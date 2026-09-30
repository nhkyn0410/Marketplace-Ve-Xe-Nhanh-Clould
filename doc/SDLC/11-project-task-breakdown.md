# 11. Project Task Breakdown - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                     |
| ------------- | --------------------------- |
| Tên tài liệu  | Project Task Breakdown      |
| Mã tài liệu   | 11-project-task-breakdown   |
| Dự án         | Marketplace-Ve-Xe-Nhanh     |
| Trạng thái    | Approved                    |
| Người viết    | Nguyễn Hồng Khanh, AI Agent |
| Người duyệt   | Nguyễn Hồng Khanh           |
| Ngày tạo      | 11/05/2026                  |
| Ngày cập nhật | 06/06/2026                  |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp Project Task Breakdown                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| v0.2      | 25/05/2026 | AI Agent       | Rebrand `Marketplace-Ve-Xe-Nhanh`; cập nhật TASK-FND-001 nguồn                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v0.3      | 01/06/2026 | AI Agent       | **Sprint 4 Rework** — bake toàn bộ 19 layer stack (ADR-002 + 009..026). §6 cập nhật trạng thái doc (HLD/DB/LLD/API/Security/Test/Ops rework DONE). §7 task theo module gắn stack: Foundation (Turborepo+pnpm+Render+GitHub Actions+Prisma+BullMQ worker tách), IAM (Better Auth 3-namespace+token+RLS+TOTP+OAuth), BTP (Redis hold+VNPay/MoMo+dedup+escrow+payout manual), NSR (Resend+Expo+sms-noop BullMQ), thêm TASK-TEST (Vitest+Supertest+Playwright+Maestro). §8 DoD thêm money BIGINT/RLS/OpenAPI gen. §10 refine OQ. |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Quy ước task
5. Dependency tổng quan
6. Task theo giai đoạn tài liệu
7. Task theo module triển khai
8. Definition of Done
9. Rủi ro kế hoạch
10. Open Questions / TBD

---

## 3. Giới thiệu

Tài liệu này chia nhỏ công việc từ SDLC sang task triển khai, kiểm thử và nghiệm thu. Stack đã chốt 19/19 layer (ADR-002 + ADR-009..027); tham chiếu `01-srs`, `02-hld`, `03-lld`, `04-db`, `05-api`, `07-security`, `08-test`, `09-ops`, `10-adr`. Bản nháp này chưa thay thế issue tracker chính thức.

---

## 4. Quy ước task

| Trường     | Ý nghĩa                                               |
| ---------- | ----------------------------------------------------- |
| Task ID    | `TASK-<GROUP>-NNN`                                    |
| Nguồn      | FR/UC/NFR/BR/ADR/tài liệu liên quan                   |
| Owner      | BE/FE/Mobile/QA/DevOps/Reviewer (v1 solo: Khanh + AI) |
| Dependency | Task hoặc tài liệu cần hoàn thành trước               |
| Status     | Draft / Ready / In Progress / Blocked / Done          |
| DoD        | Điều kiện hoàn thành                                  |

---

## 5. Dependency tổng quan

```mermaid
flowchart TD
    ADR[10 ADR - 19 layer CHỐT]
    SRS[01 SRS]
    HLD[02 HLD]
    LLD[03 LLD]
    DB[04 DB]
    API[05 API]
    UX[06 UI/UX Flow]
    SEC[07 Security]
    TEST[08 Test]
    OPS[09 Deploy]
    CODE[Code v1]

    ADR --> HLD
    SRS --> HLD
    HLD --> LLD
    HLD --> DB
    HLD --> API
    HLD --> UX
    HLD --> SEC
    LLD --> CODE
    DB --> CODE
    API --> CODE
    SEC --> CODE
    OPS --> CODE
    TEST --> CODE
    UX --> CODE
```

---

## 6. Task theo giai đoạn tài liệu

Sau Sprint 5 rework + Sprint 4 Phase 4 DevOps, các doc thiết kế đã reset theo 18 ADR — chờ Khanh review/promote.

| Task ID      | Task                                                    | Nguồn           | Owner              | Dependency    | Status            |
| ------------ | ------------------------------------------------------- | --------------- | ------------------ | ------------- | ----------------- |
| TASK-DOC-001 | Review + promote 02 HLD (Review/Approved)          | 02 HLD          | Reviewer           | Rework DONE   | Ready (chờ Khanh) |
| TASK-DOC-002 | Review + promote 04 DB                             | 04 DB           | Reviewer/BE        | Rework DONE   | Ready (chờ Khanh) |
| TASK-DOC-003 | Review + promote 03 LLD                            | 03 LLD          | Reviewer/Architect | Rework DONE   | Ready (chờ Khanh) |
| TASK-DOC-004 | Review + promote 05 API                            | 05 API          | Reviewer/BE        | Rework DONE   | Ready (chờ Khanh) |
| TASK-DOC-005 | Review + promote 07 Security                       | 07 Security     | Reviewer/Security  | Rework DONE   | Ready (chờ Khanh) |
| TASK-DOC-006 | Review + promote 08 Test + 09 Deploy          | 08 Test, 09 Ops | Reviewer/QA/DevOps | Rework DONE   | Ready (chờ Khanh) |
| TASK-DOC-007 | Hoàn thiện 06 UI/UX flow (User/Operator/Employee/Admin) | 06 UI/UX        | FE/Mobile/Reviewer | TASK-DOC-001  | Draft             |
| TASK-DOC-008 | Tạo 12 Release Notes & Change Log (khi vào code)        | —               | Reviewer           | Code v1 start | Draft             |

---

## 7. Task theo module triển khai

### 7.1. Foundation

| Task ID      | Task                                                                                                                       | Nguồn           | Owner  | Dependency   | Status      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ | ------------ | ----------- |
| TASK-FND-001 | Setup monorepo Turborepo + pnpm (`apps/api,marketplace,operator-os,admin,passenger-mobile,employee-mobile` + `packages/*`) | ADR-013/014     | DevOps | None         | Done           |
| TASK-FND-002 | Docker foundation API+Worker (cùng image, khác start cmd `main.ts`/`worker.ts` — ADR-024) + Render Web Service (`apps/api`) + GitHub Actions CI skeleton + secret placeholders. **KHÔNG Render Cron Job riêng** — payout cron = BullMQ `repeat` concurrency 1 trong Worker (ADR-024). Frontend deploy + staging smoke → TASK-OPS-001; full observability (Pino/RFC 7807/Sentry SDK/OTel) → TASK-FND-006                                              | ADR-023/024/026 | DevOps | TASK-FND-001 | Done ( local worker)         |
| TASK-FND-003 | Prisma + Postgres + Mongoose + Mongo audit + RLS policy + migration                                                        | ADR-011         | BE     | TASK-FND-001 | Done        |
| TASK-FND-004 | Redis Upstash (ioredis) + BullMQ worker process tách + Bull Board                                                          | ADR-015/016/024 | BE     | TASK-FND-003 | Done        |
| TASK-FND-005 | Zod env validation (nestjs-zod) + config theo môi trường                                                                   | ADR-010         | BE     | TASK-FND-002 | Done        |
| TASK-FND-006 | Logging Pino + request id + RFC 7807 error + Sentry + OTel                                                                 | ADR-012/026     | BE     | TASK-FND-005 | Done        |
| TASK-FND-007 | Audit module base (Mongo append-only) + ESLint boundary rule                                                               | ADR-010/011     | BE     | TASK-FND-006 | Done        |
| TASK-FND-008 | OpenAPI auto-gen (nestjs-zod) + gen api-client (`openapi-typescript`) CI                                                   | ADR-012         | BE     | TASK-FND-005 | Done        |

### 7.2. IAM

| Task ID      | Task                                                                                                                   | Nguồn                  | Owner        | Dependency   | Status |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------ | ------------ | ------ |
| TASK-IAM-001 | Better Auth + custom NestJS adapter; login 3-namespace (Email/OTP/OAuth + `{slug}/{username}` + `platform/{username}`) | FR-IAM-\*, ADR-017/020 | BE/FE/Mobile | TASK-FND-006 | Draft  |
| TASK-IAM-002 | Hybrid token (JWT RS256 15min + opaque refresh 30d rotation/family) + `auth_sessions` + Redis cache                    | ADR-017                | BE           | TASK-IAM-001 | Draft  |
| TASK-IAM-003 | RBAC 8-role + TenantGuard (JWT claims) + Postgres RLS                                                                  | FR-IAM-06, ADR-011/017 | BE           | TASK-IAM-002 | Draft  |
| TASK-IAM-004 | MFA TOTP (mandatory Owner/PlatformAdmin/PlatformSupport) + backup code                                                 | ADR-017                | BE           | TASK-IAM-002 | Draft  |
| TASK-IAM-005 | Closed enrollment provisioning (Platform cấp Operator+Owner; Owner cấp employee)                                       | ADR-017                | BE/FE        | TASK-IAM-003 | Draft  |

### 7.3. Transport resource

| Task ID      | Task                                                              | Nguồn                  | Owner | Dependency   | Status |
| ------------ | ----------------------------------------------------------------- | ---------------------- | ----- | ------------ | ------ |
| TASK-TRN-001 | Vehicle/VehicleType/SeatMap (Prisma + JSONB layout) schema và API | FR-OPS-01..03          | BE/FE | TASK-FND-003 | Draft  |
| TASK-TRN-002 | Route/StopPoint + Goong distance/duration cache DB               | FR-OPS-04..05, ADR-027 | BE/FE | TASK-TRN-001 | Draft  |
| TASK-TRN-003 | Trip/Fare/TripSeat inventory schema và API                        | FR-OPS-06..13          | BE/FE | TASK-TRN-002 | Draft  |
| TASK-TRN-004 | Search index Postgres + cache Redis (TTL 60s) cho trip            | FR-MKT-01..04, ADR-015 | BE/FE | TASK-TRN-003 | Draft  |

### 7.4. Booking, payment, ticket

| Task ID      | Task                                                                                            | Nguồn                  | Owner        | Dependency                 | Status |
| ------------ | ----------------------------------------------------------------------------------------------- | ---------------------- | ------------ | -------------------------- | ------ |
| TASK-BTP-001 | SeatHold Redis `SET NX EX 600` + Lua EVAL ownership                                             | FR-BTP-01..03, ADR-015 | BE           | TASK-TRN-003, TASK-FND-004 | Draft  |
| TASK-BTP-002 | Booking snapshot + total calculation (BIGINT/Decimal)                                           | FR-BTP-05..06, ADR-009 | BE/FE        | TASK-BTP-001               | Draft  |
| TASK-BTP-003 | PaymentGateway adapter VNPay (SHA512) + MoMo (SHA256) + webhook BullMQ + dedup `(provider,txn)` | FR-BTP-07..09, ADR-019 | BE           | TASK-BTP-002               | Draft  |
| TASK-BTP-004 | Ticket issuance + QR token hash                                                                 | FR-BTP-10..11          | BE/FE/Mobile | TASK-BTP-003               | Draft  |
| TASK-BTP-005 | Cancel/refund request flow (policy snapshot)                                                    | FR-BTP-12..14          | BE/FE        | TASK-BTP-004               | Draft  |
| TASK-BTP-006 | EscrowLedger append-only + commission 5% + payout T+3 manual (BullMQ cron concurrency 1)        | FR-BTP-15..17, ADR-022 | BE/FE        | TASK-BTP-003               | Draft  |

### 7.5. Operator, Employee, Admin, Trust

| Task ID        | Task                                                     | Nguồn                    | Owner     | Dependency                 | Status |
| -------------- | -------------------------------------------------------- | ------------------------ | --------- | -------------------------- | ------ |
| TASK-OPR-001   | Operator onboarding/KYC (R2 private + presigned)/profile | FR-OPR-01..06, ADR-018   | BE/FE     | TASK-IAM-005               | Draft  |
| TASK-OPR-002   | Operator finance dashboard (escrow/payout view)          | FR-OPR-07..09            | BE/FE     | TASK-BTP-006               | Draft  |
| TASK-EMP-001   | Employee assignment/passenger list (employee-mobile)     | FR-EMP-01..06, ADR-014   | BE/Mobile | TASK-IAM-005, TASK-TRN-003 | Draft  |
| TASK-EMP-002   | QR check-in + trip status (Maestro test)                 | FR-EMP-07..13            | BE/Mobile | TASK-BTP-004, TASK-EMP-001 | Draft  |
| TASK-ADM-001   | Admin KYC approve/catalog/policy                         | FR-ADM-02..09            | BE/FE     | TASK-IAM-005               | Draft  |
| TASK-ADM-002   | Admin payment/refund/payout confirm/dispute/audit        | FR-ADM-10..17, FR-DSP-\* | BE/FE     | TASK-BTP-005, TASK-FND-007 | Draft  |
| TASK-TRUST-001 | Review/support/complaint/dispute workflow                | FR-NSR-06..11, FR-DSP-\* | BE/FE     | TASK-BTP-004               | Draft  |

### 7.6. Notification, reporting, operation, test

| Task ID       | Task                                                                                                          | Nguồn                  | Owner        | Dependency   | Status |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------ | ------------ | ------ |
| TASK-NSR-001  | Notification fan-out BullMQ (Resend email + Expo push + sms-noop) + retry + DLQ                               | FR-NSR-01..05, ADR-020 | BE           | TASK-FND-004 | Draft  |
| TASK-NSR-002  | Notification preference + `notification_log` Mongo                                                            | FR-NSR-14              | BE/FE/Mobile | TASK-NSR-001 | Draft  |
| TASK-RPT-001  | Operator reporting (Postgres CTE/materialized view)                                                           | FR-NSR-12, ADR-011     | BE/FE        | TASK-BTP-006 | Draft  |
| TASK-RPT-002  | Admin reporting + Mongo audit aggregation                                                                     | FR-NSR-13              | BE/FE        | TASK-RPT-001 | Draft  |
| TASK-OPS-001  | Deployment pipeline Render + GitHub Actions + staging smoke + EAS mobile                                      | 09 Ops, ADR-023/026    | DevOps/BE    | TASK-FND-002 | Draft  |
| TASK-TEST-001 | Setup Vitest + Supertest + Playwright + Maestro + Testcontainers; mandatory test money/idempotency/tenant-RLS | 08 Test, ADR-025       | QA/BE        | TASK-FND-002 | Draft  |

---

## 8. Definition of Done

| Nhóm task | DoD tối thiểu                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | FR/UC linked, Zod DTO validation, service logic, Prisma schema/index/RLS, RBAC/ownership, RFC 7807 error code, money BIGINT/Decimal, Vitest tests |
| Frontend  | API contract (gen client) linked, loading/error/empty/permission state, responsive, Zod form validation                                           |
| Mobile    | expo-secure-store token, offline/sync state nếu có, permission state, Maestro E2E critical flow                                                   |
| Database  | Prisma schema/index/RLS reviewed, migration/rollback, seed data nếu cần                                                                           |
| Security  | RBAC/RLS/ownership test, audit log (Mongo), no sensitive logging, webhook HMAC                                                                    |
| QA        | Test case (Vitest/Supertest/Playwright/Maestro), evidence, regression, critical pass                                                              |
| DevOps    | Render config/secret (env group), GitHub Actions CI/CD, Sentry, deployment checklist, rollback                                                    |

---

## 9. Rủi ro kế hoạch

| Rủi ro                          | Tác động                           | Giảm thiểu                                                                                |
| ------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| SeatHold race condition         | Bán trùng ghế                      | Redis SET NX EX + Lua EVAL + test concurrency bắt buộc; hybrid Postgres defer nếu đo được |
| Money rounding                  | Sai tiền commission/refund/payout  | BIGINT/Decimal + lint cấm float + test mandatory (ADR-009/011)                            |
| Tenant leak                     | Operator xem dữ liệu nhau          | TenantGuard + Postgres RLS + test RLS bắt buộc                                            |
| Webhook spoofing/trùng          | Ghi tiền sai                       | HMAC verify + dedup `(provider,txn)` (ADR-019)                                            |
| **OQ-22 giấy phép TGTT**        | Chặn production escrow/payout thật | Sandbox/MVP không vướng; production prep (defer)                                          |
| **OQ-21 KYC storage residency** | Chặn production KYC                | dev-local adapter; production VN-cloud/DPIA (defer)                                       |

---

## 10. Open Questions / TBD

| ID         | Câu hỏi                                                      | Tác động    | Trạng thái                                                                 |
| ---------- | ------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------- |
| TASK-OQ-01 | Issue tracker chính thức?                                    | Task sync   | Khuyến nghị **GitHub Issues** (đồng bộ GitHub Actions ADR-026); Khanh chốt |
| TASK-OQ-02 | Ưu tiên release MVP Marketplace trước hay Operator OS trước? | Sprint plan | Mở (product decision)                                                      |
| TASK-OQ-03 | Owner từng nhóm BE/FE/Mobile/QA/DevOps?                      | Assignment  | v1 solo Khanh + AI                                                         |
| TASK-OQ-04 | Chia milestone theo module hay end-to-end flow?              | Roadmap     | Mở                                                                         |

---

### Quy ước mã trong Task Breakdown

- `TASK-<GROUP>-NNN`: Task triển khai.
- `TASK-OQ-NN`: Câu hỏi mở của Task Breakdown.
