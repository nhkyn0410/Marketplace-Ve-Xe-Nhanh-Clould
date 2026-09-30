# TASK-TRN-003 — Todo: Trip + TripStop + TripSeat

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 — Trip + TripStop + TripSeat (sinh từ SeatMap): tạo chuyến lẻ theo route/ngày giờ/xe ở trạng thái `DRAFT`; chặn một xe chạy hai chuyến trùng giờ. Nguồn chi tiết: SRS `FR-OPS-06`, `UC-14` (bước 1–3, 6, 8; A1, A2), `UC-12 A3`, `BR-14`, §17.3–17.4 (trạng thái Trip / TripSeat); DB §5.2 nhóm Trip & Inventory + §7; API §7.3; Security §7; DOMAIN-MAP `trip/`; GLOSSARY `Trip`, `TripStop`, `TripSeat`.
> **Dependency:** TASK-TRN-001 (Vehicle/SeatMap) + TASK-TRN-002 (Route/RouteStop) — code đã có trên `develop` của repo này.
> **Mở khóa:** TASK-TRN-005 (Fare), TASK-TRN-006 (mở bán), TASK-EMP-001 (phân công theo chuyến), TASK-BTP-001 (giữ ghế theo TripSeat).
> **Cách dùng:** Guide chạy tay `TRN-003-guide.md`. Nghiệm thu `TRN-003-verification-checklist.md`.

## Trạng thái (30/09/2026) — 🔨 **ĐANG TRIỂN KHAI (BE xong, chờ review/CI + màn Operator OS)**

- ✅ Đối chiếu task row với SRS, DB, API, Security, DOMAIN-MAP, GLOSSARY và code TRN-001/002 (bàn giao ở `TRN-001-todo.md`, `TRN-002-todo.md`).
- ✅ Khanh duyệt Q1–Q6 ngày 30/09/2026 (Q1 đổi so với khuyến nghị — xem bảng).
- ✅ BE: migration `20260930100000_add_trip`, module `apps/api/src/trip/`, chặn UC-12 A3 ở `vehicle/`, OpenAPI + client TS/Dart, test.
- ⏳ Review `code-reviewer` + `security-auditor`, CI, màn Operator OS (M1: từ TRN-003 mỗi task làm cả BE lẫn màn).

---

## Phạm vi chuẩn

### Thuộc TRN-003

- Module `apps/api/src/trip/` (DOMAIN-MAP §2 `trip/`). TripSeat đặt trong `trip/` (giống Seat nằm trong `vehicle/`), không tách `trip-seat/`.
- 3 bảng Operator-owned `trips`, `trip_stops`, `trip_seats`: `operator_id` + ENABLE/FORCE RLS + FK ghép `(…, operator_id)`.
- API Owner `GET/POST /operator/trips`, `GET/PUT /operator/trips/{tripId}` — chỉ chuyến `DRAFT`.
- BR-14 / UC-14 A1: một xe không chạy hai chuyến chồng giờ — ràng buộc EXCLUDE ở DB.
- UC-12 A3 (bàn giao TRN-001): chặn `PUT` SeatMap và đổi SeatMap của xe khi đang được chuyến chưa kết thúc dùng.

### Không tự kéo vào task

- Mở bán / khoá / tạm dừng / huỷ, kiểm đủ điều kiện mở bán (BR-39), khoá ghế thủ công (`BLOCKED`), cửa sổ đón khách, thời điểm ngừng bán online (AS-20) → `TASK-TRN-006`.
- Giá vé → `TASK-TRN-005`. Tìm chuyến công khai → `TASK-TRN-004`. Lịch lặp → `TASK-TRN-007`.
- Sửa chuyến đã bán vé (lý do, audit, thông báo, đổi xe map ghế đã bán) → `TASK-TRN-008`.
- Employee xem/cập nhật chuyến được phân công → `TASK-EMP-001/002`. Admin giám sát chuyến → task Admin sau.
- Ràng buộc route ↔ loại xe theo quy định (Q3: Khanh cần tham khảo thêm) → mở lại khi có quy định cụ thể.

---

## Quyết định đã chốt ngày 30/09/2026

| ID | Điểm cần chốt | Quyết định |
| --- | --- | --- |
| Q1 | Thời gian quay đầu xe (BR-14) | ✅ Khanh: **không cần** — sau khi chuyến kết thúc, nhà xe tự sắp xếp chuyến mới. Xe bận trong `[departureAt, arrivalAt)`; chuyến sau được khởi hành **đúng lúc** chuyến trước đến. Lệch câu chữ SRS `BR-14` ("hoặc không đủ thời gian quay đầu") → cần Khanh xác nhận sửa SRS (BR-13 của tài xế có cùng khái niệm, quyết ở EMP-001). |
| Q2 | Cách chặn trùng xe | ✅ Theo khuyến nghị: ràng buộc `EXCLUDE USING gist` (extension `btree_gist`) trên `(vehicle_id, tsrange(departure_at, arrival_at, '[)'))`, bỏ qua chuyến `CANCELLED` và chuyến chưa gắn xe. Hai request đồng thời cũng chỉ một bên thành công. |
| Q3 | Xe bắt buộc khi tạo chuyến? | ✅ Tạm theo khuyến nghị: tuỳ chọn khi `DRAFT`, bắt buộc lúc mở bán (TRN-006). Khanh sẽ tham khảo quy định tuyến / loại xe để thêm ràng buộc sau. |
| Q4 | Cửa sổ đón + thời điểm ngừng bán online | ✅ Để TRN-006. TRN-003 chỉ có giờ dự kiến từng điểm. |
| Q5 | Quyền | ✅ Thêm `trip:manage`, chỉ `OPERATOR_OWNER` phạm vi tenant. |
| Q6 | Enum trạng thái | ✅ Tạo đủ `TripStatus` (10 giá trị) và `TripSeatStatus` (5 giá trị) theo GLOSSARY; TRN-003 chỉ ghi `DRAFT` / `AVAILABLE`. |

### Chi tiết hiện thực (AI đặt, Khanh phản đối thì sửa)

- **Body** `{ routeId, vehicleId | null, departureAt, arrivalAt, stopTimes | null, note }`; POST và PUT gửi đủ trường (không `.default()`), trạng thái không có trong body.
- **Giờ**: ISO 8601 có múi giờ (`+07:00` hoặc `Z`), lưu UTC (`TIMESTAMP(3)` như các bảng khác). Giờ đi ở tương lai, giờ đến sau giờ đi, chuyến ≤ 7 ngày (chặn gõ nhầm năm làm xe "bận" cả năm).
- **TripStop** chép từ RouteStop lúc tạo và mỗi lần PUT (chuyến còn nháp). Giờ từng điểm: gửi `stopTimes` thì dùng nguyên (đủ số điểm, đầu/cuối trùng giờ đi/đến, không giảm); không gửi thì chia [giờ đi, giờ đến] theo tỉ lệ thời gian chặng đã lưu của route — giữ đúng giờ Operator chọn, không gọi Goong lại (ADR-027).
- **TripSeat** là bản chụp `seats` của SeatMap lúc gắn xe (mã, tầng, hàng, cột, loại), tham chiếu `seat_code` (DB §7). Chỉ sinh lại khi đổi xe; giữ xe thì trạng thái ghế giữ nguyên.
- **Route/xe đang gắn được giữ** dù đã `INACTIVE`/`MAINTENANCE` (mẫu TRN-001/002); route/xe **mới chọn** phải hợp lệ: route `ACTIVE` của tenant; xe `ACTIVE` của tenant và có SeatMap (UC-14 A2).
- **Khoá**: sinh ghế khoá dòng xe + SeatMap `FOR SHARE`; `PUT` SeatMap / đổi SeatMap của xe ghi (khoá) trước rồi mới kiểm "đang dùng" → bên nào đến sau thấy bên kia, không có chuyến lấy ghế từ bố cục sửa dở.
- **"Chuyến chưa kết thúc"** (UC-12 A3) = chưa `COMPLETED`/`CANCELLED` và chưa qua giờ đến dự kiến — chuyến nháp quá hạn không khoá SeatMap mãi.
- **List** sắp theo `(departureAt, id)`; cursor = id chuyến cuối trang (không lặp/sót khi trùng giờ đi); cursor lạ/khác tenant → trang rỗng.
- **Mã lỗi**: `TRIP_NOT_FOUND` 404, `TRIP_NOT_EDITABLE` 409, `VEHICLE_SCHEDULE_CONFLICT` 409, `ROUTE_UNAVAILABLE` 422, `VEHICLE_UNAVAILABLE` 422, `TRIP_STOP_TIMES_INVALID` 422, `SEAT_MAP_IN_USE` 409 (vehicle). Route/xe "không có" / "tenant khác" / "ngừng dùng" chung một mã để không lộ dữ liệu tenant khác.

---

## Todo (ID = thứ tự thực hiện)

### ✅ #1 — [TRN-003.1] Chốt Q1–Q6 và khóa contract

**Success:** Khanh duyệt 30/09/2026; API §7.3, DB §7, Security §7, file 11 cập nhật (giữ trạng thái Review).

### ✅ #2 — [TRN-003.2] Schema + migration + RLS

Model Prisma + migration `20260930100000_add_trip` (FK ghép, CHECK, EXCLUDE, RLS); thêm 3 bảng vào `RLS_TABLES`.

**Success:** — ✅ 30/09/2026: 12 migration áp tuần tự trên PostgreSQL 16 trống; `db:app-role` pass; `prisma migrate diff` DB ↔ schema rỗng; `migrate status` up to date.

### ✅ #3 — [TRN-003.3] Module `trip/` + API

DTO Zod, `TripService`, `TripController` mỏng, quyền `trip:manage`, đăng ký `AppModule` + `OpenApiModule`.

### ✅ #4 — [TRN-003.4] Chặn UC-12 A3 ở `vehicle/`

`SeatMapService.update` + `VehicleService.update` (đổi `seatMapId`) → 409 `SEAT_MAP_IN_USE`.

### ✅ #5 — [TRN-003.5] OpenAPI + client TS/Dart

**Success:** — ✅ OpenAPI chỉ thêm 4 operation + 3 schema trip, 2 operation cũ đổi mô tả 409; không mất gì. Dart client sinh bằng openapi-generator **v7.25.0** (jar Maven Central, SHA1 khớp) + `build_runner`; `dart analyze` 0 error, `dart test` 474/474; phép so của CI Contract chạy tay → khớp.

### ✅ #6 — [TRN-003.6] Test bắt buộc + regression

**Success:** — ✅ 30/09/2026, `REQUIRE_DB_TESTS=1`, role app, PostgreSQL 16 + Redis 7 + MongoDB 7 local: **67/67 file, 777/777 test, 0 skip**. `pnpm turbo run lint typecheck test build --force` **35/35**. Mutation: bỏ EXCLUDE → 4 test đỏ; tắt RLS `trip_seats` → 2 test đỏ; bỏ FK ghép route → 1 test đỏ; khôi phục → xanh.

### 🔶 #7 — [TRN-003.7] Review, CI và đóng phần BE

`code-reviewer` + `security-auditor` (chạm tenant/RLS); AI journal; CI xanh (Khanh xác nhận).

### ⏳ #8 — [TRN-003.8] Màn Operator OS

Danh sách chuyến + form chuyến (06 UI "Trip calendar/list, trip form") dùng client TS đã sinh. Làm sau khi IAM-006 phần web (đăng nhập Operator OS) sẵn sàng theo M1.

---

## Bàn giao cho TRN-005 / TRN-006 / TRN-008 / EMP-001

- TRN-006: kiểm lại **mọi** điểm của chuyến còn `ACTIVE` (route được giữ điểm đã ngừng — TRN-002), xe bắt buộc, SeatMap có ghế, fare, giờ; chuyển trạng thái ra khỏi `DRAFT` phải dùng điều kiện `status` trong `updateMany` như TRN-003 để không đua với `PUT`.
- TRN-006 thêm cửa sổ đón + ngừng bán online (AS-20) vào `trip_stops` / `trips`.
- TRN-008: `PUT` hiện **chỉ** cho `DRAFT`; sửa chuyến đã mở bán/đã bán là luồng riêng (lý do, audit, thông báo, map ghế đã bán theo `seat_code`).
- EMP-001: BR-13 (tài xế) cùng khái niệm "quay đầu" — cần Khanh chốt có áp dụng khoảng đệm không (Q1 đã bỏ cho xe).
- Chuyến huỷ không giữ xe (điều kiện của EXCLUDE) — TRN-006 huỷ chuyến là xe rảnh ngay.

---

## Rủi ro phải test chủ động

- Query quên lọc `operatorId` → lộ chuyến tenant khác (RLS phải chặn).
- Gắn route/xe của tenant khác bằng id đoán được (IDOR qua body).
- Hai request đồng thời gắn cùng xe trùng giờ → bán trùng xe.
- Sửa SeatMap trong lúc tạo chuyến → ghế chuyến lấy từ bố cục sửa dở.
- `PUT` chuyến đã mở bán (TRN-006) → đổi ngầm chuyến đang bán.
- Controller mới thiếu trong `OpenApiModule` → client sinh thiếu mà CI vẫn xanh.
