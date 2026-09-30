---
id: RB-09
title: Chạy E2E Playwright cho web Operator OS / Admin
match:
  - playwright test
  - test:e2e
  - e2e-web-auth-seed.ts
---

# RB-09 — Chạy E2E Playwright (web)

**Mục đích:** kiểm luồng đăng nhập web thật trên trình duyệt (TC-SEC-008): Operator OS first-login → TOTP → backup code, Admin TOTP, Employee bị chặn.
**Điều kiện:** Postgres/Redis/Mongo chạy ([RB-05](RB-05-local-infra.md)), đã migrate + `db:app-role` ([RB-02](RB-02-prisma-migration.md)). Cổng 3000/3002/3003 trống. Có Chrome, hoặc chạy một lần `npx playwright install chromium` trong `apps/operator-os`.

## Các bước

1. Bật API: `pnpm --filter @vexenhanh/api build` rồi `pnpm --filter @vexenhanh/api start` (để chạy riêng một terminal).
2. Ở terminal khác đặt `MIGRATION_DATABASE_URL` (owner DB — global-setup dùng để seed tài khoản E2E) và `$env:PLAYWRIGHT_CHANNEL = "chrome"` nếu dùng Chrome đã cài.
3. `pnpm --filter @vexenhanh/operator-os test:e2e` và `pnpm --filter @vexenhanh/admin test:e2e`. Playwright tự bật Next dev nếu 3002/3003 chưa chạy.

## Kiểm tra

- Operator 3 passed, Admin 2 passed.
- `git status` sạch ở `apps/*/next-env.d.ts` — `next dev` hay tự sửa file này; nếu đổi thì `git checkout --` lại.

## Lỗi hay gặp

- `API chưa chạy ở http://localhost:3000/v1`: bước 1 chưa xong hoặc API lỗi env.
- `MIGRATION_DATABASE_URL (hoặc DATABASE_URL) is required`: thiếu biến ở bước 2.
- `Không seed E2E ở production`: đang trỏ nhầm môi trường — dừng lại, kiểm `NODE_ENV`/URL DB.
- `Executable doesn't exist … chromium`: chưa cài trình duyệt Playwright; dùng `PLAYWRIGHT_CHANNEL=chrome` hoặc cài chromium.

**Liên quan:** `doc/task-propreties/IAM-006-guide.md` §3 · 08 Test TC-SEC-008 · ADR-025
