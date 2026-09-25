# TASK-CAT-001 — Todo: Catalog nền cho Transport

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 (v0.11) — schema `provinces`, `wards`, `stop_points_catalog`, `vehicle_types`, `amenities` + seed tối thiểu + API đọc cho Operator/Marketplace. Nguồn chi tiết: DB §5.2 nhóm Catalog + `DB-MIG-04`; SRS `FR-ADM-04` (phần đọc), `AS-15`, `DP-08`, `DM-07`, `BR-38`, `UC-13` (tiền điều kiện), `UC-24` A1/A2; LLD §5.2 "Catalog & Search"; Security §6 "Public catalog"; DOMAIN-MAP §2 `catalog/`; GLOSSARY `VehicleType`, `StopPoint`.
> **Dependency:** TASK-FND-003 (Prisma + RLS nền) và TASK-IAM-003 (RBAC + TenantGuard + RLS) đều **Done**.
> **Mở khóa:** `TASK-TRN-001` (Vehicle chọn `VehicleType`/tiện ích) và `TASK-TRN-002` (Route gắn StopPoint chuẩn).
> **Cách dùng:** Guide chạy tay `CAT-001-guide.md`. Nghiệm thu `CAT-001-verification-checklist.md`.

## Trạng thái (25/09/2026) — 🔨 **ĐANG TRIỂN KHAI**

- ✅ Đã đối chiếu task row với SRS, LLD, DB, API, Security, DOMAIN-MAP, GLOSSARY và code nền FND-003/IAM-003 (`app_rls_allows`, `RLS_TABLES`, `@Authorize`, OpenAPI contract test).
- ✅ Tạo nhánh `TASK-CAT-001` từ `develop`.
- ✅ Khanh chốt Q1–Q4 ngày 25/09/2026: Q1–Q3 theo khuyến nghị; **Q4 đổi** sang import danh mục hành chính từ file chính thức do Khanh cung cấp.
- ⏳ Chờ Khanh đặt file danh mục chính thức (định dạng ở Q4) để seed thật; code/test không phụ thuộc file này.

---

## Phạm vi chuẩn

### Thuộc CAT-001

- Module `apps/api/src/catalog/` (DOMAIN-MAP §2).
- 5 bảng Platform-owned, **không** `operator_id`: `provinces`, `wards`, `stop_points_catalog`, `vehicle_types`, `amenities` + migration + invariant DB.
- Trạng thái catalog item `ACTIVE`/`INACTIVE`: không xóa cứng (UC-24 A1). API công khai chỉ trả item `ACTIVE`.
- API **chỉ đọc** cho Guest/Passenger/Operator (Marketplace search + Operator OS cấu hình xe/tuyến).
- Seed tối thiểu (`DB-MIG-04`, phần catalog) idempotent.
- Zod DTO + OpenAPI + sinh lại client TS + Dart; test unit + tích hợp Postgres thật bằng role app.

### Không tự kéo vào task

- Admin CRUD catalog `/admin/catalog/*`, vô hiệu hóa có kiểm soát, duyệt StopPoint đề xuất → `TASK-ADM-001`.
- Operator đề xuất StopPoint + bảng `stop_points` riêng của Operator → `TASK-TRN-002`.
- Gán `VehicleType`/tiện ích cho Vehicle → `TASK-TRN-001`.
- `content_pages` (có trong nhóm Catalog của DB §5.2 nhưng **không** nằm trong task row).
- Seed first Platform account (`DB-MIG-04` phần còn lại) — đã có ở `prisma/seed.ts` từ IAM-001.
- Tìm kiếm không dấu, gợi ý theo khoảng cách (PostGIS), Goong geocoding → `TASK-TRN-002`/`TASK-TRN-004`.
- Redis cache cho catalog: ADR-015 không liệt kê catalog trong bảng TTL; dữ liệu nhỏ → chưa cache. Mở lại nếu đo được tải.

---

## Quyết định đã chốt ngày 25/09/2026

| ID | Điểm cần chốt | Quyết định |
| --- | --- | --- |
| Q1 | **Endpoint đọc** (API §7.5 chỉ có `/admin/catalog/*`) | ✅ 5 endpoint **công khai** (không token, giống `/trips/search`): `GET /v1/catalog/provinces`, `GET /v1/catalog/wards?provinceId=` (bắt buộc), `GET /v1/catalog/stop-points?provinceId=&wardId=&type=&cursor=&limit=` (cursor theo `id`, mặc định 20 / tối đa 100), `GET /v1/catalog/vehicle-types`, `GET /v1/catalog/amenities`. Chỉ trả item `ACTIVE`, chỉ field công khai. Provinces/wards/vehicle-types/amenities trả hết (ít dòng), không phân trang. Lý do công khai: Marketplace (Guest) cần danh sách tỉnh/bến để tìm chuyến (UC-02 bước 2, A2). Cập nhật API §7 + revision history, giữ Approved. |
| Q2 | **Schema & loại điểm** | ✅ Mỗi bảng: `id` uuid + `code` unique (mã chính thức cho tỉnh/xã; mã nội bộ cho loại xe/tiện ích) + `name` + `status` (`CatalogStatus`: `ACTIVE`/`INACTIVE`) + timestamps. `wards.province_id` FK RESTRICT. `stop_points_catalog`: `name`, `type`, `address`, `province_id`, `ward_id`, `latitude`/`longitude` (`double precision` + CHECK phạm vi), `description?`; **FK ghép `(ward_id, province_id)` → `wards(id, province_id)`** để DB chặn phường không thuộc tỉnh (UC-24 A2). Enum `StopPointType` = `BUS_STATION` (bến xe), `OFFICE` (văn phòng), `REST_STOP` (trạm dừng), `PICKUP_POINT` (điểm đón/trả dọc đường) — theo AS-15/DP-08. Chưa PostGIS (để task cần proximity bật). |
| Q3 | **Bảo vệ ghi ở DB** | ✅ Bảng catalog **ENABLE + FORCE RLS** theo đúng mẫu `operator_profiles`: `public_read` (SELECT cho mọi ngữ cảnh) + chỉ scope `platform`/`system` được INSERT/UPDATE/DELETE; thêm 5 bảng vào `RLS_TABLES` để kiểm tra lúc khởi động. Lý do: role app có quyền CRUD mọi bảng; không có policy thì một bug ở route tenant/Guest sửa được catalog toàn hệ thống. |
| Q4 | **Seed** | ✅ **Khanh cấp file danh mục chính thức** (tỉnh + xã/phường, nguồn Cục Thống kê / QĐ 19/2025/QĐ-TTg). Script riêng `db:seed:catalog`, **create-only** (không ghi đè sửa đổi của Admin sau này), chạy lại không nhân dòng. **(1) reference, mọi môi trường** — toàn bộ tỉnh + xã/phường từ file chính thức; loại xe (`SEATER`, `SLEEPER`, `LIMOUSINE`, `CABIN` theo GLOSSARY) + tiện ích cơ bản do AI soạn. **(2) dev-sample, opt-in `--with-samples`, từ chối production** — 6 bến xe lớn, tọa độ gần đúng; phường tra theo tên trong tỉnh, không khớp thì bỏ qua + cảnh báo (AI không đoán mã phường sau sắp xếp 2025). |

### Định dạng file danh mục (Q4)

- Đường dẫn: `apps/api/prisma/seed-data/administrative-units.csv`, **UTF-8**, dấu phẩy, có dòng tiêu đề.
- Tiêu đề đúng thứ tự: `province_code,province_name,ward_code,ward_name` — mỗi dòng một xã/phường; cột tỉnh lặp lại.
- Từ file Excel của Cục Thống kê: giữ 4 cột mã tỉnh, tên tỉnh, mã xã, tên xã → đổi tên tiêu đề như trên → *Save As → CSV UTF-8*. Giữ nguyên số 0 đầu mã (định dạng cột Text trước khi lưu).
- Script kiểm: đủ 4 cột, mã chỉ gồm chữ số, một mã tỉnh chỉ một tên, mã xã không trùng; sai thì dừng, không ghi gì.

### Giả định (không cần chốt riêng — Khanh phản đối thì sửa)

- **A1** — Một `CatalogService` + một `CatalogController` cho 5 luồng đọc. LLD liệt kê 5 service (`ProvinceService`…); tách khi ADM-001 thêm logic ghi theo từng entity (tránh 5 class một-hàm).
- **A2** — Route công khai **không** dùng `@Authorize` (decorator đòi token trước tiên); không thêm permission mới. Quyền `catalog:manage` để ADM-001 thêm.
- **A3** — Response theo mẫu IAM hiện có: `{ items }` / `{ items, nextCursor }`, không bọc `{ data, meta }`. Lỗi query → 400 RFC 7807 qua `ProblemDetailsFilter` sẵn có.
- **A4** — `provinceId`/`wardId` không tồn tại → `200 { items: [] }` (dữ liệu công khai, không cần chống dò). Thứ tự: tỉnh/xã/loại xe/tiện ích theo `code`; stop point theo `id` (cursor ổn định).
- **A5** — Chỉ đọc nên không ghi audit; audit thay đổi catalog (NFR-MAINT-05) thuộc ADM-001.

---

## Contract dự kiến (sau khi Q1 được duyệt)

| Method | Path | Query | Response 200 |
| --- | --- | --- | --- |
| `GET` | `/catalog/provinces` | — | `{ items: [{ id, code, name }] }` |
| `GET` | `/catalog/wards` | `provinceId` (uuid, bắt buộc) | `{ items: [{ id, code, name, provinceId }] }` |
| `GET` | `/catalog/stop-points` | `provinceId?`, `wardId?`, `type?`, `cursor?` (uuid), `limit` 1..100 = 20 | `{ items: [{ id, name, type, address, provinceId, wardId, latitude, longitude, description }], nextCursor }` |
| `GET` | `/catalog/vehicle-types` | — | `{ items: [{ id, code, name, description }] }` |
| `GET` | `/catalog/amenities` | — | `{ items: [{ id, code, name }] }` |

Lỗi: `400` query sai (uuid/enum/limit). Không có 401/403 (công khai). Không trả `status`, `createdAt`, `updatedAt`.

---

## Data design dự kiến (sau khi Q2–Q3 được duyệt)

- Enum `CatalogStatus { ACTIVE, INACTIVE }`, `StopPointType { BUS_STATION, OFFICE, REST_STOP, PICKUP_POINT }`.
- `provinces`: `id`, `code` unique, `name`, `status`, `created_at`, `updated_at`.
- `wards`: như trên + `province_id` FK RESTRICT, index `province_id`, unique `(id, province_id)` làm đích FK ghép.
- `stop_points_catalog`: `id`, `name`, `type`, `address`, `province_id`, `ward_id`, `latitude`, `longitude`, `description?`, `status`, timestamps; FK `province_id` + FK ghép `(ward_id, province_id)`; CHECK `latitude BETWEEN -90 AND 90`, `longitude BETWEEN -180 AND 180`; index `(province_id, status)`, `ward_id`.
- `vehicle_types`, `amenities`: `id`, `code` unique, `name`, `description?` (chỉ vehicle type), `status`, timestamps.
- Mọi FK `ON DELETE RESTRICT ON UPDATE RESTRICT` (không cascade — cascade chạy quyền owner, bỏ qua RLS).
- RLS theo Q3; không `operator_id` (DB §5.2).

---

## Todo (ID = thứ tự thực hiện)

### ✅ #1 — [CAT-001.1] Chốt Q1–Q4 và khóa contract

Khanh duyệt Q1–Q4; cập nhật API §7 (endpoint đọc) + revision history theo `doc/AGENT.md`, không đổi trạng thái Approved.

**Success:** đạt 25/09/2026 — không còn quyết định API/schema/RLS/seed ngầm.

### ✅ #2 — [CAT-001.2] Schema + migration + RLS

Model Prisma + migration SQL (FK ghép, CHECK, RLS/policy); thêm bảng vào `RLS_TABLES`; `db:app-role` chạy lại vẫn idempotent.

**Success:** migration chạy trên DB trống và DB đã có 7 migration cũ; DB từ chối phường khác tỉnh, tọa độ ngoài phạm vi, trùng `code`; role app ở scope tenant/không scope **không** ghi được catalog nhưng đọc được. — ✅ 25/09/2026: `20260925010000_add_catalog` áp trên PostgreSQL 16 trống (8/8 migration), `db:app-role` chạy 2 lần idempotent; `catalog.int.spec.ts` chứng minh các invariant bằng role app. Mutation test (tắt RLS `provinces` + bỏ CHECK latitude) làm test đỏ đúng chỗ.

### 🔶 #3 — [CAT-001.3] Seed catalog

`prisma/catalog-seed.ts` (đọc + kiểm file CSV chính thức, loại xe, tiện ích, bến mẫu); script `db:seed:catalog`; lớp dev-sample từ chối production.

**Success:** file sai định dạng → dừng, không ghi gì; chạy 2 lần số dòng không đổi; sửa tay một dòng rồi chạy lại không bị ghi đè; `NODE_ENV=production` chỉ seed lớp reference. — ✅ Code + test xong 25/09/2026 (unit parser 11 ca lỗi; tích hợp create-only/idempotent; smoke CLI bằng CSV fixture tạm trên DB test riêng: thiếu file/mất số 0 → dừng, production 0 bến mẫu, lần 2 tạo 0). ⏳ Còn chạy với file chính thức của Khanh.

### ✅ #4 — [CAT-001.4] Module `catalog/` + API đọc

Zod DTO, `CatalogService` (lọc `ACTIVE`, cursor), `CatalogController` mỏng, đăng ký `AppModule` + `OpenApiModule`.

**Success:** 5 route trả đúng shape; item `INACTIVE` không lộ; query sai → 400 problem+json; không cần token. — ✅ `catalog.http.spec.ts` (route thật + ZodValidationPipe + serializer + filter RFC 7807) và `catalog.int.spec.ts` (Postgres thật).

### ✅ #5 — [CAT-001.5] OpenAPI + client TS/Dart

Khai báo query/response tường minh; `openapi.spec.ts` kiểm 5 path GET và không có `security`; `pnpm gen:api-client` + Dart client.

**Success:** OpenAPI 3.1 + hai client không drift; CI contract xanh. — ✅ 25/09/2026: diff OpenAPI/TS chỉ thêm 5 path + 5 schema catalog; Dart client sinh bằng openapi-generator v7.25.0 + build_runner, `dart test` 181/181, `dart analyze` 0 error / 9 warning (7 cũ + 2 import thừa của `catalog_api.dart`, cùng mẫu generator). CI contract chờ chạy trên branch.

### ✅ #6 — [CAT-001.6] Test bắt buộc + regression

Unit (DTO, service, controller) + tích hợp Postgres thật bằng role app (invariant, RLS ghi/đọc, lọc ACTIVE, phân trang, seed idempotent); chạy lại toàn bộ test API.

**Success:** `REQUIRE_DB_TESTS=1` pass, không skip; regression IAM-001..005 xanh. — ✅ 25/09/2026 (sau khi sửa review): `REQUIRE_DB_TESTS=1` với role app + PostgreSQL 16 + Redis 7 + Mongo 7 (container riêng cổng 55432/56379/57017, giống job CI `db-integration`): 52/52 file, 490/490 test, 0 skip. `pnpm turbo run typecheck lint build` 26/26.

### 🔶 #7 — [CAT-001.7] Review, CI và đóng task

`code-reviewer` + `security-auditor` (chạm RLS); lint/typecheck/test/build; AI journal; chỉ đổi task row `Done` sau khi Khanh xác nhận CI xanh.

**Success:** không finding blocking/high; CI xanh; task row + PROJECT-STATE cập nhật đúng gate. — ✅ Review 25/09/2026: security-auditor 0 blocking/high; code-reviewer 0 blocking, 1 high (H1) đã sửa. ⏳ Chờ commit/CI khi Khanh yêu cầu + file danh mục chính thức.

#### Finding review và xử lý (25/09/2026)

| Nguồn | Mức | Finding | Xử lý |
| --- | --- | --- | --- |
| code-reviewer | High | CSV không phải UTF-8 được đọc thành U+FFFD, lọt kiểm tra, seed create-only không sửa lại được | ✅ Từ chối dòng có U+FFFD + test; guide/RB-08 ghi rõ |
| cả hai | Medium | Bến mẫu mặc định bật, chỉ chặn khi `NODE_ENV` đúng chuỗi `production` | ✅ Opt-in `--with-samples`; có cờ ở production (kể cả có khoảng trắng) → từ chối; CLI in host DB đích |
| security | Low | Tỉnh/phường cha INACTIVE nhưng con vẫn hiện | ✅ Lọc cha `ACTIVE` ở wards/stop-points + test DB thật |
| security | Low | Thiếu test policy cho vehicle_types/amenities | ✅ Test `pg_policies` cho cả 5 bảng |
| code-reviewer | Low/Nit | Dấu `;`, NFD/NFC, BOM ký tự ẩn trong source, chuỗi `"ACTIVE"` cứng | ✅ Thông báo nêu dấu phân cách; chuẩn hoá NFC; BOM kiểm bằng mã ký tự; dùng `CatalogStatus` |
| security | Medium | Endpoint công khai chưa rate limit / `Cache-Control` | ⏸ Giữ quyết định "chưa cache" (ngoài phạm vi); rate limit toàn cục cần thư viện mới → hỏi Khanh ở task riêng |
| security | Low | Scope `system` ghi được catalog (giống `operator_profiles`) | ⏸ Giữ nhất quán mẫu hiện có; siết chỉ `platform` cần Khanh quyết |
| security | Low | Seed ưu tiên owner thay vì role app | ⏸ Giữ giống `seed.ts`; đổi thì đổi cả hai |
| security / code-reviewer | Low/Nit | `id` TEXT không kiểm định dạng uuid; UUID viết hoa; `limit` sinh `num` ở Dart | ⏸ Nhất quán các bảng/controller IAM hiện có; id do Prisma sinh |
| security | Lưu ý | TRN-001/002 tham chiếu catalog phải RESTRICT + kiểm item `ACTIVE` ở app (FK chấp nhận INACTIVE) | → ghi cho TRN-001/TRN-002 |

---

## Rủi ro phải test chủ động

- Quên RLS/policy → route Guest hoặc tenant có bug ghi được catalog toàn hệ thống.
- Phường gắn nhầm tỉnh khác (UC-24 A2) nếu chỉ kiểm ở app.
- Item `INACTIVE` vẫn lộ qua API công khai hoặc qua cursor.
- Seed chạy lại ghi đè dữ liệu Admin đã sửa (sau ADM-001) hoặc nhân dòng.
- Dữ liệu mẫu (bến xe tọa độ gần đúng) lọt vào production.
- File CSV lưu bằng Excel mất số 0 đầu mã (`01` → `1`) hoặc sai mã hóa → script phải từ chối thay vì seed mã sai.
- Controller mới thiếu trong `OpenApiModule` → route biến mất khỏi client mà CI vẫn xanh (đã từng xảy ra với IAM).
- Endpoint công khai chưa có rate limit toàn cục; dữ liệu nhỏ, chỉ đọc — ghi nhận, xử lý chung khi có task rate-limit.
