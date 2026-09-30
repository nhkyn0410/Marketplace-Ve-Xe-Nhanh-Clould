# 07. Security & Permission Design - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                       |
| ------------- | ----------------------------- |
| Tên tài liệu  | Security & Permission Design  |
| Mã tài liệu   | 07-security-permission-design |
| Dự án         | Marketplace-Ve-Xe-Nhanh       |
| Trạng thái    | Approved                      |
| Người viết    | Nguyễn Hồng Khanh, AI Agent   |
| Người duyệt   | Nguyễn Hồng Khanh             |
| Ngày tạo      | 11/05/2026                    |
| Ngày cập nhật | 03/06/2026                    |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp Security & Permission Design                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| v0.2      | 25/05/2026 | AI Agent       | Bổ sung tham chiếu DOMAIN-MAP / GLOSSARY / PROJECT-STATE; chốt email OTP v1; chốt phone mask `0*** *** 789`; đóng SEC-OQ-03 và SEC-OQ-05 (storage)                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| v0.3      | 25/05/2026 | AI Agent       | Cập nhật tham chiếu SRS v1.15 → v1.20; cập nhật số mục DOMAIN-MAP. Không thay đổi nội dung normative.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| v0.4      | 01/06/2026 | AI Agent       | **Sprint 5 Rework** — bake **ADR-017/019/020 (Khanh re-confirm CRITICAL 01/06/2026)** + ADR-011/018. §5 auth: Better Auth 3-namespace + Hybrid token (JWT 15min + opaque refresh 30d rotation/family) + §5.2 MFA TOTP + §5.3 OAuth Google/FB/Apple PKCE. §6 TenantGuard + Postgres RLS. §8 payout manual confirm + maker-checker (ADR-022). §9 KYC R2 private presigned (ADR-018) + payment PCI SAQ-A (ADR-019) + cross-border PII. §11 webhook HMAC + OAuth/refresh-reuse threat + SQL injection (Prisma). **Đóng SEC-OQ-01/02/04/06** (per ADR-017/018); refine SEC-OQ-05/07; thêm SEC-OQ-08 (OAuth linking). |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Actor và trust boundary
5. Authentication
6. Authorization và tenant boundary
7. Permission matrix mức cao
8. Sensitive action control
9. Data protection
10. Audit, logging và monitoring
11. Threat control
12. Open Questions / TBD

---

## 3. Giới thiệu

Tài liệu này mô tả thiết kế bảo mật và phân quyền cho hệ thống. Đây là nguồn bắt buộc trước khi triển khai chức năng có quyền, dữ liệu cá nhân, vé, ghế, thanh toán, hoàn tiền, payout, KYC hoặc audit. Stack auth/security đã chốt theo ADR-017 (auth/identity, Khanh re-confirm 01/06/2026), ADR-011 (RLS), ADR-018 (storage), ADR-019 (payment), ADR-020 (OAuth).

### 3.1. Tài liệu tham chiếu

| Tài liệu                                     | Vai trò                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `01-srs-he-thong-dat-ve-xe-khach.md` | FR/BR/NFR bảo mật, actor §7, dispute final-arbiter (MQ-03)                                     |
| `02-hld-he-thong-dat-ve-xe-khach.md`  | Bảo mật mức cao §11                                                                            |
| `03-lld-he-thong-dat-ve-xe-khach.md`  | Module ↔ guard/audit, 6.5 auth flow                                                            |
| `04-database-design.md`               | auth_sessions, audit Mongo, KYC metadata, PolicySnapshot                                       |
| `05-api-specification.md`             | Auth endpoint, webhook HMAC, RFC 7807                                                          |
| `10-architecture-decision-record.md` | **ADR-017** auth, **ADR-011** RLS, **ADR-018** storage, **ADR-019** payment, **ADR-020** OAuth |
| `context/DOMAIN-MAP.md`                      | Tenant boundary §6, actor §3                                                                   |
| `context/GLOSSARY.md`                        | Actor / RBAC / Tenant / Snapshot / Idempotency                                                 |
| `context/PROJECT-STATE.md`                   | OQ đã chốt + OQ-21 (KYC production), OQ-22 (TGTT license)                                      |

---

## 4. Actor và trust boundary

Identity 3 namespace tách biệt (ADR-017): Passenger=Email; Operator-side=`{slug}/{username}`; Platform-side=`platform/{username}`.

| Actor             | Trust level          | Boundary                                        |
| ----------------- | -------------------- | ----------------------------------------------- |
| Guest             | Public/untrusted     | Chỉ public data và ticket lookup có xác minh    |
| Passenger (User)  | Authenticated user   | Chỉ dữ liệu của chính mình                      |
| Operator          | Tenant admin         | Chỉ dữ liệu thuộc Operator (`operatorId` + RLS) |
| Employee          | Tenant scoped worker | Chỉ dữ liệu theo Operator, role và assignment   |
| Admin / Platform  | Platform privileged  | Toàn hệ thống theo RBAC, audit + TOTP bắt buộc  |
| External provider | Third party          | Chỉ qua adapter/webhook đã verify HMAC          |

---

## 5. Authentication

Auth library = **Better Auth** + custom NestJS adapter (ADR-017).

| Actor               | Cơ chế                                                                | Rule                                                                         |
| ------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Passenger (User)    | Email + OTP (Resend) primary; hoặc OAuth Google/Facebook/Apple (PKCE) | Self-register; reset qua email; account linking email-match                  |
| Operator / Employee | `{operatorSlug}/{username}` + password; closed enrollment             | Không public/OAuth; Operator quản lý trạng thái + assignment scope           |
| Admin / Platform    | `platform/{username}` + password; closed enrollment                   | TOTP mandatory; không public/OAuth                                           |
| Guest               | Guest session, không login                                            | Search/hold/book/pay/lookup; email/OTP verify cho thao tác nhạy cảm + lookup |

### 5.1. Session và token policy (ADR-017)

| Nội dung      | Rule                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Access token  | JWT RS256, TTL **15 phút** (claims `sub`, `scope`, `role`, `operatorSlug`)                          |
| Refresh token | Opaque 32-byte, TTL **30 ngày**, rotation mỗi lần refresh + family invalidation khi phát hiện reuse |
| Token storage | Web = JWT trong httpOnly cookie (+ CSRF token); Mobile = `expo-secure-store`                        |
| Session store | `auth_sessions` (Postgres) + Redis cache metadata                                                   |
| Multi-device  | Mỗi login = 1 session family; revoke theo family hoặc revoke all                                    |
| Force logout  | Khi khóa account, reset password, thu hồi quyền hoặc phát hiện rủi ro → revoke family               |
| Login history | actor, thời điểm, device/IP nếu có, kết quả                                                         |

### 5.2. MFA (ADR-017)

| Role                                            | TOTP                                             |
| ----------------------------------------------- | ------------------------------------------------ |
| OperatorOwner / PlatformAdmin / PlatformSupport | **Bắt buộc** + 10 backup code single-use         |
| Driver / TicketStaff / SupportStaff             | Optional v1                                      |
| Passenger                                       | OTP email là factor chính; TOTP optional post-v1 |

### 5.3. OAuth (ADR-020 — Passenger-only)

- Providers: **Google + Facebook + Apple** (Better Auth built-in); Operator/Platform KHÔNG OAuth (closed enrollment).
- PKCE + `state` param chống CSRF; verify email ownership.
- Account linking: OAuth email khớp account Email-OTP → merge (Better Auth tự handle).
- Apple Sign-In **mandatory** (App Store Guideline 4.8); Zalo defer v1.x (cần custom adapter + OA KYC).

---

## 6. Authorization và tenant boundary

RBAC 8-role hardcoded enum v1 (Anonymous / Passenger / OperatorOwner / Driver / TicketStaff / SupportStaff / PlatformAdmin / PlatformSupport); ABAC defer post-v1. Tenant defense-in-depth = NestJS `TenantGuard` (match `operatorSlug` URL từ JWT claims) + Postgres RLS DB-level theo `operator_id` (`SET LOCAL app.operator_id`; JWT mang `operatorId`) (ADR-011, ADR-017).

| Boundary            | Rule                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| User ownership      | `userId` trong resource phải khớp actor hoặc quyền admin hợp lệ                               |
| Operator tenant     | Mọi query Operator/Employee filter theo `operatorId` (service/repository) **và** Postgres RLS |
| Employee assignment | Employee chỉ xem/chỉnh chuyến/passenger list được phân công hoặc được cấp quyền               |
| Admin scope         | Admin quyền cao nhưng thao tác nhạy cảm cần permission, re-auth/TOTP và audit                 |
| Public catalog      | Chỉ dữ liệu đã được phép public mới trả qua API Guest                                         |

---

## 7. Permission matrix mức cao

| Chức năng                | Guest              | Passenger   | Operator                      | Employee               | Admin                  |
| ------------------------ | ------------------ | ----------- | ----------------------------- | ---------------------- | ---------------------- |
| Search trip              | Có                 | Có          | Có trong phạm vi              | Không                  | Có                     |
| Create booking           | Có (guest session) | Có          | Có thể hỗ trợ nếu được phép   | Không                  | Có thể hỗ trợ          |
| Payment                  | Có (guest session) | Có          | Không trực tiếp               | Không                  | Giám sát/đối soát      |
| Cancel/refund request    | Không              | Vé của mình | Vé thuộc Operator theo policy | Không                  | Có                     |
| Vehicle/SeatMap          | Không              | Không       | Có trong tenant               | Xem nếu được phân công | Giám sát/toàn hệ thống |
| Check-in                 | Không              | Không       | Xem kết quả                   | Có theo assignment     | Giám sát               |
| KYC Operator             | Không              | Không       | Hồ sơ của mình                | Không                  | Duyệt/quản lý          |
| Policy/commission/payout | Không              | Không       | Xem phần liên quan            | Không                  | Cấu hình               |
| Audit log                | Không              | Không       | Log của tenant nếu được cấp   | Không                  | Có                     |

---

## 8. Sensitive action control

| Thao tác                          | Kiểm soát bắt buộc                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Refund thủ công                   | Admin permission, re-auth/TOTP, reason, audit, notification Operator                                     |
| Payout confirm + nhập bank ref    | Admin permission, re-auth/TOTP, reason, audit; maker-checker dual-control khi team Platform >1 (ADR-022) |
| Đổi bank account Operator         | Operator/Admin permission, re-auth, re-verify, audit                                                     |
| Đổi trip đã bán vé                | Operator/Admin permission, reason, notification, audit                                                   |
| Khóa Operator/User/Employee       | Permission, reason, audit, session revoke (family)                                                       |
| Đổi policy hủy/giữ ghế/commission | Admin permission, effective date, audit, không áp ngược booking cũ (PolicySnapshot)                      |
| Xem/export dữ liệu cá nhân        | Permission, masking, purpose, audit nếu nhạy cảm                                                         |

---

## 9. Data protection

| Dữ liệu                            | Kiểm soát                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Password                           | Better Auth hashing (Argon2/bcrypt), không log plaintext                                                                |
| OTP/token                          | Không log plaintext, TTL ngắn; refresh token opaque (không readable)                                                    |
| Số điện thoại/email                | Mask khi không cần đầy đủ; SĐT theo `0*** *** 789` (OQ-11)                                                              |
| Payment data                       | **PCI SAQ-A**: cổng hosted/redirect (VNPay/MoMo), KHÔNG lưu card data; chỉ lưu mã giao dịch/provider metadata (ADR-019) |
| KYC document                       | R2 **private bucket**; presigned URL TTL **5 phút** + audit log mỗi access (ADR-018)                                    |
| Attachment (dispute/payment-proof) | R2 private bucket, presigned URL + audit                                                                                |
| Cross-border PII                   | Resend (email) + R2 (storage) đặt ngoài VN → DPIA NĐ 13/2023 cho KYC production (blocker **OQ-21**)                     |
| QR token                           | Không đoán được, lưu hash; verify server-side                                                                           |
| Audit log                          | Không chứa secret/plaintext nhạy cảm; Mongo cluster riêng                                                               |

---

## 10. Audit, logging và monitoring

AuditLog ghi vào Mongo `audit_event` (cluster RIÊNG, append-only via REVOKE, ADR-011).

| Nhóm         | Rule                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| AuditLog     | Actor, actor type/role, action, target, before/after masked, reason, result, time, IP/device nếu có |
| Security log | Login fail, suspicious access, tenant violation, rate limit hit, refresh token reuse                |
| Payment log  | Callback, reconciliation, refund, payout, không log payload nhạy cảm                                |
| Alert        | Payment callback lỗi, seat lock lỗi (Redis down → 503), tenant violation, provider down             |

---

## 11. Threat control

| Threat                | Kiểm soát                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| IDOR                  | Backend ownership check + tenant filter + Postgres RLS, test case bắt buộc                                                     |
| SQL/NoSQL Injection   | Prisma parameterized query (Postgres); Mongoose schema validation (Mongo audit); Zod input validation; không truyền filter raw |
| XSS                   | Escape/sanitize nội dung user-generated, CSP TBD                                                                               |
| CSRF                  | Web dùng httpOnly cookie → CSRF token bắt buộc; Mobile Bearer không cần                                                        |
| OAuth abuse           | PKCE + `state` param; verify email ownership chống account-linking takeover (ADR-020)                                          |
| Refresh token reuse   | Rotation + family invalidation (ADR-017)                                                                                       |
| Brute force login/OTP | Rate limit, lock tạm, monitoring (SEC-OQ-07)                                                                                   |
| Double booking        | Redis `SET NX EX 600` atomic + idempotency + state validation                                                                  |
| Payment spoofing      | Webhook verify HMAC (VNPay SHA512 / MoMo SHA256) + timestamp + nonce + dedup `(provider, provider_txn_id)` (ADR-019)           |
| QR forgery            | QR token random, server-side validation                                                                                        |

---

## 12. Open Questions / TBD

| ID        | Câu hỏi                                                                                 | Tác động                | Trạng thái                                                                                                                           |
| --------- | --------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| SEC-OQ-01 | Web dùng Bearer token hay cookie session?                                               | CSRF/token storage      | **Đóng theo ADR-017**: Web = httpOnly cookie (+ CSRF); Mobile = Bearer (expo-secure-store)                                           |
| SEC-OQ-02 | Có bật MFA cho Admin/Operator ở v1 không?                                               | Auth flow               | **Đóng theo ADR-017**: TOTP **bắt buộc** Owner/PlatformAdmin/PlatformSupport + backup code; optional Driver/TicketStaff/SupportStaff |
| SEC-OQ-03 | Mask số điện thoại cụ thể theo rule nào?                                                | UI/API/report           | Đóng 11/05/2026 theo OQ-11: `0*** *** 789`                                                                                           |
| SEC-OQ-04 | KYC document lưu provider nào?                                                          | Object storage security | **Đóng theo ADR-018**: Cloudflare R2 private bucket, presigned TTL 5min + audit. Production location → **OQ-21** (mở)                |
| SEC-OQ-05 | AuditLog lưu bao lâu và ai được export?                                                 | Compliance/operation    | Storage đóng theo ADR-011 (Mongo cluster RIÊNG); **retention + export ACL còn mở** (DB-OQ-06)                                        |
| SEC-OQ-06 | Token TTL access/refresh và multi-device limit cụ thể?                                  | Session policy §5.1     | **Đóng theo ADR-017**: access 15min + refresh 30d rotation/family; multi-device = session family                                     |
| SEC-OQ-07 | OTP rate limit và reuse policy (cooldown, attempt limit)?                               | Brute force control     | Mở; chốt implementation LLD (default: cooldown 60s, ≤5 attempt/giờ)                                                                  |
| SEC-OQ-08 | Policy account-linking OAuth (email khớp nhưng chưa verify, multi-provider cùng email)? | Auth edge case          | Mở; chốt LLD (Better Auth UI manual link, ADR-020 mitigation)                                                                        |

---

### Quy ước mã trong Security Design

- `SEC-OQ-NN`: Câu hỏi mở của Security & Permission Design.
