import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { Controller, Get, type ExecutionContext, type INestApplication, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ProblemDetailsExceptionFilter } from "../../common/errors/problem-details.filter";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { configureApiRoutes } from "../../openapi/openapi";
import { type AccessTokenClaims, TokenService } from "../auth/token.service";
import { SessionService } from "../session/session.service";
import type { Authorization } from "./authorization";
import { Authorize, Authz } from "./authorize.decorator";
import { TenantGuard } from "./tenant.guard";

/**
 * Chuỗi `@Authorize()` qua HTTP thật (TASK-IAM-003): 401 → 403 PERMISSION_DENIED → 403
 * TENANT_SCOPE_VIOLATION → 200 kèm `DbScope` đúng. Không cần Postgres/Redis: phiên luôn "còn sống"
 * (phần đó IAM-002 đã test), ở đây chỉ kiểm phân quyền.
 */
@Controller("probe")
class ProbeController {
  @Get("vehicles")
  @Authorize("vehicle:manage")
  manageVehicles(@Authz() authz: Authorization): Authorization {
    return authz;
  }

  @Get("operators/:operatorSlug/vehicles")
  @Authorize("vehicle:read")
  readVehiclesBySlug(@Authz() authz: Authorization): Authorization {
    return authz;
  }

  @Get("operators/by-id/:operatorId/checkins")
  @Authorize("checkin:read")
  readCheckinsById(@Authz() authz: Authorization): Authorization {
    return authz;
  }

  @Get("checkins/perform")
  @Authorize("checkin:perform")
  performCheckin(@Authz() authz: Authorization): Authorization {
    return authz;
  }

  @Get("kyc-queue")
  @Authorize("kyc:review")
  kycQueue(@Authz() authz: Authorization): Authorization {
    return authz;
  }

  @Get("trips")
  @Authorize("trip:search")
  searchTrips(@Authz() authz: Authorization): Authorization {
    return authz;
  }
}

const config = { NODE_ENV: "test", JWT_ACCESS_TTL_SECONDS: 900, JWT_ISSUER: "vexenhanh-test" } as AppConfig;

@Module({
  controllers: [ProbeController],
  providers: [
    { provide: APP_CONFIG, useValue: config },
    TokenService,
    { provide: SessionService, useValue: {
      assertActive: async () => undefined,
      assertOperatorAccountCurrent: async () => undefined,
    } },
  ],
})
class ProbeModule {}

describe("@Authorize — HTTP", () => {
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;
  const operatorId = randomUUID();

  beforeAll(async () => {
    app = await NestFactory.create(ProbeModule, { logger: false, abortOnError: false });
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1/probe`;
    tokens = app.get(TokenService);
  });

  afterAll(async () => {
    await app?.close();
  });

  async function token(claims: Omit<AccessTokenClaims, "sid">): Promise<string> {
    return (await tokens.mintAccessToken({ ...claims, sid: randomUUID() })).accessToken;
  }

  async function get(path: string, accessToken?: string) {
    const response = await fetch(`${base}${path}`, {
      headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  }

  const owner = () =>
    token({ sub: "acc-1", scope: "operator", role: "OPERATOR_OWNER", mfa: true, operatorId, operatorSlug: "phuongtrang" });

  it("không token → 401 AUTH_SESSION_EXPIRED", async () => {
    expect(await get("/vehicles")).toMatchObject({ status: 401, body: { code: "AUTH_SESSION_EXPIRED" } });
  });

  it("có token nhưng role không có quyền → 403 PERMISSION_DENIED", async () => {
    const driver = await token({ sub: "emp-1", scope: "operator", role: "DRIVER", operatorId, operatorSlug: "phuongtrang" });
    expect(await get("/vehicles", driver)).toMatchObject({ status: 403, body: { code: "PERMISSION_DENIED" } });
  });

  it("owner đúng tenant → 200, DbScope tenant lấy operatorId từ JWT", async () => {
    expect(await get("/vehicles", await owner())).toMatchObject({
      status: 200,
      body: { permission: "vehicle:manage", scope: "tenant", db: { kind: "tenant", operatorId } },
    });
  });

  it("slug trên URL khác claim → 403 TENANT_SCOPE_VIOLATION; khớp (không phân biệt hoa thường) → 200", async () => {
    const ownerToken = await owner();
    expect(await get("/operators/nhaxe-khac/vehicles", ownerToken)).toMatchObject({
      status: 403,
      body: { code: "TENANT_SCOPE_VIOLATION" },
    });
    expect((await get("/operators/PhuongTrang/vehicles", ownerToken)).status).toBe(200);
  });

  it("`:operatorId` trên URL khác claim → 403 TENANT_SCOPE_VIOLATION; khớp → 200", async () => {
    const ownerToken = await owner();
    expect(await get(`/operators/by-id/${randomUUID()}/checkins`, ownerToken)).toMatchObject({
      status: 403,
      body: { code: "TENANT_SCOPE_VIOLATION" },
    });
    expect((await get(`/operators/by-id/${operatorId}/checkins`, ownerToken)).status).toBe(200);
  });

  it("grant `assigned` (Employee) cũng khoá vào tenant của token — lọc phân công là việc của service", async () => {
    const driver = await token({ sub: "emp-1", scope: "operator", role: "DRIVER", operatorId, operatorSlug: "phuongtrang" });
    expect(await get("/checkins/perform", driver)).toMatchObject({
      status: 200,
      body: { scope: "assigned", db: { kind: "tenant", operatorId } },
    });
  });

  it("token phía Operator thiếu claim tenant → 401 ngay ở bước verify (không tới được guard)", async () => {
    const orphan = await token({ sub: "acc-2", scope: "operator", role: "OPERATOR_OWNER", mfa: true });
    expect(await get("/vehicles", orphan)).toMatchObject({ status: 401, body: { code: "AUTH_SESSION_EXPIRED" } });
  });

  it("PLATFORM_ADMIN duyệt KYC → DbScope platform; PLATFORM_SUPPORT → 403", async () => {
    const admin = await token({ sub: "padm-1", scope: "platform", role: "PLATFORM_ADMIN", mfa: true });
    expect(await get("/kyc-queue", admin)).toMatchObject({ status: 200, body: { db: { kind: "platform" } } });
    const support = await token({ sub: "psup-1", scope: "platform", role: "PLATFORM_SUPPORT", mfa: true });
    expect(await get("/kyc-queue", support)).toMatchObject({ status: 403, body: { code: "PERMISSION_DENIED" } });
  });

  it("Passenger tìm chuyến → 200, không có DbScope tenant/platform (dữ liệu công khai: task MKT quyết)", async () => {
    const passenger = await token({ sub: "user-1", scope: "passenger", role: "PASSENGER" });
    expect(await get("/trips", passenger)).toMatchObject({ status: 200, body: { scope: "any", db: null } });
  });

  it("role lạ trong token ký hợp lệ → 401 ngay ở bước verify (role phải thuộc namespace của scope)", async () => {
    const forged = await token({ sub: "x", scope: "platform", role: "SUPER_ADMIN" });
    expect(await get("/trips", forged)).toMatchObject({ status: 401, body: { code: "AUTH_SESSION_EXPIRED" } });
  });
});

describe("TenantGuard — lớp phòng thủ khi claim tenant thiếu (verify đã chặn, guard vẫn phải tự đứng)", () => {
  it("grant tenant + token operator không có operatorId → 403 TENANT_SCOPE_VIOLATION", () => {
    const request = {
      params: {},
      user: { sub: "acc-2", sid: randomUUID(), scope: "operator", role: "OPERATOR_OWNER" },
      authz: { permission: "vehicle:manage", scope: "tenant", db: null },
    };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
    let code: string | undefined;
    try {
      new TenantGuard().canActivate(context);
    } catch (error) {
      code = ((error as { getResponse(): { code?: string } }).getResponse()).code;
    }
    expect(code).toBe("TENANT_SCOPE_VIOLATION");
  });

  it("@Authorize chỉ đặt được trên method — đặt trên class là lỗi compile", () => {
    // @ts-expect-error — `Authorize` trả MethodDecorator; đặt trên class thì guard đọc không thấy quyền.
    @Authorize("vehicle:manage")
    class Misused {}
    expect(Misused).toBeDefined();
  });
});
