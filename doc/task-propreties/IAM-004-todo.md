# TASK-IAM-004 — Todo: MFA TOTP bắt buộc + backup code + MFA re-auth

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` dòng 141 — _"MFA TOTP (mandatory Owner/PlatformAdmin/PlatformSupport) + backup code"_. Nguồn thiết kế: **ADR-017**, Security §5.2/§8, LLD §6.5 bước 3, API §5/§7.1, `FR-IAM-10`, TC-ADM-001.
> **Dependency:** TASK-IAM-002 ✓ (hybrid token + `auth_sessions` + Redis). TASK-IAM-003 và bộ tài liệu IAM-003 đã merge vào `develop` qua PR #6; **không tạo lại** trong task này.
> **Cách dùng:** chỉ tick `[x]` khi có bằng chứng tương ứng. Guide chạy tay: `IAM-004-guide.md`. Nghiệm thu: `IAM-004-verification-checklist.md`.

## Trạng thái (21/09/2026) — ✅ **DONE**

- ✅ Khanh chốt toàn bộ quyết định IAM-004 ngày **18/09/2026**; bảng dưới là nguồn thực thi của task.
- ✅ 19/09/2026: code + test + review xong. Số đo: **310/310** test (Postgres/Redis/Mongo thật, role app, `REQUIRE_DB_TESTS=1`); turbo `typecheck lint test build` **35/35**; smoke API build thật **23/23** (guide §5–§10, gồm tắt Redis); 11 mutation vào các chốt bảo mật đều bị test bắt; Dart client khớp OpenAPI (mô phỏng đúng job `contract.yml`).
- ✅ 2 review (`code-reviewer` + `security-auditor`): không đường nào cấp token khi thiếu MFA; 2 finding **High** + các Medium/Low đã sửa — xem "Ghi nhận khi hiện thực".
- ✅ Khanh xác nhận CI branch xanh ngày 21/09/2026; checklist và task row đã cập nhật `Done`. Không thay đổi trạng thái Approved của tài liệu SDLC.

---

## Phạm vi & ranh giới

| Thuộc IAM-004 | Để task sau / không làm |
| --- | --- |
| Pre-auth challenge Redis 5 phút sau khi password đúng; chưa cấp token | Recovery/reset MFA thủ công → IAM-005/Admin |
| TOTP bắt buộc cho `OPERATOR_OWNER`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT` | TOTP optional cho `DRIVER`, `TICKET_STAFF`, `SUPPORT_STAFF` → defer |
| Enrollment lần đầu qua chính `POST /auth/mfa/verify` | Không thêm endpoint enrollment/reset ngoài API §7.1 |
| RFC 6238 SHA-1, 6 số, chu kỳ 30 giây, skew ±1 và anti-replay | Passenger tiếp tục dùng Email OTP; TOTP Passenger post-v1 |
| AES-256-GCM cho TOTP secret; 10 backup code chỉ hiện một lần, lưu hash, single-use atomic | UI nhập/scanning QR và UX lưu backup code → task FE/Mobile |
| `/auth/re-auth` nhận password **hoặc** MFA; passenger OTP cũ vẫn giữ | Guard tiêu thụ bằng chứng `reauth:{sid}` ở endpoint nghiệp vụ → task sở hữu endpoint đó |
| Tối đa 5 lần thử trên mỗi challenge; Redis lỗi thì 503 fail-closed | Đổi ADR, thêm actor/role/vendor hoặc cơ chế recovery mới |

---

## Quyết định — ✅ **ĐÃ CHỐT 18/09/2026**

| # | Quyết định | Hệ quả bắt buộc |
| --- | --- | --- |
| Q1 | Password đúng chỉ tạo **pre-auth challenge Redis TTL 5 phút** | Nhánh MFA tuyệt đối không trả access/refresh token trước verify |
| Q2 | Chỉ `POST /auth/mfa/verify` mới cấp token | Challenge phải bind đúng subject/role/tenant và dùng một lần |
| Q3 | Enrollment lần đầu đi qua cùng `/auth/mfa/verify` | Không tạo endpoint mới; response login lần đầu có `otpAuthUri`, verify thành công mới persist enrollment |
| Q4 | TOTP = RFC 6238 **SHA-1 / 6 digits / 30s / skew ±1 / anti-replay** | `last_totp_counter` phải được cập nhật atomically; cùng time-step không được dùng lại |
| Q5 | TOTP secret mã hóa **AES-256-GCM** | `MFA_ENCRYPTION_KEY` là base64 chuẩn của đúng 32 byte; DB/log/audit không có secret plaintext |
| Q6 | Sinh đúng **10 backup code** | Chỉ trả đúng một lần khi enrollment; DB chỉ lưu hash; mỗi code consume atomically một lần |
| Q7 | Chỉ 3 role mandatory | Employee optional defer; login Employee hiện tại vẫn cấp token bình thường |
| Q8 | Re-auth chấp nhận password **hoặc** MFA | DTO bắt đúng một trong `password`, `otp`, `mfaCode`; thành công chỉ cấp proof 5 phút, không mint session mới |
| Q9 | Tối đa **5 lần sai/challenge** | Lần sai thứ 5 làm challenge hết hiệu lực; challenge hết hạn/sai/replay trả cùng lỗi generic |
| Q10 | Recovery/reset MFA defer IAM-005/Admin | Không có bypass/reset tự phục vụ trong IAM-004 |

---

## Contract API phải giữ

### Login Operator / Platform

Nhánh role bắt buộc MFA trả HTTP 200 nhưng **không có token**:

```json
{
  "mfaRequired": true,
  "challengeToken": "<opaque-one-time-token>",
  "enrollmentRequired": true,
  "challengeExpiresIn": 300,
  "otpAuthUri": "<only-on-first-enrollment>"
}
```

- `otpAuthUri` chỉ có khi `enrollmentRequired=true`; đây là secret-bearing value, không log/audit/telemetry.
- Login sau khi đã enroll vẫn trả challenge nhưng không có `otpAuthUri`.
- Employee không thuộc 3 role mandatory giữ luồng cấp token và thêm `mfaRequired:false`.

### Verify challenge

Request duy nhất cho cả TOTP và backup code:

```json
{ "challengeToken": "<opaque-one-time-token>", "code": "<totp-or-backup-code>" }
```

Success trả các field token IAM-002 + `mfaRequired:false`. Lần enrollment đầu trả thêm `backupCodes` gồm đúng 10 mã; mọi lần sau **không** trả lại danh sách này.

Challenge/token/code sai, hết hạn, replay hoặc vượt số lần thử đều trả `401 AUTH_INVALID_CREDENTIALS`, không tiết lộ account/challenge/code nào sai. Redis không sẵn sàng trả `503 SERVICE_UNAVAILABLE`.

### Re-auth

`POST /auth/re-auth` vẫn cần Bearer access token. Body nhận **đúng một** trong:

```json
{ "password": "<password>" }
```

```json
{ "otp": "<passenger-email-otp>" }
```

```json
{ "mfaCode": "<totp-or-unused-backup-code>" }
```

Thành công chỉ ghi `reauth:{sid}` TTL 300 giây; không phát hành access/refresh token mới.

---

## Data design đã chốt

### PostgreSQL

| Model / bảng | Cột và ràng buộc chính |
| --- | --- |
| `MfaCredential` / `mfa_credentials` | `id`, `subject_type`, `subject_id`, `secret_ciphertext`, `last_totp_counter BIGINT NULL`, `enabled_at`, `created_at`, `updated_at`; unique `(subject_type, subject_id)`; CHECK `subject_type <> PASSENGER` |
| `MfaBackupCode` / `mfa_backup_codes` | `id`, `credential_id`, `code_hash`, `used_at NULL`, `created_at`; unique `(credential_id, code_hash)`; index `(credential_id, used_at)`; FK credential → credential `ON DELETE/UPDATE CASCADE` |
| `AuthSession` / `auth_sessions` | thêm `mfa_verified_at NULL`; chỉ set khi session được cấp sau verify TOTP/backup code |

Migration: `20260918164834_add_mfa_credentials` (kèm enum `SessionRevokeReason.MFA_REQUIRED`).

Hai bảng MFA **có RLS ENABLE + FORCE, policy chỉ cho ngữ cảnh `system`** (đổi so với bản nháp "không RLS" — xem Ghi nhận #1) và nằm trong `RLS_TABLES` (production kiểm lúc khởi động). Không có FK đa hình tới bốn bảng account. Mọi truy vấn đi qua `withSystem()` trong `iam/auth/MfaService`; CHECK + enum ngăn Passenger nhận credential trong task này.

### Redis

| Key | TTL | Nội dung / invariant |
| --- | --- | --- |
| `mfa:challenge:{<sha256(token)>}` | 300s | HASH `{payload, attempts}`. `payload` = JSON bind subject/tenant + enrollment state, **niêm phong AES-256-GCM** (AAD = hash token); không dùng token thô làm key |
| `mfa:challenge-lock:{<sha256(token)>}` | 30s | Lease NX: serialize verify để hai request song song không cùng consume challenge/code |
| `mfa-fail:{subject_type}:{subject_id}` | 24h | Đếm lần sai MFA **khi login** của chủ thể qua mọi challenge; ≥20 → 429; xoá khi xác thực đúng |
| `mfa-fail:reauth:{subject_type}:{subject_id}` | 24h | Như trên nhưng cho `/auth/re-auth` — **tách riêng** để phiên bị đánh cắp không khoá được login của chủ account |

`{…}` là hash tag Redis Cluster (challenge + lock cùng slot). Payload Redis không chứa password, TOTP/backup code hoặc secret plaintext; ai ghi được Redis cũng không tự dựng được challenge (không có key). Challenge bị xóa sau success, hết 5 lần sai hoặc hết TTL.

---

## Todo (ID = thứ tự thực hiện)

### ✅ #1 — [IAM-004.1] Chốt quyết định + khóa contract

Khanh chốt Q1–Q10 ngày 18/09/2026; không thêm endpoint enrollment/reset; IAM-003 docs đã merge nên không tạo lại.

**Success:** bảng quyết định, ranh giới, request/response union và error behavior ở trên được dùng làm acceptance criteria. — **Đạt (quyết định, chưa phải code).**

### ✅ #2 — [IAM-004.2] Env + crypto service

- Validate `MFA_ENCRYPTION_KEY`: base64 chuẩn, decode đúng 32 byte; production thiếu/sai phải fail startup.
- AES-256-GCM dùng nonce ngẫu nhiên mới cho mỗi lần encrypt, xác thực tag khi decrypt; không log key/secret/ciphertext.
- Non-production có thể derive key context-separated từ secret ứng dụng để test không gãy, nhưng smoke/CI IAM-004 phải đặt key tường minh.

**Success:** round-trip crypto xanh; ciphertext khác plaintext và hai lần encrypt cùng secret không trùng; key sai/tamper bị từ chối; production thiếu key không khởi động. — **Đạt:** `totp.spec.ts` (AES-GCM ngẫu nhiên; lật byte thật ở ciphertext/tag; sai key; sai ngữ cảnh AAD; sai version), `env.config.spec.ts` (base64 chuẩn đúng 32 byte, bit đệm lạ bị từ chối, production thiếu key → lỗi), `mfa.service.spec.ts` (production thiếu key → không khởi tạo được).

### ✅ #3 — [IAM-004.3] Prisma schema + migration

Tạo hai model và cột `auth_sessions.mfa_verified_at` đúng phần Data design; áp migration trên DB trống bằng owner rồi chạy `db:app-role` để role app có quyền trên bảng mới.

**Success:** `prisma migrate status` up-to-date; unique/CHECK/FK/index tồn tại thật; role app CRUD được qua `withSystem()` nhưng query ngoài context không tạo bypass tenant. — **Đạt:** migrate deploy (owner) → `db:app-role` → `migrate diff` rỗng; `pg_constraint`/`pg_indexes`/`pg_policies` khớp; test RLS `mfa.int.spec.ts` (không ngữ cảnh / tenant / platform → 0 row, xoá/ghi → 0; system thấy; CHECK Passenger bị từ chối).

### ✅ #4 — [IAM-004.4] Pre-auth challenge Redis

Challenge opaque ngẫu nhiên, DB/Redis chỉ nhận hash token; TTL 300 giây; bind subject/role/operator; attempts=5; verify/delete atomic và có lock chống race; Redis lỗi fail-closed.

**Success:** token giả/hết hạn/replay/attempt thứ 6 đều 401 generic; hai verify song song cùng challenge chỉ một request thắng; Redis stop → 503, không cấp token. — **Đạt:** int test (replay trả đúng như token giả; 5 sai → xoá; song song → `[200,401]`; script Lua gọi thẳng trên Redis thật; payload tự viết/ghép → 401); unit 503 ở cả 4 script; smoke §9B (docker Redis stop → login + verify 503 ~1s, không session mới).

### ✅ #5 — [IAM-004.5] TOTP enrollment + verification

Implement RFC 6238 đúng Q4; enrollment đầu tạo `otpAuthUri`, chỉ persist credential sau khi code TOTP hợp lệ; `last_totp_counter` chống dùng lại cùng time-step bằng update có điều kiện.

**Success:** current/±1 step pass, ngoài window fail; cùng counter chỉ thắng một lần kể cả concurrent; SHA-1/6 digits/30s được test bằng RFC vector phù hợp. — **Đạt:** 6 vector RFC 6238; −1/0/+1 pass, ±2 fail; hai challenge song song cùng mã TOTP → `[200,401]` trên Postgres thật; hai enrollment song song → `[200,401]`, secret bên thua không dùng được.

### ✅ #6 — [IAM-004.6] Backup code

Sinh đúng 10 code đủ entropy; chỉ trả một lần khi enrollment; lưu hash; verify bằng compare an toàn; consume `used_at` atomically.

**Success:** code đầu dùng được một lần; replay fail; hai request concurrent cùng code chỉ một thắng; DB/log/audit không chứa code thô; response login/verify sau enrollment không trả lại 10 code. — **Đạt:** int test (replay kể cả viết thường → 401; song song → đúng một `used_at`; quét DB + payload audit không thấy mã, có hay không gạch); smoke §6/§8.

### ✅ #7 — [IAM-004.7] Nối login + `POST /auth/mfa/verify`

Nối mandatory roles vào cả Operator/Platform login; controller mỏng + Zod DTO/OpenAPI; verify thành công mới tạo session/token và set `mfa_verified_at`; Employee optional không bị ép enrollment.

**Success:** ba role mandatory không nhận token trước MFA; Employee login hồi quy xanh; endpoint có requestBody/response union trong OpenAPI; client TS/Dart regen được. — **Đạt:** int test ma trận role (Owner/Admin/Support → challenge; DRIVER → token, không credential); `openapi.spec.ts` assert union 2 nhánh + `MfaVerifyDto` + không Bearer; `gen:api-client` + Dart regen (`dart analyze` 0 lỗi, mô phỏng `contract.yml` exit 0).

### ✅ #8 — [IAM-004.8] MFA cho `/auth/re-auth`

Mở rộng DTO với `mfaCode`; đúng một trong password/OTP/MFA; TOTP và backup code cùng invariant anti-replay/single-use; giữ rate limit hiện hữu.

**Success:** password hoặc MFA hợp lệ → 200 + `reauth:{sid}` TTL ≤300; gửi 0 hoặc >1 method → 400; code sai/replay → 401 và không tạo proof. — **Đạt:** int test + smoke §7 (TOTP / backup code / password → 200, TTL ≤300, không phiên mới; replay → 401, không proof; 0 hoặc 2 phương thức → 400).

### ✅ #9 — [IAM-004.9] Bảo mật, audit, OpenAPI và test

- Mask toàn bộ password/challenge/TOTP/backup/`otpAuthUri`/key; audit chỉ metadata cần thiết.
- Unit + integration Postgres/Redis thật cho crypto, RFC6238, anti-replay, attempts, backup atomic, role matrix, token gating và re-auth.
- Chạy lại IAM-001/002/003; OpenAPI assert `/auth/mfa/verify`; regen TS + Dart client.

**Success:** `IAM-004-verification-checklist.md` phần A–G có evidence; không giảm test cũ; static/build xanh. — **Đạt:** 310/310 (IAM-003 là 248; không xoá test cũ — `auth-session.int.spec` IAM-002 nay login qua MFA); turbo 35/35; log API smoke không khớp mẫu nhạy cảm nào.

### ✅ #10 — [IAM-004.10] Review + smoke + đóng task

Chạy `code-reviewer` + `security-auditor`, guide từ đầu tới cuối, CI branch. Chỉ sau khi tất cả xanh mới cập nhật task row/PROJECT-STATE theo quy trình dự án.

**Success:** không còn finding blocking/high; CI xanh; checklist có số đo thật; không tự promote SDLC `Approved`/`Done` trước gate. — ✅ Khanh xác nhận CI xanh ngày 21/09/2026; task row đã chuyển `Done`.

---

## Ghi nhận khi hiện thực (19/09/2026)

| # | Điểm | Lý do / nguồn |
| --- | --- | --- |
| 1 | Hai bảng MFA **có RLS chỉ cho `system`** (bản nháp ghi "không RLS") | Không policy thì mọi query role app đọc/**xoá** được credential; xoá một row = login sau quay về enrollment chỉ bằng mật khẩu (bypass MFA). Thêm vào `RLS_TABLES` |
| 2 | Yêu cầu MFA là thuộc tính role: `ROLE_REQUIRES_MFA: Record<Role, boolean>` trong `iam/role/role.ts` | Playbook mở rộng role IAM-003: thêm role mà quên quyết định MFA → TypeScript báo lỗi; không so tên role rải rác |
| 3 | Token của role bắt buộc phải có claim `mfa: true`; phiên cấp trước IAM-004 refresh → 401 `AUTH_MFA_REQUIRED` + thu hồi family (enum mới `MFA_REQUIRED`) | Không để token/phiên cũ đi vòng qua MFA sau khi deploy |
| 4 | ⭐ Review H1 (cả 2 reviewer): **trần lần sai MFA theo chủ thể 20/24h → 429**, reset khi đúng | 5 lần/challenge × 10 login/giờ = 50 lần đoán/giờ, không giới hạn thời gian (~73%/năm trúng). **Khanh cần xác nhận con số + mã 429** |
| 5 | ⭐ Review H1: bucket rate-limit login tính theo danh tính đã resolve | `platform /khanh`, `platform/<tab>khanh`… cùng vào một account nhưng mỗi biến thể là một bucket mới (lỗi có từ IAM-001) |
| 6 | Review M2 (security): payload challenge niêm phong AES-GCM (AAD = hash token); secret TOTP khoá AAD vào chủ thể | Trước đó ai ghi được Redis (một credential Upstash dùng chung API/worker/Bull Board) dựng được challenge cho account khác → chiếm Owner/Admin |
| 7 | Review L1: `precheck` (account/tenant còn active) chạy **sau** proof đúng, **trước** khi tiêu proof | Account bị khoá thì backup code không bị đốt, secret của kẻ tấn công không kịp được lưu |
| 8 | Review M1/L2: MFA sai → lịch sử đăng nhập `mfa_invalid` + IP/UA; audit `auth.mfa.challenge_issued` | Password đúng + MFA sai là dấu hiệu mạnh nhất của lộ mật khẩu |
| 9 | Sentry tắt đính kèm body request + scrub header; Pino redact thêm field MFA | SDK Sentry 10 mặc định gửi body ≤10KB theo event lỗi — password/OTP/refresh token/mã MFA (lỗ có từ IAM-001) |
| 10 | Nhỏ: `otpauth` mã hoá RFC 3986 (`%20`), TOTP nhận `123 456`, key Redis có hash tag, key MFA chỉ validate một chỗ (env) | Review L4/L5/L7/L9 |
| 11 | Vòng kiểm lại của security-auditor (N1): bộ đếm lần sai của **re-auth tách khỏi login** | Dùng chung thì kẻ cầm access/refresh token bị đánh cắp (không cần mật khẩu) sai re-auth 20 lần là khoá chủ account khỏi login MFA 24h, lặp lại suốt đời refresh family |
| 12 | N2/N4: chạm trần → audit `auth.mfa.locked` (IP/UA); thua race compare-and-set → audit `auth.mfa.verification_failed` | Chạm trần là dấu hiệu lộ mật khẩu mạnh nhất, trước chỉ có log |

**Rủi ro còn lại (chấp nhận, ghi rõ):**

- Enrollment lần đầu: ai có mật khẩu thì enroll được (Q3). Sau deploy production, owner/admin nên đăng nhập + enroll ngay.
- Credential enrollment và session không nằm chung một transaction: Postgres lỗi đúng giữa hai bước → 500, người dùng mất 10 backup code (TOTP vẫn dùng được). Cấp lại backup code → IAM-005/Admin.
- Envelope chưa có key id → chưa xoay `MFA_ENCRYPTION_KEY` được; mất key = mọi admin phải reset MFA (IAM-005). Runbook reset sau này: **đổi mật khẩu trước** rồi mới xoá credential.
- `/auth/mfa/verify` chưa có rate limit theo IP riêng (challenge đã bị giới hạn bởi login + trần theo chủ thể + payload niêm phong) — security-auditor đồng ý.
- Người có mật khẩu giữ chủ account ở trạng thái bị khoá MFA được (~4 login/24h) — chấp nhận vì cần mật khẩu; IAM-005 reset mật khẩu nên xoá `mfa-fail:*`.
- Ai vừa có mật khẩu vừa ghi được Redis thì xoá được bộ đếm `attempts`/`mfa-fail` (bộ đếm bền trong Postgres không cần cho v1).
- Trần có thể vượt nhẹ khi nhiều challenge song song (≤ số challenge sống) — không ảnh hưởng phép tính brute-force.

## Rủi ro phải test chủ động

| Rủi ro | Test bắt buộc |
| --- | --- |
| Password đúng vô tình vẫn nhận token | Assert response challenge không có `accessToken`/`refreshToken`; DB không có session mới |
| Hai request verify cùng challenge/code cùng thắng | Test concurrent: đúng một 200, request còn lại 401 |
| TOTP dùng lại trong cùng 30 giây | Hai challenge, cùng counter: request thứ hai 401 |
| Backup code race | Hai request dùng cùng code: đúng một consume `used_at` |
| Secret/key/code rơi vào log | Capture Pino/audit/error/Redis payload và scan giá trị canary |
| Đồng hồ lệch làm người dùng bị từ chối | Test biên ±1; guide yêu cầu đồng bộ clock, không nới window |
| Migration chạy xong nhưng role app thiếu quyền | Sau migrate luôn chạy `db:app-role`, test API bằng `DATABASE_URL` role app |
| Mất encryption key | Startup/decrypt fail rõ ràng; không tạo bypass; recovery/reset để IAM-005/Admin |
