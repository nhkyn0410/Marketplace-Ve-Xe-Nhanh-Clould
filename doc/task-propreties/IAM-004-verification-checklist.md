# TASK-IAM-004 — Checklist nghiệm thu: TOTP + backup code + MFA re-auth

> Mục tiêu: chứng minh password của role privileged **chưa đủ để lấy token**, MFA dùng đúng chuẩn và mọi credential/challenge/code đều chống leak, replay và race.
> Chạy theo thứ tự **A → G**; tick `[x]` chỉ khi có evidence. Lệnh chi tiết: `IAM-004-guide.md`. Phạm vi/sub-task: `IAM-004-todo.md`.

## Snapshot trạng thái (21/09/2026)

- ✅ Q1–Q10 đã được Khanh chốt ngày 18/09/2026.
- ✅ **TASK-IAM-004 hoàn tất**: 310/310 test (hạ tầng thật, role app); turbo 35/35; smoke API build thật 23/23; 2 review đã sửa hết finding High; Khanh xác nhận CI branch xanh ngày 21/09/2026; task row đã chuyển `Done`.
- ✅ Bộ docs IAM-003 đã merge qua PR #6; IAM-004 không tạo lại hay sửa ngược bộ đó.

---

## PHẦN A — Thiết kế & ranh giới

- [x] Login password đúng của role mandatory chỉ tạo challenge Redis TTL 300s; `/auth/mfa/verify` mới cấp token — **đã chốt 18/09/2026**
- [x] Enrollment lần đầu dùng cùng `/auth/mfa/verify`, không thêm endpoint ngoài API §7.1 — **đã chốt 18/09/2026**
- [x] TOTP SHA-1 / 6 digits / 30s / skew ±1 / anti-replay — **đã chốt 18/09/2026**
- [x] AES-256-GCM; 10 backup code one-time display/hash/single-use atomic — **đã chốt 18/09/2026**
- [x] Mandatory chỉ `OPERATOR_OWNER`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT`; Employee optional defer — **đã chốt 18/09/2026**
- [x] Re-auth password hoặc MFA; 5 lần sai/challenge; recovery/reset defer IAM-005/Admin — **đã chốt 18/09/2026**
- [x] Không có endpoint/bypass/reset/recovery mới ngoài phạm vi; Passenger Email OTP không bị đổi hành vi — chỉ thêm `POST /auth/mfa/verify` (API §7.1); test OTP passenger cũ xanh
- [x] Không sửa ADR hoặc tự promote tài liệu SDLC sang Approved/Done — chỉ bump v0.7 DB (§5/§7 thêm bảng MFA) + v0.3 API (§7.1 làm rõ); status giữ nguyên

## PHẦN B — Env, crypto, schema & migration

- [x] `MFA_ENCRYPTION_KEY` decode base64 đúng 32 byte; production thiếu/sai → fail startup — `env.config.spec.ts` + `mfa.service.spec.ts`
- [x] AES-256-GCM nonce mới mỗi encryption; authentication tag được verify; tamper/wrong key fail-closed — `totp.spec.ts` (lật byte ciphertext/tag, sai key, sai ngữ cảnh AAD)
- [x] TOTP secret plaintext không xuất hiện trong Postgres, Redis payload, Pino, audit Mongo, Sentry hoặc response ngoài `otpAuthUri` enrollment one-time — int test quét DB/Redis/payload audit; smoke quét log API; payload Redis niêm phong; Sentry không đính kèm body
- [x] `mfa_credentials`: đủ cột, unique `(subject_type, subject_id)`, CHECK cấm `PASSENGER`, `last_totp_counter` là BIGINT nullable — kiểm `pg_constraint`/`information_schema`
- [x] `mfa_backup_codes`: unique `(credential_id, code_hash)`, index `(credential_id, used_at)`, FK cascade đúng migration — kiểm `pg_indexes`/`pg_constraint`
- [x] `auth_sessions.mfa_verified_at` nullable tồn tại và chỉ set cho session cấp sau MFA verify — int test + smoke §8 (Employee không có)
- [x] Migration `20260918164834_add_mfa_credentials` chạy được trên DB trống; `prisma migrate status` up-to-date — `migrate deploy` + `migrate diff` rỗng; CI `db-integration` chạy trên DB mới
- [x] Chạy `db:app-role` sau migrate; API test bằng role `vexenhanh_app`, không dùng superuser để che lỗi quyền — int test tự đỏ nếu superuser/BYPASSRLS
- [x] ~~Hai bảng MFA không có RLS~~ → **có RLS chỉ cho `system`** (todo Ghi nhận #1); không FK đa hình; truy cập chỉ qua `withSystem()` trong `MfaService` — test RLS 0 row ngoài ngữ cảnh system

## PHẦN C — Challenge & API contract

- [x] Mandatory login trả `{mfaRequired:true, challengeToken, enrollmentRequired, challengeExpiresIn:300}` và **không có access/refresh token** — int test + smoke §5A/§6/§10
- [x] Lần đầu có `otpAuthUri`; login sau enrollment không trả `otpAuthUri` — int test + smoke §5A/§6/§10
- [x] Employee optional trả token bình thường + `mfaRequired:false`, không tạo challenge/enrollment — int test + smoke §5A/§6/§10
- [x] Redis key dùng SHA-256 của token, không token thô; payload bind subject/role/operator và không chứa password/code/secret plaintext — key `mfa:challenge:{sha256}`; payload niêm phong AES-GCM (không đọc được cả subject id)
- [x] Challenge success là one-time; expired/fake/replay/exhausted đều `401 AUTH_INVALID_CREDENTIALS` cùng shape, không account oracle — int test: replay trả y hệt token giả
- [x] Tối đa 5 lần sai; lần thứ 5 vô hiệu challenge; counter attempts update atomic — HINCRBY trong Lua; int + smoke §9A
- [x] Hai verify song song cùng challenge → đúng một thành công — int test `[200,401]` + script Lua trả BUSY
- [x] Redis stop → `503 SERVICE_UNAVAILABLE`; không fallback in-memory, không tạo session/token — smoke §9B ~1s; unit 503 ở cả 4 script
- [x] `/auth/mfa/verify` request đúng `{challengeToken, code}`; TOTP và backup code dùng chung field `code` — `openapi.spec.ts`
- [x] Success trả token IAM-002 + `mfaRequired:false`; `backupCodes` chỉ có lần enrollment và đúng 10 — int test + smoke

## PHẦN D — TOTP security invariants

- [x] RFC 6238 test vector / clock deterministic chứng minh SHA-1, 6 digits, step 30s — 6 vector RFC
- [x] Counter hiện tại, -1, +1 pass; ngoài skew ±1 fail — `totp.spec.ts`
- [x] `last_totp_counter` update có điều kiện/transaction: cùng counter không dùng lại được — CAS `lt`; mutation bỏ CAS → test đỏ
- [x] Hai challenge concurrent dùng cùng TOTP counter → đúng một thành công — int test Postgres thật
- [x] TOTP format sai bị Zod 400; TOTP đúng format nhưng sai trả 401 generic — int test (`12ab` → 400); nhận thêm dạng `123 456`
- [x] Enrollment chỉ persist credential/enabled state sau khi TOTP proof hợp lệ — unit + int (credential null trước verify)
- [x] Challenge/credential bind đúng subject + role + tenant; không đổi token challenge giữa hai account được — payload AAD = hash token, secret AAD = chủ thể; int test ghép payload → 401
- [x] Clock drift được xử lý bằng sync clock, không nới window vượt quyết định — window cố định ±1; guide §11

## PHẦN E — Backup code & re-auth

- [x] Sinh đúng 10 backup code đủ entropy; response chỉ xuất hiện một lần — 80 bit/mã; int test
- [x] DB chỉ có `code_hash`; không có plaintext code trong DB/log/audit/Redis/Sentry — int test quét DB + payload audit; smoke quét log
- [x] Backup code hợp lệ cấp session và set `used_at`; replay trả 401 — int + smoke §6
- [x] Hai request concurrent cùng backup code → đúng một request consume/thành công — int test Postgres thật
- [x] Re-auth DTO bắt **đúng một** `password` / `otp` / `mfaCode`; 0 hoặc >1 field → 400 — int + smoke §7B
- [x] Re-auth password hợp lệ → 200 + `reauth:{sid}` TTL ≤300, không mint token mới — int + smoke
- [x] Re-auth TOTP hợp lệ → 200 + proof; anti-replay counter vẫn áp dụng — int + smoke §7A
- [x] Re-auth backup code hợp lệ → 200 + proof; code bị consume single-use — int test
- [x] Re-auth code sai/replay → 401, không tạo proof; vẫn chịu rate-limit hiện hữu — int test; thêm trần lần sai MFA theo chủ thể
- [x] Logout/revoke session xóa proof re-auth như invariant IAM-002 — IAM-002 test logout vẫn xanh (không đổi luồng)

## PHẦN F — Runtime smoke theo guide

- [x] §1 — key explicit, decode đúng 32 byte mà không in secret — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn); key ngẫu nhiên trong `.env.development` local, kiểm độ dài 32
- [x] §2 — migrate → `db:app-role` → seed; hai bảng + cột session tồn tại — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn); seed bỏ qua: cần `SEED_*_PASSWORD`, account seed đã có
- [x] §5A — enrollment challenge 300s, chưa token; verify TOTP ra token + đúng 10 backup code — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn)
- [x] §5B — replay challenge đã consume → 401 generic — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn)
- [x] §6 — backup code đầu dùng được; login sau không trả codes; replay cùng code → 401 — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn)
- [x] §7 — re-auth MFA và password đều 200; Redis proof TTL ≤300; response không có token mới — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn)
- [x] §8 — Redis TTL/key và Postgres boolean/count đúng; không select/log secret/hash/code — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn)
- [x] §9A — 5 lần sai làm challenge vô hiệu — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn)
- [x] §9B — Redis stop → 503, không session/token — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn); API trỏ Redis docker qua LAN IP
- [x] §10 — Employee optional login không bị ép MFA; IAM-002 refresh/logout và IAM-003 RLS smoke không hồi quy — smoke 23/23 (19/09/2026, account smoke riêng, đã dọn); refresh/reuse/logout + test RLS IAM-003 xanh

## PHẦN G — Static, regression, review & CI

- [x] Unit test crypto, RFC6238, ±1 skew, anti-replay, backup hash/single-use, challenge attempts/expiry/race
- [x] Integration/Supertest chạy Postgres + Redis thật bằng role app; `REQUIRE_DB_TESTS=1` không skip im lặng — `mfa.int.spec.ts` 15 test; workflow `db-integration.yml` đặt key ngẫu nhiên
- [x] Test cả ba role mandatory và ít nhất một Employee optional
- [x] OpenAPI assert có `/v1/auth/mfa/verify`, requestBody/response union và re-auth `mfaCode`
- [x] `pnpm gen:api-client` chạy; generated TS không drift; Dart contract generate/analyze xanh — mô phỏng `contract.yml` exit 0; `dart analyze` 0 lỗi
- [x] Toàn bộ IAM-001/002/003 regression xanh; số test không giảm — 310/310 (IAM-003: 248)
- [x] `pnpm turbo run typecheck lint test build` xanh — 35/35
- [x] `code-reviewer` + `security-auditor` không còn finding blocking/high — 2 High + Medium/Low đã sửa (todo Ghi nhận #4–#12); security-auditor kiểm lại: 5 finding đã đóng, 1 Medium mới (N1: re-auth khoá được login) đã sửa + test
- [x] CI branch xanh — Khanh xác nhận ngày 21/09/2026
- [x] Sau toàn bộ gate đã cập nhật task row/PROJECT-STATE; không thay đổi trạng thái Approved của tài liệu SDLC

## PHẦN H — DoD theo sub-task

| Sub-task | DoD | ✓ |
| --- | --- | --- |
| `.1` Quyết định | Q1–Q10 chốt, contract/range/defer ghi rõ | [x] |
| `.2` Env + crypto | Key validation + AES-GCM round-trip/tamper tests | [x] |
| `.3` Schema | Migration DB trống + constraint/index/grant thật | [x] |
| `.4` Challenge | TTL/attempt/binding/one-time/concurrency/fail-closed | [x] |
| `.5` TOTP | RFC6238 ±1 + atomic anti-replay + enrollment | [x] |
| `.6` Backup | 10 one-time display + hash + atomic single-use | [x] |
| `.7` API/login | 3 role gate token; Employee regression; OpenAPI/client | [x] |
| `.8` Re-auth | exactly-one method + proof TTL + no new token | [x] |
| `.9` Security/test | Leak scan + integration + full regression | [x] |
| `.10` Đóng task | review + smoke + CI + state update đúng gate | [x] |

## PHẦN I — Ranh giới (KHÔNG chặn nghiệm thu task này)

- Optional TOTP cho Driver/TicketStaff/SupportStaff → defer.
- UI scan QR, UX tải/in/nhắc lưu backup code → FE/Mobile task.
- Recovery/reset/rotate MFA secret hoặc cấp lại backup code → IAM-005/Admin.
- Guard nghiệp vụ tiêu thụ `reauth:{sid}` → task endpoint nhạy cảm tương ứng.
- Không yêu cầu tạo lại bộ docs IAM-003 đã merge qua PR #6.
