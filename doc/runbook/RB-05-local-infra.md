---
id: RB-05
title: Chạy hạ tầng local bằng Docker Compose
match:
  - docker compose
  - docker-compose
---

# RB-05 — Hạ tầng local (Postgres · Mongo · Redis)

**Mục đích:** có DB và cache ở máy để chạy API và test tích hợp mà không đụng dữ liệu thật.
**Điều kiện:** Docker Desktop đang chạy. Các port 5432, 27017, 6379 còn trống (thêm 5050, 8081 nếu dùng GUI).

## Các bước

1. Bật 3 dịch vụ chính: `docker compose up -d postgres mongo redis`
2. Xem trạng thái: `docker compose ps`, chờ cột STATUS báo `healthy`.
3. GUI xem DB (tuỳ chọn): `docker compose up -d pgadmin mongo-express`. pgAdmin ở `http://localhost:5050`, Mongo Express ở `http://localhost:8081`.
4. Xem log một dịch vụ: `docker compose logs -f postgres`
5. Tắt: `docker compose down`. Dữ liệu vẫn còn trong volume.
6. Xoá sạch dữ liệu để làm lại từ đầu: `docker compose down -v`. Sau đó migrate lại ([RB-02](RB-02-prisma-migration.md)).

## Kiểm tra

- `docker compose ps` báo `healthy` cho `postgres`, `mongo`, `redis`.
- API local gọi `GET /v1/health` trả OK.

## Lỗi hay gặp

- Port bị chiếm (thường do Postgres cài sẵn trên Windows): tắt service đó, hoặc đổi port trong `docker-compose.yml` và cả `.env`.
- Mật khẩu trong `docker-compose.yml` **chỉ dùng cho dev**. Không dùng lại ở môi trường thật.

**Liên quan:** ADR-011 (Postgres + Mongo) · ADR-015 (Redis) · `docker-compose.yml`
