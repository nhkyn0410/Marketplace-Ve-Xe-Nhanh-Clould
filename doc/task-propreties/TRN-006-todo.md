# TASK-TRN-006 — Todo: Vòng đời bán chuyến (chưa có vé) + khóa ghế thủ công

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 — Vòng đời bán **khi chưa có vé**: kiểm tra đủ điều kiện trước khi mở bán (route, xe/SeatMap, fare, điểm đón/trả, giờ) → mở / khóa / tạm dừng / hủy; khóa / mở ghế thủ công (`BLOCKED`) cho vé bán ngoài Platform. Nguồn chi tiết: SRS `FR-OPS-10`, `FR-OPS-13`, `UC-14` bước 6–12 + A2/A3/A6/A7, `BR-11`, `BR-12`, `BR-39`, `BR-42`, `AS-20`, `FR-ADM-06`, §17.3 (Trip), §17.4 (TripSeat), `RSK-05`, `RSK-07`; LLD §8 (Trip / Seat state), §9 (audit); Security §7 dòng Trip; UI §5 "open/lock sale"; DOMAIN-MAP `trip/`; GLOSSARY Trip status, Seat status.
> **Dependency:** TASK-TRN-005 (fare) — nhánh `TASK-TRN-006` tách từ nhánh `TASK-TRN-005` (chưa merge `develop`; thứ tự merge: TRN-003 → TRN-005 → TRN-006).
> **Mở khóa:** TASK-TRN-004 (search chỉ chuyến đang mở bán), TASK-TRN-007 (lịch lặp), TASK-BTP-001 (giữ ghế: chuyến mở bán + ghế không `BLOCKED`), TASK-TRN-008 (đổi chuyến đã bán vé).

## Trạng thái (30/09/2026) — 🔨 **ĐANG TRIỂN KHAI**

- ✅ Tạo nhánh `TASK-TRN-006`; đối chiếu SDLC. SDLC có danh sách trạng thái (§17.3/§17.4) và điều kiện mở bán (BR-39) nhưng **chưa có**: bảng chuyển trạng thái, "tạm dừng" khác "khóa" thế nào, nơi cấu hình thời điểm ngừng bán online / cửa sổ đón, endpoint, audit cho đổi trạng thái / khóa ghế.
- 📝 Q5: Khanh lưu ý "hệ thống quầy" chưa có trong tài liệu nào → ghi chú tạm ở Q5 (30/09/2026). Các ý khác của Q5 và Q1–Q4, Q6–Q8 vẫn chờ chốt.
- ✅ Khanh chốt **Q1–Q8 theo khuyến nghị** (30/09/2026). **Đồng bộ tài liệu trước khi code**: SRS v1.31 (`FR-OPS-10`, `AS-20`, `BR-39`, `UC-14` bước 6, §17.3 `LOCKED`), GLOSSARY (Online sale cutoff, Sale lock), LLD v0.12 (§8 chuyển trạng thái, §9 audit), DB v0.18 (§7 `trips`, `trip_seats`), API v0.16 (§6.2 `reasons`, §7.3 hai route mới + body chuyến), Security v0.13, Test plan v0.9 (`TC-TRN-004..007`), file 11 v0.29 (**cửa sổ đón khách → EMP-002**).

---

## Phạm vi chuẩn

### Thuộc TRN-006

- Module `apps/api/src/trip/` (DOMAIN-MAP §2: Trip + TripSeat do `TripService` quản lý).
- Chuyển trạng thái chuyến do **Operator** thực hiện khi **chưa có vé**: mở bán, khóa / tạm dừng, mở lại, hủy (+ thu hồi về nháp nếu Q2 chốt).
- Kiểm đủ điều kiện mở bán (BR-39) — trả đủ lý do chưa đạt để màn Operator OS hiển thị.
- Thời điểm ngừng bán online (AS-20) — theo Q4.
- Khóa / mở ghế thủ công `AVAILABLE ↔ BLOCKED` (FR-OPS-13, BR-42).
- Zod DTO + OpenAPI + client TS/Dart; RLS + test tenant + test tranh chấp (hai request đồng thời); màn Operator OS (M1 — sau khi có đăng nhập web, như TRN-003/005).

### Không tự kéo vào task

- Đổi / hủy chuyến **đã có vé**: lý do + thông báo hành khách + hoàn tiền + map ghế đã bán (BR-10, BR-12, UC-14 A4/A5) → **TASK-TRN-008**.
- Giữ ghế Redis, trạng thái `HOLDING` / `BOOKED` (BTP-001/002); `SOLD_OUT` do bán hết (Q2).
- `BOARDING` / `DEPARTED` / `IN_PROGRESS` / `COMPLETED` / `INCIDENT` do Employee cập nhật (EMP-002).
- Admin khóa chuyến khi vi phạm (Security §7 "task Admin sau"); Admin cấu hình policy thời gian ngừng bán (FR-ADM-06) → ADM.
- Search công khai (TRN-004); lịch lặp (TRN-007); đồng bộ tự động với hệ thống bán vé quầy / đại lý — chưa có trong tài liệu nào, ghi chú tạm ở Q5.

---

## Quyết định (Khanh chốt Q1–Q8 theo khuyến nghị, 30/09/2026)

Toàn bộ phương án **khuyến nghị** bên dưới được chọn. Chi tiết hiện thực (khớp API v0.16):

- Mã lý do mở bán thêm `SEAT_PRICE_ZERO` (tách khỏi `SEAT_PRICE_MISSING` cho Owner biết sửa gì).
- `onlineSaleCutoffMinutes` **bắt buộc** trong body POST/PUT (quy ước TRN-003: PUT thay toàn bộ phải gửi đủ trường, tránh PUT thiếu trường âm thầm đưa về mặc định); DB mặc định 60 cho chuyến cũ, UI gợi ý 60.
- Chuyển sang chính trạng thái hiện tại → 409 như chuyển sai bảng.
- Lỗi cần nhiều lý do dùng member mở rộng RFC 7807 `reasons: string[]` (API §6.2).

### Câu hỏi đã chốt (giữ để tra cứu)

### Q1 — "Tạm dừng bán" và "khóa bán" có khác nhau không?

`FR-OPS-10` liệt kê 4 thao tác (mở bán / khóa bán / tạm dừng bán / hủy) nhưng SRS §17.3 chỉ có **một** trạng thái `LOCKED` ("khóa bán tạm thời — do vận hành, kiểm tra hoặc rủi ro").

| Phương án | Nội dung | Ưu / nhược |
| --- | --- | --- |
| **A — Gộp** *(khuyến nghị)* | "Tạm dừng" = "khóa" = `LOCKED`: ẩn khỏi search, không giữ ghế / đặt mới; Operator mở lại → `OPEN_FOR_SALE`. | Khớp §17.3, không thêm trạng thái. |
| B — Tách | Thêm `PAUSED` (Operator tự dừng) khác `LOCKED` (Admin khóa, Operator không tự mở). | Phải sửa SRS §17.3, GLOSSARY, DOMAIN-MAP, enum DB. Admin khóa chưa làm ở task này. |

Khi làm Admin khóa chuyến (task Admin), cần phân biệt "ai khóa" để Operator không tự mở lại khóa của Admin → thêm cột lúc đó, không làm trước.

### Q2 — Bảng chuyển trạng thái trong TRN-006

Đề xuất (Operator, chuyến **chưa có vé**):

| Từ | Sang | Điều kiện |
| --- | --- | --- |
| `DRAFT` | `OPEN_FOR_SALE` | Đủ điều kiện mở bán (Q3). |
| `OPEN_FOR_SALE` | `LOCKED` | Lý do tuỳ chọn. |
| `LOCKED` | `OPEN_FOR_SALE` | Kiểm lại đủ điều kiện (Q3) — giá / xe / điểm có thể đã đổi trong lúc khóa. |
| `DRAFT` / `OPEN_FOR_SALE` / `LOCKED` | `CANCELLED` | **Bắt buộc lý do** (§17.3). Terminal — không mở lại; xe rảnh ngay (ràng buộc EXCLUDE của TRN-003 đã bỏ qua chuyến hủy). |
| `OPEN_FOR_SALE` / `LOCKED` | `DRAFT` | **Thu hồi về nháp** để sửa bằng `PUT` (hiện `PUT` chỉ cho `DRAFT`). *(Khuyến nghị: cho phép khi chuyến chưa có ghế `BOOKED` / `CHECKED_IN` — hiện chưa có booking nên luôn được; BTP-001/002 bổ sung điều kiện "không còn giữ ghế".)* Nếu **không** cho: nhập sai sau khi mở bán thì phải hủy + tạo lại. |

- `SOLD_OUT`: **TRN-006 không tự đặt**. Khóa hết ghế trống bằng `BLOCKED` không làm chuyến thành `SOLD_OUT`; "hết ghế" do BTP-002 (bán hết) / TRN-004 (search lọc còn ghế) quyết.
- Chuyển trạng thái sai bảng → 409 `TRIP_STATUS_TRANSITION_INVALID`. Request đồng thời **xếp hàng** (khóa dòng + `updateMany` có điều kiện `status` như TRN-003): bên sau chạy trên trạng thái mới — hai lần mở bán → một 409; mở bán rồi hủy → cả hai chạy (sửa theo review 30/09/2026).

### Q3 — Điều kiện mở bán (BR-39)

Kiểm **tất cả**, trả 422 `TRIP_NOT_READY_FOR_SALE` kèm **danh sách lý do** (không dừng ở lý do đầu tiên) để Operator sửa một lần:

1. Nhà xe `ACTIVE`.
2. Tuyến `ACTIVE` + **mọi** điểm dừng của chuyến (catalog / điểm riêng) còn `ACTIVE` (bàn giao TRN-002: route được giữ điểm đã ngừng để Owner vẫn sửa).
3. Đã gắn xe, xe `ACTIVE`, chuyến có ghế (UC-14 A2).
4. Bảng giá tuyến `ACTIVE` và **mọi ghế** có giá (không ghế nào `price = null` — UC-14 A3). *Ghế giá 0:* khuyến nghị **chặn mở bán** (giá 0 gần như chắc chắn là nhập sai; cổng thanh toán có mức tối thiểu — BTP-002); nếu nhà xe cần ghế miễn phí thì mở lại sau.
5. Giờ: chưa qua thời điểm ngừng bán online (Q4) — tức giờ khởi hành còn đủ xa.
6. Điểm đón / trả tối thiểu = tuyến có điểm đầu + điểm cuối (luôn đúng từ TRN-002, không cần mã lỗi riêng).

Mã lý do dự kiến: `OPERATOR_INACTIVE`, `ROUTE_INACTIVE`, `STOP_POINT_INACTIVE`, `VEHICLE_MISSING`, `VEHICLE_INACTIVE`, `SEATS_MISSING`, `FARE_MISSING`, `SEAT_PRICE_MISSING`, `SALE_WINDOW_CLOSED`.

### Q4 — Thời điểm ngừng bán online + cửa sổ đón khách

SDLC nhắc ở 3 cấp: `AS-20` (theo nhà xe / tuyến), `UC-14` bước 6 (Operator cấu hình cho chuyến), `FR-ADM-06` (Admin cấu hình policy).

| Phương án | Nội dung | Ưu / nhược |
| --- | --- | --- |
| **A — Trên chuyến** *(khuyến nghị)* | Thêm `onlineSaleCutoffMinutes` (0–1440, **mặc định 60 phút**) vào body `POST/PUT /operator/trips`. Hết bán online khi `now ≥ giờ khởi hành − số phút`. **Không có job đổi trạng thái** — search / giữ ghế tự so giờ (UC-14 A7). | Đơn giản nhất, đúng UC-14 bước 6; lịch lặp (TRN-007) mang sẵn giá trị. Mức sàn của Admin (FR-ADM-06) thêm ở ADM sau. Đổi body chuyến của TRN-003 (client sinh lại). |
| B — Theo tuyến | Cột trên `routes`, chuyến dùng giá trị của tuyến. | Đúng chữ AS-20 nhưng đổi API tuyến (TRN-002); sửa tuyến làm đổi ngầm các chuyến đang bán. |
| C — Chờ Admin policy | Dùng một giá trị Platform (FR-ADM-06). | Phụ thuộc ADM (M4) → chặn TRN-006. |

**Cửa sổ đón khách** (UC-14 bước 6, BR-23, ticket `NO_SHOW` §17.7): khuyến nghị **không làm ở TRN-006** — mở bán không cần; giờ dự kiến từng điểm (`TripStop.plannedAt`) đã có. Cửa sổ đón dùng cho check-in / no-show → chuyển sang **EMP-002** (sửa file 11). Nếu Khanh muốn hiển thị cho khách ngay từ đầu → thêm `pickupWindowMinutes` trên chuyến như A.

### Q5 — Khóa ghế thủ công (FR-OPS-13, BR-42, UC-14 A6)

Đề xuất:
- Đổi theo lô, được cả hoặc không: danh sách `seatCodes` + trạng thái đích `BLOCKED` | `AVAILABLE` + ghi chú tuỳ chọn (vd "bán tại quầy").
- Chỉ `AVAILABLE ↔ BLOCKED`; ghế đang giữ / đã bán → 409 `TRIP_SEAT_NOT_AVAILABLE`. Mã ghế không thuộc chuyến → 422.
- Chuyến `DRAFT` / `OPEN_FOR_SALE` / `LOCKED` được khóa ghế (khóa trước khi mở bán = đã bán quầy trước); `CANCELLED` / đã khởi hành → 409.
- **Đổi xe khi chuyến có ghế khóa** (`PUT` nháp sinh lại ghế): giữ `BLOCKED` theo `seat_code` nếu sơ đồ mới có ghế cùng mã; ghế khóa không còn trong sơ đồ mới → 409 (không cho đổi xe âm thầm làm mất ghế đã bán quầy → overbooking).
- 📝 **Ghi chú tạm (Khanh, 30/09/2026) — "hệ thống quầy" chưa được đề cập ở tài liệu nào.** SDLC chỉ nêu **kênh** bán ngoài Platform (quầy vé, tổng đài, đại lý — SRS `AS-19`, `CO-18`, `DP-16`, `RSK-07`) và cách xử lý là khóa ghế thủ công hoặc đồng bộ tồn ghế (`FR-OPS-13`, `BR-42`); **không** có actor / hệ thống ngoài (§7.6) / adapter / API nào cho phần mềm bán vé tại quầy. TRN-006 chỉ làm **khóa ghế thủ công**; đồng bộ tự động với hệ thống quầy / đại lý để mở lại khi có yêu cầu + tài liệu riêng.
- Giữ ghế Redis chưa có (BTP-001): khi làm BTP-001, giữ ghế phải kiểm `BLOCKED` ở Postgres và khóa ghế phải kiểm không có hold — ghi bàn giao.

### Q6 — Lý do + audit

| Thao tác | Lý do | Audit (khuyến nghị) |
| --- | --- | --- |
| Hủy chuyến | **Bắt buộc** (1–500 ký tự) | Mongo `audit_event` **trong transaction** như fare (Mongo lỗi → không hủy) — thao tác hiếm, quan trọng, TRN-008 dùng lại lý do để báo khách. |
| Mở bán / khóa / mở lại / thu hồi nháp | Tuỳ chọn | Như trên. |
| Khóa / mở ghế | Tuỳ chọn | **Ghi sau commit, best-effort** — khóa ghế là để **chống overbooking**, không được để Mongo sập chặn việc khóa ghế bán quầy (RSK-07 vẫn có dấu vết khi Mongo sống). |

Thêm cột `trips.status_reason` (lý do lần đổi trạng thái gần nhất) để Operator OS / TRN-008 đọc mà không cần Mongo? Khuyến nghị **có** (một cột text, rẻ) — lịch sử đầy đủ vẫn ở audit. Ghi chú khóa ghế: không thêm cột, chỉ trong audit.

### Q7 — API + quyền

| Method | Path | Body | Kết quả |
| --- | --- | --- | --- |
| PUT | `/operator/trips/{tripId}/status` | `{ status: OPEN_FOR_SALE \| LOCKED \| CANCELLED \| DRAFT, reason \| null }` | 200 chi tiết chuyến; 409 `TRIP_STATUS_TRANSITION_INVALID`; 422 `TRIP_NOT_READY_FOR_SALE` + `reasons[]`; 400 thiếu lý do hủy |
| PUT | `/operator/trips/{tripId}/seats/status` | `{ seatCodes: string[1..100], status: BLOCKED \| AVAILABLE, note \| null }` | 200 chi tiết chuyến; 409 / 422 như Q5 |

- Quyền **dùng lại `trip:manage`** (Owner). Employee không khóa ghế ở v1 (SRS ma trận quyền: Employee "Không"). Chuyến khác tenant → 404.
- Danh sách chuyến (`GET /operator/trips`) đã lọc được theo `status` (TRN-003).

### Q8 — Sau khi mở bán, dữ liệu gốc đổi thì sao?

Bảng giá bị tắt / thiếu rule, xe chuyển `INACTIVE`, điểm hoặc tuyến ngừng dùng **trong lúc** chuyến đang mở bán.

| Phương án | Nội dung |
| --- | --- |
| **A — Chỉ kiểm lúc mở bán / mở lại** *(khuyến nghị)* | Không tự khóa chuyến, không chặn sửa ở module khác. Ghế `price = null` coi như **không bán được** (BTP-001/TRN-004 lọc). Operator OS cảnh báo (FE). |
| B — Chặn sửa gốc | Fare/xe/tuyến không được sửa khi có chuyến mở bán đang dùng → chạm TRN-001/002/005, dễ khóa cứng vận hành. |
| C — Tự khóa chuyến | Sửa gốc làm chuyến liên quan về `LOCKED` → phải quét chéo module, khó đoán. |

---

## Sub-task (sau khi chốt Q)

| # | Việc | Trạng thái |
| --- | --- | --- |
| 1 | Đồng bộ tài liệu theo Q (SRS, API §6.2/§7.3, DB §7, LLD §8/§9, Security §7, Test plan TC-TRN-004..007, GLOSSARY, file 11) | ✅ `951a761` |
| 2 | Migration (cột theo Q4/Q6) + Prisma | ✅ `20260930130000_trip_sale_lifecycle` (cutoff 0–1440 mặc định 60, `status_reason`, CHECK hủy có lý do); `migrate diff` rỗng |
| 3 | `TripService`: chuyển trạng thái + kiểm điều kiện + khóa ghế; DTO/controller/errors | ✅ `trip-sale.ts` (bảng chuyển + điều kiện, hàm thuần), `changeStatus`, `setSeatStatus`, `update` giữ ghế khóa; `reasons[]` RFC 7807 |
| 4 | Test: unit (bảng chuyển trạng thái, điều kiện), HTTP (RBAC, 400), int (RLS, đồng thời, audit lỗi, đổi xe giữ ghế khóa) | ✅ 74/74 file, **947/947** test sau sửa review (942 trước review), 0 skip (PG + Redis + Mongo thật); mutation 3/3 đỏ đúng chỗ. Sửa 3 test TRN-003 do đổi hành vi có chủ đích (giữ ghế khóa khi đổi xe; CHECK hủy có lý do; mock thiếu trường mới) |
| 5 | OpenAPI + client TS/Dart | ✅ TS: 2 route, 2 DTO, 2 trường chuyến, `reasons`; Dart 7.25.0 + `build_runner`: analyze 0 error, test 533/533 |
| 6 | Review (`code-reviewer` + `security-auditor`) + guide/checklist + commit/push | ✅ không blocking / high; Medium tiềm ẩn → bàn giao BTP / Admin; Low sửa + test (bảng dưới) |
| 7 | Màn Operator OS (mở/khóa bán, sơ đồ ghế khóa) — sau M1 | ⏸ |

---

## Kết quả review (30/09/2026)

| Nguồn | Mức | Finding | Xử lý |
| --- | --- | --- | --- |
| security M-1 + code-reviewer M1 | Medium (tiềm ẩn) | Khóa ghế / thu hồi nháp / hủy không thấy **giữ ghế Redis** (ADR-015) và booking đang ghi dở; khoá `FOR NO KEY UPDATE` dòng chuyến không chặn khoá FK ngầm `FOR KEY SHARE` của booking → có thể hủy chuyến có vé / khóa ghế đang thanh toán khi BTP có | ✅ Phần làm được ngay: thu hồi nháp / hủy **khoá toàn bộ ghế `FOR SHARE`** trước khi đếm vé (ghế đang được bán dở → chờ commit → thấy `BOOKED` → 409; test + mutation). ⏭ **Bàn giao BTP-001 (file 11 v0.30, LLD v0.13):** giữ / bán ghế phải khoá chuyến `FOR SHARE` + kiểm `OPEN_FOR_SALE` + còn giờ bán; **cần Khanh chốt** hold ghi thêm `HOLDING` vào Postgres (hybrid) hay thuần Redis + kiểm key ở các luồng trên. Tài liệu API/LLD sửa: "ghế đang giữ → 409" chỉ đúng với trạng thái trong Postgres |
| security M-2 | Medium (tiềm ẩn) | Khi có Admin khóa chuyến, Owner mở lại được chuyến Admin khóa (`LOCKED → OPEN_FOR_SALE`) | ⏭ Bàn giao task Admin (Security §7 "khóa khi vi phạm — task Admin sau"): thêm nguồn khóa (vd `locked_by_scope`) và `canTransition` từ chối Operator mở khóa của Platform. Chưa có đường Admin nên chưa khai thác được |
| code-reviewer M2 | Medium | Thiếu test nhánh tranh chấp "được cả lô hoặc không" | ✅ Test: ghế đang được transaction khác đổi `HOLDING` (chưa commit) → cả lô 409, ghế còn lại không đổi |
| security L-1 + code-reviewer L7 | Low | Audit ghi trước `findDetail`; request xếp hàng chờ khoá tiêu hạn transaction → audit xong ở Mongo sau khi Postgres hết hạn → dòng "ma" | ✅ Audit là lệnh cuối; `transactionDeadline` + option `deadline` (sửa chung ở TRN-005 `1f7ece3`, áp cho fare + trip) — không đủ thời gian thì từ chối trước khi ghi |
| security L-2 | Low | Kiểm điều kiện mở bán không khoá bảng giá / xe / tuyến → sửa đồng thời lọt giữa lúc kiểm và commit | ✅ `FOR SHARE` tuyến, bảng giá, xe trước khi kiểm (các luồng sửa đó không khoá `trips` → không vòng chờ) |
| security L-3 | Low | Giữ kết nối pool khi chờ khoá / Mongo; không giới hạn tần suất theo nhà xe | Giữ nguyên trong task: giới hạn tần suất `/operator/*` + cấu hình pool là việc chung (FND/OPS) — ghi đề xuất cho Khanh. Đã giảm tác động: audit trong transaction ≤ hạn còn lại, P2028 → 503 |
| code-reviewer L1 | Low | Mô tả "mở bán ↔ hủy đồng thời → một thắng" sai | ✅ Sửa comment + Q2 + Test plan v0.10 + API v0.17: request xếp hàng, bên sau chạy trên trạng thái mới |
| code-reviewer L2 | Low | `PUT` sinh lại ghế âm thầm xoá ghế `HOLDING` / `BOOKED` | ✅ Còn ghế khác `AVAILABLE` / `BLOCKED` → 409 `TRIP_SEAT_NOT_AVAILABLE` (test) |
| code-reviewer L3 | Low | `TRIP_BLOCKED_SEATS_MISSING` nói "xe mới" kể cả khi bỏ xe; không nêu mã ghế | ✅ Câu trung tính, `detail` nêu mã ghế (test) |
| code-reviewer L4 | Low | Thiếu test: xe có sơ đồ thiếu ghế khóa, điểm riêng ngừng dùng, lý do vào audit, P2028 → 503 | ✅ Thêm cả 4 (lý do kiểm qua spy `recordAuditEvent`). Nháp quá hạn sinh lại ghế dùng cùng nhánh code với đổi xe |
| code-reviewer L5 + security I-4 | Low | `setSeatStatus` P2028 → 500 | ✅ Bọc chung `withRetryable`: `AuditWriteError` → 503 lịch sử, P2028 → 503 `tripBusy` |
| code-reviewer L6 + security I-2 | Low | CHECK hủy chưa backfill; chấp nhận lý do rỗng / khoảng trắng | ✅ Migration (chưa merge, sửa tại chỗ): backfill chuyến hủy thiếu lý do trước khi thêm CHECK; CHECK `btrim(status_reason) <> ''` (test) |
| security I-3 + code-reviewer nit | Nit | `reasons` kiểu `string[]`; so `"ACTIVE"` bằng chuỗi; log lỗi audit mất stack | ✅ `SaleReadinessReason[]`; dùng enum `CatalogStatus` / `StopPointStatus`; log có cấu trúc `{ event: "audit.write_failed", … }` như IAM |
| code-reviewer nit | Nit | `isTransactionExpired` / `TripActor` lặp với fare; `findDetail` đọc hai lần khi mở bán | Giữ nguyên: gom về `common` là refactor ngoài phạm vi; đọc lại sau khi đổi trạng thái là cần (trạng thái mới) |
| security I-1, I-5, I-6, I-7 | Info | Path param không kiểm UUID; gửi Sentry khi audit ghế lỗi; ghim `writeConcern`; trigger chặn rời `CANCELLED` | Giữ nguyên: giống module khác (id sai → 404); log có cấu trúc đã vào Pino; `writeConcern` là cấu hình chung (Atlas mặc định `majority`); trigger `CANCELLED` để TRN-008 / Admin (các đường có thể đổi) |

## Bàn giao

- **BTP-001 / BTP-002:** như dòng M-1 — khoá chuyến `FOR SHARE`, kiểm `OPEN_FOR_SALE` + `isOnlineSaleOpen` (hàm có sẵn ở `trip-sale.ts`) + giá ghế khác `null` / > 0 trong cùng transaction; hold phải kiểm ghế `BLOCKED`; **câu hỏi hold Redis vs Postgres cần Khanh chốt**.
- **Task Admin khóa chuyến:** nguồn khóa để Owner không mở lại khóa của Platform (M-2).
- **TRN-008:** hủy / đổi chuyến đã có vé; cân nhắc trigger DB chặn rời `CANCELLED`.
- **EMP-002:** cửa sổ đón khách (Q4).

## Rủi ro phải test chủ động

- Mở bán chuyến thiếu giá một loại chỗ (vd có giá giường, thiếu giá ghế ngồi) → phải bị chặn.
- Hai request đồng thời: mở bán ↔ hủy; khóa ghế ↔ `PUT` đổi xe; khóa cùng một ghế hai lần.
- `PUT` nháp đổi xe làm mất ghế đã khóa (bán quầy) → overbooking.
- Hủy chuyến khi audit Mongo lỗi → không được hủy nửa chừng.
- Chuyến / ghế của tenant khác qua id đoán được (IDOR) → 404; RLS chặn kể cả query quên lọc.
- Chuyến quá thời điểm ngừng bán vẫn mở lại được.
