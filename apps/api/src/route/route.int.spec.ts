import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { parseAppConfig } from "../config/env.config";
import { tenantScope } from "../database/db-scope";
import { PrismaService } from "../database/prisma.service";
import {
  type Coordinates,
  type RouteLeg,
  type RoutingProvider,
  RoutingProviderError,
} from "../external/routing/routing-provider";
import type { Authorization } from "../iam/role/authorization";
import { StopPointInputSchema, StopPointProposalInputSchema } from "../stop-point/dto/stop-point.dto";
import { StopPointProposalService } from "../stop-point/stop-point-proposal.service";
import { StopPointService } from "../stop-point/stop-point.service";
import { RouteInputSchema } from "./dto/route.dto";
import { RouteService } from "./route.service";

/**
 * TASK-TRN-002 — Postgres THẬT bằng role APP (RLS chỉ có hiệu lực với role không superuser/BYPASSRLS).
 * Provider routing là fake đếm số lần gọi — không gọi Goong thật, không tốn quota.
 */
const url = process.env.DATABASE_URL;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

async function rejectionOf(promise: Promise<unknown>): Promise<{ status?: number; code?: string; text: string }> {
  try {
    await promise;
    return { text: "" };
  } catch (error) {
    const response = (error as { getResponse?: () => { code?: string } }).getResponse?.();
    return {
      status: (error as { getStatus?: () => number }).getStatus?.(),
      code: response?.code,
      text: JSON.stringify(error, Object.getOwnPropertyNames(error)) + String(error),
    };
  }
}

/** Provider giả: chặng thứ i = 1000·(i+1) m, 60·(i+1) s; đếm lần gọi; bật lỗi được. */
class FakeRouting implements RoutingProvider {
  source: "GOONG" | "ESTIMATE" = "GOONG";
  calls = 0;
  fail = false;
  legsOverride: RouteLeg[] | null = null;
  async measureLegs(points: Coordinates[]): Promise<RouteLeg[]> {
    this.calls++;
    if (this.fail) {
      throw new RoutingProviderError("fake failure");
    }
    return this.legsOverride ?? points.slice(1).map((_point, index) => ({ distanceMeters: 1000 * (index + 1), durationSeconds: 60 * (index + 1) }));
  }
}

describe.skipIf(!url && !requireDb)("Route / StopPoint / Proposal — Postgres thật, role app", () => {
  let prisma: PrismaService;
  let stopPoints: StopPointService;
  let proposals: StopPointProposalService;
  let routes: RouteService;
  const routing = new FakeRouting();
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const province = randomUUID();
  const provinceOther = randomUUID();
  const ward = randomUUID();
  const wardInactive = randomUUID();
  const wardOther = randomUUID();
  const catalog1 = randomUUID();
  const catalog2 = randomUUID();
  const catalogInactive = randomUUID();
  const catalogInInactiveWard = randomUUID();
  const authzA = authz(tenantA);
  const authzB = authz(tenantB);

  function authz(operatorId: string): Authorization {
    return { permission: "route:manage", scope: "tenant", db: tenantScope(operatorId) };
  }

  function location(overrides: Record<string, unknown> = {}) {
    return {
      name: `Điểm ${randomUUID().slice(0, 6)}`,
      type: "OFFICE",
      address: "1 Trần Hưng Đạo",
      provinceId: province,
      wardId: ward,
      latitude: 10.75,
      longitude: 106.66,
      description: null,
      ...overrides,
    };
  }
  const stopPointInput = (overrides: Record<string, unknown> = {}) =>
    StopPointInputSchema.parse({ ...location(overrides), status: "ACTIVE", ...overrides });
  const proposalInput = (overrides: Record<string, unknown> = {}) => StopPointProposalInputSchema.parse(location(overrides));
  const catalogStop = (id: string) => ({ catalogStopPointId: id, stopPointId: null, note: null });
  const privateStop = (id: string) => ({ catalogStopPointId: null, stopPointId: id, note: null });
  const routeInput = (name: string, stops: object[], overrides: Record<string, unknown> = {}) =>
    RouteInputSchema.parse({ name, status: "ACTIVE", note: null, stops, ...overrides });

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    stopPoints = new StopPointService(prisma);
    proposals = new StopPointProposalService(prisma);
    routes = new RouteService(prisma, routing);
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL đang là superuser/BYPASSRLS — dùng role app (TRN-002-guide.md §0).");
    }
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: `rt-a-${tag}`, displayName: "RT A" },
          { id: tenantB, operatorSlug: `rt-b-${tag}`, displayName: "RT B" },
        ],
      });
      await tx.province.createMany({
        data: [
          { id: province, code: `rp-${tag}`, name: "Tỉnh route" },
          { id: provinceOther, code: `ro-${tag}`, name: "Tỉnh khác" },
        ],
      });
      await tx.ward.createMany({
        data: [
          { id: ward, provinceId: province, code: `rw-${tag}`, name: "Phường route" },
          { id: wardInactive, provinceId: province, code: `ri-${tag}`, name: "Phường ngừng", status: "INACTIVE" },
          { id: wardOther, provinceId: provinceOther, code: `rx-${tag}`, name: "Phường tỉnh khác" },
        ],
      });
      const point = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
        id,
        name: `${name} ${tag}`,
        type: "BUS_STATION" as const,
        address: "x",
        provinceId: province,
        wardId: ward,
        latitude: 10.8,
        longitude: 106.7,
        ...extra,
      });
      await tx.stopPointCatalog.createMany({
        data: [
          point(catalog1, "Bến 1", { latitude: 10.74, longitude: 106.62 }),
          point(catalog2, "Bến 2", { latitude: 11.93, longitude: 108.44 }),
          point(catalogInactive, "Bến ngừng", { status: "INACTIVE" }),
          point(catalogInInactiveWard, "Bến phường ngừng", { wardId: wardInactive }),
        ],
      });
    });
  }, 30_000);

  beforeEach(() => {
    routing.calls = 0;
    routing.fail = false;
    routing.legsOverride = null;
    routing.source = "GOONG";
  });

  afterAll(async () => {
    if (!prisma) {
      return;
    }
    await prisma.withSystem(async (tx) => {
      const operatorId = { in: [tenantA, tenantB] };
      await tx.routeStop.deleteMany({ where: { operatorId } });
      await tx.route.deleteMany({ where: { operatorId } });
      await tx.stopPointProposal.deleteMany({ where: { operatorId } });
      await tx.stopPoint.deleteMany({ where: { operatorId } });
      await tx.stopPointCatalog.deleteMany({ where: { provinceId: { in: [province, provinceOther] } } });
      await tx.ward.deleteMany({ where: { provinceId: { in: [province, provinceOther] } } });
      await tx.province.deleteMany({ where: { id: { in: [province, provinceOther] } } });
      await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
    });
    await prisma.$disconnect();
  });

  describe("RLS", () => {
    it("4 bảng ENABLE + FORCE RLS; đề xuất có đủ 4 policy theo lệnh; rlsProblems() rỗng", async () => {
      const forced = await prisma.$queryRaw<{ relname: string }[]>`
        SELECT relname FROM pg_class
        WHERE relname IN ('stop_points','stop_point_proposals','routes','route_stops')
          AND relrowsecurity AND relforcerowsecurity`;
      expect(forced.map((row) => row.relname).sort()).toEqual(["route_stops", "routes", "stop_point_proposals", "stop_points"]);
      const policies = await prisma.$queryRaw<{ policyname: string; cmd: string }[]>`
        SELECT policyname, cmd FROM pg_policies WHERE tablename = 'stop_point_proposals'`;
      expect(policies.map((row) => `${row.cmd}:${row.policyname}`).sort()).toEqual([
        "DELETE:platform_delete",
        "INSERT:tenant_insert_pending",
        "SELECT:tenant_read",
        "UPDATE:tenant_resubmit_rejected",
      ]);
      expect(await prisma.rlsProblems()).toEqual([]);
    });

    it("query CỐ Ý quên lọc operator_id: tenant B không đọc/sửa/xoá được điểm, route, điểm dừng của A", async () => {
      const own = await stopPoints.create(authzA, stopPointInput({ name: `RLS ${tag}` }));
      const route = await routes.create(authzA, routeInput(`RLS ${tag}`, [catalogStop(catalog1), privateStop(own.id)]));
      await prisma.withTenant(tenantB, async (tx) => {
        expect(await tx.stopPoint.findMany({ where: { id: own.id } })).toEqual([]);
        expect(await tx.route.findMany({ where: { id: route.id } })).toEqual([]);
        expect(await tx.routeStop.findMany({ where: { routeId: route.id } })).toEqual([]);
        expect((await tx.route.updateMany({ where: { id: route.id }, data: { name: "hack" } })).count).toBe(0);
        expect((await tx.routeStop.deleteMany({ where: { routeId: route.id } })).count).toBe(0);
        expect((await tx.stopPoint.updateMany({ where: { id: own.id }, data: { status: "INACTIVE" } })).count).toBe(0);
      });
      expect(await prisma.route.findMany({ where: { id: route.id } })).toEqual([]);
      expect((await routes.get(authzA, route.id)).stops).toHaveLength(2);
    });

    it("đề xuất: DB khoá state machine phía tenant — không tự duyệt/từ chối, không sửa bản PENDING, không xoá", async () => {
      const created = await proposals.create(authzA, proposalInput());
      const tenantOnly = (work: Parameters<PrismaService["withTenant"]>[1]) => prisma.withTenant(tenantA, work);

      // Tạo sẵn ở trạng thái khác PENDING (dữ liệu hợp lệ theo CHECK) → RLS chặn.
      const insertRejected = await rejectionOf(
        tenantOnly((tx) =>
          tx.stopPointProposal.create({
            data: { ...proposalInput(), operatorId: tenantA, status: "REJECTED", rejectionReason: "tự từ chối" },
          }),
        ),
      );
      expect(insertRejected.text).toMatch(/row-level security|42501/);
      // Bản PENDING không sửa được ở scope tenant (USING chỉ thấy bản REJECTED).
      expect(
        await tenantOnly((tx) => tx.stopPointProposal.updateMany({ where: { id: created.id }, data: { name: "sửa lén" } })),
      ).toEqual({ count: 0 });
      expect(await tenantOnly((tx) => tx.stopPointProposal.deleteMany({ where: { id: created.id } }))).toEqual({ count: 0 });

      // Admin (scope platform) từ chối → tenant không tự chuyển sang APPROVED được, chỉ gửi lại thành PENDING.
      await prisma.withPlatform((tx) =>
        tx.stopPointProposal.update({ where: { id: created.id }, data: { status: "REJECTED", rejectionReason: "Sai toạ độ" } }),
      );
      const selfApprove = await rejectionOf(
        tenantOnly((tx) =>
          tx.stopPointProposal.update({
            where: { id: created.id },
            data: { status: "APPROVED", rejectionReason: null, catalogStopPointId: catalog1 },
          }),
        ),
      );
      expect(selfApprove.text).toMatch(/row-level security|42501/);
      const resubmitted = await proposals.resubmit(authzA, created.id, proposalInput({ name: "Đã sửa toạ độ" }));
      expect(resubmitted).toMatchObject({ status: "PENDING", rejectionReason: null, name: "Đã sửa toạ độ" });
    });

    it("đề xuất: tenant không tạo hay chuyển được đề xuất sang operator_id của tenant khác", async () => {
      const insertForeign = await rejectionOf(
        prisma.withTenant(tenantA, (tx) =>
          tx.stopPointProposal.create({ data: { ...proposalInput(), operatorId: tenantB, status: "PENDING" } }),
        ),
      );
      expect(insertForeign.text).toMatch(/row-level security|42501/);
      const created = await proposals.create(authzA, proposalInput());
      await prisma.withPlatform((tx) =>
        tx.stopPointProposal.update({ where: { id: created.id }, data: { status: "REJECTED", rejectionReason: "Thiếu mô tả" } }),
      );
      const moveForeign = await rejectionOf(
        prisma.withTenant(tenantA, (tx) =>
          tx.stopPointProposal.update({
            where: { id: created.id },
            data: { operatorId: tenantB, status: "PENDING", rejectionReason: null },
          }),
        ),
      );
      expect(moveForeign.text).toMatch(/row-level security|42501/);
    });
  });

  describe("Invariant DB (scope system — DB tự chặn, không nhờ service)", () => {
    const stopRow = (routeId: string, extra: Record<string, unknown>) => ({
      id: randomUUID(),
      operatorId: tenantA,
      routeId,
      sequence: 2,
      role: "DESTINATION" as const,
      latitude: 10,
      longitude: 106,
      distanceMetersFromPrevious: 1,
      durationSecondsFromPrevious: 1,
      ...extra,
    });

    it.each([
      ["không có nguồn", { catalogStopPointId: null, stopPointId: null }, /route_stops_single_source|23514/],
      ["hai nguồn", { catalogStopPointId: "__catalog__", stopPointId: "__private__" }, /route_stops_single_source|23514/],
      ["điểm đầu có số liệu chặng", { sequence: 1, role: "ORIGIN", catalogStopPointId: "__catalog2__" }, /route_stops_sequence_consistent|23514/],
      ["điểm riêng của tenant khác", { stopPointId: "__privateB__" }, /route_stops_stop_point_id_operator_id_fkey|23503|Foreign key/i],
    ])("route_stops: %s → DB từ chối", async (_case, extra, message) => {
      const route = await routes.create(authzA, routeInput(`INV ${randomUUID().slice(0, 6)}`, [catalogStop(catalog1), catalogStop(catalog2)]));
      const ownA = await stopPoints.create(authzA, stopPointInput());
      const ownB = await stopPoints.create(authzB, stopPointInput());
      const resolved = Object.fromEntries(
        Object.entries(extra).map(([key, value]) => [
          key,
          { __catalog__: catalog1, __catalog2__: catalogInactive, __private__: ownA.id, __privateB__: ownB.id }[value as string] ?? value,
        ]),
      );
      const failure = await rejectionOf(
        prisma.withSystem((tx) => tx.routeStop.create({ data: { ...stopRow(route.id, {}), sequence: 3, ...resolved } })),
      );
      expect(failure.text).toMatch(message);
    });

    it("đề xuất: CHECK trạng thái — REJECTED thiếu/rỗng lý do, APPROVED thiếu điểm catalog bị chặn cả với Admin", async () => {
      const created = await proposals.create(authzA, proposalInput());
      for (const data of [
        { status: "REJECTED" as const },
        { status: "REJECTED" as const, rejectionReason: "   " },
        { status: "APPROVED" as const },
      ]) {
        const failure = await rejectionOf(prisma.withPlatform((tx) => tx.stopPointProposal.update({ where: { id: created.id }, data })));
        expect(failure.text).toMatch(/stop_point_proposals_state_consistent|23514/);
      }
    });

    it("điểm riêng: phường không thuộc tỉnh → FK ghép chặn", async () => {
      const failure = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.stopPoint.create({ data: { ...stopPointInput(), operatorId: tenantA, wardId: wardOther } }),
        ),
      );
      expect(failure.text).toMatch(/stop_points_ward_id_province_id_fkey|23503|Foreign key/i);
    });
  });

  describe("StopPointService + StopPointProposalService", () => {
    it("CRUD điểm riêng; trùng tên 409; tenant khác 404; tỉnh/phường không hợp lệ 422", async () => {
      const created = await stopPoints.create(authzA, stopPointInput({ name: `VP ${tag}` }));
      expect(await stopPoints.get(authzA, created.id)).toEqual(created);
      const updated = await stopPoints.update(authzA, created.id, stopPointInput({ name: `VP ${tag}`, status: "INACTIVE" }));
      expect(updated.status).toBe("INACTIVE");
      expect((await rejectionOf(stopPoints.create(authzA, stopPointInput({ name: `VP ${tag}` })))).code).toBe("STOP_POINT_NAME_CONFLICT");
      expect((await stopPoints.create(authzB, stopPointInput({ name: `VP ${tag}` }))).name).toBe(`VP ${tag}`);
      expect((await rejectionOf(stopPoints.get(authzB, created.id))).code).toBe("STOP_POINT_NOT_FOUND");
      expect((await rejectionOf(stopPoints.update(authzB, created.id, stopPointInput()))).code).toBe("STOP_POINT_NOT_FOUND");
      for (const bad of [{ wardId: wardInactive }, { wardId: wardOther }, { wardId: randomUUID() }]) {
        expect(await rejectionOf(stopPoints.create(authzA, stopPointInput(bad)))).toMatchObject({
          code: "CATALOG_ITEM_UNAVAILABLE",
          status: 422,
        });
      }
    });

    it("phường của điểm bị vô hiệu hoá sau đó: vẫn sửa tên/tạm ngưng được; đổi SANG phường ngừng thì 422", async () => {
      const lateWard = randomUUID();
      await prisma.withSystem((tx) => tx.ward.create({ data: { id: lateWard, provinceId: province, code: `rl-${tag}`, name: "Phường sắp ngừng" } }));
      const created = await stopPoints.create(authzA, stopPointInput({ wardId: lateWard }));
      await prisma.withSystem((tx) => tx.ward.update({ where: { id: lateWard }, data: { status: "INACTIVE" } }));
      const kept = await stopPoints.update(authzA, created.id, stopPointInput({ wardId: lateWard, name: `Đổi tên ${tag}`, status: "INACTIVE" }));
      expect(kept).toMatchObject({ wardId: lateWard, status: "INACTIVE" });
      expect((await rejectionOf(stopPoints.update(authzA, created.id, stopPointInput({ wardId: wardInactive })))).code).toBe(
        "CATALOG_ITEM_UNAVAILABLE",
      );
    });

    it("đề xuất: tạo PENDING; gửi lại bản PENDING → 409; tenant khác → 404; list lọc trạng thái", async () => {
      const created = await proposals.create(authzA, proposalInput());
      expect(created).toMatchObject({ status: "PENDING", rejectionReason: null, catalogStopPointId: null });
      expect((await rejectionOf(proposals.resubmit(authzA, created.id, proposalInput()))).code).toBe(
        "STOP_POINT_PROPOSAL_STATE_INVALID",
      );
      expect((await rejectionOf(proposals.resubmit(authzB, created.id, proposalInput()))).code).toBe(
        "STOP_POINT_PROPOSAL_NOT_FOUND",
      );
      const pending = await proposals.list(authzA, { status: "PENDING", limit: 100 });
      expect(pending.items.map((item) => item.id)).toContain(created.id);
      expect((await proposals.list(authzB, { limit: 100 })).items.map((item) => item.id)).not.toContain(created.id);
    });
  });

  describe("RouteService", () => {
    it("tạo route: vai trò theo vị trí, số liệu từng chặng + tổng, nguồn GOONG; gọi provider 1 lần, GET không gọi", async () => {
      const own = await stopPoints.create(authzA, stopPointInput({ latitude: 11.2, longitude: 107.1 }));
      const created = await routes.create(
        authzA,
        routeInput(`SG-ĐL ${tag}`, [catalogStop(catalog1), privateStop(own.id), catalogStop(catalog2)]),
      );
      expect(routing.calls).toBe(1);
      expect(created).toMatchObject({ totalDistanceMeters: 3000, totalDurationSeconds: 180, metricsSource: "GOONG" });
      expect(created.stops.map((stop) => [stop.sequence, stop.role, stop.distanceMetersFromPrevious])).toEqual([
        [1, "ORIGIN", null],
        [2, "INTERMEDIATE", 1000],
        [3, "DESTINATION", 2000],
      ]);
      expect(created.stops[1]).toMatchObject({ stopPointId: own.id, name: own.name, latitude: 11.2 });
      await routes.get(authzA, created.id);
      await routes.list(authzA, { limit: 100 });
      expect(routing.calls).toBe(1);
    });

    it("PUT: đổi tên/ghi chú không gọi provider; đổi thứ tự gọi lại; điểm riêng đổi toạ độ → tính lại", async () => {
      const own = await stopPoints.create(authzA, stopPointInput({ latitude: 11.2, longitude: 107.1 }));
      const stops = [catalogStop(catalog1), privateStop(own.id), catalogStop(catalog2)];
      const created = await routes.create(authzA, routeInput(`PUT ${tag}`, stops));
      routing.calls = 0;

      const renamed = await routes.update(authzA, created.id, routeInput(`PUT2 ${tag}`, stops, { note: "Ghi chú", status: "INACTIVE" }));
      expect(routing.calls).toBe(0);
      expect(renamed).toMatchObject({ name: `PUT2 ${tag}`, note: "Ghi chú", status: "INACTIVE", totalDistanceMeters: 3000 });

      await routes.update(authzA, created.id, routeInput(`PUT2 ${tag}`, [stops[0]!, stops[2]!, stops[1]!]));
      expect(routing.calls).toBe(1);

      await stopPoints.update(authzA, own.id, stopPointInput({ name: own.name, latitude: 11.3, longitude: 107.2 }));
      const recomputed = await routes.update(authzA, created.id, routeInput(`PUT2 ${tag}`, [stops[0]!, stops[2]!, stops[1]!]));
      expect(routing.calls).toBe(2);
      expect(recomputed.stops[2]).toMatchObject({ latitude: 11.3, longitude: 107.2 });
    });

    it("số liệu ước lượng (dev) được tính lại khi đã có Goong, kể cả không đổi toạ độ", async () => {
      routing.source = "ESTIMATE";
      const stops = [catalogStop(catalog1), catalogStop(catalog2)];
      const created = await routes.create(authzA, routeInput(`EST ${tag}`, stops));
      expect(created.metricsSource).toBe("ESTIMATE");
      routing.source = "GOONG";
      const upgraded = await routes.update(authzA, created.id, routeInput(`EST ${tag}`, stops));
      expect(upgraded.metricsSource).toBe("GOONG");
      expect(routing.calls).toBe(2);
    });

    it("provider lỗi hoặc trả sai số chặng → 503; không tạo route, route cũ giữ nguyên", async () => {
      const stops = [catalogStop(catalog1), catalogStop(catalog2)];
      routing.fail = true;
      expect(await rejectionOf(routes.create(authzA, routeInput(`FAIL ${tag}`, stops)))).toMatchObject({
        code: "ROUTING_PROVIDER_UNAVAILABLE",
        status: 503,
      });
      expect(await prisma.withTenant(tenantA, (tx) => tx.route.count({ where: { operatorId: tenantA, name: `FAIL ${tag}` } }))).toBe(0);

      routing.fail = false;
      const created = await routes.create(authzA, routeInput(`KEEP ${tag}`, stops));
      routing.legsOverride = [];
      expect((await rejectionOf(routes.update(authzA, created.id, routeInput(`KEEP ${tag}`, [...stops].reverse())))).code).toBe(
        "ROUTING_PROVIDER_UNAVAILABLE",
      );
      routing.legsOverride = [{ distanceMeters: -5, durationSeconds: 10 }];
      expect((await rejectionOf(routes.update(authzA, created.id, routeInput(`KEEP ${tag}`, [...stops].reverse())))).code).toBe(
        "ROUTING_PROVIDER_UNAVAILABLE",
      );
      expect((await routes.get(authzA, created.id)).stops.map((stop) => stop.catalogStopPointId)).toEqual([catalog1, catalog2]);
    });

    it("điểm không dùng được → 422 STOP_POINT_UNAVAILABLE, không gọi provider", async () => {
      const ownInactive = await stopPoints.create(authzA, stopPointInput({ status: "INACTIVE" }));
      const ownB = await stopPoints.create(authzB, stopPointInput());
      for (const bad of [
        catalogStop(catalogInactive),
        catalogStop(catalogInInactiveWard),
        catalogStop(randomUUID()),
        privateStop(ownInactive.id),
        privateStop(ownB.id),
      ]) {
        const failure = await rejectionOf(routes.create(authzA, routeInput(`BAD ${randomUUID().slice(0, 6)}`, [catalogStop(catalog1), bad])));
        expect(failure).toMatchObject({ code: "STOP_POINT_UNAVAILABLE", status: 422 });
      }
      expect(routing.calls).toBe(0);
    });

    it("điểm đã có trong route bị vô hiệu hoá sau đó: vẫn đổi tên/tạm ngưng route được; thêm MỚI điểm ngừng thì 422", async () => {
      const lateCatalog = randomUUID();
      await prisma.withSystem((tx) =>
        tx.stopPointCatalog.create({
          data: { id: lateCatalog, name: `Bến sắp ngừng ${tag}`, type: "BUS_STATION", address: "x", provinceId: province, wardId: ward, latitude: 12, longitude: 107 },
        }),
      );
      const own = await stopPoints.create(authzA, stopPointInput({ latitude: 11.1, longitude: 107.3 }));
      const stops = [catalogStop(catalog1), catalogStop(lateCatalog), privateStop(own.id)];
      const created = await routes.create(authzA, routeInput(`KEEP-OLD ${tag}`, stops));
      await prisma.withSystem((tx) => tx.stopPointCatalog.update({ where: { id: lateCatalog }, data: { status: "INACTIVE" } }));
      await stopPoints.update(authzA, own.id, stopPointInput({ name: own.name, latitude: 11.1, longitude: 107.3, status: "INACTIVE" }));
      routing.calls = 0;

      const paused = await routes.update(authzA, created.id, routeInput(`KEEP-OLD ${tag}`, stops, { status: "INACTIVE" }));
      expect(paused.status).toBe("INACTIVE");
      expect(routing.calls).toBe(0);
      expect((await rejectionOf(routes.update(authzA, created.id, routeInput(`KEEP-OLD ${tag}`, [...stops, catalogStop(catalogInactive)])))).code).toBe(
        "STOP_POINT_UNAVAILABLE",
      );
    });

    it("trùng tên bị chặn TRƯỚC khi gọi provider (không tốn quota); giá trị chặng phi lý → 503", async () => {
      const stops = [catalogStop(catalog1), catalogStop(catalog2)];
      await routes.create(authzA, routeInput(`QUOTA ${tag}`, stops));
      routing.calls = 0;
      expect((await rejectionOf(routes.create(authzA, routeInput(`QUOTA ${tag}`, stops)))).code).toBe("ROUTE_NAME_CONFLICT");
      expect(routing.calls).toBe(0);
      routing.legsOverride = [{ distanceMeters: 5_000_001, durationSeconds: 60 }];
      expect((await rejectionOf(routes.create(authzA, routeInput(`HUGE ${tag}`, stops)))).code).toBe("ROUTING_PROVIDER_UNAVAILABLE");
    });

    it("trùng tên trong tenant → 409, tenant khác được; tenant khác GET/PUT → 404", async () => {
      const stops = [catalogStop(catalog1), catalogStop(catalog2)];
      const created = await routes.create(authzA, routeInput(`NAME ${tag}`, stops));
      expect((await rejectionOf(routes.create(authzA, routeInput(`NAME ${tag}`, stops)))).code).toBe("ROUTE_NAME_CONFLICT");
      expect((await routes.create(authzB, routeInput(`NAME ${tag}`, stops))).name).toBe(`NAME ${tag}`);
      expect((await rejectionOf(routes.get(authzB, created.id))).code).toBe("ROUTE_NOT_FOUND");
      expect((await rejectionOf(routes.update(authzB, created.id, routeInput(`X ${tag}`, stops)))).code).toBe("ROUTE_NOT_FOUND");
    });

    it("hai PUT đồng thời: bản sau thắng trọn vẹn, không trộn điểm dừng", async () => {
      const own = await stopPoints.create(authzA, stopPointInput({ latitude: 11.5, longitude: 107.5 }));
      const created = await routes.create(authzA, routeInput(`RACE ${tag}`, [catalogStop(catalog1), catalogStop(catalog2)]));
      const variants = [
        [catalogStop(catalog1), privateStop(own.id), catalogStop(catalog2)],
        [catalogStop(catalog2), catalogStop(catalog1)],
      ];
      await Promise.all(variants.map((stops) => routes.update(authzA, created.id, routeInput(`RACE ${tag}`, stops))));
      const final = (await routes.get(authzA, created.id)).stops.map((stop) => stop.catalogStopPointId ?? stop.stopPointId);
      expect([
        [catalog1, own.id, catalog2],
        [catalog2, catalog1],
      ]).toContainEqual(final);
    });

    it("list: lọc trạng thái, cursor đi hết không lặp/sót, kèm số điểm", async () => {
      for (const index of [1, 2, 3]) {
        await routes.create(authzB, routeInput(`LIST ${index} ${tag}`, [catalogStop(catalog1), catalogStop(catalog2)], { status: "INACTIVE" }));
      }
      const seen: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await routes.list(authzB, { status: "INACTIVE", cursor, limit: 2 });
        expect(page.items.every((item) => item.status === "INACTIVE" && item.stopCount === 2)).toBe(true);
        seen.push(...page.items.map((item) => item.id));
        cursor = page.nextCursor ?? undefined;
      } while (cursor);
      expect(new Set(seen).size).toBe(seen.length);
      expect(seen.length).toBe(3);
    });
  });
});
