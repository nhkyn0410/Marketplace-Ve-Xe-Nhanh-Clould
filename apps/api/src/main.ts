import "./instrument-api";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ZodValidationPipe } from "nestjs-zod";
import { assertDecoratorMetadata } from "./common/assert-decorator-metadata";
import type { Auth } from "./iam/auth/auth.config";
import { BETTER_AUTH, BETTER_AUTH_BASE_PATH } from "./iam/auth/auth.constants";
import { ProblemDetailsExceptionFilter } from "./common/errors/problem-details.filter";
import { createHttpLoggerMiddleware, createAppLogger, createNestLogger } from "./common/observability/logger";
import { createRequestContextMiddleware } from "./common/observability/request-context";
import { AppModule } from "./app.module";
import { loadAppConfig } from "./config/env.config";
import { configureApiRoutes, setupOpenApi } from "./openapi/openapi";
import { createBullBoardAccessGuard } from "./queue/bull-board-access";
import { BullBoardService } from "./queue/bull-board.service";
import { BULL_BOARD_PATH } from "./queue/queue.constants";
import { configureTrustProxy } from "./common/trust-proxy";
import { configureSecurityHeaders } from "./common/security-headers";
import { configureWebCors } from "./common/web-cors";

async function bootstrap(): Promise<void> {
  // Fail-fast: sai runtime thì dependency inject theo kiểu thành undefined mà Nest không báo.
  assertDecoratorMetadata("api");
  const config = loadAppConfig(); // nạp .env + validate (fail-fast) trước khi bootstrap
  const logger = createAppLogger(config, "api");
  // bodyParser tắt để mount handler Better Auth trước — `toNodeHandler` cần raw body, body parser
  // chạy trước sẽ nuốt stream. Bật lại ngay bên dưới cho phần còn lại của app.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: createNestLogger(logger),
    bodyParser: false
  });
  configureTrustProxy(app, config.TRUST_PROXY_HOPS);
  configureSecurityHeaders(app, config.NODE_ENV);
  configureWebCors(app, config);
  const bullBoard = app.get(BullBoardService);

  app.use(createRequestContextMiddleware());
  app.use(createHttpLoggerMiddleware(logger));

  // Better Auth phục vụ chính các route của nó (`/api/auth/*` — mặc định basePath của thư viện,
  // NGOÀI prefix `/v1` của Nest). Bắt buộc phải có: `signInSocial` gửi cho provider
  // `redirectURI = {BETTER_AUTH_URL}/api/auth/callback/{provider}` — không mount thì callback ăn
  // 404, session cookie không bao giờ được set và luồng OAuth không thể hoàn tất (ADR-017/020).
  // better-auth là ESM-only → dynamic import (cùng lý do với `createAuth` ở auth.config.ts).
  const { toNodeHandler } = await import("better-auth/node");
  app.use(BETTER_AUTH_BASE_PATH, toNodeHandler(app.get<Auth>(BETTER_AUTH)));

  app.useBodyParser("json");
  app.useBodyParser("urlencoded", { extended: true });
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());
  app.use(BULL_BOARD_PATH, createBullBoardAccessGuard(), bullBoard.getRouter());
  configureApiRoutes(app);
  setupOpenApi(app);

  await app.listen(config.PORT);
}

void bootstrap();
