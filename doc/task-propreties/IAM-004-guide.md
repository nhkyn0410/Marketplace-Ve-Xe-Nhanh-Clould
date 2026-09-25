# TASK-IAM-004 — Guide kiểm chứng: TOTP, backup code và MFA re-auth

> Chạy thật IAM-004 trên máy local: enrollment → verify TOTP → login bằng backup code → replay thất bại → re-auth bằng MFA/password, rồi soi Redis/Postgres mà không in secret.
> Lệnh chạy ở repo root `C:\Code\Ve_Xe_Nhanh` (**PowerShell**). Phạm vi/quyết định: `IAM-004-todo.md`. Nghiệm thu: `IAM-004-verification-checklist.md`.
>
> ⚠️ Guide này không chứa secret thật. Không paste `MFA_ENCRYPTION_KEY`, password, `otpAuthUri`, TOTP, backup code, access/refresh token vào log, issue, commit, ảnh chụp hoặc transcript.

## 0. Tiền đề

- Docker Desktop đang chạy; branch thực hiện IAM-004; đã `pnpm install`.
- IAM-003 đã merge: app dùng role `vexenhanh_app`; migrate dùng owner qua `MIGRATION_DATABASE_URL`.
- Có một account thuộc role mandatory (`OPERATOR_OWNER`, `PLATFORM_ADMIN` hoặc `PLATFORM_SUPPORT`) **chưa enroll MFA**.
  - ⚠️ Enroll vào account seed (`platform/khanh`, `phuongtrang/owner01`) nghĩa là từ đó login local **bắt buộc** authenticator đó; chưa có luồng reset (IAM-005/Admin). Muốn thử mà không "khoá" account seed thì tạo account riêng để smoke rồi xoá sau.
- Có authenticator RFC 6238 tương thích SHA-1 / 6 digits / 30s. Đồng hồ máy và điện thoại phải được sync.
- Các placeholder dạng `<...>` phải lấy từ local secret store/seed; không thay bằng giá trị thật trong file này.

---

## 1. Cấu hình `MFA_ENCRYPTION_KEY`

`apps/api/.env.development` cần key riêng cho môi trường, base64 chuẩn decode ra **đúng 32 byte**:

```dotenv
MFA_ENCRYPTION_KEY="<BASE64_32_BYTE_KEY_FROM_LOCAL_SECRET_STORE>"
```

Không commit file env. Production bắt buộc có biến này và phải lấy từ secret manager. Non-production có fallback derive context-separated để test không gãy, nhưng guide này cố ý đặt key tường minh để gần production.

Kiểm **độ dài decode** mà không in key:

```powershell
$decodedMfaKey = [Convert]::FromBase64String($env:MFA_ENCRYPTION_KEY)
if ($decodedMfaKey.Length -ne 32) { throw "MFA_ENCRYPTION_KEY phải decode thành đúng 32 byte" }
Remove-Variable decodedMfaKey
```

Nếu cần tạo key local mới, dùng công cụ sinh số ngẫu nhiên mật mã và đưa thẳng vào secret store; không ghi ví dụ key cố định vào doc/code. Giữ key ổn định cho môi trường có credential đã mã hóa — đổi key làm secret cũ không giải mã được; recovery/reset thuộc IAM-005/Admin.

---

## 2. Migrate bằng owner, cấp quyền lại cho role app

`apps/api/.env.development` giữ hai URL theo IAM-003:

```dotenv
DATABASE_URL="postgresql://vexenhanh_app:<APP_ROLE_PASSWORD>@localhost:5432/vexenhanh_dev?schema=public"
MIGRATION_DATABASE_URL="postgresql://vexenhanh:<OWNER_PASSWORD>@localhost:5432/vexenhanh_dev?schema=public"
MFA_ENCRYPTION_KEY="<BASE64_32_BYTE_KEY_FROM_LOCAL_SECRET_STORE>"
```

```powershell
docker compose up -d
pnpm --filter @vexenhanh/api exec prisma migrate deploy
pnpm --filter @vexenhanh/api db:app-role
pnpm --filter @vexenhanh/api db:seed
```

Thứ tự `migrate` → `db:app-role` là bắt buộc: hai bảng MFA được tạo sau phải được grant cho role app. `db:seed` cần `SEED_PLATFORM_PASSWORD`, `SEED_OPERATOR_PASSWORD`, `SEED_EMPLOYEE_PASSWORD` trong env (không có mật khẩu mặc định); account seed đã có từ task trước thì bỏ qua bước seed được.

Kiểm schema thật mà không đọc ciphertext/hash:

```powershell
docker compose exec -T postgres psql -U vexenhanh -d vexenhanh_dev -c "select table_name from information_schema.tables where table_schema='public' and table_name in ('mfa_credentials','mfa_backup_codes') order by table_name;"
docker compose exec -T postgres psql -U vexenhanh -d vexenhanh_dev -c "select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='auth_sessions' and column_name='mfa_verified_at';"
```

Mong đợi: có đủ hai bảng và `auth_sessions.mfa_verified_at` nullable.

Hai bảng MFA có RLS **chỉ cho ngữ cảnh `system`** (xoá được một row `mfa_credentials` = login sau quay về enrollment chỉ bằng mật khẩu):

```powershell
docker compose exec -T postgres psql -U vexenhanh -d vexenhanh_dev -c "select relname, relrowsecurity, relforcerowsecurity from pg_class where relname in ('mfa_credentials','mfa_backup_codes');"
```

→ cả hai `t | t`.

---

## 3. Chạy test trước smoke

Test IAM với Postgres/Redis/Mongo thật và role app:

```powershell
$env:DATABASE_URL = "postgresql://vexenhanh_app:<APP_ROLE_PASSWORD>@localhost:5432/vexenhanh_dev?schema=public"
$env:MIGRATION_DATABASE_URL = "postgresql://vexenhanh:<OWNER_PASSWORD>@localhost:5432/vexenhanh_dev?schema=public"
$env:MFA_ENCRYPTION_KEY = "<BASE64_32_BYTE_KEY_FROM_LOCAL_SECRET_STORE>"
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api exec vitest run src/iam
```

Static + regression toàn monorepo:

```powershell
pnpm gen:api-client
pnpm turbo run typecheck lint test build
```

OpenAPI phải có `POST /v1/auth/mfa/verify`, request body `{challengeToken, code}`, login response union challenge/token và `mfaCode` trong re-auth. Contract workflow riêng phải chứng minh Dart client sinh/analyze được; không sửa tay generated client.

---

## 4. Khởi động API

```powershell
pnpm --filter @vexenhanh/api build
pnpm --filter @vexenhanh/api start
```

API tự nạp `apps/api/.env.development` (biến đã set trong shell được ưu tiên). Muốn chạy §9B (tắt Redis) thì API phải trỏ vào **Redis docker**: trên máy này `localhost:6379` là Redis trong WSL, nên đặt `$env:REDIS_URL = "redis://<LAN IP>:6379"` trước `start` (xem §11).

Ở PowerShell khác:

```powershell
$base = "http://localhost:3000/v1"
$mandatoryIdentifier = "platform/<SEED_PLATFORM_USERNAME>"
$mandatoryPassword = "<SEED_PLATFORM_PASSWORD>"
$loginBody = @{ identifier = $mandatoryIdentifier; password = $mandatoryPassword } | ConvertTo-Json -Compress
```

Không bật verbose curl (`-v`) vì header/body có credential/token.

---

## 5. Enrollment lần đầu → verify TOTP

### 5A. Password đúng chỉ nhận challenge, chưa có token

```powershell
$enrollment = curl.exe -s -X POST "$base/auth/platform/login" -H "Content-Type: application/json" -d $loginBody | ConvertFrom-Json
$enrollment | Select-Object mfaRequired, enrollmentRequired, challengeExpiresIn
$enrollment.PSObject.Properties.Name -contains "accessToken"
$enrollment.PSObject.Properties.Name -contains "refreshToken"
```

Mong đợi:

- `mfaRequired=True`, `enrollmentRequired=True`, `challengeExpiresIn=300`.
- Hai kiểm tra token đều `False`.
- Có `challengeToken` và `otpAuthUri`, nhưng **không in hai field này**. `otpAuthUri` chứa TOTP secret.

Import `$enrollment.otpAuthUri` vào authenticator trong môi trường local tin cậy, không copy qua chat/log/screenshare. Sau đó nhập mã đang hiển thị:

```powershell
$totp = Read-Host "TOTP hiện tại (không lưu vào file)"
$verifyBody = @{ challengeToken = $enrollment.challengeToken; code = $totp } | ConvertTo-Json -Compress
$verified = curl.exe -s -X POST "$base/auth/mfa/verify" -H "Content-Type: application/json" -d $verifyBody | ConvertFrom-Json
$verified | Select-Object mfaRequired, tokenType, expiresIn, refreshExpiresIn
$verified.backupCodes.Count
Remove-Variable totp, verifyBody
```

Mong đợi: token fields có mặt, `mfaRequired=False`, và count backup code = **10**.

⚠️ `backupCodes` chỉ xuất hiện lần này. Giữ tạm trong memory để chạy §6, sau đó xóa biến. Ở sản phẩm thật, người dùng phải lưu vào nơi an toàn; server không thể hiển thị lại plaintext.

### 5B. Challenge đã consume không dùng lại được

Nhập một TOTP bất kỳ vào biến mới rồi gửi lại **cùng challenge**:

```powershell
$replayTotp = Read-Host "TOTP để thử replay challenge"
$replayBody = @{ challengeToken = $enrollment.challengeToken; code = $replayTotp } | ConvertTo-Json -Compress
curl.exe -s -w "`n[%{http_code}]`n" -X POST "$base/auth/mfa/verify" -H "Content-Type: application/json" -d $replayBody
Remove-Variable replayTotp, replayBody
```

→ `401 AUTH_INVALID_CREDENTIALS`; không tiết lộ challenge đã dùng hay code sai.

---

## 6. Login bằng backup code → replay thất bại

Giữ code đầu trong memory, không in:

```powershell
$oneBackupCode = $verified.backupCodes[0]
$backupChallenge = curl.exe -s -X POST "$base/auth/platform/login" -H "Content-Type: application/json" -d $loginBody | ConvertFrom-Json
$backupChallenge | Select-Object mfaRequired, enrollmentRequired, challengeExpiresIn
$backupChallenge.PSObject.Properties.Name -contains "otpAuthUri"
```

Mong đợi: `mfaRequired=True`, `enrollmentRequired=False`, không có `otpAuthUri`, chưa có token.

```powershell
$backupVerifyBody = @{ challengeToken = $backupChallenge.challengeToken; code = $oneBackupCode } | ConvertTo-Json -Compress
$verifiedByBackup = curl.exe -s -X POST "$base/auth/mfa/verify" -H "Content-Type: application/json" -d $backupVerifyBody | ConvertFrom-Json
$verifiedByBackup | Select-Object mfaRequired, tokenType, expiresIn, refreshExpiresIn
$verifiedByBackup.PSObject.Properties.Name -contains "backupCodes"
Remove-Variable backupVerifyBody
```

→ Có token, `mfaRequired=False`, và **không** trả lại `backupCodes`.

Tạo challenge mới rồi replay đúng backup code đã dùng:

```powershell
$replayChallenge = curl.exe -s -X POST "$base/auth/platform/login" -H "Content-Type: application/json" -d $loginBody | ConvertFrom-Json
$backupReplayBody = @{ challengeToken = $replayChallenge.challengeToken; code = $oneBackupCode } | ConvertTo-Json -Compress
curl.exe -s -w "`n[%{http_code}]`n" -X POST "$base/auth/mfa/verify" -H "Content-Type: application/json" -d $backupReplayBody
Remove-Variable backupReplayBody, oneBackupCode
```

→ `401 AUTH_INVALID_CREDENTIALS`. Đây là bằng chứng single-use; test concurrent trong Vitest mới là bằng chứng atomicity đầy đủ.

---

## 7. Re-auth bằng MFA hoặc password

### 7A. MFA

Dùng access token của session vừa verify backup; nhập TOTP mới (không tái dùng counter đã verify):

```powershell
$reauthTotp = Read-Host "TOTP mới cho re-auth"
$reauthMfaBody = @{ mfaCode = $reauthTotp } | ConvertTo-Json -Compress
curl.exe -s -w "`n[%{http_code}]`n" -X POST "$base/auth/re-auth" -H ("Authorization: Bearer " + $verifiedByBackup.accessToken) -H "Content-Type: application/json" -d $reauthMfaBody
Remove-Variable reauthTotp, reauthMfaBody
```

→ 200. Response không có token mới; Redis có `reauth:{sid}` TTL tối đa 300 giây.

### 7B. Password

```powershell
$reauthPasswordBody = @{ password = $mandatoryPassword } | ConvertTo-Json -Compress
curl.exe -s -w "`n[%{http_code}]`n" -X POST "$base/auth/re-auth" -H ("Authorization: Bearer " + $verifiedByBackup.accessToken) -H "Content-Type: application/json" -d $reauthPasswordBody
```

→ 200. Gửi cả `password` và `mfaCode`, hoặc không gửi field nào, phải là 400 do Zod `exactly one`.

---

## 8. Soi Redis và Postgres bằng bằng chứng không lộ secret

Redis chỉ xem tên key/TTL, **không `GET` payload challenge** (payload đã niêm phong AES-GCM nên có đọc cũng không ra gì, nhưng giữ thói quen). Key có dạng `mfa:challenge:{<sha256>}` — `{…}` là hash tag Redis Cluster:

```powershell
docker compose exec -T redis redis-cli --scan --pattern "mfa:challenge:*"
docker compose exec -T redis redis-cli --scan --pattern "mfa:challenge-lock:*"
docker compose exec -T redis redis-cli --scan --pattern "reauth:*"
```

Challenge chưa consume có TTL `1..300`; challenge đã verify/replay/exhaust phải biến mất. Lock tự hết sau khoảng 30 giây. Với key `reauth:*` vừa thấy, chạy `TTL <key>` và mong đợi `1..300`.

Postgres chỉ query boolean/count:

```powershell
docker compose exec -T postgres psql -U vexenhanh -d vexenhanh_dev -c "select subject_type, secret_ciphertext is not null and length(secret_ciphertext) > 0 as encrypted_secret_present, last_totp_counter is not null as anti_replay_counter_present, enabled_at is not null as enabled from mfa_credentials order by created_at desc limit 5;"
docker compose exec -T postgres psql -U vexenhanh -d vexenhanh_dev -c "select count(*) as total_codes, count(*) filter (where used_at is not null) as used_codes from mfa_backup_codes where credential_id=(select id from mfa_credentials order by created_at desc limit 1);"
docker compose exec -T postgres psql -U vexenhanh -d vexenhanh_dev -c "select mfa_verified_at is not null as mfa_verified from auth_sessions order by issued_at desc limit 5;"
```

Mong đợi: credential enabled + counter có; `total_codes=10`, `used_codes>=1`; session cấp qua MFA có `mfa_verified=true`. Không select `secret_ciphertext` hay `code_hash` ra màn hình.

---

## 9. Fail-closed và giới hạn lần thử

### 9A. Năm lần sai làm challenge vô hiệu

Tạo challenge mới rồi gửi một mã 6 số cố ý sai tối đa 5 lần. Test tự động dùng clock/code deterministic là nguồn chính; smoke này chỉ bổ sung:

```powershell
$limitedChallenge = curl.exe -s -X POST "$base/auth/platform/login" -H "Content-Type: application/json" -d $loginBody | ConvertFrom-Json
$wrongBody = @{ challengeToken = $limitedChallenge.challengeToken; code = "000000" } | ConvertTo-Json -Compress
1..5 | ForEach-Object { curl.exe -s -o NUL -w "attempt $_ -> %{http_code}`n" -X POST "$base/auth/mfa/verify" -H "Content-Type: application/json" -d $wrongBody }
curl.exe -s -w "`n[%{http_code}]`n" -X POST "$base/auth/mfa/verify" -H "Content-Type: application/json" -d $wrongBody
Remove-Variable wrongBody
```

→ Mọi lần sai là 401; request sau lần thứ 5 vẫn 401 generic và challenge không còn trong Redis. Nếu `000000` tình cờ là TOTP hợp lệ ở thời điểm chạy, bỏ kết quả smoke này và dựa vào test deterministic — không cố bẻ dữ liệu production-like.

### 9B. Redis chết → 503 và không có session/token

Đảm bảo API đang dùng đúng Redis Docker (máy này từng có Redis WSL cùng port), rồi:

```powershell
docker compose stop redis
curl.exe -s -w "`n[%{http_code}]`n" -X POST "$base/auth/platform/login" -H "Content-Type: application/json" -d $loginBody
docker compose start redis
```

→ 503 `SERVICE_UNAVAILABLE`; không được fallback in-memory hoặc cấp token sau password.

### 9C. Trần lần sai theo tài khoản (20 lần / 24h)

Ngoài 5 lần/challenge, mỗi tài khoản có bộ đếm lần sai MFA **khi login** cộng dồn qua mọi challenge: `mfa-fail:<subject_type>:<id>`. Chạm 20 → `429 AUTH_LOGIN_RATE_LIMITED` kể cả khi mã lần đó đúng, tự hết sau 24h tính từ lần sai đầu; xác thực đúng thì bộ đếm về 0. Re-auth có bộ đếm **riêng** `mfa-fail:reauth:<subject_type>:<id>` (phiên bị đánh cắp không khoá được login của chủ account).

```powershell
docker compose exec -T redis redis-cli --scan --pattern "mfa-fail:*"
```

Test tự động (`mfa.int.spec.ts`) đã chạy đủ 20 lần sai; smoke tay không cần lặp lại.

---

## 10. Hồi quy role không bắt buộc MFA

Login một Employee seed (`DRIVER`, `TICKET_STAFF` hoặc `SUPPORT_STAFF`):

```powershell
$employeeBody = @{ identifier = "<OPERATOR_SLUG>/<SEED_EMPLOYEE_USERNAME>"; password = "<SEED_EMPLOYEE_PASSWORD>" } | ConvertTo-Json -Compress
$employeeLogin = curl.exe -s -X POST "$base/auth/operator/login" -H "Content-Type: application/json" -d $employeeBody | ConvertFrom-Json
$employeeLogin | Select-Object mfaRequired, tokenType, expiresIn, refreshExpiresIn
```

→ `mfaRequired=False` và có token ngay. Không có enrollment/challenge. Optional Employee MFA đã defer, đừng coi đây là lỗi.

Chạy lại refresh/logout và RLS smoke của IAM-002/003 để bảo đảm session MFA không phá rotation, revoke hoặc tenant scope.

---

## 11. Gỡ vướng

| Hiện tượng | Kiểm tra / xử lý |
| --- | --- |
| API không khởi động, báo key sai | Base64 phải hợp lệ và decode đúng 32 byte; không dùng chuỗi 32 ký tự thường |
| TOTP đúng trên điện thoại nhưng 401 | Sync clock máy/điện thoại; window chỉ ±1 theo quyết định, không nới để che lỗi |
| TOTP vừa dùng bị 401 ở challenge/re-auth khác | Anti-replay cùng counter đang hoạt động; đợi time-step mới |
| Challenge 401 sau một lúc | TTL đúng 5 phút; login lại để lấy challenge mới |
| Challenge luôn 401 sau nhiều lần thử | Đã hết 5 attempts; login lại; response cố ý không phân biệt lý do |
| `/auth/mfa/verify` trả 429 dù mã đúng | Tài khoản đã sai ≥20 lần trong 24h (§9C). Chờ hết cửa sổ; **chỉ dev local** mới xoá tay: `redis-cli DEL mfa-fail:<subject_type>:<id>`. Production: coi là dấu hiệu lộ mật khẩu — xem audit `auth.mfa.locked` |
| Bấm verify hai lần liên tiếp, lần sau báo 401 | Lần đầu đã thành công (phiên đã tạo); request thứ hai thua race → 401 generic. FE nên chặn double-submit |
| `otpAuthUri` không có | Account đã enroll hoặc role không mandatory; không được tái hiện secret |
| Enrollment không trả 10 backup code lần nữa | Đúng thiết kế one-time display; recovery/reset defer IAM-005/Admin |
| Migration xong nhưng API báo permission denied | Chạy lại `db:app-role` **sau** migrate; kiểm app đang dùng `DATABASE_URL` role app |
| Stop Redis nhưng API vẫn hoạt động | API có thể đang dùng Redis WSL/host khác; đối chiếu `REDIS_URL` trước khi kết luận |
| Credential cũ decrypt lỗi sau đổi env | Khôi phục đúng key môi trường; không bypass MFA; reset/recovery không thuộc task này |
| Mất authenticator của account **dev local** | Chỉ local dev: xoá row của chính mình bằng owner — `delete from mfa_credentials where subject_id='<id>';` (backup code xoá theo cascade) → login lại sẽ enroll mới. Production KHÔNG làm vậy: chờ IAM-005/Admin |
| Login `platform/...` ra challenge thay vì token | Đúng thiết kế IAM-004 cho `OPERATOR_OWNER` / `PLATFORM_ADMIN` / `PLATFORM_SUPPORT`; gọi tiếp `/auth/mfa/verify` |
| Refresh phiên cũ của owner/admin → 401 `AUTH_MFA_REQUIRED` | Phiên cấp trước IAM-004 (không có `mfa_verified_at`) bị thu hồi có chủ ý; login lại qua MFA |

---

## 12. Dọn dữ liệu nhạy cảm trong phiên PowerShell

```powershell
Remove-Variable enrollment, verified, backupChallenge, verifiedByBackup, replayChallenge, limitedChallenge -ErrorAction SilentlyContinue
Remove-Variable mandatoryPassword, loginBody, reauthPasswordBody -ErrorAction SilentlyContinue
```

Dừng API bằng Ctrl+C, rồi:

```powershell
docker compose stop
```

Không xóa credential MFA khỏi DB bằng SQL tay để "test lại enrollment" trên dữ liệu cần giữ. Dùng fixture/test database riêng; recovery/reset chính thức để IAM-005/Admin.

## 13. Triển khai production (Render) — làm TRƯỚC khi deploy code IAM-004

1. Sinh key: `openssl rand -base64 32` → đặt `MFA_ENCRYPTION_KEY` cho service `vexenhanh-api` trên Render (đã khai trong `render.yaml`, `sync: false`). Thiếu/sai key → API **từ chối khởi động** ở production. Lưu key vào secret manager; **không đổi** sau khi đã có người enroll.
2. `prisma migrate deploy` bằng owner (`MIGRATION_DATABASE_URL`), rồi chạy lại `db:app-role` để role app có quyền trên hai bảng MFA mới (như IAM-003-guide §7).
3. Deploy. Hệ quả có chủ ý ngay sau deploy:
   - Access token cũ của owner/admin/support (không có claim `mfa`) bị từ chối → 401.
   - Refresh phiên cũ của ba role đó → 401 `AUTH_MFA_REQUIRED`, cả family bị thu hồi.
   - Login lần đầu sau deploy = **enrollment**: ai có mật khẩu thì enroll được → các account privileged nên đăng nhập + enroll **ngay** sau deploy, không để trống.
4. Employee (Driver/TicketStaff/SupportStaff) và Passenger không bị ảnh hưởng.

## Lưu ý phạm vi

- IAM-003 docs đã merge qua PR #6; không tạo/sửa lại ở IAM-004.
- Optional MFA cho Employee, reset/recovery và UI QR/backup-code thuộc task sau.
- TASK-IAM-004 chỉ được đóng sau review + smoke + CI; Khanh đã xác nhận CI xanh ngày 21/09/2026. Việc đóng task không thay đổi trạng thái Approved của tài liệu SDLC.
