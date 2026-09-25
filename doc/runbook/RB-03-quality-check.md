---
id: RB-03
title: Kiểm tra trước khi commit (lint · typecheck · test · build)
match:
  - /(^|[;&|]\s*)pnpm\s+(.*\s)?(lint|typecheck|test|build)(\s|$)/
  - /\bturbo\s+run\b/
  - vitest
  - /(^|[;&|]\s*)(fvm\s+)?(flutter|dart)\s+(test|analyze|format)\b/
---

# RB-03 — Kiểm tra trước khi commit

**Mục đích:** bắt lỗi ở máy mình trước khi CI (GitHub Actions) bắt, vì CI đỏ thì không merge được.
**Điều kiện:** đã `pnpm install`. Test có DB thì cần Docker với Postgres, Redis, Mongo đang chạy ([RB-05](RB-05-local-infra.md)).

## Các bước

1. Toàn repo, giống CI: `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`
2. Chỉ một app (nhanh hơn): `pnpm --filter @vexenhanh/api test` (tương tự với `lint`, `typecheck`, `build`).
3. Test tích hợp DB **không được skip**: đặt `$env:REQUIRE_DB_TESTS = "1"` rồi chạy test API.
4. Nếu đổi API contract thì sinh lại client ([RB-04](RB-04-api-client.md)), rồi chạy `pnpm turbo run typecheck lint test build`.
5. Mobile (trong thư mục app): `fvm flutter analyze` → `fvm flutter test`.

## Kiểm tra

- Mọi lệnh thoát 0; không có test bị "skipped" vì thiếu DB, Redis hay Mongo.
- Test bắt buộc (ADR-025) có mặt khi chạm tới: tiền, idempotency, tenant/RLS, webhook HMAC.

## Lỗi hay gặp

- Chạy ở máy thì pass nhưng CI đỏ: do cache Turborepo. Chạy lại với `--force`, hoặc kiểm tra file sinh ra chưa commit.
- Test DB fail vì kết nối: container chưa healthy. Chạy `docker compose ps` để xem.

**Liên quan:** ADR-025 (Vitest, test bắt buộc) · ADR-026 (CI) · `.github/workflows/ci.yml`
