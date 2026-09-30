# 08. Test Plan & Acceptance Criteria - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                          |
| ------------- | -------------------------------- |
| Tên tài liệu  | Test Plan & Acceptance Criteria  |
| Mã tài liệu   | 08-test-plan-acceptance-criteria |
| Dự án         | Marketplace-Ve-Xe-Nhanh          |
| Trạng thái    | Draft                            |
| Người viết    | Nguyễn Hồng Khanh, AI Agent        |
| Người duyệt   | Nguyễn Hồng Khanh                |
| Ngày tạo      | 11/05/2026                       |
| Ngày cập nhật | 01/06/2026                       |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                         |
| --------- | ---------- | -------------- | ----------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp Test Plan & Acceptance Criteria |
| v0.2      | 01/06/2026 | AI Agent       | **Sprint 4 Rework** — bake **ADR-025** test framework (Vitest + Supertest + Playwright + Maestro) + stack ADR. §4 strategy map tool cụ thể; §6 môi trường Postgres/Mongo Testcontainers + VNPay/MoMo sandbox; §8/§9 thêm mandatory test money BIGINT/idempotency dedup/tenant RLS/webhook HMAC/OAuth (ADR-009/011/015/017/019). Đóng TEST-OQ-02 (sandbox VNPay+MoMo+Resend+Expo per ADR-019/020); refine TEST-OQ-01. |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Test strategy
5. Test scope
6. Test environment
7. Traceability matrix
8. Acceptance criteria theo nhóm
9. Test case nháp trọng yếu
10. Entry / Exit criteria
11. Open Questions / TBD

---

## 3. Giới thiệu

Tài liệu này mô tả chiến lược kiểm thử, tiêu chí nghiệm thu và test case nháp. Test framework đã chốt (ADR-025): **Vitest** (unit+integration BE+FE monorepo), **Supertest** (e2e API), **Playwright** (e2e web), **Maestro** (e2e mobile Expo). Tham chiếu: `01-srs`, `03-lld`, `04-db`, `05-api`, `07-security`, `10-adr` (v0.21 — ADR-025 + 009/011/015/017/019).

---

## 4. Test strategy

| Cấp độ test | Tool (ADR-025) | Mục tiêu | Chủ thể |
| ----------- | -------------- | -------- | ------- |
| Unit | **Vitest** | Logic service, policy, validation, state transition, money math | Developer |
| Integration | **Vitest** + Testcontainers | Module với Postgres/Mongo/Redis thật, queue, provider mock | Developer/QA |
| API contract / e2e | **Supertest** | Endpoint, Zod DTO, RFC 7807 error code, permission, RLS | QA/Developer |
| E2E Web | **Playwright** | Luồng marketplace/operator/admin chính | QA |
| E2E Mobile | **Maestro** | Luồng passenger + employee (booking, check-in) | QA |
| Security | Vitest + Supertest | Auth, RBAC, tenant RLS, IDOR, rate limit, webhook HMAC | QA/Security |
| Performance | k6/Artillery (chốt LLD) | Search, seat hold, payment callback, report export | QA/DevOps |
| UAT | Manual | Người duyệt xác nhận nghiệp vụ | Người duyệt/PO |

---

## 5. Test scope

| Nhóm | Trong scope | Mức ưu tiên |
| ---- | ----------- | ----------- |
| IAM | Đăng ký, login 3-namespace, OTP/OAuth, refresh rotation, TOTP, session revoke | Cao |
| Marketplace | Search, filter, trip detail, seat map, booking, ticket | Cao |
| Booking/Payment | SeatHold (Redis), create booking, VNPay/MoMo callback, refund, escrow | Rất cao |
| Operator OS | KYC, vehicle, route, trip, booking list, finance, payout | Cao |
| Employee | Assignment, passenger list, QR check-in, incident report | Cao |
| Admin | KYC approval, policy, payment/refund, payout confirm, dispute, audit | Cao |
| Notification | Fan-out email/push/sms-noop, delivery retry, preference | Trung bình |
| Reporting | Dashboard, filter, async export | Trung bình |

---

## 6. Test environment

| Môi trường | Tool | Ghi chú |
| ---------- | ---- | ------- |
| Local | Vitest + Testcontainers | Postgres 16 + Mongo 7 ephemeral; Redis local/Upstash dev |
| CI | GitHub Actions + Vitest + Turborepo affected | Seed data ổn định; tách unit (mọi commit) vs integration/e2e (scheduled) (ADR-026) |
| Staging | Playwright + Maestro + Supertest | Sandbox **VNPay + MoMo** + **Resend** + **Expo Push**; KYC local adapter |
| Production | Smoke test sau deploy | Không dùng dữ liệu giả nhạy cảm |

---

## 7. Traceability matrix

| Nguồn | Test artifact cần có |
| ----- | -------------------- |
| FR-IAM-* | Auth Vitest/Supertest/security (3-namespace, token, TOTP, RLS) |
| FR-MKT-* | Search/trip/booking Vitest/Playwright |
| FR-BTP-* | SeatHold/payment/ticket/refund/escrow Vitest integration + Supertest |
| FR-OPR-* | Operator onboarding/finance/payout Supertest/Playwright |
| FR-OPS-* | Vehicle/route/trip/fare/inventory Vitest |
| FR-EMP-* | Employee Maestro (mobile)/Supertest/check-in |
| FR-ADM-* | Admin Playwright/Supertest/security/audit |
| FR-NSR-* | Notification/support/review/reporting Vitest |
| FR-DSP-* | Dispute state machine Vitest |
| NFR-* | Performance, security (RLS/IDOR), availability, privacy |

---

## 8. Acceptance criteria theo nhóm

| Nhóm | Acceptance criteria |
| ---- | ------------------- |
| User booking | User tìm chuyến, chọn ghế, tạo booking, thanh toán (VNPay/MoMo) thành công, nhận ticket QR, xem lại ticket. |
| Seat safety | Hai user không thể mua cùng một ghế trên cùng chuyến dù thao tác đồng thời (Redis SET NX EX). |
| Payment safety | Callback trùng không tạo payment/booking/ticket/ledger trùng (dedup `(provider, provider_txn_id)`). |
| Money correctness | Mọi tính tiền dùng BIGINT/Decimal; commission/refund/payout không sai số làm tròn (ADR-009/011). |
| Refund | User/Admin hủy vé đúng policy snapshot, refund state rõ, audit ghi. |
| Tenant isolation | Operator chỉ xem/quản lý dữ liệu tenant mình; RLS chặn cả khi app guard miss (ADR-011/017). |
| Employee | Employee chỉ check-in chuyến được phân công, không xem dữ liệu ngoài scope. |
| Admin | Admin xử lý KYC/refund/dispute/payout có re-auth/TOTP/audit với quyền phù hợp. |
| Notification | Ticket vẫn xem được dù email/push thất bại; delivery retry ghi nhận (BullMQ DLQ). |
| Reporting | Báo cáo lớn không làm chậm luồng booking/payment/check-in chính. |

---

## 9. Test case nháp trọng yếu

Mandatory (rủi ro cao, ADR-025): money math, idempotency, tenant RLS, seat-hold race, webhook HMAC.

| ID | Test case | Loại test | Ưu tiên |
| -- | --------- | --------- | ------- |
| TC-BOOK-001 | Giữ ghế thành công với Redis hold còn TTL | Integration | Cao |
| TC-BOOK-002 | Hai user giữ cùng ghế đồng thời, chỉ một thành công | Integration/Concurrency | Rất cao |
| TC-BOOK-003 | Redis hold hết TTL tự giải phóng ghế | Integration | Cao |
| TC-PAY-001 | VNPay/MoMo callback success cập nhật booking/payment/ticket/escrow/commission | Integration | Rất cao |
| TC-PAY-002 | Callback trùng (dedup provider+txn) không ghi trùng tiền/ticket | Integration | Rất cao |
| TC-PAY-003 | Webhook HMAC sai (SHA512/SHA256) bị từ chối | Security | Rất cao |
| TC-MONEY-001 | Commission 5% + refund + payout tính BIGINT/Decimal không sai số | Unit | Rất cao |
| TC-REF-001 | Hủy vé trước hạn tạo refund đúng policy snapshot | E2E | Cao |
| TC-SEC-001 | Operator A không xem booking Operator B (RLS) | Security | Rất cao |
| TC-SEC-002 | Refresh token reuse bị family invalidation | Security | Cao |
| TC-EMP-001 | Employee check-in ticket hợp lệ được phân công (Maestro) | E2E | Cao |
| TC-EMP-002 | Employee không check-in chuyến ngoài assignment | Security | Cao |
| TC-ADM-001 | Admin refund/payout thủ công yêu cầu re-auth/TOTP + audit | E2E/Security | Cao |

---

## 10. Entry / Exit criteria

### 10.1. Entry criteria

| Điều kiện | Trạng thái |
| --------- | --------- |
| SRS liên quan đã Review/Approved | TBD |
| HLD/LLD/API/DB/Security liên quan đã Review/Approved | TBD (rework v0.x chờ Khanh promote) |
| Test environment có seed data + Testcontainers | TBD |
| Provider sandbox (VNPay/MoMo/Resend/Expo) sẵn sàng | TBD |

### 10.2. Exit criteria

| Điều kiện | Quy định |
| --------- | -------- |
| Test case critical pass | 100% critical (money/idempotency/tenant/seat) pass hoặc chấp nhận rủi ro có ghi |
| High bug | Không còn high severity chưa xử lý |
| Security blocker | Không còn lỗi IDOR/RBAC/RLS/payment/seat critical |
| Test evidence | Có log/screenshot/Playwright trace/report cho UAT và regression |

---

## 11. Open Questions / TBD

| ID | Câu hỏi | Tác động | Trạng thái |
| -- | ------- | -------- | ---------- |
| TEST-OQ-01 | Ưu tiên automation backend hay E2E trước? | Kế hoạch QA | Refined per ADR-025: **BE unit/integration (Vitest) trước** (ROI cao, nhanh); E2E critical path sau |
| TEST-OQ-02 | Provider sandbox nào cho payment/notification? | Integration test | **Đóng theo ADR-019/020**: VNPay + MoMo sandbox; Resend; Expo Push |
| TEST-OQ-03 | Performance baseline cụ thể cho seat hold/payment? | Load test | Mở; cần target số liệu (k6/Artillery chốt LLD) |
| TEST-OQ-04 | UAT data set do ai chuẩn bị? | UAT | Mở (solo: Khanh + AI seed) |

---

### Quy ước mã trong Test Plan

- `TC-...`: Test case.
- `TEST-OQ-NN`: Câu hỏi mở của Test Plan.
