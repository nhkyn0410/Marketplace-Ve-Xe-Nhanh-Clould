# 09. Deployment & Operation Standard - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                          |
| ------------- | -------------------------------- |
| Tên tài liệu  | Deployment & Operation Standard  |
| Mã tài liệu   | 09-deployment-operation-standard |
| Dự án         | Marketplace-Ve-Xe-Nhanh          |
| Trạng thái    | Approved                            |
| Người viết    | Nguyễn Hồng Khanh, AI Agent          |
| Người duyệt   | Nguyễn Hồng Khanh                |
| Ngày tạo      | 11/05/2026                       |
| Ngày cập nhật | 03/06/2026                       |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                |
| --------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp Deployment & Operation Standard                                                                                                       |
| v0.2      | 25/05/2026 | AI Agent       | Bổ sung observability/operation cho escrow, payout T+3, KYC                                                                                         |
| v0.3      | 25/05/2026 | AI Agent       | Rebrand `Marketplace-Ve-Xe-Nhanh`; gỡ tham chiếu `TECH-STACK.md`. Không thay đổi normative.                                                       |
| v0.4      | 01/06/2026 | AI Agent       | **Sprint 4 Rework** — bake Phase 4 DevOps **ADR-023..026** + stack ADR. §4 môi trường: Render (SG) + Postgres Supabase/Neon + Mongo Atlas; §5 build Turborepo + Docker + EAS mobile; §6 secret theo vendor đã chốt (VNPay/MoMo/Resend/Expo/OAuth/Goong/R2/Sentry); §7 Prisma Migrate + Mongo + RLS; §8 observability Sentry + Pino + OTel; §10 Render rollback; §11 checklist BullMQ/Postgres/Mongo. **Đóng OPS-OQ-01** (Render ADR-023) + **OPS-OQ-02** (Render env + GitHub secrets ADR-026) + **OPS-OQ-03** (Sentry ADR-026) + **OPS-OQ-05** (EAS ADR-014); refine OPS-OQ-04. |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Môi trường
5. Build và release
6. Configuration và secret
7. Database và migration
8. Observability
9. Backup và restore
10. Rollback và incident
11. Operation checklist
12. Open Questions / TBD

---

## 3. Giới thiệu

Tài liệu này quy định triển khai và vận hành hệ thống từ local, staging đến production. Stack DevOps đã chốt Phase 4 (Sprint 4): deploy **Render managed PaaS (SG)** (ADR-023), worker **Render Background Worker** tách (ADR-024), test **Vitest+Supertest+Playwright+Maestro** (ADR-025), CI/CD **GitHub Actions + Render auto-deploy** + observability **Sentry-centric** (ADR-026).

### 3.1. Tài liệu tham chiếu

| Tài liệu | Vai trò |
| -------- | ------- |
| `01-srs-he-thong-dat-ve-xe-khach.md` | NFR vận hành, sao lưu, sẵn sàng |
| `02-hld-he-thong-dat-ve-xe-khach.md` | Deployment overview §14 |
| `04-database-design.md` | Migration (Prisma + Mongo), retention, RLS |
| `07-security-permission-design.md` | Secret, audit, KYC handling |
| `10-architecture-decision-record.md` | **ADR-023** Render, **ADR-024** worker, **ADR-025** test, **ADR-026** CI/CD+observability; + ADR-011/015/016/018/019/020/021 |
| `context/DOMAIN-MAP.md` | External adapter location |
| `context/PROJECT-STATE.md` | OQ-21 (KYC storage), OQ-22 (TGTT license) — production blocker |

---

## 4. Môi trường

| Môi trường | Mục đích | Hạ tầng |
| ---------- | -------- | ------- |
| Local | Dev và test thủ công | Docker Compose: Postgres 16 + Mongo 7; Redis = Upstash (hoặc local redis dev); R2/Goong/Resend = API key dev; KYC = local storage adapter (ADR-018) |
| CI | Typecheck, lint, test tự động | **GitHub Actions** + pnpm + Turborepo affected (ADR-026) |
| Staging | E2E, UAT, provider sandbox | Render (SG); sandbox VNPay + MoMo + Resend + Expo Push |
| Production | Vận hành thật | Render (SG) HTTPS; Supabase/Neon Postgres + Atlas Mongo + Upstash Redis + R2; Sentry; **blocker OQ-21 (KYC storage) + OQ-22 (TGTT license)** |

---

## 5. Build và release

Monorepo Turborepo + pnpm (ADR-013). Build qua `turbo run build --filter=...` (chỉ phần affected).

| Thành phần | Build / deploy | Ghi chú |
| ---------- | -------------- | ------- |
| API (`apps/api`) | Docker image → Render **Web Service** | NestJS 11, Node 24 (ADR-009/010/023) |
| Worker (`apps/api`) | Cùng image → Render **Background Worker** (khác start command) | BullMQ worker tách (ADR-024) |
| Frontend (`apps/marketplace`, `operator-os`, `admin`) | Next.js build → Render Web Service (SSR Docker) hoặc Vercel | App count chốt LLD (ADR-013) |
| Mobile (`apps/passenger-mobile`, `employee-mobile`) | **EAS Build** (cloud) + **EAS Update** (OTA) + **EAS Submit** | Windows dev OK, không cần Mac (ADR-014) |
| Packages (`types`, `api-client`, `ui`...) | Build theo workspace; `api-client` gen từ OpenAPI (`openapi-typescript`) | Shared (ADR-012/013) |

### 5.1. Release checklist

| Bước | Kiểm tra |
| ---- | -------- |
| REL-01 | SRS/HLD/API/DB/Security liên quan đã Review/Approved theo phạm vi release |
| REL-02 | GitHub Actions pass: ESLint + `tsc` + **Vitest** + build + gen api-client (ADR-025/026) |
| REL-03 | E2E critical pass (Playwright web + Maestro mobile + Supertest API) |
| REL-04 | Prisma migration đã review + rollback plan; RLS policy kiểm |
| REL-05 | Env var/secret đã cấu hình đúng môi trường (Render env group) |
| REL-06 | Backup trước deploy production (Postgres PITR + Mongo) |
| REL-07 | Smoke test sau Render auto-deploy; Sentry không error spike |

---

## 6. Configuration và secret

Secret quản lý qua **Render env group** + **GitHub Actions secrets** (ADR-026); không commit. JWT RS256 keypair (ADR-017).

| Nhóm config | Ví dụ | Rule |
| ----------- | ----- | ---- |
| Database | Postgres URI (Supabase/Neon), Mongo URI (Atlas) | Không commit; env theo môi trường (ADR-011) |
| Redis/Queue | Upstash `REDIS_URL` (ioredis) | Cache + lock + BullMQ (ADR-015/016) |
| Auth | Better Auth secret, JWT RS256 private/public key | Rotation policy; refresh opaque (ADR-017) |
| Payment | VNPay TmnCode/HashSecret (SHA512); MoMo partnerCode/accessKey/secretKey (SHA256) | Chỉ staging/production secret store (ADR-019) |
| Notification | Resend API key; Expo (FCM server key + APNs key) | SMS defer (chỉ adapter) (ADR-020) |
| OAuth | Google/Facebook/Apple client id + secret | Passenger-only (ADR-020) |
| Routing/Map | Goong API key | Free tier (ADR-027) |
| Object storage | R2 account id/access key/secret/bucket (public + private) | `@aws-sdk/client-s3` (ADR-018) |
| Payout | Manual (không credential v1); bank info trong DB verified | Auto-disbursement defer v1.x (ADR-022) |
| Monitoring | Sentry DSN (BE/FE/Mobile); OTel endpoint | Không log secret (ADR-026) |

---

## 7. Database và migration

| Quy định | Nội dung |
| -------- | -------- |
| Migration tool | **Prisma Migrate** (Postgres schema/index/enum/RLS); Mongoose schema strict + version (Mongo audit) (ADR-011) |
| RLS | Tạo + test Postgres RLS policy `operator_id` cùng migration (ADR-011/017) |
| Backward compatibility | Không deploy API dùng field mới trước khi migration sẵn sàng |
| Seed data | Catalog (tỉnh/ward/stop-point/vehicle-type) + first Platform account; tách môi trường |
| Rollback | Prisma migration rollback hoặc forward-fix; backup trước migration production |
| Fresh build | Không backfill legacy (Phương án A) — không có dữ liệu cũ |

---

## 8. Observability

Sentry-centric (ADR-026): error + performance + tracing phủ BE + FE + Mobile (1 tool); Pino structured log → Render logs; OpenTelemetry vendor-neutral; Render metric built-in; free uptime monitor.

| Nhóm | Chỉ số/log cần theo dõi |
| ---- | ----------------------- |
| API | Latency, error rate (Sentry), status code, request id, RFC 7807 |
| Auth | Login fail, lock, suspicious, refresh token reuse |
| Booking | SeatHold success/fail (Redis), hold expiry, conversion |
| Payment | VNPay + MoMo callback success/fail, duplicate (dedup `(provider,txn)`), reconciling count, HMAC fail |
| Refund/Payout | Refund failed, payout T+3 cycle delay, ledger mismatch, escrow drift |
| KYC | Pending backlog, reject rate, time-to-approve |
| Dispute | Open count theo SLA, escalation rate |
| Queue | BullMQ job count, retry, DLQ, processing latency (Bull Board) |
| Notification | Delivery success/fail/retry per channel (email/push/sms-noop) |
| DB | Postgres query latency, index usage, pool; Mongo audit write rate |
| Redis | Upstash memory, eviction, connection, lock failure |

---

## 9. Backup và restore

| Dữ liệu | Chính sách |
| ------- | --------- |
| PostgreSQL | Supabase/Neon managed backup + PITR; kiểm restore drill trước production |
| MongoDB audit | Atlas managed backup (cluster riêng); append-only |
| R2 object (KYC/attachment/report) | Object versioning + lifecycle; backup theo bucket policy |
| Env/secret | Không backup trong repo; Render env group + GitHub secrets |
| Audit log | Retention dài, archive policy TBD (DB-OQ-06) |

---

## 10. Rollback và incident

### 10.1. Rollback

| Tình huống | Cách xử lý |
| ---------- | --------- |
| API/worker deploy lỗi | **Render rollback** về deploy trước (cùng image cũ); giữ migration nếu backward compatible |
| Frontend lỗi | Render/Vercel rollback build trước |
| Migration lỗi | Prisma restore/forward-fix theo migration plan |
| Payment callback lỗi | Bật maintenance nếu cần; chạy reconciliation cron (querydr) |
| Notification lỗi | BullMQ retry + DLQ; không chặn ticket lookup |
| Mobile lỗi | **EAS Update** OTA push fix (không qua store review) (ADR-014) |

### 10.2. Incident priority

| Mức | Ví dụ |
| --- | ----- |
| P0 | Bán trùng ghế, ghi nhận tiền sai, lộ PII/KYC lớn, payout sai |
| P1 | Payment callback lỗi diện rộng, không check-in được diện rộng, Redis down (503) |
| P2 | Notification lỗi, report chậm, search chậm cục bộ |
| P3 | Lỗi UI nhỏ, dữ liệu phụ không cập nhật |

---

## 11. Operation checklist

| Checklist | Tần suất |
| --------- | -------- |
| Kiểm VNPay + MoMo callback / reconciliation (querydr) | Hằng ngày |
| Kiểm BullMQ DLQ / dead jobs (Bull Board) | Hằng ngày |
| Kiểm backup Postgres (Supabase/Neon) + Mongo (Atlas) | Hằng ngày |
| Kiểm KYC backlog và phê duyệt | Hằng ngày |
| Kiểm Sentry error spike / performance regression | Hằng ngày |
| Kiểm escrow ledger balance vs payout pending | Hằng ngày trước cycle T+3 |
| Chạy payout cycle T+3 (BullMQ cron) + xác nhận bank transfer thủ công + nhập bank ref | Mỗi 3 ngày theo cycle |
| Kiểm audit/security anomaly (Mongo audit) | Hằng tuần hoặc theo alert |
| Kiểm scorecard / dispute SLA | Hằng tuần |
| Kiểm restore drill + Upstash/Atlas cost | Định kỳ |
| Kiểm dependency/security update (Dependabot) | Định kỳ |

---

## 12. Open Questions / TBD

| ID | Câu hỏi | Tác động | Trạng thái |
| -- | ------- | -------- | ---------- |
| OPS-OQ-01 | Production deploy target là gì? | Deployment plan | **Đóng theo ADR-023**: Render managed PaaS (SG); DB managed-separate Supabase/Neon + Atlas |
| OPS-OQ-02 | Secret manager dùng gì? | Security/operation | **Đóng theo ADR-026**: Render env group + GitHub Actions secrets |
| OPS-OQ-03 | Monitoring stack dùng gì? | Alert/runbook | **Đóng theo ADR-026**: Sentry (error+perf+trace) + Pino logs + OpenTelemetry + Render metric |
| OPS-OQ-04 | Backup/restore RPO/RTO mục tiêu là bao nhiêu? | DR plan | Mở; cần định nghĩa target (Supabase/Neon PITR + Atlas backup là nền) |
| OPS-OQ-05 | Mobile release quy trình App Store/Play Store ra sao? | Release plan | **Đóng theo ADR-014**: EAS Build + EAS Update (OTA) + EAS Submit |
| OPS-OQ-06 | Data residency production cho KYC/payment (VN cloud vs Render+DPIA)? | Compliance | Mở — **OQ-21/OQ-22** production blocker (không chặn MVP) |

---

### Quy ước mã trong Deployment & Operation

- `REL-NN`: Bước release checklist.
- `OPS-OQ-NN`: Câu hỏi mở của Deployment & Operation.
