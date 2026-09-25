import { Inject, Injectable } from "@nestjs/common";
import { PrismaService, type DbTransaction } from "../database/prisma.service";
import {
  CatalogStatus,
  RouteStopRole,
  StopPointStatus,
  type RouteStatus,
  type RoutingMetricsSource,
} from "../database/prisma.types";
import {
  ROUTING_PROVIDER,
  type RouteLeg,
  type RoutingProvider,
  RoutingProviderError,
} from "../external/routing/routing-provider";
import type { Authorization } from "../iam/role/authorization";
import { requireTenant } from "../iam/role/require-tenant";
import { isPrismaUniqueConflict } from "../iam/user/account.errors";
import { stopPointUnavailable } from "../stop-point/stop-point.errors";
import type { RouteInput, RouteListResponse, RouteResponse } from "./dto/route.dto";
import { routeNameConflict, routeNotFound, routingProviderUnavailable } from "./route.errors";

/** Một điểm đã kiểm còn hiệu lực + toạ độ hiện tại của nó. */
type ResolvedStop = {
  catalogStopPointId: string | null;
  stopPointId: string | null;
  note: string | null;
  latitude: number;
  longitude: number;
};

type Measured = { source: RoutingMetricsSource; legs: RouteLeg[] };

const POINT_SELECT = { name: true, address: true } as const;
/** Trần một chặng: 5.000 km / 7 ngày — quá mức là provider trả sai; 25 điểm × trần vẫn nằm trong INT4. */
const MAX_LEG_METERS = 5_000_000;
const MAX_LEG_SECONDS = 7 * 24 * 3_600;
const ACTIVE_WARD = { status: CatalogStatus.ACTIVE, province: { status: CatalogStatus.ACTIVE } } as const;

/**
 * Tuyến của nhà xe (TASK-TRN-002, FR-OPS-04, UC-13). Khoảng cách/thời gian tính lúc tạo hoặc khi chuỗi
 * toạ độ đổi rồi lưu DB (ADR-027 cache-once) — GET không bao giờ gọi provider. Provider được gọi NGOÀI
 * transaction; lỗi provider → 503 và không ghi gì (Q5).
 */
@Injectable()
export class RouteService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ROUTING_PROVIDER) private readonly routing: RoutingProvider,
  ) {}

  /** Liệt kê route của nhà xe (không kèm điểm), lọc trạng thái, phân trang theo `id`. */
  async list(
    authz: Authorization,
    query: { status?: RouteStatus; cursor?: string; limit: number },
  ): Promise<RouteListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const rows = await this.prisma.withScope(db, (tx) =>
      tx.route.findMany({
        where: { operatorId, status: query.status, ...(query.cursor ? { id: { gt: query.cursor } } : {}) },
        orderBy: { id: "asc" },
        take: query.limit + 1,
        select: {
          id: true,
          name: true,
          status: true,
          totalDistanceMeters: true,
          totalDurationSeconds: true,
          metricsSource: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { stops: true } },
        },
      }),
    );
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(({ _count, ...route }) => ({
        ...route,
        stopCount: _count.stops,
        createdAt: route.createdAt.toISOString(),
        updatedAt: route.updatedAt.toISOString(),
      })),
      nextCursor: rows.length > query.limit ? page[page.length - 1]!.id : null,
    };
  }

  /** Chi tiết một route kèm điểm dừng; khác tenant trả 404 như không tồn tại. */
  async get(authz: Authorization, routeId: string): Promise<RouteResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, (tx) => findDetail(tx, operatorId, routeId));
    if (!row) {
      throw routeNotFound();
    }
    return toResponse(row);
  }

  /** Tạo route: kiểm điểm → đo chặng (ngoài transaction) → ghi route + điểm trong một transaction. */
  async create(authz: Authorization, input: RouteInput): Promise<RouteResponse> {
    const { db, operatorId } = requireTenant(authz);
    const stops = await this.prisma.withScope(db, async (tx) => {
      await assertNameFree(tx, operatorId, input.name);
      return resolveStops(tx, operatorId, input.stops);
    });
    const measured = await this.measure(stops);
    const row = await this.withNameConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const route = await tx.route.create({
          data: { operatorId, ...routeData(input, measured) },
          select: { id: true },
        });
        await tx.routeStop.createMany({ data: stopRows(operatorId, route.id, stops, measured.legs) });
        return findDetail(tx, operatorId, route.id);
      }),
    );
    return toResponse(row!);
  }

  /**
   * Thay toàn bộ route. Chỉ gọi provider khi chuỗi toạ độ đổi so với toạ độ ĐÃ DÙNG để tính (hoặc nguồn
   * số liệu đổi, vd. vừa có key Goong) — đổi tên/ghi chú/trạng thái không tốn quota. Ghi dòng route trước
   * (khoá dòng) rồi mới thay điểm → hai PUT đồng thời không trộn điểm/số liệu.
   */
  async update(authz: Authorization, routeId: string, input: RouteInput): Promise<RouteResponse> {
    const { db, operatorId } = requireTenant(authz);
    const { current, stops } = await this.prisma.withScope(db, async (tx) => {
      const current = await findDetail(tx, operatorId, routeId);
      if (!current) {
        throw routeNotFound();
      }
      await assertNameFree(tx, operatorId, input.name, routeId);
      // Điểm đã có trong route được giữ dù đã bị vô hiệu hoá — để Owner vẫn đổi tên/tạm ngưng route
      // (mẫu TRN-001); chỉ điểm MỚI thêm mới phải ACTIVE. Mở bán (TRN-006) kiểm lại toàn bộ điểm.
      const kept = current.stops.map((stop) => stop.catalogStopPointId ?? stop.stopPointId!);
      return { current, stops: await resolveStops(tx, operatorId, input.stops, kept) };
    });
    const measured =
      current.metricsSource === this.routing.source && sameCoordinates(current.stops, stops)
        ? {
            source: current.metricsSource,
            legs: current.stops.slice(1).map((stop) => ({
              distanceMeters: stop.distanceMetersFromPrevious!,
              durationSeconds: stop.durationSecondsFromPrevious!,
            })),
          }
        : await this.measure(stops);
    const row = await this.withNameConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const updated = await tx.route.updateMany({
          where: { id: routeId, operatorId },
          data: routeData(input, measured),
        });
        if (updated.count === 0) {
          throw routeNotFound();
        }
        await tx.routeStop.deleteMany({ where: { routeId, operatorId } });
        await tx.routeStop.createMany({ data: stopRows(operatorId, routeId, stops, measured.legs) });
        return findDetail(tx, operatorId, routeId);
      }),
    );
    return toResponse(row!);
  }

  private async measure(stops: ResolvedStop[]): Promise<Measured> {
    let legs: RouteLeg[];
    try {
      legs = await this.routing.measureLegs(stops.map(({ latitude, longitude }) => ({ latitude, longitude })));
    } catch (error) {
      if (error instanceof RoutingProviderError) {
        throw routingProviderUnavailable();
      }
      throw error;
    }
    // Không tin provider: thiếu/thừa chặng, số âm/không nguyên hoặc lớn phi lý (vượt INT4 khi cộng) thì coi
    // như lỗi, không lưu (Q5).
    const valid =
      legs.length === stops.length - 1 &&
      legs.every(
        (leg) =>
          Number.isInteger(leg.distanceMeters) &&
          Number.isInteger(leg.durationSeconds) &&
          leg.distanceMeters >= 0 &&
          leg.durationSeconds >= 0 &&
          leg.distanceMeters <= MAX_LEG_METERS &&
          leg.durationSeconds <= MAX_LEG_SECONDS,
      );
    if (!valid) {
      throw routingProviderUnavailable();
    }
    return { source: this.routing.source, legs };
  }

  private async withNameConflict<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      // Điểm lặp đã bị Zod chặn → unique còn lại chỉ có thể là tên route trong tenant.
      if (isPrismaUniqueConflict(error)) {
        throw routeNameConflict();
      }
      throw error;
    }
  }
}

/**
 * Chặn trùng tên TRƯỚC khi gọi provider: POST/PUT lặp lại với tên đã có không được tốn quota Goong
 * (security M2). Unique DB vẫn là chốt chặn cuối cho trường hợp đua.
 */
async function assertNameFree(tx: DbTransaction, operatorId: string, name: string, exceptRouteId?: string) {
  const taken = await tx.route.findFirst({
    where: { operatorId, name, ...(exceptRouteId ? { id: { not: exceptRouteId } } : {}) },
    select: { id: true },
  });
  if (taken) {
    throw routeNameConflict();
  }
}

/**
 * Kiểm điểm dùng được (BR-38, UC-13 A1): điểm MỚI phải là catalog `ACTIVE`, hoặc điểm riêng `ACTIVE` CỦA
 * TENANT NÀY, với phường/tỉnh `ACTIVE`; điểm trong `kept` (đã có trên route) được giữ dù đã vô hiệu hoá.
 * Điểm riêng luôn lọc theo tenant. Không phân biệt lý do để không lộ điểm của tenant khác.
 */
async function resolveStops(
  tx: DbTransaction,
  operatorId: string,
  stops: RouteInput["stops"],
  kept: string[] = [],
): Promise<ResolvedStop[]> {
  const catalogIds = stops.flatMap((stop) => (stop.catalogStopPointId ? [stop.catalogStopPointId] : []));
  const privateIds = stops.flatMap((stop) => (stop.stopPointId ? [stop.stopPointId] : []));
  const coordinates = { id: true, latitude: true, longitude: true } as const;
  const [catalog, own] = await Promise.all([
    tx.stopPointCatalog.findMany({
      where: {
        id: { in: catalogIds },
        OR: [{ id: { in: kept } }, { status: CatalogStatus.ACTIVE, ward: ACTIVE_WARD }],
      },
      select: coordinates,
    }),
    tx.stopPoint.findMany({
      where: {
        id: { in: privateIds },
        operatorId,
        OR: [{ id: { in: kept } }, { status: StopPointStatus.ACTIVE, ward: ACTIVE_WARD }],
      },
      select: coordinates,
    }),
  ]);
  const catalogById = new Map(catalog.map((point) => [point.id, point]));
  const ownById = new Map(own.map((point) => [point.id, point]));
  return stops.map((stop) => {
    const point = stop.catalogStopPointId
      ? catalogById.get(stop.catalogStopPointId)
      : ownById.get(stop.stopPointId!);
    if (!point) {
      throw stopPointUnavailable();
    }
    return {
      catalogStopPointId: stop.catalogStopPointId,
      stopPointId: stop.stopPointId,
      note: stop.note,
      latitude: point.latitude,
      longitude: point.longitude,
    };
  });
}

function sameCoordinates(
  current: { latitude: number; longitude: number }[],
  next: { latitude: number; longitude: number }[],
): boolean {
  return (
    current.length === next.length &&
    current.every((stop, index) => stop.latitude === next[index]!.latitude && stop.longitude === next[index]!.longitude)
  );
}

function routeData(input: RouteInput, measured: Measured) {
  return {
    name: input.name,
    status: input.status,
    note: input.note,
    totalDistanceMeters: measured.legs.reduce((sum, leg) => sum + leg.distanceMeters, 0),
    totalDurationSeconds: measured.legs.reduce((sum, leg) => sum + leg.durationSeconds, 0),
    metricsSource: measured.source,
  };
}

function stopRows(operatorId: string, routeId: string, stops: ResolvedStop[], legs: RouteLeg[]) {
  const last = stops.length - 1;
  return stops.map((stop, index) => ({
    operatorId,
    routeId,
    sequence: index + 1,
    role: index === 0 ? RouteStopRole.ORIGIN : index === last ? RouteStopRole.DESTINATION : RouteStopRole.INTERMEDIATE,
    catalogStopPointId: stop.catalogStopPointId,
    stopPointId: stop.stopPointId,
    note: stop.note,
    latitude: stop.latitude,
    longitude: stop.longitude,
    distanceMetersFromPrevious: index === 0 ? null : legs[index - 1]!.distanceMeters,
    durationSecondsFromPrevious: index === 0 ? null : legs[index - 1]!.durationSeconds,
  }));
}

function findDetail(tx: DbTransaction, operatorId: string, routeId: string) {
  return tx.route.findFirst({
    where: { id: routeId, operatorId },
    select: {
      id: true,
      name: true,
      status: true,
      note: true,
      totalDistanceMeters: true,
      totalDurationSeconds: true,
      metricsSource: true,
      createdAt: true,
      updatedAt: true,
      stops: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          role: true,
          catalogStopPointId: true,
          stopPointId: true,
          note: true,
          latitude: true,
          longitude: true,
          distanceMetersFromPrevious: true,
          durationSecondsFromPrevious: true,
          catalogStopPoint: { select: POINT_SELECT },
          stopPoint: { select: POINT_SELECT },
        },
      },
    },
  });
}

function toResponse(row: NonNullable<Awaited<ReturnType<typeof findDetail>>>): RouteResponse {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    stops: row.stops.map(({ catalogStopPoint, stopPoint, ...stop }) => {
      const point = catalogStopPoint ?? stopPoint!;
      return { ...stop, name: point.name, address: point.address };
    }),
  };
}
