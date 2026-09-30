# TASK-FND — Checklist kiểm tra & test Foundation

> Mục tiêu: xác nhận FND-001..008 chạy đúng (static → runtime → Docker/Render).
> Cách dùng: chạy theo thứ tự **PHẦN A → B → D**; PHẦN C là bảng DoD theo từng task. Tick `[x]` khi pass.
> Lệnh chạy ở repo root (`C:\Code\Ve_Xe_Nhanh`). Prefix `pnpm --filter @vexenhanh/api` = chạy trong app `api`.

## Snapshot trạng thái (06/06/2026)

- ✅ **FND-001..008 DONE** — lint ✓ · typecheck ✓ · **33 test** ✓ · build ✓ · OpenAPI/client gen ✓.
- ✅ **FND-008 (OpenAPI gen)** — API expose `/v1/docs` + `/v1/openapi.json`; `packages/api-client` sinh `src/generated/openapi.json` + `schema.ts` từ `openapi-typescript`.

---

## 0. Chuẩn bị

- [x] `node -v` = 24.x · `pnpm -v` = 10.x
- [x] `docker compose up -d` → `docker compose ps` = postgres/mongo/redis **healthy** (pgadmin/mongo-express optional)
- [x] `apps/api/.env` = `NODE_ENV="development"`; `apps/api/.env.development` đủ biến (đối chiếu `.env.example`)

## PHẦN A — Static (1 lượt cover phần lớn logic qua unit test)

- [x] `pnpm install` sạch — postinstall `prisma generate` sinh `apps/api/src/generated/prisma`
- [x] `pnpm --filter @vexenhanh/api prisma:validate` → `valid 🚀` (Prisma 7 config OK)
- [x] `pnpm --filter @vexenhanh/api typecheck` → 0 lỗi
- [x] `pnpm --filter @vexenhanh/api lint` → 0 lỗi _(gồm ESLint boundary Prisma↔Mongoose — FND-007)_
- [x] `pnpm --filter @vexenhanh/api test` → **all pass** _(env.config, redis.config, bull-board-access, problem-details.filter, request-context, audit.service, eslint-boundary)_
- [x] `pnpm --filter @vexenhanh/api build` → có `dist/` + **`dist/generated/prisma/client.js`**
- [x] `pnpm gen:api-client` → sinh/cập nhật `packages/api-client/src/generated/openapi.json` + `schema.ts` _(FND-008)_
- [x] (toàn monorepo) `pnpm typecheck` + `pnpm build` (turbo) → all task pass

## PHẦN B — Runtime (boot + smoke)

**Terminal 1**: `pnpm --filter @vexenhanh/api start` _(boot = connect Postgres + Mongo + Redis)_

- [x] Boot không lỗi; log **Pino structured** hiện ra (FND-006)
- [x] `pnpm --filter @vexenhanh/api exec prisma migrate status` → `up to date` (FND-003)

**Health** (Terminal 2 / browser) — kết nối THẬT 3 store:

- [x] `curl http://localhost:3000/v1/health` → `200` liveness
- [x] `/v1/health/postgres` → `{"status":"ok"}` _(Prisma 7 adapter `pg` — FND-003)_
- [x] `/v1/health/mongo` → `ok` _(Mongoose audit cluster — FND-003)_
- [x] `/v1/health/redis` → `ok` _(ioredis — FND-004)_
- [x] `/v1/health/queues` → `ok` _(BullMQ — FND-004)_

**RFC 7807 + request-id** (FND-006):

- [x] `curl -i http://localhost:3000/v1/khong-ton-tai` → `404` + header `Content-Type: application/problem+json` + body `{type,title,status,detail}`
- [x] Response có header **request-id** (vd `x-request-id`)

**OpenAPI + API client** (FND-008):

- [x] `curl http://localhost:3000/v1/openapi.json` → JSON có `"openapi":"3.1.0"` + path `/v1/health`
- [x] Mở `http://localhost:3000/v1/docs` → Swagger UI hiển thị nhóm `health`
- [x] `pnpm gen:api-client` → pass và không tạo diff nếu contract không đổi
- [x] Import type trong app khác: `import type { paths, components } from "@vexenhanh/api-client"`

**Queue / Worker** (FND-004):

- [x] **Terminal 3**: `pnpm --filter @vexenhanh/api start:worker` → `Worker bootstrap complete. BullMQ processors are registered.`
- [x] **Bull Board**: mở `http://localhost:3000/admin/queues` → dev mở; nếu set `BULL_BOARD_TOKEN` thì cần header `Authorization: Bearer <token>` (FND-004 guard)

## PHẦN C — DoD theo task

| Task                         | Deliverable (DoD)                                                                                 | Verify                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **FND-001** monorepo         | Turborepo + pnpm; 6 `apps/*` + 6 `packages/*`                                                     | `pnpm install` + `pnpm build` (turbo) ✓                                                                  |
| **FND-002** Docker/Render    | Dockerfile distroless + `render.yaml` + CI skeleton + secret placeholders                         | PHẦN D                                                                                                   |
| **FND-003** Prisma/Mongo/RLS | schema + migration `init`; `PrismaService` (adapter pg); Mongo audit; RLS convention (DB-PRIN-01) | migrate status + health/postgres,mongo                                                                   |
| **FND-004** Redis/BullMQ     | ioredis + BullMQ + worker tách + Bull Board guard (fail-closed prod)                              | health/redis,queues + worker boot + /admin/queues                                                        |
| **FND-005** env config       | Zod env **2-part** (`.env`→`.env.{NODE_ENV}`) + fail-fast + typed `APP_CONFIG`                    | `test` (env.config.spec) + app đọc `.env.development`                                                    |
| **FND-006** observability    | Pino + request-id + **RFC 7807 global filter** + Sentry (`instrument-api`) + OTel                 | `test` (filter/request-context spec) + RFC7807 smoke + request-id header                                 |
| **FND-007** audit            | Mongo `audit_event`/`system_log` **append-only** + ESLint boundary Prisma↔Mongoose                | `test` (audit.service + eslint-boundary spec)                                                            |
| **FND-008** OpenAPI          | OpenAPI 3.1 auto từ nestjs-zod + `gen:api-client` (`openapi-typescript`) → `packages/api-client`  | `/v1/docs`, `/v1/openapi.json`, `pnpm gen:api-client`, import generated types từ `@vexenhanh/api-client` |

## PHẦN D — Docker / Render

- [x] `docker build -t vexenhanh-api:fnd .` → build OK _(distroless, **không** libssl — Prisma 7 driver adapter)_
- [x] (smoke) chạy container với `DATABASE_URL` thật → **KHÔNG** lỗi `Cannot find module '.prisma/client/default'` _(generated client ở `dist/`)_
- [x] Mongo audit hardening production: set `MONGODB_ADMIN_URI`, `MONGODB_AUDIT_DB`, `MONGODB_AUDIT_APP_USER`, `MONGODB_AUDIT_APP_PASSWORD`; chạy `pnpm --filter @vexenhanh/api mongo:audit:hardening`; sau đó set `MONGODB_AUDIT_URI` bằng app user với `authSource=<MONGODB_AUDIT_DB>`.
- [x] Render: set secrets ở dashboard — `DATABASE_URL` (Supabase) · `MONGODB_AUDIT_URI` (Atlas) · `REDIS_URL` (Upstash/RedisLabs) · `SENTRY_DSN` · `BULL_BOARD_TOKEN`
- [x] Render deploy → `/v1/health` 200; logs Pino; (nếu có DSN) Sentry nhận event
- [x] Migrate Supabase: `prisma migrate deploy` (release command, đọc Render env group)

## Lưu ý

- **Sentry/OTel**: `SENTRY_DSN` trống → no-op (không lỗi). Test thật cần DSN (+ collector cho OTel).
- **Audit append-only**: app-layer chặn update/delete/replace/bulk bypass bằng Mongoose guard; DB-layer hardening qua Mongo role chỉ có `find` + `insert` cho `audit_event`/`system_log`.
- **RLS thật**: `health_checks` là non-tenant → RLS chưa exercise; áp `FORCE RLS` + policy ở **tenant table đầu** (vd TASK-TRN-001 Vehicle có `operator_id`).
- **Bí mật**: `.env.development`/`.env.production` đã `.gitignore` — đừng commit value.
