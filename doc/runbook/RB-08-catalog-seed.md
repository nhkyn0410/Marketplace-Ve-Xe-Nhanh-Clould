---
id: RB-08
title: Seed catalog chuẩn (tỉnh/xã, loại xe, tiện ích)
match:
  - db:seed:catalog
  - catalog-seed.ts
---

# RB-08 — Seed catalog chuẩn

**Mục đích:** nạp dữ liệu chuẩn Platform (tỉnh/thành, xã/phường, loại xe, tiện ích; dev có thêm bến xe mẫu) cho một môi trường. Chạy lại an toàn: chỉ **tạo mới**, không ghi đè dòng đã có.
**Điều kiện:** đã migrate + `db:app-role` ([RB-02](RB-02-prisma-migration.md)). Có file `apps/api/prisma/seed-data/administrative-units.csv` (UTF-8, tiêu đề `province_code,province_name,ward_code,ward_name`, mã tỉnh 2 chữ số, mã xã 5 chữ số). `MIGRATION_DATABASE_URL` là owner.

## Các bước

1. Lấy file danh mục chính thức (Cục Thống kê). Trong Excel đặt cột mã là **Text** trước khi lưu để giữ số 0 đầu → *Save As → CSV UTF-8*.
2. Dev/local: `pnpm --filter @vexenhanh/api run db:seed:catalog -- --with-samples` (có bến xe mẫu).
3. Production: đặt `NODE_ENV=production` + `MIGRATION_DATABASE_URL` của production rồi chạy **không** có `--with-samples`.

## Kiểm tra

- Dòng đầu in host/DB đích — đúng môi trường mới đọc tiếp.
- Lần 1 in số tỉnh/xã đọc từ file và số dòng tạo mới; chạy lần 2 báo tạo mới 0.
- `GET /v1/catalog/provinces` trả đủ số tỉnh trong file.

## Lỗi hay gặp

- `Dòng N: mã tỉnh "1" phải gồm đúng 2 chữ số`: Excel đã xoá số 0 đầu. Làm lại bước 1. Script không ghi dòng nào khi file sai.
- `Dòng 1: tiêu đề phải đúng …`: sai tên cột hoặc Excel lưu bằng dấu `;`.
- `ký tự lỗi mã hoá`: file không phải UTF-8. Lưu lại bằng *CSV UTF-8*.
- `Bỏ qua bến mẫu …`: tên phường mẫu không có trong file chính thức. Chỉ là cảnh báo, chỉ ảnh hưởng dữ liệu mẫu ở dev.
- Muốn sửa dữ liệu đã seed: sửa qua Admin (TASK-ADM-001), không chạy lại seed (seed không ghi đè).

**Liên quan:** DB-MIG-04 · API §7.6 · `doc/task-propreties/CAT-001-guide.md` §2
