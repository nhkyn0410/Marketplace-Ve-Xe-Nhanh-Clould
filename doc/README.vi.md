# Marketplace Ve Xe Nhanh

Ngôn ngữ: [English](../README.md) | Tiếng Việt

Marketplace quản lý bán vé xe khách liên tỉnh tại Việt Nam, phục vụ ba phía của hệ thống:

- Marketplace cho hành khách
- Operator OS cho nhà xe và nhân viên vận hành
- Platform admin cho đội ngũ quản trị nền tảng

Dự án được triển khai theo hướng modular monolith bằng TypeScript trong monorepo pnpm + Turborepo.

## Trạng Thái Hiện Tại

Phần foundation scaffold đã bắt đầu. `TASK-FND-001` đã tạo workspace monorepo, tooling gốc, và shell ban đầu cho các app/package. Business modules, database schema, auth, payment, queue jobs, và production integrations sẽ được xây dựng ở các foundation/feature task tiếp theo.

Nguồn thiết kế chính nằm trong `doc/SDLC/`. Khi bắt đầu code, đọc `AGENTS.md` trước để nắm stack, cấu trúc, code style, testing, và boundary của dự án.

## Stack

| Khu vực | Lựa chọn |
| --- | --- |
| Runtime | Node.js 24 LTS, TypeScript strict |
| Package manager | pnpm 10 |
| Monorepo | Turborepo |
| Backend | NestJS 11, nestjs-zod |
| Web | Next.js 16 App Router |
| Mobile | Expo SDK 55+ |
| Operational DB | PostgreSQL 16, Prisma 5 |
| Audit/log DB | MongoDB 7, Mongoose 8 |
| Cache/lock/queue | Redis 7, ioredis, BullMQ |
| Tests | Vitest, Supertest, Playwright, Maestro |
| Observability | Pino, Sentry, OpenTelemetry |

## Cấu Trúc Repository

```text
apps/
  api/                  NestJS API và worker entrypoints
  marketplace/          Next.js app cho hành khách
  operator-os/          Next.js dashboard cho nhà xe và nhân viên
  admin/                Next.js dashboard cho platform admin
  passenger-mobile/     Expo app cho hành khách
  employee-mobile/      Expo app cho nhân viên

packages/
  types/                Zod schemas và shared TypeScript types
  api-client/           Placeholder cho generated API client
  ui/                   Shared web UI package
  ui-mobile-shared/     Shared mobile UI helpers
  utils/                Shared utilities, gồm money helpers
  config/               Shared TypeScript configuration
```

## Yêu Cầu Môi Trường

- Node.js `>=24 <25`
- pnpm `>=10 <11`

Phiên bản Node được khai báo qua `engines.node` trong `package.json` (`>=24 <25`). Nếu pnpm báo unsupported engine, hãy đổi shell local sang Node 24 (vd `nvm use 24`) trước khi chạy lệnh của dự án.

## Bắt Đầu Nhanh

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Chạy toàn bộ app ở chế độ development:

```bash
pnpm dev
```

Chạy một workspace bằng Turbo filter khi cần:

```bash
pnpm turbo run build --filter=@vexenhanh/api
pnpm turbo run dev --filter=@vexenhanh/marketplace
```

## Lệnh Gốc

| Lệnh | Mục đích |
| --- | --- |
| `pnpm dev` | Chạy các dev task của workspace song song |
| `pnpm build` | Build tất cả workspace |
| `pnpm lint` | Lint tất cả workspace |
| `pnpm typecheck` | Typecheck tất cả workspace |
| `pnpm test` | Chạy Vitest trên các workspace |
| `pnpm gen:api-client` | Generate API client package sau khi OpenAPI thay đổi |

## Quy Tắc Phát Triển

- Code, API, và database identifiers dùng English.
- Tài liệu SDLC viết bằng tiếng Việt.
- Dùng Zod làm nguồn validation và OpenAPI duy nhất.
- Không dùng `number` hoặc floating point cho tiền. Lưu VND bằng `BIGINT` và dùng Decimal.js wrappers.
- Không gọi vendor SDK trực tiếp từ domain services. Đi qua adapters dưới `external/<provider>/`.
- Controller phải mỏng. Business logic nằm trong service.
- Enforce tenant isolation ở services/repositories và PostgreSQL RLS.
- Không log tokens, OTPs, passwords, card data, hoặc raw sensitive PII.

## Kỳ Vọng Testing

Các vùng bắt buộc phải có coverage theo SDLC:

- Money math bằng BIGINT/Decimal
- Idempotency cho payment và seat-hold
- Tenant isolation và RLS behavior
- Webhook HMAC verification
- Refresh-token reuse detection

Với thay đổi nhỏ, viết test tập trung. Khi chạm shared contracts, auth, payment, tenant isolation, hoặc generated API surfaces, mở rộng phạm vi test tương ứng.

## Git Workflow

- Branch từ default branch.
- Không commit trực tiếp lên default branch trừ khi được yêu cầu rõ.
- Một commit cho một thay đổi logic.
- Chỉ commit/push khi được yêu cầu.
- Commit message theo hướng dẫn Copilot trong `.github/instructions/commit-message.instructions.md`.

## Tài Liệu Quan Trọng

| File | Vai trò |
| --- | --- |
| `AGENTS.md` | Coding brief cross-tool: stack, structure, style, testing, boundaries |
| `CLAUDE.md` | Claude Code operational workflow và project state pointers |
| `doc/context/PROJECT-STATE.md` | Trạng thái sống của dự án |
| `doc/context/DOMAIN-MAP.md` | Map domain và tên module |
| `doc/context/GLOSSARY.md` | Thuật ngữ entity, state, error-code |
| `doc/SDLC/10-architecture-decision-record.md` | Architecture decisions |
| `doc/SDLC/11-project-task-breakdown.md` | Build task backlog |

## Production Blockers

Hai điểm sau còn là blocker cho production, nhưng không chặn local development hoặc sandbox MVP:

- Quyết định về KYC storage residency
- Yêu cầu giấy phép trung gian thanh toán tại Việt Nam cho vận hành escrow/payment thật
