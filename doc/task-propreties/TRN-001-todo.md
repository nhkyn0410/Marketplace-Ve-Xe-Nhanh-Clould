# TASK-TRN-001 — Todo: Vehicle + SeatMap/Seat

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 — Vehicle (biển số, `VehicleType`, tiện ích, trạng thái vận hành) + SeatMap/Seat (layout `JSONB`): `/operator/vehicles`, `/operator/seat-maps`; unique `(operator_id, plate_number)` + RLS. Nguồn chi tiết: SRS `FR-OPS-01..03`, `UC-12` (A1–A5), §9 quan hệ "một `Vehicle` có một `SeatMap`; `SeatMap` gồm nhiều `Seat`", `BR-14/20/39` (phần dùng sau), `AC-18`; DB §5.2 nhóm Transport + §7; API §7.3; Security §6–7 (`Vehicle/SeatMap`: Operator quản lý trong tenant, Employee xem nếu được phân công, Admin giám sát); UI §5 "Vehicle list, vehicle form, seat map editor", `UX-OQ-03`; DOMAIN-MAP `vehicle/`.
> **Dependency:** TASK-CAT-001 (catalog `vehicle_types`, `amenities`) — code đã commit `54dd0d9` trên nhánh `TASK-CAT-001`; nhánh `TASK-TRN-001` tạo từ đó.
> **Mở khóa:** `TASK-TRN-003` (Trip chọn xe, sinh TripSeat từ Seat).
> **Cách dùng:** Guide chạy tay `TRN-001-guide.md`. Nghiệm thu `TRN-001-verification-checklist.md`.

## Trạng thái (25/09/2026) — 🔨 **ĐANG TRIỂN KHAI**

- ✅ Đã đối chiếu task row với SRS, HLD/LLD, DB, API, Security, UI, DOMAIN-MAP, GLOSSARY và code IAM-003/005 + CAT-001.
- ✅ Khanh chốt Q1–Q4 ngày 25/09/2026: Q2–Q4 theo khuyến nghị; Q1 = **"mẫu và có thể tùy chỉnh"** (xem cách hiện thực ở bảng dưới).

---

## Phạm vi chuẩn

### Thuộc TRN-001

- Module `apps/api/src/vehicle/` (DOMAIN-MAP §2 — `vehicle/` chứa Vehicle, SeatMap, Seat).
- Bảng Operator-owned có `operator_id` + **ENABLE/FORCE RLS** + lọc `operatorId` tường minh ở service (DB-PRIN-01).
- Vehicle: biển số (unique trong tenant), loại xe (catalog), tiện ích (catalog), SeatMap, trạng thái vận hành, mô tả.
- SeatMap: tên, bố cục tầng/hàng/cột (`JSONB`), danh sách Seat (mã, tầng, vị trí, loại ghế/giường); tổng số ghế khớp bố cục (UC-12 bước 4–5, A2).
- API Operator OS theo API §7.3 + Zod/OpenAPI/RFC 7807 + client TS/Dart; test tenant-RLS/IDOR bắt buộc.

### Không tự kéo vào task

- Chặn sửa Vehicle/SeatMap đã gắn chuyến/vé (UC-12 A3), đổi xe có vé (BR-20) → TRN-003 (thêm kiểm "đang được chuyến dùng") và TRN-008.
- Xung đột lịch xe (BR-14) → TRN-003.
- Employee xem xe được phân công → TASK-EMP-001 (cần assignment). Admin giám sát xe toàn hệ thống → task Admin sau khi có endpoint.
- VehicleType riêng của Operator ("trong phạm vi Platform cho phép", UC-12 bước 3): Platform chưa có policy cho phép → v1 chỉ chọn từ catalog.
- Xóa cứng Vehicle/SeatMap: API §7.3 chỉ có GET/POST/PUT → ngừng dùng bằng trạng thái.

---

## Quyết định đã chốt ngày 25/09/2026

| ID | Điểm cần chốt | Quyết định |
| --- | --- | --- |
| Q1 | **SeatMap ↔ Vehicle + mô hình bố cục** (FR-OPS-03 "cho phương tiện hoặc loại phương tiện"; API có resource `/operator/seat-maps` riêng; `UX-OQ-03`) | ✅ Khanh: **"mẫu và có thể tùy chỉnh"**. Hiện thực: nhà xe **tự cấu hình** SeatMap (không có mẫu cứng của Platform); SeatMap là **mẫu dùng chung** cho nhiều xe; muốn một xe khác mẫu thì **tạo bản sao** (lấy chi tiết mẫu → sửa → `POST` SeatMap mới) rồi gắn bản sao cho xe đó. Sửa mẫu gốc **không** ảnh hưởng bản sao. Không làm bảng "ghi đè từng xe" (phức tạp, TRN-003 phải gộp) — mở lại nếu Khanh cần bản tùy chỉnh vẫn nhận thay đổi của mẫu. Chi tiết mô hình: SeatMap là mẫu của nhà xe, dùng chung cho nhiều xe cùng kiểu: `vehicles.seat_map_id` (được để trống lúc tạo xe — UC-14 A2 "xe chưa có seat map thì không mở bán"). Mỗi xe vẫn đúng một SeatMap (SRS §9). Bố cục `layout` `JSONB` = danh sách tầng `{ deck, rows, columns }` (1–2 tầng, ≤ 30 hàng, ≤ 10 cột); bảng `seats` (mã ghế, tầng, hàng, cột, loại `SEAT`/`BED`) — TRN-003 sinh TripSeat từ đây. Server tự tính `seatCount`; từ chối trùng mã, trùng vị trí, ghế ngoài lưới. Tên SeatMap unique trong tenant. |
| Q2 | **Trạng thái vận hành + tiện ích** | ✅ `VehicleStatus` = `ACTIVE` (đang chạy), `MAINTENANCE` (bảo dưỡng), `INACTIVE` (ngừng dùng); không xóa cứng; TRN-003 chỉ cho chọn xe `ACTIVE`. Tiện ích lưu bảng nối **`vehicle_amenities`** (mới — DB §5.2 chưa liệt kê; cập nhật DB doc) có `operator_id` + RLS + FK RESTRICT tới `amenities`. Loại xe/tiện ích phải đang `ACTIVE` lúc gán (FK chấp nhận cả INACTIVE — lưu ý của security-auditor CAT-001); item bị vô hiệu hóa sau đó không làm hỏng xe cũ. |
| Q3 | **API + quyền** (API §7.3 ghi `GET/POST/PUT`) | ✅ 8 route: `GET /operator/vehicles` (cursor 20/max 100, lọc `status`), `GET /operator/vehicles/{vehicleId}`, `POST /operator/vehicles`, `PUT /operator/vehicles/{vehicleId}`; tương tự `/operator/seat-maps` (list không kèm ghế, chi tiết kèm ghế). `PUT` thay toàn bộ. Mọi route dùng quyền `vehicle:manage` (chỉ Owner); **không** dùng `vehicle:read` vì grant `assigned` của Employee chưa có dữ liệu phân công để lọc → sẽ lộ cả đội xe. Khác tenant / không tồn tại → cùng `404`. Chưa đòi lý do/re-auth/audit vì chưa có chuyến dùng xe (UC-12 bước 7 áp dụng từ TRN-003/008). |
| Q4 | **Phạm vi FE** (task row Owner BE/FE) | ✅ **Chỉ BE** ở TRN-001: Operator OS chưa có đăng nhập + API client (FND-010 mới làm khung layout). Màn hình Vehicle list/form + seat map editor làm khi Operator OS có auth — giống IAM-005 hoãn UI. Client TS/Dart sinh sẵn để FE dùng. |

### Giả định (không cần chốt riêng — Khanh phản đối thì sửa)

- **A1** — Biển số chuẩn hóa trước khi lưu/so trùng: chữ hoa, bỏ khoảng trắng, `.` và `-` (`51B-123.45` → `51B12345`); hợp lệ khi khớp `^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$`. Unique theo `(operator_id, plate_number)` đúng DB §7 — nhà xe khác có cùng biển số vẫn tạo được (không để lộ biển số tồn tại ở tenant khác). Trùng trong tenant → `409 VEHICLE_PLATE_CONFLICT`.
- **A2** — Mã ghế chữ hoa + số, 1–8 ký tự (`A1`, `B12`, `T2-01` không hợp lệ vì có `-`). Loại ghế `SEAT`/`BED` (UC-12 "loại ghế / giường").
- **A3** — Sửa SeatMap bằng `PUT` thay toàn bộ ghế (xóa + tạo lại trong một transaction). Hợp lệ vì chưa có TripSeat; TRN-003 phải chặn khi SeatMap đang được chuyến dùng.
- **A4** — Không có optimistic lock (`version`): hai tab cùng sửa thì bản ghi sau thắng. Dữ liệu của một Owner, chưa ảnh hưởng vé.
- **A5** — Response theo mẫu IAM/CAT: `{ items, nextCursor }` cho list; cursor theo `id` dạng `id > cursor` như CAT-001.
- **A6** — Mã lỗi mới: `VEHICLE_NOT_FOUND`, `VEHICLE_PLATE_CONFLICT`, `SEAT_MAP_NOT_FOUND`, `SEAT_MAP_NAME_CONFLICT`, `CATALOG_ITEM_UNAVAILABLE` (loại xe/tiện ích không tồn tại hoặc INACTIVE, 422); lỗi bố cục ghế → `400` qua Zod.

---

## Contract dự kiến (sau khi Q1–Q3 được duyệt)

| Method | Path | Body / Query | Response |
| --- | --- | --- | --- |
| `GET` | `/operator/vehicles` | `status?`, `cursor?`, `limit` 1..100 = 20 | `200 { items: Vehicle[], nextCursor }` |
| `GET` | `/operator/vehicles/{vehicleId}` | — | `200 Vehicle` / `404` |
| `POST` | `/operator/vehicles` | `{ plateNumber, vehicleTypeId, seatMapId?, amenityIds[], status, description? }` | `201 Vehicle` / `409` / `422` |
| `PUT` | `/operator/vehicles/{vehicleId}` | như POST | `200 Vehicle` / `404` / `409` / `422` |
| `GET` | `/operator/seat-maps` | `cursor?`, `limit` | `200 { items: SeatMapSummary[], nextCursor }` |
| `GET` | `/operator/seat-maps/{seatMapId}` | — | `200 SeatMap` (kèm `seats`) / `404` |
| `POST` | `/operator/seat-maps` | `{ name, layout: { decks[] }, seats[] }` | `201 SeatMap` / `409` |
| `PUT` | `/operator/seat-maps/{seatMapId}` | như POST | `200 SeatMap` / `404` / `409` |

`Vehicle = { id, plateNumber, vehicleTypeId, seatMapId, amenityIds, status, description, createdAt, updatedAt }`. `SeatMap = { id, name, layout, seatCount, seats: [{ code, deck, row, column, type }], createdAt, updatedAt }`. Mọi route: Bearer, `401/403` như `@Authorize`.

---

## Data design dự kiến (sau khi Q1–Q2 được duyệt)

- Enum `VehicleStatus { ACTIVE, MAINTENANCE, INACTIVE }`, `SeatType { SEAT, BED }`.
- `seat_maps`: `id`, `operator_id` → `operator_profiles` RESTRICT, `name`, `layout` JSONB, `seat_count`, timestamps; unique `(operator_id, name)`, unique `(id, operator_id)` làm đích FK ghép.
- `seats`: `id`, `operator_id`, `seat_map_id`, `code`, `deck`, `row`, `column`, `type`; FK ghép `(seat_map_id, operator_id)` → `seat_maps(id, operator_id)` **RESTRICT** (không CASCADE: cascade chạy quyền owner, bỏ qua RLS — service tự xóa ghế cũ trong cùng transaction khi `PUT`); unique `(seat_map_id, code)`, unique `(seat_map_id, deck, row, column)`; CHECK `deck ≥ 1`, `row ≥ 1`, `column ≥ 1`.
- `vehicles`: `id`, `operator_id`, `plate_number`, `vehicle_type_id` → `vehicle_types` RESTRICT, `seat_map_id?` + FK ghép `(seat_map_id, operator_id)` → `seat_maps(id, operator_id)` (chặn gắn SeatMap của tenant khác), `status`, `description?`, timestamps; unique `(operator_id, plate_number)`, unique `(id, operator_id)`, index `(operator_id, status)`.
- `vehicle_amenities`: PK `(vehicle_id, amenity_id)`, `operator_id`; FK ghép `(vehicle_id, operator_id)` → `vehicles`; FK `amenity_id` → `amenities` RESTRICT.
- Cả 4 bảng: `ENABLE + FORCE RLS`, policy `tenant_isolation` = `app_rls_allows(operator_id)` cho USING + WITH CHECK (mẫu `employee_accounts`); thêm vào `RLS_TABLES`.

---

## Todo (ID = thứ tự thực hiện)

### ✅ #1 — [TRN-001.1] Chốt Q1–Q4 và khóa contract

Khanh duyệt; cập nhật API §7.3 (route chi tiết) + DB §5.2 (`vehicle_amenities`) + revision history; không đổi trạng thái Approved.

**Success:** đạt 25/09/2026 — không còn quyết định API/schema/phạm vi ngầm.

### ✅ #2 — [TRN-001.2] Schema + migration + RLS

Model Prisma + migration SQL (FK ghép, CHECK, RLS); thêm 4 bảng vào `RLS_TABLES`; `db:app-role` idempotent.

**Success:** DB chặn biển số trùng trong tenant, gắn SeatMap/tiện ích khác tenant, ghế trùng mã/vị trí; tenant A không đọc/ghi được dữ liệu tenant B kể cả khi query quên lọc. — ✅ 25/09/2026: `20260925020000_add_vehicle` áp trên PostgreSQL 16 trống (9/9 migration), `db:app-role` pass; `vehicle.int.spec.ts` chứng minh bằng role app. Mutation (tắt RLS `vehicles`, bỏ unique biển số, bỏ FK ghép SeatMap) làm đúng 4 test đỏ.

### ✅ #3 — [TRN-001.3] SeatMap API

Zod DTO (bố cục + ghế, kiểm trong lưới/trùng), `SeatMapService` (create/update thay ghế trong transaction, list/detail), controller mỏng.

**Success:** bố cục sai → 400 không ghi gì; `seatCount` = số ghế; cross-tenant → 404; trùng tên → 409. — ✅ unit 12 ca bố cục sai + test DB (PUT lỗi giữa chừng giữ ghế cũ; bản sao không đổi khi sửa mẫu gốc).

### ✅ #4 — [TRN-001.4] Vehicle API

Zod DTO + chuẩn hóa biển số, `VehicleService` (kiểm loại xe/tiện ích `ACTIVE`, SeatMap cùng tenant), controller mỏng.

**Success:** trùng biển số trong tenant → 409, khác tenant thì được; loại xe/tiện ích INACTIVE → 422; SeatMap tenant khác → 404; employee/platform → 403. — ✅ HTTP (guard chain thật: Owner được, không token 401, 3 role Employee + PlatformAdmin 403 cho cả 8 route) + test DB. Xe cũ giữ loại xe/tiện ích đã INACTIVE vẫn sửa được, không chọn mới item INACTIVE.

### ✅ #5 — [TRN-001.5] OpenAPI + client TS/Dart

`@ApiBody/@ApiParam/@ApiQuery` tường minh; `openapi.spec.ts` chặn mất route/requestBody; sinh lại client.

**Success:** OpenAPI 3.1 + hai client không drift. — ✅ So sánh ngữ nghĩa với bản commit: chỉ thêm 4 path + 6 schema, phần còn lại trùng khít. Dart (v7.25.0 + build_runner): `dart test` 250/250, `dart analyze` 0 error / 13 warning (4 mới = import thừa của 2 file api mới, cùng mẫu generator).

### ✅ #6 — [TRN-001.6] Test bắt buộc + regression

Unit (DTO, chuẩn hóa biển số, kiểm bố cục), HTTP (RBAC/400/404), tích hợp Postgres thật bằng role app (RLS/IDOR/FK ghép/unique/transaction), regression toàn bộ.

**Success:** `REQUIRE_DB_TESTS=1` pass, 0 skip; mutation tắt RLS làm test đỏ. — ✅ 25/09/2026 (sau khi sửa review): role app + PostgreSQL 16 + Redis 7 + Mongo 7 (container riêng cổng 55432/56379/57017): 55/55 file, 560/560 test, 0 skip. `pnpm turbo run typecheck lint build` 26/26. Test PUT đồng thời: code cũ đỏ 2/3 lần, code đã sửa xanh 6/6 lần.

### 🔶 #7 — [TRN-001.7] Review, CI và đóng task

`code-reviewer` + `security-auditor` (chạm tenant/RLS); lint/typecheck/test/build; AI journal; task row `Done` chỉ sau khi Khanh xác nhận CI.

**Success:** không finding blocking/high; CI xanh. — ✅ Review 25/09/2026: cả hai 0 blocking/high; các medium đã sửa. ⏳ Chờ commit/CI khi Khanh yêu cầu.

#### Finding review và xử lý (25/09/2026)

| Nguồn | Mức | Finding | Xử lý |
| --- | --- | --- | --- |
| cả hai | Medium/Low | Hai `PUT` xe đồng thời: tiện ích bị trộn hai danh sách, hoặc báo nhầm 409 biển số | ✅ Ghi (khoá) dòng xe trước rồi mới xoá/tạo tiện ích; test đồng thời (code cũ đỏ 2/3, code mới xanh 6/6) |
| code-reviewer | Medium | `PUT` dùng mặc định của `POST`: bỏ trường → xe về `ACTIVE`, mất SeatMap, mất tiện ích | ✅ Bỏ `.default()`: POST/PUT phải gửi đủ 6 trường, thiếu → 400 |
| code-reviewer | Low | OpenAPI công bố regex dạng đã chuẩn hoá → client sinh từ spec chặn `51B-123.45`, `a1` | ✅ `transform` + `pipe`: spec chỉ còn `maxLength` |
| code-reviewer | Low | DB không chặn biển số chưa chuẩn hoá | ✅ CHECK `vehicles_plate_number_normalized` |
| security | Low | `update` chỉ lọc `id` | ✅ `where: { id_operatorId }` |
| security | Low | `requireTenant` nhận cả grant `assigned` | ✅ Chỉ nhận `tenant` + test |
| security | Low | `...seat` dựa vào Zod strip | ✅ Map từng field; test mass assignment qua HTTP |
| cả hai | Low | Thiếu test FK ghép `seats`/`vehicle_amenities`, PUT trùng biển số, giữ tiện ích INACTIVE, RLS `vehicle_amenities` | ✅ Đã thêm |
| code-reviewer | Nit | Đọc lại SeatMap sau commit ở transaction thứ hai; mô tả rỗng lưu `""`; `.sort()` tầng theo chuỗi | ✅ Đọc trong cùng transaction; `""` → `null`; tầng phải liệt kê 1, 2 theo thứ tự |
| security | Low | Không quota/rate limit số xe, SeatMap | ⏸ Enrollment đóng + KYC; xử lý chung khi có task rate limit |
| security | Lưu ý | Biển số chỉ unique trong tenant (DB §7) → nhà xe B đăng ký được biển số thật của nhà xe A | ❓ Cần Khanh quyết có muốn unique toàn hệ thống không (đánh đổi: lộ "biển số đã tồn tại" giữa các nhà xe) |

#### Bàn giao cho TRN-003

- `PUT` SeatMap xoá + tạo lại ghế (id ghế đổi): TripSeat nên tham chiếu `seat_code` (DB §7 `trip_seats` unique `(trip_id, seat_code)`) và TRN-003 phải chặn `PUT` SeatMap / đổi SeatMap của xe khi đã có chuyến dùng (UC-12 A3).
- Chỉ chọn xe `ACTIVE`; kiểm SeatMap tồn tại (UC-14 A2).
- Cột `row`, `column` của `seats` là từ khoá SQL — SQL tay phải đặt trong nháy kép.

---

## Rủi ro phải test chủ động

- Query quên lọc `operatorId` → lộ đội xe tenant khác (RLS phải chặn).
- Gắn SeatMap/Vehicle của tenant khác bằng id đoán được (IDOR qua body, không chỉ qua path).
- Employee có `vehicle:read` (`assigned`) nhưng chưa có phân công → nếu dùng quyền này sẽ thấy cả đội xe.
- `PUT` SeatMap lỗi giữa chừng để lại SeatMap không có ghế hoặc `seatCount` lệch.
- Biển số nhập khác định dạng (`51b 123.45` vs `51B-12345`) lọt qua unique.
- Gán loại xe/tiện ích đã vô hiệu hóa.
- Controller mới thiếu trong `OpenApiModule` hoặc thiếu `@ApiBody` → client sinh thiếu payload mà CI vẫn xanh.
