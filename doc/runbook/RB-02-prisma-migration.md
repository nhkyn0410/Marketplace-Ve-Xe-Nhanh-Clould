---
id: RB-02
title: Tạo & áp migration Prisma + cấp quyền role app
match:
  - prisma:migrate
  - prisma migrate
  - db:app-role
  - prisma:generate
  - prisma generate
  - db:seed
---

# RB-02 — Tạo & áp migration Prisma

**Mục đích:** đổi schema Postgres có kiểm soát, đồng thời giữ RLS có hiệu lực (app không chạy bằng owner).
**Điều kiện:** Postgres đang chạy ([RB-05](RB-05-local-infra.md)). `MIGRATION_DATABASE_URL` là role **owner**, `DATABASE_URL` là role **app** (NOSUPERUSER, NOBYPASSRLS).

## Các bước

1. Sửa `apps/api/prisma/schema.prisma`. Nếu là SQL tay (RLS, policy) thì sửa trong migration sinh ra.
2. Tạo migration ở máy local: `pnpm --filter @vexenhanh/api run prisma:migrate:dev --name <ten_ngan>`
3. Cấp lại quyền cho role app (chạy lại nhiều lần vẫn an toàn): `pnpm --filter @vexenhanh/api run db:app-role`
4. Sinh lại client: `pnpm --filter @vexenhanh/api run prisma:generate`
5. DB đã có dữ liệu (staging/production): **không** dùng `migrate dev`. Chạy `pnpm --filter @vexenhanh/api run prisma:migrate:deploy`, rồi `db:app-role`.

## Kiểm tra

- Có thư mục mới trong `apps/api/prisma/migrations/`, và commit nó cùng schema.
- Test DB pass với role app: `REQUIRE_DB_TESTS=1` ([RB-03](RB-03-quality-check.md)).

## Lỗi hay gặp

- Migration đã áp ở nơi khác thì **không sửa lại**. Muốn đổi thì tạo migration mới (checksum sẽ lệch).
- Test pass nhưng RLS không chặn gì: đang chạy bằng owner. Kiểm lại `DATABASE_URL`.
- Bảng tenant mới phải bật `ENABLE` + `FORCE ROW LEVEL SECURITY` và có policy, nếu không thì dữ liệu lộ giữa các nhà xe.

**Liên quan:** ADR-011 (Postgres + Prisma, RLS) · `doc/SDLC/04-database-design.md`
