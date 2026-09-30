# 03. Low Level Design - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                                     |
| ------------- | ------------------------------------------- |
| Tên tài liệu  | Low Level Design - Hệ thống đặt vé xe khách |
| Mã tài liệu   | 03-lld-he-thong-dat-ve-xe-khach             |
| Dự án         | Marketplace-Ve-Xe-Nhanh                     |
| Trạng thái    | Approved                                    |
| Người viết    | Nguyễn Hồng Khanh, AI Agent                 |
| Người duyệt   | Nguyễn Hồng Khanh                           |
| Ngày tạo      | 11/05/2026                                  |
| Ngày cập nhật | 01/06/2026                                  |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp LLD từ SRS, HLD và context repo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| v0.2      | 25/05/2026 | AI Agent       | Align module list theo `context/DOMAIN-MAP` target state; bổ sung tham chiếu GLOSSARY và PROJECT-STATE; đóng LLD-OQ-02, LLD-OQ-03, LLD-OQ-05                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| v0.3      | 25/05/2026 | AI Agent       | Cập nhật tham chiếu SRS v1.15 → v1.20; gỡ wording "skeleton hiện tại" khỏi §3.2. Không thay đổi nội dung normative.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| v0.4      | 01/06/2026 | AI Agent       | **Sprint 5 Rework** — reset stack theo 18 ADR. §5.1 pattern: Prisma repo (Postgres) + Mongoose (audit), Zod DTO (nestjs-zod), BullMQ processor. §5.2 module: Identity bake **ADR-017 confirmed** (Better Auth + Hybrid token + 3-namespace + closed enrollment + TenantGuard); Payment VNPay+MoMo; Notification Resend+Expo+sms-noop; Reporting Postgres CTE+Mongo agg; Audit Mongo cluster riêng; cross-cutting external adapters per ADR. §6 thêm 6.5 Auth login+token refresh + 6.6 Payout T+3; seat hold = Redis. **Đóng LLD-OQ-01** (seat hold Redis per ADR-015) + **LLD-OQ-05** (audit Mongo cluster RIÊNG per ADR-011); cập nhật LLD-OQ-03 (VNPay+MoMo). ⚠️ ADR-017 re-confirm CRITICAL — Khanh chốt toàn bộ 01/06/2026. |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Nguyên tắc thiết kế chi tiết
5. Cấu trúc module backend
6. Thiết kế use case trọng yếu
7. Validation và error handling
8. State handling
9. Audit và logging
10. Open Questions / TBD

---

## 3. Giới thiệu

### 3.1. Mục đích

Tài liệu này mô tả thiết kế chi tiết mức module/service cho các nghiệp vụ trọng yếu trong hệ thống. LLD dùng làm đầu vào trực tiếp cho lập trình viên trước khi triển khai code. Stack đã chốt theo các ADR (file 10 v0.21): NestJS 11 + nestjs-zod, Prisma 5 (Postgres) / Mongoose 8 (Mongo audit), BullMQ, Redis Upstash, Better Auth; deploy Render + worker tách (ADR-023/024).

### 3.2. Tài liệu tham chiếu

| Tài liệu                                     | Vai trò                                                                                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `01-srs-he-thong-dat-ve-xe-khach.md` | Yêu cầu hệ thống                                                                                                                                                                                       |
| `02-hld-he-thong-dat-ve-xe-khach.md`  | Kiến trúc tổng quan và module boundary                                                                                                                                                                 |
| `04-database-design.md`               | Bảng Postgres / collection Mongo, index, transaction, migration                                                                                                                                        |
| `10-architecture-decision-record.md` | **ADR-010** (nestjs-zod), **ADR-011** (Hybrid DB), **ADR-015** (Redis lock), **ADR-016** (BullMQ), **ADR-017** (auth/identity), **ADR-019** (payment), **ADR-022** (payout), **ADR-024** (worker tách) |
| `05-api-specification.md`                    | API contract (rework Sprint 5)                                                                                                                                                                         |
| `07-security-permission-design.md`           | Auth, RBAC, audit, threat control (rework Sprint 5)                                                                                                                                                    |
| `context/DOMAIN-MAP.md`                      | Mapping ba lớp ↔ module backend ở target state                                                                                                                                                         |
| `context/GLOSSARY.md`                        | Nguồn đặt tên entity, actor, state, error code                                                                                                                                                         |
| `context/PROJECT-STATE.md`                   | Quyết định đã chốt và OQ còn mở                                                                                                                                                                        |

---

## 4. Nguyên tắc thiết kế chi tiết

| ID          | Nguyên tắc                                                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LLD-PRIN-01 | Controller không chứa business logic chính; controller chỉ nhận request, gọi guard/pipe/Zod schema và chuyển vào service.                                                     |
| LLD-PRIN-02 | Mỗi service method nghiệp vụ phải truy vết được về FR/UC/BR tương ứng trong SRS.                                                                                              |
| LLD-PRIN-03 | Mọi thao tác tạo/sửa tiền, vé, ghế, policy, quyền hoặc dữ liệu tenant phải kiểm RBAC, ownership và audit.                                                                     |
| LLD-PRIN-04 | Payment callback, refund callback, seat hold và job retry phải idempotent.                                                                                                    |
| LLD-PRIN-05 | Dữ liệu theo Operator phải filter theo `operatorId` tại service/repository **và** Postgres RLS defense-in-depth (ADR-011, ADR-017), không chỉ ở UI.                           |
| LLD-PRIN-06 | Mọi giá trị tiền = VND `BIGINT`; tính % bằng `Decimal.js`; validate boundary bằng Zod (nestjs-zod). Cấm `number`/`float` raw cho amount (ADR-009, ADR-010, ADR-011).          |
| LLD-PRIN-07 | Provider ngoài (payment, notification, routing, storage, payout) chỉ gọi qua adapter port `external/<provider>/`; domain service không import SDK vendor trực tiếp (ADR-006). |

---

## 5. Cấu trúc module backend

### 5.1. Pattern chung

| Thành phần                      | Vai trò                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `*.controller.ts`               | HTTP endpoint, guard, pipe, Zod schema, response mapping (RFC 7807 cho error)                     |
| `*.service.ts`                  | Use case orchestration, validation nghiệp vụ, transaction/lock boundary                           |
| `*.repository.ts`               | Truy vấn Postgres qua `PrismaService` (atomic update, index-aware); module `audit/` dùng Mongoose |
| `*.schema.ts` / `schema.prisma` | Prisma model (operational); Mongoose schema cho `audit/` (enum, index, soft delete)               |
| `dto/*.dto.ts`                  | Zod schema (nestjs-zod) — single source validate + OpenAPI + TS type (ADR-010, ADR-012)           |
| `processors/*.processor.ts`     | BullMQ processor (`@Processor`/`@Process`, `@nestjs/bullmq`) nếu module có job nền (ADR-016)      |
| `events/*.event.ts`             | Event nội bộ cho notification, audit, realtime                                                    |

### 5.2. Module chi tiết

Tên module / folder dưới đây dùng **target state** theo `context/DOMAIN-MAP §1, §2`. Mọi module Operator-owned BẮT BUỘC enforce tenant boundary theo `operatorId` tại service/repository + Postgres RLS (`FR-OPR-11`, `FR-IAM-06`, `DM-01`).

| Module nhóm                  | Folder target                                                                                                                                                                                                 | Service chính                                                                                                              | Trách nhiệm LLD                                                                                                                                                                                                                                                                                                             | Rủi ro cần kiểm                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Identity & Access            | `iam/auth/`, `iam/user/`, `iam/session/`, `iam/role/`                                                                                                                                                         | `AuthService`, `SessionService`, `UserProfileService`, `RoleService`                                                       | **Better Auth** (custom NestJS adapter) login 3-namespace (Passenger Email/OTP/OAuth; Operator `{slug}/{username}`; Platform `platform/{username}`); Hybrid token (JWT RS256 15min + opaque refresh 30d rotation/family); closed enrollment; RBAC 8-role enum; TOTP mandatory Owner/PlatformAdmin/PlatformSupport (ADR-017) | brute force, token leak/reuse, sai namespace, IDOR, refresh family hijack |
| Operator Profile & KYC       | `operator/`, `operator-kyc/`                                                                                                                                                                                  | `OperatorProfileService`, `KycService`, `BankAccountService`                                                               | KYC submission (file → R2 private bucket, metadata Postgres), admin approval, profile, bank account, OperatorStatusHistory                                                                                                                                                                                                  | KYC giả, đổi tài khoản nhận tiền không audit                              |
| Catalog & Search             | `catalog/`, `search/`                                                                                                                                                                                         | `ProvinceService`, `WardService`, `StopPointCatalogService`, `VehicleTypeService`, `AmenityService`, `SearchService`       | Catalog Platform sở hữu; search public trip availability (cache Redis TTL 60s)                                                                                                                                                                                                                                              | search lệch tải, catalog cập nhật không đồng bộ                           |
| Transport Resource           | `vehicle/`, `route/`, `stop-point/`                                                                                                                                                                           | `VehicleService`, `SeatMapService`, `RouteService`, `RouteStopService`                                                     | Vehicle, SeatMap (layout `JSONB`), Seat, Route, RouteStop, StopPoint Operator-owned; cache distance/duration Goong                                                                                                                                                                                                         | đổi xe/sơ đồ ghế sau khi đã có vé                                         |
| Trip & Inventory             | `trip/`, `trip-seat/`, `seat-hold/`, `fare/`                                                                                                                                                                  | `TripService`, `TripSeatService`, `SeatHoldService`, `FareService`                                                         | Trip, TripStop, TripSeat, SeatHold (Redis `SET NX EX 600`, ADR-015), Fare riêng                                                                                                                                                                                                                                             | bán trùng ghế, fare snapshot sai                                          |
| Booking & Ticket             | `booking/`, `ticket/`                                                                                                                                                                                         | `BookingService`, `TicketService`, `QrTokenService`, `BookingStatusHistoryService`                                         | Booking snapshot bắt buộc (fare, policy, promotion), ticket, QR token hash                                                                                                                                                                                                                                                  | snapshot drift, ticket giả, hold consume sai                              |
| Payment & Refund             | `payment/`, `refund/`                                                                                                                                                                                         | `PaymentService`, `RefundService`                                                                                          | Payment intent VNPay (HMAC-SHA512) + MoMo (HMAC-SHA256) qua adapter; callback verify + dedup `(provider, provider_txn_id)`; refund riêng từng cổng (ADR-019)                                                                                                                                                                | callback trùng, hoàn tiền trùng, signature giả                            |
| Escrow / Payout / Commission | `escrow/`, `payout/`, `commission/`                                                                                                                                                                           | `EscrowLedgerService`, `PayoutService`, `CommissionService`                                                                | EscrowLedger append-only in-house, commission 5% + override, payout T+3 manual confirm + batch (ADR-022)                                                                                                                                                                                                                    | điều chỉnh ledger không audit, payout sai operator                        |
| Promotion                    | `promotion/`                                                                                                                                                                                                  | `PromotionService`, `PromotionRuleService`, `PromotionRedemptionService`, `PromotionUsageLimitService`                     | Rule, validation, redemption snapshot, usage limit                                                                                                                                                                                                                                                                          | dùng sai mã, vượt giới hạn                                                |
| Employee Operations          | `employee/`, `manifest/`, `check-in/`, `journey-log/`, `incident/`                                                                                                                                            | `EmployeeAccountService`, `AssignmentService`, `ManifestService`, `CheckInService`, `JourneyLogService`, `IncidentService` | Employee account, assignment scope, manifest, QR check-in, journey log, incident (employee-mobile, ADR-014)                                                                                                                                                                                                                 | Employee xem sai chuyến, manifest lộ dữ liệu                              |
| Support & Trust              | `support/`, `complaint/`, `review/`, `dispute/`, `scorecard/`                                                                                                                                                 | `SupportTicketService`, `ComplaintService`, `ReviewService`, `DisputeCaseService`, `OperatorScorecardService`              | Support, complaint, review moderation, dispute final-arbiter Admin, scorecard; attachment → R2                                                                                                                                                                                                                              | thiếu bằng chứng, dispute sai state, review giả                           |
| Notification                 | `notification/`                                                                                                                                                                                               | `NotificationService`, `DeliveryService`, `PreferenceService`                                                              | Fan-out BullMQ: email Resend + push Expo + sms-noop (ADR-020); retry + DLQ; delivery log → Mongo `system_log`; NotificationPreference (mandatory không tắt được)                                                                                                                                                            | gửi lỗi, lộ OTP/token trong log                                           |
| Reporting                    | `reporting/`                                                                                                                                                                                                  | `ReportService`, `ExportJobService`                                                                                        | Dashboard: Postgres CTE + materialized view (structured); Mongo aggregation (audit); async export qua BullMQ                                                                                                                                                                                                                | truy vấn lớn làm chậm giao dịch                                           |
| Audit & Policy               | `audit/`, `policy/`                                                                                                                                                                                           | `AuditService`, `PolicyService`, `PolicySnapshotService`                                                                   | AuditLog append-only **Mongo cluster RIÊNG** (Mongoose, ADR-011), PolicyVersion, PolicySnapshot                                                                                                                                                                                                                             | thiếu log, lộ dữ liệu nhạy cảm trong log                                  |
| Admin                        | `admin/`                                                                                                                                                                                                      | `AdminUserService`, `AdminApprovalService`                                                                                 | Admin platform-level, KYC approve, dispute arbiter, manual refund/payout confirm                                                                                                                                                                                                                                            | quyền vượt cấp, audit thiếu                                               |
| Cross-cutting                | `common/`, `database/` (Prisma + Mongoose), `redis/`, `external/payment/{vnpay,momo}/`, `external/notification/{email,push,sms}/`, `external/routing/{goong,osrm}/`, `external/storage/`, `external/payout/` | `TenantGuard`, rate limiter, audit interceptor, adapter                                                                    | Tenant guard + RLS, rate limiter, audit interceptor, payment/notification/routing/storage/payout adapter                                                                                                                                                                                                                    | sai filter tenant, adapter không verify signature                         |

---

## 6. Thiết kế use case trọng yếu

### 6.1. Seat hold

| Bước | Xử lý                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 1    | Validate trip đang mở bán, chưa hết thời gian bán online, seat thuộc `TripSeat`.                                            |
| 2    | Kiểm tra seat chưa `BOOKED`, chưa `BLOCKED`, chưa có hold còn hiệu lực.                                                     |
| 3    | Tạo hold bằng **Redis** `SET seat:{tripId}:{seatId}:hold {bookingId} NX EX 600` — atomic, auto-release 10 phút (ADR-015).   |
| 4    | Gắn hold với actor/session, danh sách seat, idempotency key nếu có.                                                         |
| 5    | Khi key Redis hết TTL, ghế tự giải phóng; không cần job nền clean (hybrid Postgres `seat_hold` defer LLD nếu đo được race). |

### 6.2. Create booking

| Bước | Xử lý                                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1    | Verify Redis seat hold còn hiệu lực + ownership (Lua `EVAL` atomic).                                                          |
| 2    | Validate passenger info, contact, pickup/dropoff, fare, promotion.                                                            |
| 3    | Tính tổng tiền (`BIGINT`) và lưu snapshot bắt buộc: trip, operator, route, fare, policy, promotion.                           |
| 4    | Tạo booking `PENDING_PAYMENT` trong Postgres transaction (v1 chỉ pay-first per OQ-07; `PENDING_CONFIRMATION` giữ trong enum). |
| 5    | Ghi state history và audit nếu có thao tác nhạy cảm.                                                                          |

### 6.3. Payment callback

| Bước | Xử lý                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Verify HMAC signature (VNPay SHA512 / MoMo SHA256), provider transaction id, amount, booking id, status.                                    |
| 2    | Kiểm idempotency dedup unique `(provider, provider_txn_id)` (ADR-019, FR-BTP-08).                                                           |
| 3    | Nếu success hợp lệ, cập nhật payment + booking + seat + escrow ledger + commission + ticket trigger trong Postgres transaction (savepoint). |
| 4    | Nếu lệch trạng thái hoặc callback trễ, chuyển `RECONCILING`; reconciliation cron BullMQ call querydr đối chiếu.                             |
| 5    | Fan-out notification (BullMQ) và ghi audit/state history.                                                                                   |

### 6.4. Check-in ticket

| Bước | Xử lý                                                                                     |
| ---- | ----------------------------------------------------------------------------------------- |
| 1    | Employee đăng nhập (employee-mobile), được phân công hoặc có quyền check-in chuyến.       |
| 2    | Hệ thống xác thực QR token server-side, không tin dữ liệu encode trong QR.                |
| 3    | Validate ticket `VALID`, đúng trip, chưa `CHECKED_IN`, chưa `CANCELLED`, chưa `REFUNDED`. |
| 4    | Cập nhật ticket/passenger status và tạo `CheckInEvent`.                                   |
| 5    | Đồng bộ realtime cho Operator/Admin (transport TBD, HLD-OQ-11) và ghi operation log.      |

### 6.5. Auth login + token refresh (ADR-017 — Khanh confirmed 01/06/2026)

| Bước | Xử lý                                                                                                                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Xác định namespace từ identifier: Passenger=email; Operator=`{slug}/{username}`; Platform=`platform/{username}`. Mỗi `(scope, username)` là account riêng (Account-separate).                                                       |
| 2    | Better Auth (custom NestJS adapter) verify credential: Passenger qua Email OTP / OAuth Google-FB-Apple (ADR-020); Operator/Platform qua password (closed enrollment, KHÔNG self-register/OAuth).                                    |
| 3    | MFA: nếu role bắt buộc TOTP (Owner/PlatformAdmin/PlatformSupport) → verify TOTP hoặc backup code (10 single-use).                                                                                                                   |
| 4    | Phát hành Hybrid token: JWT RS256 access 15min (claims `sub`, `scope`, `role`, `operatorSlug`) + opaque 32-byte refresh 30d persist `auth_sessions`; cache session metadata Redis. Web=httpOnly cookie, Mobile=`expo-secure-store`. |
| 5    | Refresh: rotation mỗi lần + family invalidation nếu phát hiện reuse; revoke toàn bộ family khi khóa account / đổi quyền.                                                                                                            |

### 6.6. Payout T+3 (ADR-022)

| Bước | Xử lý                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | BullMQ cron `0 0 * * *` concurrency 1 (ADR-016) gom escrow eligible theo operator (chu kỳ T+3).                      |
| 2    | Tính payable (`BIGINT`) = Σ escrow eligible − commission (5% OQ-18) − refund − adjustment − holdback (SRS dòng 570). |
| 3    | Tạo `Payout` PENDING + `payout_items`; idempotent per `(operator_id, period)`.                                       |
| 4    | Admin review batch → tự chuyển khoản tới `bank_accounts` verified (KYC OQ-19) → nhập bank ref → COMPLETED.           |
| 5    | Tạo `ReconciliationRecord` (DP-18); audit who/why/when (CO-27); policy versioning (AS-23).                           |

---

## 7. Validation và error handling

Error response theo RFC 7807 Problem Details (`application/problem+json`) với field `code` (GLOSSARY error code) (ADR-012).

| Nhóm lỗi   | Error code gợi ý                                                                               | Ghi chú                                        |
| ---------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Auth       | `AUTH_INVALID_CREDENTIALS`, `AUTH_ACCOUNT_LOCKED`, `AUTH_SESSION_EXPIRED`, `AUTH_MFA_REQUIRED` | Không tiết lộ tài khoản có tồn tại hay không   |
| Permission | `PERMISSION_DENIED`, `TENANT_SCOPE_VIOLATION`                                                  | Dùng cho Operator/Employee/Admin               |
| Seat       | `SEAT_NOT_AVAILABLE`, `SEAT_HOLD_EXPIRED`, `SEAT_HOLD_CONFLICT`                                | Không giả định giữ ghế thành công khi lock lỗi |
| Booking    | `BOOKING_EXPIRED`, `BOOKING_INVALID_STATE`, `BOOKING_SNAPSHOT_CHANGED`                         | Cần hướng xử lý cho client                     |
| Payment    | `PAYMENT_INVALID_CALLBACK`, `PAYMENT_AMOUNT_MISMATCH`, `PAYMENT_RECONCILING`                   | Không ghi tiền trùng                           |
| Refund     | `REFUND_POLICY_DENIED`, `REFUND_ALREADY_PROCESSED`, `REFUND_RECONCILING`                       | Audit bắt buộc                                 |
| Ticket     | `TICKET_INVALID`, `TICKET_ALREADY_CHECKED_IN`, `TICKET_REVOKED`                                | QR xác thực server-side                        |
| Infra      | `SERVICE_UNAVAILABLE` (Redis down → 503)                                                       | Không in-memory fallback lock (ADR-015)        |

---

## 8. State handling

| State group | Nguồn chuẩn               | LLD cần chốt                                         |
| ----------- | ------------------------- | ---------------------------------------------------- |
| Trip        | SRS §17.1 / DOMAIN-MAP §5 | Transition hợp lệ, actor được phép đổi state         |
| Seat        | SRS §17.2                 | Redis hold + TripSeat status, block/manual inventory |
| Booking     | SRS §17.3                 | Transition khi payment success/fail/expire/refund    |
| Ticket      | SRS §17.4                 | Transition khi issue/check-in/no-show/refund         |
| Payment     | SRS §17.5                 | Callback idempotency và reconciliation               |
| Refund      | SRS §17.6                 | Manual/auto refund state machine                     |
| DisputeCase | SRS §17.7                 | Evidence, timeout, escalation, final decision        |

---

## 9. Audit và logging

Sự kiện nhạy cảm ghi vào Mongo `audit_event` (cluster RIÊNG, append-only, ADR-011); snapshot sẵn `operator_id`, `actor_role`, `target_type` tại write-time (no cross-DB join).

| Sự kiện                        | Bắt buộc audit | Dữ liệu cần lưu                                    |
| ------------------------------ | -------------- | -------------------------------------------------- |
| Đổi bank account Operator      | Có             | actor, operatorId, before/after masked, reason     |
| Refund thủ công                | Có             | adminId, booking/payment/refund id, amount, reason |
| Đổi policy/commission/payout   | Có             | before/after, effective date, actor                |
| Đổi trip đã có vé bán          | Có             | tripId, affected bookings, reason                  |
| Khóa/mở khóa tài khoản         | Có             | target actor, actor thực hiện, reason              |
| Confirm payout / nhập bank ref | Có             | adminId, payoutId, operatorId, amount, bank ref    |
| Check-in                       | Operation log  | employeeId, tripId, ticketId, result               |

---

## 10. Open Questions / TBD

| ID        | Câu hỏi                                                       | Tác động               | Trạng thái                                                                                                                  |
| --------- | ------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| LLD-OQ-01 | SeatHold dùng Redis lock, Postgres atomic update hay kết hợp? | Booking implementation | **Đóng 26/05/2026 theo ADR-015**: Pure Redis `SET NX EX 600` v1; hybrid (+ Postgres `seat_hold`) defer LLD nếu race đo được |
| LLD-OQ-02 | Có hỗ trợ `PENDING_CONFIRMATION` trong v1 không?              | Booking/payment state  | Đóng 11/05/2026 theo OQ-07: chỉ pay-first; enum giữ                                                                         |
| LLD-OQ-03 | Payment provider đầu tiên là gì?                              | Callback verification  | **Đóng theo ADR-019**: VNPay primary (HMAC-SHA512) + MoMo phương thức 2 (HMAC-SHA256), sau `PaymentGateway` adapter         |
| LLD-OQ-04 | QR token rotate/revoke policy cụ thể ra sao?                  | Ticket/check-in        | Mở; chốt cùng 07 Security Design (rework Sprint 5)                                                                          |
| LLD-OQ-05 | AuditLog lưu cùng DB hay storage riêng?                       | Audit implementation   | **Đóng 25/05/2026 theo ADR-011**: Mongo **cluster RIÊNG**, append-only                                                      |

---

### Quy ước mã trong LLD

- `LLD-PRIN-NN`: Nguyên tắc thiết kế chi tiết.
- `LLD-OQ-NN`: Câu hỏi mở của LLD.
