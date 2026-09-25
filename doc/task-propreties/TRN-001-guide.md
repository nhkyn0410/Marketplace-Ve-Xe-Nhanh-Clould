# TASK-TRN-001 — Guide kiểm chứng: Vehicle + SeatMap/Seat

> Mục tiêu: chứng minh Owner quản lý được đội xe và sơ đồ ghế của **chính tenant mình**, DB tự chặn dữ liệu sai (biển số trùng, ghế trùng, gắn chéo tenant) và không ai khác đọc/ghi được.
> Phạm vi/quyết định: `TRN-001-todo.md`. Checklist nghiệm thu: `TRN-001-verification-checklist.md`.
> **Hiện tại:** Q1–Q4 đã chốt 25/09/2026. Lệnh dưới đây chỉ là evidence khi thực sự chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q4 trong `TRN-001-todo.md` đã chốt 25/09/2026.
- [ ] `pnpm install` xong; nhánh `TASK-TRN-001` (chứa CAT-001).
- [ ] Postgres 16 + Redis 7 + Mongo 7 chạy ([RB-05](../runbook/RB-05-local-infra.md)). Nếu cổng 5432/6379/27017 đang bị checkout khác chiếm, dựng container riêng cổng khác giống job CI `db-integration`.
- [ ] `DATABASE_URL` = role app (không SUPERUSER/BYPASSRLS/owner); `MIGRATION_DATABASE_URL` = owner.
- [ ] Catalog có loại xe + tiện ích (`db:seed:catalog`, [RB-08](../runbook/RB-08-catalog-seed.md)).

## 1. Migrate và cấp quyền role app

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Kiểm bằng owner — 4 bảng phải `true` ở cả hai cột:

```sql
SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class
WHERE relname IN ('vehicles','seat_maps','seats','vehicle_amenities');
```

## 2. Test trước smoke

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Không chấp nhận integration test bị skip. Test tenant-RLS tự đỏ nếu `DATABASE_URL` là superuser/BYPASSRLS.

## 3. Smoke HTTP (Owner)

Cần access token của Owner đã qua MFA (luồng login IAM-004). Không lưu token vào file.

```powershell
$api = "http://localhost:3001/v1"
$h = @{ Authorization = "Bearer <OWNER_ACCESS_TOKEN>" }
$types = Invoke-RestMethod "$api/catalog/vehicle-types"
$amenities = Invoke-RestMethod "$api/catalog/amenities"
```

### 3A. SeatMap

```powershell
$seatMap = @{
  name = "Giường nằm 2 tầng 34 chỗ"
  layout = @{ decks = @(@{ deck = 1; rows = 6; columns = 3 }, @{ deck = 2; rows = 6; columns = 3 }) }
  seats = @(
    @{ code = "A1"; deck = 1; row = 1; column = 1; type = "BED" },
    @{ code = "B1"; deck = 2; row = 1; column = 1; type = "BED" }
  )
} | ConvertTo-Json -Depth 5
$created = Invoke-RestMethod -Method Post "$api/operator/seat-maps" -Headers $h -ContentType "application/json" -Body $seatMap
$created.seatCount   # 2
```

Kỳ vọng lỗi (400, không ghi gì): trùng mã ghế; hai ghế cùng vị trí; ghế ở tầng/hàng/cột ngoài `layout`; không có ghế nào. Trùng tên SeatMap trong tenant → 409.

**Tùy chỉnh cho một xe (Q1):** `GET /operator/seat-maps/{id}` lấy mẫu → sửa `name` + ghế → `POST` thành SeatMap mới → `PUT` xe với `seatMapId` mới. Kiểm tra: sửa mẫu gốc sau đó không làm đổi ghế của bản sao.

### 3B. Vehicle

```powershell
$vehicle = @{
  plateNumber = "51b-123.45"
  vehicleTypeId = $types.items[0].id
  seatMapId = $created.id
  amenityIds = @($amenities.items[0].id)
  status = "ACTIVE"
  description = $null
} | ConvertTo-Json
Invoke-RestMethod -Method Post "$api/operator/vehicles" -Headers $h -ContentType "application/json" -Body $vehicle
```

Kỳ vọng: `201`, `plateNumber = "51B12345"`. Gửi lại với `51B 12345` → 409 `VEHICLE_PLATE_CONFLICT`. Loại xe/tiện ích đã `INACTIVE` hoặc id lạ → 422 `CATALOG_ITEM_UNAVAILABLE`. POST và PUT phải gửi **đủ 6 trường** (`seatMapId`/`description` gửi `null` nếu trống); thiếu trường → 400, không tự reset về mặc định.

### 3C. Tenant isolation

Với token Owner tenant B: `GET/PUT /operator/vehicles/{id của A}` → 404; `POST /operator/vehicles` với `seatMapId` của A → 404 `SEAT_MAP_NOT_FOUND`; list chỉ thấy xe của B. Token Employee (DRIVER) hoặc Platform → 403.

## 4. OpenAPI và client

```powershell
pnpm gen:api-client
```

Sinh client Dart theo [RB-04](../runbook/RB-04-api-client.md). `git status` chỉ đổi phần vehicle/seat-map.

## 5. Production rollout

Backup → `prisma:migrate:deploy` bằng owner → `db:app-role` → deploy API → smoke §3 bằng tài khoản Owner thử. Kiểm tra RLS lúc khởi động (`RLS_TABLES`) phải qua.

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence.
- Không tự promote tài liệu SDLC sang Approved.
- Unit test mock không phải bằng chứng RLS/FK; các mục đó phải chạy Postgres thật bằng role app.
