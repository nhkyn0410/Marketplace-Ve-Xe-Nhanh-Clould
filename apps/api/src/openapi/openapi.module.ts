import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { AppController } from "../app.controller";
import { CatalogController } from "../catalog/catalog.controller";
import { CatalogService } from "../catalog/catalog.service";
import { APP_CONFIG } from "../config/env.config";
import { DatabaseHealthService } from "../database/database-health.service";
import { MongoHealthService } from "../database/mongo-health.service";
import { AuthController } from "../iam/auth/auth.controller";
import { AuthService } from "../iam/auth/auth.service";
import { TokenService } from "../iam/auth/token.service";
import { PermissionGuard } from "../iam/role/permission.guard";
import { RecentReauthGuard } from "../iam/role/recent-reauth.guard";
import { TenantGuard } from "../iam/role/tenant.guard";
import { SessionController } from "../iam/session/session.controller";
import { SessionService } from "../iam/session/session.service";
import { EmployeeAccountController } from "../iam/user/employee-account.controller";
import { EmployeeAccountService } from "../iam/user/employee-account.service";
import { QueueHealthService } from "../queue/queue-health.service";
import { RedisHealthService } from "../redis/redis-health.service";
import { SeatMapController } from "../vehicle/seat-map.controller";
import { SeatMapService } from "../vehicle/seat-map.service";
import { VehicleController } from "../vehicle/vehicle.controller";
import { VehicleService } from "../vehicle/vehicle.service";

@Module({
  // Mọi controller IAM phải có mặt ở đây, nếu không route biến mất khỏi OpenAPI
  // và `gen:api-client` sinh client thiếu toàn bộ auth mà CI vẫn xanh (ADR-012).
  controllers: [
    AppController,
    AuthController,
    SessionController,
    EmployeeAccountController,
    CatalogController,
    VehicleController,
    SeatMapController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    // Scan-only: chỉ cần metadata route, không cần dependency thật (không Postgres/Redis/Mongo).
    { provide: AuthService, useValue: {} },
    { provide: CatalogService, useValue: {} },
    { provide: VehicleService, useValue: {} },
    { provide: SeatMapService, useValue: {} },
    // Dependency của AccessTokenGuard (logout, re-auth) — Nest dựng guard lúc khởi tạo module.
    { provide: TokenService, useValue: {} },
    { provide: SessionService, useValue: {} },
    { provide: EmployeeAccountService, useValue: {} },
    { provide: PermissionGuard, useValue: {} },
    { provide: TenantGuard, useValue: {} },
    { provide: RecentReauthGuard, useValue: {} },
    { provide: APP_CONFIG, useValue: { NODE_ENV: "test" } },
    {
      provide: DatabaseHealthService,
      useValue: { check: () => Promise.resolve({ status: "ok", service: "postgres", timestamp: timestamp() }) }
    },
    {
      provide: MongoHealthService,
      useValue: { check: () => Promise.resolve({ status: "ok", service: "mongo", timestamp: timestamp() }) }
    },
    {
      provide: RedisHealthService,
      useValue: { check: () => Promise.resolve({ status: "ok", service: "redis", timestamp: timestamp() }) }
    },
    {
      provide: QueueHealthService,
      useValue: {
        check: () =>
          Promise.resolve({
            status: "ok",
            queues: [{ name: "foundation", counts: {} }],
            timestamp: timestamp()
          })
      }
    }
  ]
})
export class OpenApiModule {}

function timestamp(): string {
  return new Date(0).toISOString();
}
