# TASK-CAT-001 — Guide kiểm chứng: Catalog nền cho Transport

> Mục tiêu: chứng minh catalog chuẩn đọc được công khai, chỉ lộ item `ACTIVE`, DB tự chặn dữ liệu địa giới sai và không route tenant/Guest nào ghi được catalog.
> Phạm vi/quyết định: `CAT-001-todo.md`. Checklist nghiệm thu: `CAT-001-verification-checklist.md`.
> **Hiện tại:** Q1–Q4 đã chốt 25/09/2026. Lệnh dưới đây chỉ là evidence khi thực sự chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q4 trong `CAT-001-todo.md` đã chốt 25/09/2026.
- [ ] File `apps/api/prisma/seed-data/administrative-units.csv` đã có (§2A) — chỉ cần cho §2 và smoke §5.
- [ ] `pnpm install` xong (checkout mới chưa có `node_modules`).
- [ ] Docker Desktop đang chạy; `docker compose up -d postgres mongo redis` báo `healthy` ([RB-05](../runbook/RB-05-local-infra.md)).
- [ ] `apps/api/.env`: `DATABASE_URL` = role app (không SUPERUSER/BYPASSRLS/owner); `MIGRATION_DATABASE_URL` = owner. Không in secret ra terminal.

## 1. Migrate và cấp quyền role app

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Chạy `db:app-role` hai lần phải idempotent. Kiểm tra bằng owner (psql/pgAdmin):

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN ('provinces','wards','stop_points_catalog','vehicle_types','amenities');
```

Kỳ vọng: 5 dòng, cả hai cột `true` (nếu Q3 giữ khuyến nghị).

## 2. Seed catalog

### 2A. Chuẩn bị file danh mục chính thức (Khanh làm tay)

1. Tải danh mục đơn vị hành chính cấp tỉnh + cấp xã hiện hành từ nguồn chính thức (Cục Thống kê — danh mục theo QĐ 19/2025/QĐ-TTg).
2. Trong Excel: đặt định dạng **Text** cho cột mã trước khi sửa (giữ số 0 đầu: `01`, `00004`); giữ 4 cột và đổi tiêu đề thành `province_code,province_name,ward_code,ward_name`.
3. *Save As → CSV UTF-8 (Comma delimited)* vào `apps/api/prisma/seed-data/administrative-units.csv`.

Script từ chối file nếu: không phải UTF-8 (lưu bằng "CSV (Comma delimited)" thường), sai tiêu đề hoặc dùng dấu `;`, mã tỉnh không đủ 2 chữ số, mã xã không đủ 5 chữ số, một mã tỉnh mang hai tên, trùng mã xã. Khi từ chối, không dòng nào được ghi. Tên được chuẩn hoá Unicode NFC.

### 2B. Chạy seed

```powershell
pnpm --filter @vexenhanh/api run db:seed:catalog
pnpm --filter @vexenhanh/api run db:seed:catalog -- --with-samples
```

Kỳ vọng:

- Dòng đầu in host/DB đích (không in user/mật khẩu) và có/không bến xe mẫu — kiểm tra đúng môi trường trước khi đọc tiếp.
- Lần 1 in số tỉnh/xã đọc từ file và số dòng tạo mới; chạy lại báo tạo mới 0 dòng.
- Có loại xe `SEATER`, `SLEEPER`, `LIMOUSINE`, `CABIN` + 6 tiện ích cơ bản.
- Bến xe mẫu **chỉ** có khi thêm `--with-samples` (dev). Bến mẫu nào không tìm thấy phường theo tên thì bị bỏ qua kèm cảnh báo — không phải lỗi.
- Sửa tay `name` một tỉnh rồi chạy lại seed: tên đã sửa **không** bị ghi đè (create-only).
- `$env:NODE_ENV = "production"` rồi chạy kèm `--with-samples`: bị từ chối. Xóa biến sau khi thử: `Remove-Item Env:NODE_ENV`.

## 3. Chạy test trước smoke

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Không chấp nhận integration test bị skip vì thiếu DB. Test RLS phải chạy bằng role app — test tự đỏ nếu `DATABASE_URL` là superuser/BYPASSRLS.

## 4. Khởi động API

```powershell
pnpm --filter @vexenhanh/api run start
$api = "http://localhost:3001/v1"
```

## 5. Smoke API đọc (không cần token)

```powershell
$provinces = Invoke-RestMethod "$api/catalog/provinces"
$provinces.items.Count            # bằng số tỉnh trong file chính thức (34 sau sắp xếp 2025)
$hcm = $provinces.items | Where-Object code -eq "79"   # TP.HCM

Invoke-RestMethod "$api/catalog/wards?provinceId=$($hcm.id)"
Invoke-RestMethod "$api/catalog/stop-points?provinceId=$($hcm.id)&limit=2"
Invoke-RestMethod "$api/catalog/vehicle-types"
Invoke-RestMethod "$api/catalog/amenities"
```

Kỳ vọng:

- `200`, shape đúng contract trong todo; không có `status`, `createdAt`, `updatedAt`.
- Stop points `limit=2` trả `nextCursor`; gọi tiếp với `cursor=<nextCursor>` không lặp item; trang cuối `nextCursor = null`.
- Không cần header `Authorization`; gửi kèm token hợp lệ cũng trả cùng kết quả.

### 5A. Query sai → 400 RFC 7807

```powershell
Invoke-WebRequest "$api/catalog/wards" -SkipHttpErrorCheck            # thiếu provinceId
Invoke-WebRequest "$api/catalog/wards?provinceId=abc" -SkipHttpErrorCheck
Invoke-WebRequest "$api/catalog/stop-points?limit=101" -SkipHttpErrorCheck
Invoke-WebRequest "$api/catalog/stop-points?type=AIRPORT" -SkipHttpErrorCheck
```

Kỳ vọng: `400`, `Content-Type: application/problem+json`.

### 5B. Item `INACTIVE` không lộ

Bằng owner, trong một transaction có `SELECT set_config('app.scope', 'system', true);`, đặt `status = 'INACTIVE'` cho một bến xe mẫu. Gọi lại `stop-points`: bến đó biến mất, kể cả khi đi qua các trang bằng cursor. Trả lại `ACTIVE` sau khi thử.

## 6. Invariant DB (chạy bằng role app)

Các ca này nằm trong test tích hợp; chạy tay bằng psql nếu cần xem tận mắt:

- Phường của tỉnh A gắn vào stop point của tỉnh B → lỗi FK ghép.
- `latitude = 91` hoặc `longitude = 181` → lỗi CHECK.
- Trùng `code` tỉnh/phường/loại xe/tiện ích → lỗi unique.
- Không set scope hoặc scope `tenant`: `SELECT` đọc được; `INSERT/UPDATE/DELETE` bị RLS từ chối hoặc ảnh hưởng 0 dòng.
- Scope `platform`/`system`: ghi được (đường cho ADM-001 và seed).
- `DELETE` tỉnh còn phường tham chiếu → lỗi FK RESTRICT.

## 7. OpenAPI và client

```powershell
pnpm gen:api-client
```

Sau đó sinh client Dart theo [RB-04](../runbook/RB-04-api-client.md). Kiểm tra `openapi.json` có 5 path `GET /v1/catalog/*`, không có `security`, có schema query/response. `git status` chỉ đổi phần catalog.

## 8. Production rollout

Thứ tự: backup → `prisma:migrate:deploy` bằng owner → `db:app-role` → `db:seed:catalog` bằng owner với `NODE_ENV=production` (chỉ reference, file CSV đã commit) → deploy API → smoke §5 trên production. Kiểm tra RLS lúc khởi động (`RLS_TABLES`) phải qua; nếu từ chối khởi động vì thiếu FORCE RLS thì migration chưa áp, không được tắt kiểm tra.

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence test/smoke tương ứng.
- Không tự promote tài liệu SDLC sang Approved; chỉ cập nhật revision/status task theo gate.
- Unit test mock không phải bằng chứng RLS hay FK; các mục đó phải chạy Postgres thật bằng role app.
