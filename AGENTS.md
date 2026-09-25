# AGENTS.md — Marketplace-Ve-Xe-Nhanh

Coding-agent brief (cross-tool: Claude Code / Codex / Cursor / Copilot). **Lean by design** — full SDLC ở `doc/SDLC/`; quyết định công nghệ ở `doc/SDLC/10-architecture-decision-record.md` (27 ADR); live state ở `doc/context/PROJECT-STATE.md`; module map ở `doc/context/DOMAIN-MAP.md`; thuật ngữ ở `doc/context/GLOSSARY.md`.

> `CLAUDE.md` (root) = Claude Code operational brain (role · subagents · skills · workflow). File này (`AGENTS.md`) = stack · structure · code style · testing · boundaries (cross-tool). Đọc cả hai khi code; đọc tài liệu thiết kế qua subagent `sdlc-doc-reader`.

## Project

Managed marketplace bán vé xe khách, 3 bên (Passenger ↔ Platform ↔ Operator), 3 lớp dịch vụ (Marketplace / Operator OS / Platform admin). **Modular monolith**. Trạng thái: **build v1 (foundation)** — SDLC design xong (19/19 layer, 27 ADR; 11/13 doc Approved), scaffold monorepo nền `TASK-FND-001` xong (Turborepo + 6 apps + 6 packages), tiếp tục TASK-FND. SDLC docs = Tiếng Việt; **code / API / DB identifier = English**.

## Tech stack (đã chốt — ADR-002, ADR-009..027; KHÔNG đổi nếu chưa hỏi)

- **Runtime**: TypeScript (strict) + Node.js LTS 24. Tiền = `BIGINT` VND + `Decimal.js`; **CẤM** `number`/`float` cho tiền.
- **Backend**: NestJS 11 + **nestjs-zod** (KHÔNG class-validator). Modular monolith, 1 module / business domain.
- **DB**: PostgreSQL 16 + **Prisma 7.8.0** (operational; driver adapter `@prisma/adapter-pg` + `pg`, `prisma.config.ts` cho Migrate/Studio); MongoDB 7 + Mongoose 8 (audit, cluster RIÊNG, chỉ `audit_event` + `system_log`, append-only).
- **Cache / lock / queue**: Redis 7 (Upstash) + `ioredis`; **BullMQ** (`@nestjs/bullmq`).
- **Auth**: Better Auth + custom NestJS adapter; JWT RS256 15min + opaque refresh 30d (rotation + family); 3 namespace (Passenger=Email / Operator=`{slug}/{username}` / Platform=`platform/{username}`); RBAC 8-role enum; TenantGuard + Postgres RLS; TOTP.
- **API**: REST + OpenAPI 3.1 auto từ Zod; URL `/v1`; error RFC 7807; webhook HMAC.
- **Frontend**: Next.js 16 App Router; **Turborepo + pnpm** monorepo; UI = **Shadcn/ui + Tailwind CSS 4** trong `packages/ui` (ADR-013).
- **Mobile**: Flutter 3.x + Dart 3.x (2 app: `passenger_mobile`, `employee_mobile`) — ADR-028. Nằm **ngoài** pnpm workspace / Turborepo; dùng `flutter`/`dart` CLI.
- **Vendor** (sau adapter): VNPay + MoMo (payment), Resend (email), FCM + APNs (push), OAuth Google/FB/Apple, Goong (routing/map), Cloudflare R2 (storage), manual payout.
- **DevOps**: Render PaaS (SG); worker = Render Background Worker tách; Vitest + Supertest + Playwright + Maestro; GitHub Actions + Sentry + Pino + OpenTelemetry.

## Project structure (target monorepo)

```
apps/    api (NestJS)  marketplace · operator-os · admin (Next.js)  passenger_mobile · employee_mobile (Flutter)
packages/  types (Zod single source) · api-client (gen từ OpenAPI) · ui · utils (Decimal wrappers) · config
```

Module backend theo `DOMAIN-MAP §1/§2` (tên **singular**: `booking/`, `trip/`, `iam/auth/`, `vehicle/`...). Vendor ngoài sau adapter port `external/<provider>/`: `payment/{vnpay,momo}`, `notification/{email,push,sms}`, `routing/{goong,osrm}`, `storage`, `payout`.

## Commands (chính xác chốt khi scaffold; quy ước dự kiến)

- Install: `pnpm install`
- Dev: `pnpm dev` · Build: `pnpm build` (`turbo run build --filter=<app>`)
- Test: `pnpm test` (Vitest) · Lint: `pnpm lint` · Typecheck: `pnpm typecheck` (tsc)
- Gen API client: `pnpm gen:api-client` (sau khi đổi Zod schema)
- DB: `pnpm prisma migrate dev` · `pnpm prisma generate`

## Working principles (Karpathy guidelines)

1. **Think before coding** — surface assumptions + tradeoffs; if unclear, STOP and ask (don't assume silently).
2. **Simplicity first** — minimum code for the task; no speculative features / abstractions / config.
3. **Surgical changes** — touch only what's needed; match existing style; every changed line traces to the request.
4. **Goal-driven** — turn tasks into verifiable success criteria (usually tests); loop until they pass.

## Code style (pair Don't → Do)

- **Don't** gọi SDK vendor trực tiếp trong domain service → **Do** qua adapter `external/<provider>/` (ADR-006).
- **Don't** dùng `number` cho tiền → **Do** `BIGINT` column + `Decimal.js`, validate Zod.
- **Don't** query bỏ qua tenant → **Do** filter `operatorId` ở service/repo **và** Postgres RLS.
- **Don't** log token / OTP / password / card → **Do** Pino structured, mask PII (`0*** *** 789`).
- **Don't** cross-import Prisma ↔ Mongoose → **Do** chỉ `audit/` dùng Mongoose, còn lại Prisma (ESLint enforce).
- **Don't** đặt business logic trong controller → **Do** controller mỏng (transport + Zod + gọi service); logic ở service.
- Zod schema = single source (validate + OpenAPI + type), đặt ở `packages/types`.

## Testing (mandatory — ADR-025)

Bắt buộc test: **money math** (BIGINT/Decimal), **idempotency** (payment dedup `(provider, provider_txn_id)`, seat-hold), **tenant isolation** (RLS), **webhook HMAC**, **refresh-token reuse**. Vitest unit/integration (Testcontainers Postgres + Mongo); critical path e2e (Supertest API / Playwright web / Maestro mobile).

## Git workflow

- Branch từ default; KHÔNG commit thẳng default trừ khi được yêu cầu.
- **1 commit / thay đổi logic, message rõ ràng** — đây là nguồn lịch sử chính (KHÔNG nhồi prose dài vào PROJECT-STATE).
- Commit/push chỉ khi user yêu cầu. CI (GitHub Actions) phải pass: lint + typecheck + Vitest + build + gen-client.

## Boundaries (KHÔNG vi phạm)

- **KHÔNG mở rộng phạm vi** (thêm module / actor / vendor / business rule mới) — dừng, hỏi Khanh.
- **KHÔNG tự promote** tài liệu → `Approved` (chỉ Khanh).
- **Production-blocker**: OQ-21 (KYC storage residency) + OQ-22 (giấy phép TGTT NHNN) — KYC / payment thật chỉ chạy dev-local / sandbox cho tới khi giải quyết.
- Đụng tên module → `DOMAIN-MAP`; entity/state/error code → `GLOSSARY`; quyết định công nghệ → file 10 ADR. Không chắc → DỪNG, hỏi.

## Nhật ký sử dụng AI (bắt buộc, không commit)

Nhật ký 3 tầng, quy tắc đầy đủ: **`doc/AI-JOURNAL.md`**. **KHÔNG đọc/mở/sửa tay** file trong `.ai-journal/` (đã gitignore — ghi bắt buộc, commit thì KHÔNG).

- **Tầng 1 — hook tự ghi** (Claude Code; Codex qua `.codex/hooks.json` khi repo đã trust): file + tên hàm/class, lệnh, MCP, subagent. Sửa code bằng tool sửa file (Write/Edit/`apply_patch`), **không** sed/heredoc.
- **Mô tả công dụng**: mỗi class / hàm export / method public **mới** có 1 dòng doc comment tiếng Việt ngay trên khai báo (`/** … */` TS, `///` Dart) — nói nó dùng để làm gì, không giải thích code.
- **Tầng 2 — khai báo** (mỗi lần sinh/sửa code đáng kể; mỗi khi yêu cầu Khanh làm tay ngoài repo):

```bash
node .claude/hooks/ai-journal.mjs add "<Mảng kỹ thuật>" "<AI sử dụng>" "<Mục đích>" "<Phần AI sinh>" "" "<Nhận xét>"
node .claude/hooks/ai-journal.mjs ops "<Hạng mục>" "<Việc cần làm>" "<RB-xx hoặc bỏ trống>"
```

- "Phần AI sinh" = đường dẫn + phạm vi, **không dán mã nguồn** (trần 300 ký tự/ô). "Phần SV chỉnh" truyền `""` — Khanh tự điền, agent không bịa. Ghi đúng tool + model.
- Tool **không có hook** (Copilot, Cursor, hoặc Codex khi hook không chạy): cuối phiên chạy `node .claude/hooks/ai-journal.mjs snapshot <tên-tool>`.
- **Tầng 3 — sổ tay `doc/runbook/`**: thao tác lặp lại (cài package, migration, deploy…) có thẻ hướng dẫn ngắn; thao tác mới → viết thẻ.
