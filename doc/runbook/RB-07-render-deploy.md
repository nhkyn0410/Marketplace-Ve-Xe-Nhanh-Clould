---
id: RB-07
title: Deploy API lên Render
match:
  - /\brender\b/
  - onrender.com
---

# RB-07 — Deploy API lên Render

**Mục đích:** đưa bản API mới lên service `vexenhanh-api` (Docker, vùng Singapore) và quay lại bản cũ khi cần.
**Điều kiện:** tài khoản Render đã nối repo GitHub. Service được khai trong `render.yaml`.

## Các bước

1. Render tự deploy khi có commit mới trên nhánh mà service theo dõi, **và CI đã pass** (`autoDeployTrigger: checksPass`). Chỉ cần merge PR ([RB-06](RB-06-git-pr.md)).
2. Nếu có migration: áp lên DB thật **trước** khi deploy code cần schema mới (`prisma:migrate:deploy` rồi `db:app-role`, [RB-02](RB-02-prisma-migration.md)).
3. Biến môi trường khai `sync: false` trong `render.yaml` phải **nhập tay** trên Dashboard → service → *Environment*. Tuyệt đối không commit secret.
4. Theo dõi quá trình build và chạy ở Dashboard → *Events* / *Logs*.
5. Rollback: Dashboard → *Events* → chọn bản deploy trước → *Rollback*.

## Kiểm tra

- `https://<service>.onrender.com/v1/health` trả OK. `/v1/health` cũng là health check của Render.
- Log không có lỗi thiếu env lúc khởi động.

## Lỗi hay gặp

- Gói free: service ngủ sau khoảng 15 phút không có request, lần gọi đầu mất 30–60 giây. Đây là bình thường ở v1.
- Thiếu env bắt buộc (ví dụ `MFA_ENCRYPTION_KEY`) thì app không khởi động. Xem Logs, thêm env, rồi deploy lại.
- `DATABASE_URL` trên Render phải là role **app**, không phải owner. Dùng owner thì RLS mất tác dụng.
- Worker (BullMQ) chưa deploy lên Render ở v1, hiện đang chạy local (xem chú thích trong `render.yaml`).

**Liên quan:** ADR-023 (Render) · ADR-024 (worker) · `doc/SDLC/09-deployment-operation-standard.md`
