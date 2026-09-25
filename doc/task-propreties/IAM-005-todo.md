# TASK-IAM-005 — Todo: closed enrollment + quản lý tài khoản + phiên theo thiết bị

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.2 — Platform cấp Operator + Owner đầu tiên; Owner cấp Employee; `FR-IAM-15` xem và thu hồi phiên theo thiết bị. Nguồn chi tiết: SRS `FR-IAM-02b..03c`, `FR-IAM-05..10`, `FR-IAM-13..16`, `UC-01`, `UC-16`, `AC-02`, `AC-21`; ADR-017; Security §5/§8; API §7.1/§7.3/§7.5.
> **Dependency:** TASK-IAM-003 đã Done (CI đã được Khanh xác nhận); RBAC + TenantGuard + RLS là nền của task này.
> **Cách dùng:** Q1–Q8 đã được Khanh chốt ngày 22/09/2026. Guide chạy tay: `IAM-005-guide.md`. Nghiệm thu: `IAM-005-verification-checklist.md`.

## Trạng thái (25/09/2026) — ✅ **DONE**

- ✅ TASK-IAM-004 đã đóng sau xác nhận CI xanh.
- ✅ Đã đối chiếu task row với SRS, HLD/LLD, DB, API, Security, Test, ADR-017, DOMAIN-MAP, GLOSSARY và code IAM-001..004.
- ✅ Khanh duyệt toàn bộ Q1–Q8 theo khuyến nghị ngày 22/09/2026, gồm endpoint quản lý phiên mới và contract mật khẩu tạm.
- ✅ Phạm vi defer KYC workflow, Platform employee, MFA reset và UI được giữ nguyên; không mở self-registration.
- ✅ Code/migration/OpenAPI và test local đã hoàn tất hardening; PostgreSQL/Redis/Mongo thật đạt 433/433 test, không skip.
- ✅ Khanh xác nhận CI 5/5 job xanh ngày 25/09/2026; PR #10 đã merge vào `develop`; migrate + `db:app-role` trên Supabase và deploy Render xong ngày 24/09/2026; task row đã chuyển `Done`.

---

## Phạm vi chuẩn

### Thuộc IAM-005

- Primitive đóng enrollment: Platform tạo tenant Operator + Owner đầu tiên; không có public/self-registration cho Operator/Employee/Platform.
- Owner xem/tạo/cập nhật role/trạng thái/cấp lại mật khẩu Employee trong đúng tenant.
- Mật khẩu tạm do server sinh, không lưu/log plaintext; lần đầu phải đổi trước khi nhận access/refresh token.
- Khóa, disable, cấp lại mật khẩu hoặc đổi role phải thu hồi mọi session family liên quan và ghi lý do/audit.
- Actor đã đăng nhập xem danh sách thiết bị của chính mình và thu hồi một session family.
- Zod/OpenAPI/RFC 7807, TS + Dart client, test RBAC/IDOR/RLS/concurrency và regression IAM-001..004.

### Không tự kéo vào task

- Toàn bộ KYC workflow/file R2/status history (`TASK-OPR-001`); IAM-005 chỉ cung cấp primitive để flow approve gọi.
- Assignment/chuyến/manifest/hồ sơ Employee đầy đủ (`TASK-EMP-001`).
- Platform employee/super-admin panel: có trong ADR-017 nhưng không nằm trong dòng TASK-IAM-005.
- Giới hạn số thiết bị: quyết định IAM-002 là v1 **không đặt hard cap**, chỉ list/revoke.
- MFA recovery/regenerate backup code và full Admin/Operator UI nếu chưa được chốt ở Q6/Q8.

---

## Quyết định đã chốt ngày 22/09/2026

| ID | Điểm cần chốt | Khuyến nghị để triển khai |
| --- | --- | --- |
| Q1 | Endpoint quản lý phiên | ✅ `GET /v1/auth/sessions` và `DELETE /v1/auth/sessions/{sessionId}`. `sessionId` là id ổn định đại diện **family/device**, không phải row `sid` đã rotate; chỉ được list/revoke session của chính subject. |
| Q2 | Ranh giới provision Operator | ✅ IAM-005 tạo `AccountProvisioningService.provisionOperatorOwner(...)` chạy transaction; chưa thêm endpoint KYC giả. `TASK-OPR-001` gọi primitive này từ flow approve; test service chứng minh chỉ PlatformAdmin mới gọi được. |
| Q3 | Temp password delivery | ✅ Server sinh mật khẩu mạnh; gửi **một lần** tới `contactEmail` qua `EmailNotifier`; response không trả password; hash scrypt lưu DB; temp credential hết hạn sau **24 giờ**. Cờ `credentialDeliveryPending` chặn login trong lúc chưa gửi thành công; gửi/reset/retry không tự thay đổi `status` kỷ luật. Delivery lỗi thì issuer dùng đường recovery có kiểm soát. |
| Q4 | First-login force change | ✅ Thêm `passwordChangeRequired` + `temporaryPasswordExpiresAt`. Login bằng temp password chỉ trả one-time `passwordChangeToken` TTL **5 phút**, không token/MFA secret; `POST /v1/auth/password/change-required` đổi mật khẩu rồi yêu cầu login lại. |
| Q5 | Employee API/lifecycle | ✅ `GET/POST /v1/operator/employees`, `PATCH /v1/operator/employees/{employeeId}`, `POST /v1/operator/employees/{employeeId}/password-reset`. Chỉ quản lý `username`, `contactEmail`, `role`, `status`; `ACTIVE ↔ LOCKED`; `DISABLED` không tự mở lại. |
| Q6 | Namespace + slug invariant | ✅ Bảng registry `operator_login_names` unique `(operator_id, username)` cấm trùng xuyên Owner/Employee trong tenant; `operatorSlug` lowercase, immutable; compound FK `(operator_id, operator_slug)` chặn drift. |
| Q7 | Session semantics | ✅ Không hard cap. GET cursor mặc định 20/tối đa 100, đúng một item/family và chỉ metadata đã mask; DELETE idempotent `204`, cho phép revoke current; cross-subject trả `404 AUTH_SESSION_NOT_FOUND`. |
| Q8 | Sensitive operations và phạm vi còn lại | ✅ Provision, đổi role/status, reset password yêu cầu recent re-auth 5 phút + reason. Khanh xác nhận ngày 23/09/2026: giữ re-auth bằng mật khẩu hoặc MFA, **chưa bắt buộc TOTP riêng** cho provision/reset; rủi ro mật khẩu chủ bị lộ vẫn còn và cần review khi mở rộng policy. Audit intent **fail-closed**, success best-effort; session revoke audit best-effort. Defer transactional outbox, MFA reset, Platform employee và UI sang task sở hữu. |

### Hardening được Khanh xác nhận ngày 23/09/2026

- Challenge đổi mật khẩu gắn `authEpoch`; reset/retry làm challenge cấp trước vô hiệu. Lệnh ghi kiểm lại epoch, trạng thái `ACTIVE` và cờ delivery.
- Đổi username/contact email cũng tăng `authEpoch` và revoke phiên; đổi email chuyển account sang `credentialDeliveryPending` cho tới khi Owner reset và giao credential mới đến địa chỉ mới.
- Temp-credential email giới hạn Redis nguyên tử: toàn hệ thống 30/24h, mỗi tenant 10/24h, mỗi actor 5/24h; reset cùng Employee cách ít nhất 1 giờ. Redis lỗi thì từ chối gửi (fail-closed). Các ngưỡng này áp dụng riêng cho mật khẩu tạm, không thay giới hạn OTP Passenger.
- `version` nguyên tăng dần làm optimistic concurrency; `updatedAt` chỉ dùng hiển thị/audit. Mỗi request Operator/Employee vẫn kiểm tài khoản bằng một transaction DB để chặn token cũ khi khóa/reset; chi phí DB này được chấp nhận cho v1 và cần đo tải về sau.

---

## Contract dự kiến sau khi Q1–Q8 được chốt

### Auth/session

| Method | Path | Kết quả |
| --- | --- | --- |
| `POST` | `/auth/password/change-required` | Consume one-time challenge, đổi temp password; không cấp token, client login lại |
| `GET` | `/auth/sessions` | Một record cho mỗi active family của chính subject |
| `DELETE` | `/auth/sessions/{sessionId}` | Thu hồi đúng family; idempotent `204` |

### Employee account

| Method | Path | Quyền/phạm vi |
| --- | --- | --- |
| `GET` | `/operator/employees` | `employee:manage`, tenant từ JWT/RLS |
| `POST` | `/operator/employees` | Tạo Employee + temp password delivery |
| `PATCH` | `/operator/employees/{employeeId}` | Đổi username/email/role/status, reason + recent re-auth; response có delivery pending |
| `POST` | `/operator/employees/{employeeId}/password-reset` | Server sinh temp password mới, revoke-all, delivery một lần |

### Error tối thiểu

- `ACCOUNT_USERNAME_CONFLICT` — 409.
- `ACCOUNT_NOT_FOUND` — 404, kể cả cross-tenant để chống enumeration.
- `ACCOUNT_STATE_CONFLICT` — 409.
- `ACCOUNT_TEMP_EMAIL_RATE_LIMITED` — 429.
- `AUTH_PASSWORD_CHANGE_REQUIRED` — 401 khi temp credential chưa đổi.
- `AUTH_PASSWORD_CHANGE_TOKEN_INVALID` — 401 generic cho fake/expired/replay.
- `AUTH_SESSION_NOT_FOUND` — 404 generic cho family không tồn tại/không thuộc subject.
- Giữ `AUTH_ACCOUNT_LOCKED`, `AUTH_SESSION_EXPIRED`, `PERMISSION_DENIED`, `TENANT_SCOPE_VIOLATION`, `SERVICE_UNAVAILABLE` hiện có.

---

## Data design dự kiến

- Account auth thêm `contact_email`, `password_change_required`, `temporary_password_expires_at`, `credential_delivery_pending`, `auth_epoch`, `version`; `auth_sessions.auth_epoch` chụp phiên bản lúc phát session. Mọi chuyển trạng thái (kể cả unlock), role-change/reset/password-change tăng epoch trong DB; guard so epoch trên mỗi request Operator/Employee, kể cả Redis đang cache active.
- Không lưu temp password plaintext, token đổi mật khẩu plaintext hoặc raw refresh token.
- Namespace Operator có invariant DB duy nhất cho `(operator_id, username)` xuyên Owner/Employee.
- `operator_accounts` không được chứa cặp `operator_id`/`operator_slug` lệch tenant.
- Session API group theo `family_id`; row mới nhất chưa revoke là state hiện tại của device family.
- Mutation account + session dùng explicit `operatorId` filter và transaction có RLS scope; auth/password/session cross-tenant dùng `system` chỉ trong `iam/`.

---

## Todo (ID = thứ tự thực hiện)

### ✅ #1 — [IAM-005.1] Chốt Q1–Q8 và khóa contract

Cập nhật ba file task-properties bằng ngày/quyết định; nếu thêm endpoint thì cập nhật API spec/revision history theo `doc/AGENT.md`, không đổi status Approved.

**Success:** đạt ngày 22/09/2026 — không còn quyết định security/API/schema ngầm; endpoint, response, expiry, defer và owner module rõ.

### ✅ #2 — [IAM-005.2] Schema + migration + RLS/invariant

Thêm fields/invariant đã chốt; migration chạy trên DB trống và DB nâng cấp; cấp quyền role app; kiểm FORCE RLS và không drift Prisma.

**Success:** DB chặn username collision, slug drift, cross-tenant write; plaintext secret không tồn tại.

### ✅ #3 — [IAM-005.3] Temp credential + first-login challenge

Sinh/delivery temp password; pre-auth challenge one-time/TTL; change password atomic; không cấp access/refresh/MFA data trước khi đổi.

**Success:** fake/expired/replay/concurrent challenge fail-closed; email/log/audit không lộ secret.

### ✅ #4 — [IAM-005.4] Operator Owner provisioning primitive

Tạo Operator + Owner transactionally, slug immutable, permission Platform-only; không dựng KYC workflow giả.

**Success:** duplicate/concurrent request không tạo tenant/account nửa vời; PlatformSupport/Operator bị từ chối.

### ✅ #5 — [IAM-005.5] Employee account API

List/create/update/reset trong tenant; Zod DTO; controller mỏng; service filter `operatorId`; role chỉ ba giá trị.

**Success:** tenant A không đọc/ghi tenant B kể cả query bỏ filter; duplicate namespace 409; reset/lock/role-change revoke-all.

### ✅ #6 — [IAM-005.6] Session list/revoke theo device family

Group family ổn định, mask metadata, ownership check trong query; revoke family qua Redis + Postgres fail-closed.

**Success:** rotation không tạo device giả; IDOR trả 404; revoke một device không giết device khác; current access token chết ngay.

### ✅ #7 — [IAM-005.7] Audit, re-auth và notification

Enforce recent re-auth cho mutation nhạy cảm; audit actor/target/reason/IP-device/before-after/result đã mask; notification qua adapter.

**Success:** không mutation nhạy cảm nào bypass re-auth/reason/audit; Mongo/Redis failure có hành vi đã chốt.

### ✅ #8 — [IAM-005.8] OpenAPI + generated clients

Khai báo request/response/error tường minh; regen TS + Dart clients; contract tests chặn route/requestBody bị mất.

**Success:** OpenAPI 3.1 và cả hai client không drift.

### ✅ #9 — [IAM-005.9] Test bắt buộc + regression

Unit + Postgres/Redis/Mongo integration bằng role app; Supertest; tenant-RLS/IDOR/race/leak scan; chạy lại IAM-001..004.

**Success:** 24/09/2026 — `REQUIRE_DB_TESTS=1` đạt 48/48 file, 433/433 test với role app + PostgreSQL/Redis/Mongo thật; có HTTP, RLS/IDOR, provision/create/password-change/limiter race và regression IAM-001..004, không skip im lặng.

### ✅ #10 — [IAM-005.10] Review, smoke, CI và đóng task

Chạy `code-reviewer` + `security-auditor`, guide, lint/typecheck/test/build/gen-client; chỉ sau CI user xác nhận mới đổi task row `Done`.

**Success:** không finding blocking/high; CI xanh; PROJECT-STATE/task row cập nhật đúng gate; có AI journal cho phần code. — ✅ Khanh xác nhận CI 5/5 job xanh ngày 25/09/2026; task row đã chuyển `Done`.

---

## Rủi ro phải test chủ động

- Owner/Employee trùng username khiến Employee bị shadow do login hiện tìm Owner trước.
- Thu hồi `sid` cũ sau rotation nhưng family mới vẫn sống.
- Lock/reset đổi DB thành công nhưng Redis fail khiến access JWT cũ còn dùng được: test DB thật phải chứng minh epoch mới chặn token cũ ngay cả khi cache báo active.
- Email delivery lỗi sau khi hash temp password đã commit.
- Hai request create/reset đồng thời phát hai temp credential còn hiệu lực.
- Cross-tenant IDOR qua path id hoặc query thiếu `operatorId`.
- Temp password/change token/session hash lọt vào Pino, Mongo audit, Sentry, OpenAPI example hoặc response.
- Bỏ re-auth ở một nhánh PATCH/reset hoặc audit ghi before/after chứa password hash.
- Slug legacy lệch profile trước migration có thể được chuẩn hóa và vô tình mở lại đường login: phải chạy preflight và xét từng Owner, không tự suy diễn `LOCKED` cũ là delivery pending. — ✅ Đã xử lý 24/09/2026: preflight trên Supabase trả 0 Owner, 0 lệch; file preflight đã xóa 25/09/2026.
