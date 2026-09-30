# 05. API Specification - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                     |
| ------------- | --------------------------- |
| Tên tài liệu  | API Specification           |
| Mã tài liệu   | 05-api-specification        |
| Dự án         | Marketplace-Ve-Xe-Nhanh     |
| Trạng thái    | Approved                    |
| Người viết    | Nguyễn Hồng Khanh, AI Agent |
| Người duyệt   | Nguyễn Hồng Khanh           |
| Ngày tạo      | 11/05/2026                  |
| Ngày cập nhật | 01/06/2026                  |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp API Specification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v0.2      | 01/06/2026 | AI Agent       | **Sprint 5 Rework** — reset theo **ADR-012** (REST + OpenAPI 3.1 auto từ Zod single source, URL `/v1/*`, RFC 7807 error, webhook HMAC), **ADR-017** (auth 3-namespace + Hybrid token + MFA), **ADR-019** (webhook VNPay/MoMo HMAC dedup), **ADR-020** (OAuth + notification). §4 quy ước OpenAPI/Zod/versioning; §5 auth 3-namespace; §6 error → RFC 7807; §7 endpoint cập nhật (auth OTP/OAuth/MFA, admin complex-action POST sub-resource); §10 webhook HMAC + realtime transport TBD. Đóng API-OQ-01 (cookie+Bearer per ADR-017), API-OQ-02 (guest checkout per SRS), API-OQ-03 (VNPay+MoMo per ADR-019). |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Quy ước API
5. Auth và permission
6. Response và error format
7. Endpoint groups
8. Idempotency
9. Pagination, filtering, sorting
10. Webhook và realtime API
11. Open Questions / TBD

---

## 3. Giới thiệu

Tài liệu này mô tả API contract cho frontend, mobile và backend. Theo **ADR-012**, API style v1 = **REST + OpenAPI 3.1** với **Zod là single source** (nestjs-zod + `@nestjs/swagger` auto-gen OpenAPI → `openapi-typescript` + `orval`/`@hey-api` gen client TS — tool client cụ thể chốt khi setup). Chi tiết request/response DTO hoàn thiện cùng LLD + DB Design.

Tài liệu tham chiếu: `01-srs`, `02-hld`, `03-lld`, `04-database-design`, `10-adr` (v0.21 — ADR-012/017/019/020), `07-security`, `context/GLOSSARY` (error code).

---

## 4. Quy ước API

| Quy ước            | Giá trị                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Base path          | `/v1` (URL versioning; breaking change → `/v2`, ADR-012)                                                                |
| Spec               | OpenAPI 3.1 auto-gen từ Zod schema (sticky 3.0 v1 cho tới khi tool ecosystem support 3.1, ADR-012)                      |
| Format             | JSON; error = `application/problem+json` (RFC 7807)                                                                     |
| Auth               | Web = JWT access trong httpOnly cookie; Mobile = `Authorization: Bearer <jwt>` (token từ `expo-secure-store`) (ADR-017) |
| Timezone hiển thị  | `Asia/Ho_Chi_Minh`                                                                                                      |
| Time lưu trữ       | UTC                                                                                                                     |
| Currency           | VND (amount = integer đồng)                                                                                             |
| Naming             | camelCase cho JSON field                                                                                                |
| Deprecation        | OpenAPI `deprecated: true` + response header `Deprecation: <date>` (ADR-012)                                            |
| Idempotency header | `Idempotency-Key` cho thao tác payment/refund/booking nhạy cảm                                                          |
| Correlation header | `X-Request-Id` nếu client/gateway cung cấp                                                                              |

---

## 5. Auth và permission

Identity 3 namespace tách biệt (ADR-017). Hybrid token: JWT RS256 access 15min + opaque refresh 30d (rotation + family invalidation).

| Actor               | Auth flow                                                                    | Ghi chú                                                  |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| Guest               | Không token cho public search/detail; guest session cho hold/book/pay/lookup | Guest checkout có trong v1 (SRS/GLOSSARY)                |
| Passenger (User)    | Email + OTP (primary) hoặc OAuth Google/Facebook/Apple (ADR-020)             | Self-register; Hybrid token                              |
| Operator / Employee | `{operatorSlug}/{username}` + password (closed enrollment)                   | Scope theo `operatorId` + assignment; không public/OAuth |
| Admin / Platform    | `platform/{username}` + password (closed enrollment)                         | TOTP mandatory; không public/OAuth                       |

MFA: TOTP bắt buộc OperatorOwner / PlatformAdmin / PlatformSupport; optional Driver / TicketStaff / SupportStaff (ADR-017).

---

## 6. Response và error format

### 6.1. Response thành công

HTTP status code là nguồn chuẩn. Body bọc nhẹ:

```json
{
  "data": {},
  "meta": { "requestId": "..." }
}
```

### 6.2. Response lỗi — RFC 7807 Problem Details (ADR-012)

`Content-Type: application/problem+json`

```json
{
  "type": "https://api.vexenhanh.vn/problems/booking-expired",
  "title": "Booking đã hết hạn thanh toán",
  "status": 409,
  "detail": "SeatHold đã hết TTL trước khi thanh toán.",
  "instance": "/v1/bookings/{bookingId}/payments",
  "code": "BOOKING_EXPIRED"
}
```

Field `code` dùng error code chuẩn (GLOSSARY); `type` là URI ổn định; `status` khớp HTTP status.

### 6.3. Nhóm error code

| Prefix         | Nhóm lỗi                                                     |
| -------------- | ------------------------------------------------------------ |
| `AUTH_*`       | Đăng nhập, session, token, MFA                               |
| `PERMISSION_*` | RBAC, ownership, tenant boundary                             |
| `VALIDATION_*` | Input/Zod schema không hợp lệ                                |
| `SEAT_*`       | Chọn ghế, giữ ghế, xung đột ghế                              |
| `BOOKING_*`    | Booking state/snapshot                                       |
| `PAYMENT_*`    | Payment, callback, reconciliation                            |
| `REFUND_*`     | Refund policy/state                                          |
| `TICKET_*`     | Ticket, QR, check-in                                         |
| `OPERATOR_*`   | KYC, profile, status                                         |
| `PAYOUT_*`     | Payout, escrow, commission                                   |
| `SYSTEM_*`     | Provider lỗi, bảo trì, 503 (Redis down), lỗi không phân loại |

---

## 7. Endpoint groups

Path dưới đây tương đối với base `/v1`.

### 7.1. Auth

| Method | Path                     | Actor              | Mục đích                                  |
| ------ | ------------------------ | ------------------ | ----------------------------------------- |
| POST   | `/auth/register`         | Passenger          | Đăng ký Passenger (Email)                 |
| POST   | `/auth/otp/request`      | Passenger, Guest   | Gửi Email OTP (Resend)                    |
| POST   | `/auth/otp/verify`       | Passenger          | Xác thực OTP + cấp token                  |
| POST   | `/auth/oauth/{provider}` | Passenger          | OAuth Google / Facebook / Apple (ADR-020) |
| POST   | `/auth/operator/login`   | Operator, Employee | Login `{slug}/{username}` + password      |
| POST   | `/auth/platform/login`   | Admin, Platform    | Login `platform/{username}` + password    |
| POST   | `/auth/mfa/verify`       | Authenticated      | Xác thực TOTP / backup code               |
| POST   | `/auth/refresh`          | Authenticated      | Refresh token (rotation + family)         |
| POST   | `/auth/logout`           | Authenticated      | Logout + revoke session                   |
| POST   | `/auth/re-auth`          | Authenticated      | Re-auth thao tác nhạy cảm                 |

### 7.2. Marketplace

| Method | Path                                     | Actor       | Mục đích                          |
| ------ | ---------------------------------------- | ----------- | --------------------------------- |
| GET    | `/trips/search`                          | User, Guest | Tìm kiếm chuyến (cache Redis 60s) |
| GET    | `/trips/{tripId}`                        | User, Guest | Xem chi tiết chuyến               |
| GET    | `/operators/{operatorId}/public-profile` | User, Guest | Xem profile Operator              |
| POST   | `/seat-holds`                            | User, Guest | Giữ ghế (Redis SET NX EX 600)     |
| DELETE | `/seat-holds/{holdId}`                   | User, Guest | Hủy hold                          |
| POST   | `/bookings`                              | User, Guest | Tạo booking                       |
| GET    | `/bookings/{bookingId}`                  | User, Guest | Xem booking                       |
| POST   | `/bookings/{bookingId}/payments`         | User, Guest | Tạo payment (VNPay/MoMo)          |
| GET    | `/tickets/{ticketId}`                    | User        | Xem vé                            |
| POST   | `/guest/ticket-lookup`                   | Guest       | Tra cứu vé khách vãng lai         |

### 7.3. Operator OS

| Method       | Path                        | Actor    | Mục đích                          |
| ------------ | --------------------------- | -------- | --------------------------------- |
| GET/PUT      | `/operator/profile`         | Operator | Xem/cập nhật hồ sơ                |
| POST         | `/operator/kyc-documents`   | Operator | Upload hồ sơ KYC (presigned R2)   |
| GET          | `/operator/finance/escrow`  | Operator | Xem escrow balance                |
| GET          | `/operator/finance/payouts` | Operator | Xem lịch sử payout                |
| GET/POST/PUT | `/operator/vehicles`        | Operator | Quản lý vehicle                   |
| GET/POST/PUT | `/operator/seat-maps`       | Operator | Quản lý seat map                  |
| GET/POST/PUT | `/operator/routes`          | Operator | Quản lý route                     |
| GET/POST/PUT | `/operator/trips`           | Operator | Quản lý trip                      |
| GET          | `/operator/bookings`        | Operator | Xem booking/ticket thuộc Operator |
| GET/POST/PUT | `/operator/employees`       | Operator | Quản lý Employee (issue account)  |

### 7.4. Employee operations

| Method | Path                                  | Actor    | Mục đích                           |
| ------ | ------------------------------------- | -------- | ---------------------------------- |
| GET    | `/employee/assignments`               | Employee | Xem nhiệm vụ/chuyến được phân công |
| GET    | `/employee/trips/{tripId}/passengers` | Employee | Xem danh sách hành khách           |
| POST   | `/employee/tickets/verify`            | Employee | Xác thực QR/mã vé                  |
| POST   | `/employee/check-ins`                 | Employee | Check-in hành khách                |
| POST   | `/employee/trips/{tripId}/status`     | Employee | Cập nhật trạng thái chuyến         |
| POST   | `/employee/incidents`                 | Employee | Báo cáo sự cố                      |

### 7.5. Admin

Thao tác phức tạp dùng `POST` + sub-resource (ADR-012).

| Method       | Path                                        | Actor | Mục đích                                 |
| ------------ | ------------------------------------------- | ----- | ---------------------------------------- |
| GET          | `/admin/dashboard`                          | Admin | Dashboard tổng quan                      |
| GET          | `/admin/operators/{operatorId}/kyc`         | Admin | Xem hồ sơ KYC                            |
| POST         | `/admin/operators/{operatorId}/kyc/approve` | Admin | Duyệt KYC + cấp slug/Owner               |
| POST         | `/admin/operators/{operatorId}/kyc/reject`  | Admin | Từ chối / yêu cầu bổ sung                |
| GET/POST/PUT | `/admin/catalog/*`                          | Admin | Catalog chuẩn                            |
| GET/POST/PUT | `/admin/policies`                           | Admin | Policy hủy/giữ ghế/dữ liệu               |
| GET/POST/PUT | `/admin/commission-rules`                   | Admin | Commission rule (5% + override)          |
| GET          | `/admin/payments`                           | Admin | Giám sát payment                         |
| POST         | `/admin/refunds/{refundId}/decision`        | Admin | Refund thủ công (audited)                |
| POST         | `/admin/escrow/{ledgerId}/adjust`           | Admin | Điều chỉnh ledger (audited)              |
| POST         | `/admin/payouts/{payoutId}/confirm`         | Admin | Confirm payout + nhập bank ref (ADR-022) |
| GET/PUT      | `/admin/disputes`                           | Admin | Dispute workflow (final arbiter)         |
| GET          | `/admin/audit-logs`                         | Admin | Truy xuất audit (Mongo)                  |

---

## 8. Idempotency

| API                                | Idempotency bắt buộc | Key                                                  |
| ---------------------------------- | -------------------- | ---------------------------------------------------- |
| `POST /seat-holds`                 | Có                   | actor/session + trip + seats hoặc client key         |
| `POST /bookings`                   | Có                   | SeatHold id + client key                             |
| `POST /bookings/{id}/payments`     | Có                   | booking id + method + client key                     |
| Payment callback (webhook)         | Có                   | dedup unique `(provider, provider_txn_id)` (ADR-019) |
| Refund request                     | Có                   | booking/payment/refund id + reason                   |
| Ticket issuance                    | Có                   | booking item id                                      |
| `POST /admin/payouts/{id}/confirm` | Có                   | `(operator_id, period)`                              |

---

## 9. Pagination, filtering, sorting

| Quy ước    | Giá trị nháp                                                        |
| ---------- | ------------------------------------------------------------------- |
| Pagination | `page`, `limit` hoặc cursor cho dữ liệu lớn (per-endpoint chốt LLD) |
| Sorting    | `sortBy`, `sortOrder`                                               |
| Filtering  | Query params theo từng endpoint (Zod schema)                        |
| Max limit  | TBD (chốt LLD)                                                      |
| Export lớn | Async job (BullMQ), không trả file lớn trực tiếp nếu vượt ngưỡng    |

---

## 10. Webhook và realtime API

### 10.1. Webhook inbound

| Loại                   | Path                           | Ghi chú                                                                                                                                 |
| ---------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Payment callback (IPN) | `/webhooks/payment/{provider}` | `provider` ∈ {vnpay, momo}; verify HMAC (VNPay SHA512 / MoMo SHA256) + timestamp + nonce + dedup; xử lý async BullMQ (ADR-012, ADR-019) |
| Refund callback        | `/webhooks/refund/{provider}`  | Provider-dependent; verify HMAC + idempotent                                                                                            |

### 10.2. Realtime event

Transport realtime (Socket.IO / SSE / polling) **chưa thuộc 15-layer selection** — xem HLD-OQ-11; v1 fallback polling.

| Event                         | Người nhận            |
| ----------------------------- | --------------------- |
| `booking.updated`             | User, Operator        |
| `trip.operation.updated`      | Operator, Admin       |
| `employee.assignment.updated` | Employee              |
| `dispute.updated`             | User, Operator, Admin |

---

## 11. Open Questions / TBD

| ID        | Câu hỏi                                              | Tác động           | Trạng thái                                                                                     |
| --------- | ---------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| API-OQ-01 | Auth token lưu/cấp qua Bearer hay cookie cho web?    | FE/API/Security    | **Đóng theo ADR-017**: Web = httpOnly cookie; Mobile = Bearer (token từ expo-secure-store)     |
| API-OQ-02 | Guest checkout có nằm trong v1 không?                | Booking API        | **Đóng theo SRS/GLOSSARY**: Guest có guest session cho hold/book/pay/lookup                    |
| API-OQ-03 | Provider payment đầu tiên là gì?                     | Webhook contract   | **Đóng theo ADR-019**: VNPay (HMAC-SHA512) + MoMo (HMAC-SHA256)                                |
| API-OQ-04 | Chuẩn pagination dùng page hay cursor cho từng list? | API consistency    | Mở; chốt per-endpoint khi LLD                                                                  |
| API-OQ-05 | Error code chính thức có cần versioning không?       | FE/Mobile handling | Mở; cơ chế deprecation OpenAPI (`deprecated` + header) đã có (ADR-012); danh mục code chốt LLD |

---

### Quy ước mã trong API Spec

- `API-OQ-NN`: Câu hỏi mở của API Specification.
