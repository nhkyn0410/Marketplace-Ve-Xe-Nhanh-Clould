# TASK-IAM-005 — Guide kiểm chứng: provisioning account + session theo thiết bị

> Mục tiêu: chứng minh closed enrollment không có self-register backdoor, mọi mutation đúng quyền/tenant và việc thu hồi thiết bị giết đúng session family.
> Phạm vi/quyết định: `IAM-005-todo.md`. Checklist nghiệm thu: `IAM-005-verification-checklist.md`.
> **Hiện tại:** Q1–Q8 đã chốt; hardening ngày 23/09/2026 đang kiểm chứng. Không coi lệnh dự kiến là evidence đã pass cho tới khi thực sự chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q8 trong `IAM-005-todo.md` đã được chốt ngày 22/09/2026.
- [ ] Docker/Postgres 16, Redis 7, MongoDB 7 đang chạy.
- [ ] `DATABASE_URL` dùng role app không SUPERUSER/BYPASSRLS/owner; `MIGRATION_DATABASE_URL` dùng owner.
- [ ] `NODE_EXTRA_CA_CERTS` được đặt nếu Supabase pooler cần CA; không dùng `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- [ ] Env MFA/RS256/Redis/Mongo/Resend hợp lệ; không in secret ra terminal/log.
- [ ] Dùng account smoke riêng, không thao tác dữ liệu production thật.

## 1. Migrate và cấp quyền role app

**Trước khi áp migration `20260922010000_add_account_lifecycle` trên DB cũ:** chạy truy vấn read-only preflight Owner slug bằng migration role. _Đã chạy trên Supabase 24/09/2026 (0 Owner, 0 lệch); file `apps/api/prisma/preflight-iam005-owner-slug.sql` đã xóa 25/09/2026 vì mọi DB có dữ liệu đã qua migration này. Cần cho DB cũ khác thì lấy lại từ commit `81ff903` và chạy `SELECT set_config('app.scope', 'system', false);` trước truy vấn — `operator_accounts` bật FORCE RLS nên thiếu dòng này có thể trả 0 row sai._ Nếu có row, xét từng Owner: migration cũ chuẩn hóa slug và có thể mở lại đường login của account vốn `ACTIVE` nhưng trước đó đăng nhập không được vì slug lệch. Khóa có lý do khi cần; không sửa hàng loạt và không suy diễn `LOCKED` cũ là chờ gửi mail. Nếu migration đó đã chạy, không còn đủ thông tin trong DB hiện tại để truy vết slug cũ: đối chiếu backup/log trước migration và xử lý từng account. Migration corrective `20260923010000_add_credential_delivery_state` giữ nguyên checksum migration cũ.

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Kiểm tra migration bằng owner, nhưng mọi test runtime phải dùng role app. Chạy `db:app-role` hai lần phải idempotent.

Kỳ vọng theo Q đã chốt:

- account có fields force-change/expiry/contact, `credential_delivery_pending`, `auth_epoch` và `version` theo todo;
- namespace `(operator_id, username)` không thể trùng xuyên Owner/Employee;
- cặp `operator_id`/`operator_slug` không thể drift;
- các bảng tenant/session vẫn `ENABLE + FORCE RLS` và app role không bypass.

## 2. Chạy test trước smoke

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Sau khi đổi API contract:

```powershell
pnpm gen:api-client
pnpm turbo run typecheck lint test build
```

Không chấp nhận integration test bị skip vì thiếu DB/Redis/Mongo.

## 3. Khởi động API an toàn

```powershell
pnpm --filter @vexenhanh/api run build
pnpm --filter @vexenhanh/api run start
```

Đặt biến smoke cục bộ; không commit credential:

```powershell
$api = "http://localhost:3001/v1"
$adminToken = "<PLATFORM_ADMIN_ACCESS_TOKEN>"
$ownerToken = "<OPERATOR_OWNER_ACCESS_TOKEN>"
$employeeId = "<EMPLOYEE_ID>"
```

## 4. Provision Operator + Owner — service boundary

IAM-005 không giả lập KYC endpoint nếu Q2 theo khuyến nghị. Chứng minh bằng integration test của `AccountProvisioningService`:

1. PlatformAdmin có recent re-auth gọi primitive với slug/Owner/contact email hợp lệ.
2. OperatorProfile + Owner account được tạo trong cùng transaction.
3. Temp password chỉ đi qua `EmailNotifier`; response/audit/log/DB không chứa plaintext.
4. PlatformSupport, Owner và Employee bị 403/permission denied.
5. Hai request cùng slug/username: đúng một thành công, request còn lại 409; không có row nửa vời.

Nếu gửi email Owner đầu tiên thất bại, profile và Owner vẫn tồn tại với `credentialDeliveryPending=true`; login bị chặn nhưng `status` kỷ luật không bị sửa. OPR-001 gọi primitive `retryOwnerDelivery(actor, authz, {operatorSlug, ownerUsername, reason})` sau recent re-auth; primitive cấp mật khẩu tạm **mới**, tăng `authEpoch`, gửi lại rồi chỉ xóa cờ pending khi delivery thành công. Không gọi `provisionOperatorOwner` lần nữa vì slug đã được giữ. Owner `LOCKED` vì lý do kỷ luật không được retry tự mở khóa.

Nếu Q2 đổi sang endpoint admin công khai, bổ sung smoke HTTP đúng contract đã chốt trước khi tick.

## 5. First login phải đổi temp password

Luồng dự kiến theo Q3/Q4:

1. Login bằng temp password hợp lệ.
2. Response chỉ có `passwordChangeRequired=true`, one-time `passwordChangeToken`, TTL 300 giây; **không có** access/refresh token, `otpAuthUri` hay backup code.
3. Gọi `POST /auth/password/change-required` với mật khẩu mới đạt policy.
4. Replay/fake/expired token trả cùng lỗi generic 401.
5. Cấp challenge rồi reset/retry credential trước khi consume: challenge cũ phải trả 401; đổi trạng thái sang `LOCKED` trước lệnh ghi cũng phải thất bại.
6. Login lại bằng mật khẩu cũ thất bại; mật khẩu mới đi tiếp tới MFA (Owner) hoặc token flow (Employee).

Ví dụ shape sau khi Q4 được duyệt:

```powershell
$body = @{
  passwordChangeToken = "<ONE_TIME_TOKEN>"
  newPassword = "<NEW_STRONG_PASSWORD>"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "$api/auth/password/change-required" `
  -ContentType "application/json" -Body $body
```

Không lưu token/password trong file history hoặc chụp log CI.

## 6. Owner tạo và quản lý Employee

### 6A. Tạo

```powershell
$employee = @{
  username = "driver-smoke"
  contactEmail = "<SMOKE_EMAIL>"
  role = "DRIVER"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "$api/operator/employees" `
  -Headers @{ Authorization = "Bearer $ownerToken" } `
  -ContentType "application/json" -Body $employee
```

Kỳ vọng: `201`, không có temp password trong response; role ngoài `DRIVER|TICKET_STAFF|SUPPORT_STAFF` → 400; duplicate cùng tenant hoặc trùng Owner username → 409.

Nếu delivery lỗi, HTTP 503 chứa `employeeId` trong `detail`. Account vẫn tồn tại và có cờ pending, nên **không gửi lại POST create** (sẽ 409); dùng ID này hoặc `GET /operator/employees` để xác định account, sau đó gọi endpoint password-reset hiện có để cấp lại mật khẩu tạm. Recovery vẫn đòi recent re-auth, reason, quota và cooldown.

### 6B. List và tenant isolation

```powershell
Invoke-RestMethod -Method Get -Uri "$api/operator/employees" `
  -Headers @{ Authorization = "Bearer $ownerToken" }
```

Token tenant A chỉ thấy Employee tenant A. Dùng id tenant B ở PATCH/reset phải nhận 404 generic; kiểm thêm bằng integration test query cố tình bỏ filter để RLS vẫn chỉ trả tenant A.

### 6C. Đổi role/trạng thái và reset password

Mỗi mutation nhạy cảm cần recent re-auth + `reason`. Kỳ vọng:

- mọi chuyển trạng thái (lock/disable/unlock), role-change và reset password tăng `auth_epoch` rồi revoke mọi family của Employee;
- đổi username cũng tăng `auth_epoch`; đổi `contactEmail` tăng epoch, revoke phiên và bật `credentialDeliveryPending`, nên Owner phải password-reset tới địa chỉ mới trước khi Employee đăng nhập lại;
- access JWT cũ bị chặn ngay qua Redis; refresh token cũ bị 401;
- unlock không tự làm temp password/session cũ sống lại và vẫn rotate epoch để chặn session legacy;
- audit không chứa hash/password/token.
- reset Employee đang `LOCKED` vì kỷ luật không được đổi `status` thành `ACTIVE`; `PATCH status=ACTIVE` khi còn pending cũng không cấp quyền login cho tới khi giao mật khẩu thành công.

Email mật khẩu tạm có giới hạn riêng: 30/24h toàn hệ thống, 10/24h mỗi tenant, 5/24h mỗi actor, và một lần reset/giờ cho cùng Employee. Vượt ngưỡng trả `429 ACCOUNT_TEMP_EMAIL_RATE_LIMITED`; Redis không khả dụng thì 503 và không mutate credential. Các giới hạn này dành chỗ trong quota Resend dùng chung cho OTP Passenger, không thay limiter OTP.

## 7. Danh sách phiên theo device family

```powershell
$sessions = Invoke-RestMethod -Method Get -Uri "$api/auth/sessions" `
  -Headers @{ Authorization = "Bearer $ownerToken" }
$sessions | ConvertTo-Json -Depth 5
```

Kỳ vọng:

- cursor `limit` mặc định 20/tối đa 100; một item/family dù refresh đã rotate nhiều lần;
- đúng một item có `current=true`;
- có thời điểm, device label và IP đã mask; `sessionId` là public family id; không có row `sid`, raw user-agent, refresh hash/token;
- chỉ session của chính subject; v1 không tự revoke do vượt số thiết bị.

Thu hồi một thiết bị:

```powershell
$sessionId = "<SESSION_RESOURCE_ID>"
Invoke-WebRequest -Method Delete -Uri "$api/auth/sessions/$sessionId" `
  -Headers @{ Authorization = "Bearer $ownerToken" }
```

Kỳ vọng `204`; gọi lại vẫn `204`. Token của family đó chết ngay; device khác vẫn dùng được. Id của subject khác/không tồn tại trả cùng `404 AUTH_SESSION_NOT_FOUND`.

## 8. Race/fail-closed bắt buộc

- Hai create Employee cùng username song song → một `201`, một `409`.
- Owner và Employee cùng username song song → DB vẫn chỉ cho một namespace thắng.
- Hai request consume cùng password-change token → đúng một thành công.
- Reset password đồng thời login/refresh → sau khi reset hoàn tất không family cũ nào sống. Test `account-lifecycle.int.spec.ts` cố ý để Redis cache `active`, tăng `auth_epoch` trên PostgreSQL và chứng minh guard vẫn từ chối session cũ.
- Redis dừng trong revoke → `503`, không báo thành công giả; sau recovery có thể retry idempotent.
- Mongo/audit failure xử lý đúng policy Q8 đã chốt; không nuốt lỗi trái với contract.

## 9. OpenAPI và client

Kiểm tra spec có đủ route, `security`, requestBody, response/error RFC 7807; sau đó regen TS/Dart client. CI contract phải đỏ nếu route/requestBody biến mất.

## 10. Dọn dữ liệu smoke

- Revoke toàn bộ session/account smoke trước khi xóa dữ liệu.
- Chỉ dọn các id được tạo riêng trong phiên này; không dùng wildcard/glob trên DB production.
- Xóa biến chứa token/password khỏi PowerShell:

```powershell
Remove-Variable adminToken, ownerToken, body, employee -ErrorAction SilentlyContinue
```

## 11. Production rollout

Thứ tự dự kiến (đã thực hiện trên production 24/09/2026): backup → **preflight Owner slug** → xử lý từng mismatch → migrate bằng owner → `db:app-role` → deploy API/worker → smoke role app → bật UI/client. Migration IAM-005 giữ khóa bảng account qua backfill/constraint validation; đo số row và chạy trong maintenance window đủ dài, không chạy khi có giao dịch dài. Không chạy app bằng owner để “vượt” lỗi RLS. Temp credential chỉ gửi qua adapter production đã cấu hình; console notifier phải từ chối ở production. Mỗi request Operator/Employee thêm một transaction đọc account để kiểm `authEpoch`/trạng thái; chấp nhận cho v1 nhưng theo dõi latency và tải DB.

## Lưu ý phạm vi

- Không tick nghiệm thu kỹ thuật nếu chưa có evidence test/smoke tương ứng, dù Q1–Q8 đã chốt.
- Không tự promote tài liệu SDLC sang Approved/Done; chỉ cập nhật revision/status task theo gate.
- Không coi unit test mock là bằng chứng tenant-RLS, Redis revoke hoặc race; các mục đó phải chạy hạ tầng thật bằng role app.
