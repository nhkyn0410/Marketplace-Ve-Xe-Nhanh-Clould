# TASK-TRN-005 — Todo: Fare + FareRule

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 — Fare + FareRule theo chuyến / loại ghế / thời điểm, lưu lịch sử giá, VND `BIGINT` không âm; vượt trần/sàn chỉ cảnh báo (OQ-17); giá theo chặng ngoài v1; **test money bắt buộc**. Nguồn chi tiết: SRS `FR-OPS-08..09`, `UC-14` bước 4–5, `BR-40`, `BR-41`, `OQ-08` (Fare/FareRule bảng riêng, Trip tham chiếu rule đang hiệu lực, booking lưu snapshot), `OQ-17`, `MQ-02`, `FR-ADM-09`; DB §5.2 (`fares`, `fare_rules`), `DB-PRIN-03`, `DB-OQ-02`; LLD `LLD-PRIN-06` (tiền `BIGINT` + Decimal.js); API §4 (VND = số nguyên đồng); UI §5 "fare form"; DOMAIN-MAP `fare/`; GLOSSARY `Fare / FareRule`.
> **Dependency:** TASK-TRN-003 (chuyến) — nhánh `TASK-TRN-005` tách từ nhánh TRN-003 (`claude/admiring-thompson-38d7s8`), chưa merge `develop`. Merge TRN-003 trước rồi đưa `develop` vào nhánh này.
> **Mở khóa:** TASK-TRN-006 (mở bán cần fare hợp lệ — BR-39), TASK-TRN-004 (search hiển thị giá), TASK-BTP-002 (booking snapshot giá).

## Trạng thái (30/09/2026) — ⏸ **CHỜ KHANH CHỐT Q1–Q7 TRƯỚC KHI CODE**

- ✅ Tạo nhánh `TASK-TRN-005`.
- ✅ Đối chiếu SRS, DB, API, LLD, UI, Security, DOMAIN-MAP, GLOSSARY: SDLC mới chốt **nguyên tắc** (OQ-08, BR-40/41, OQ-17), **chưa có** cột bảng, endpoint, cách tính giá theo thời điểm, cách lưu lịch sử → cần chốt Q1–Q7.
- ⏳ Sau khi chốt: cập nhật API §7.3 / DB §7 / Security §7, tạo guide + checklist, rồi code.

---

## Phạm vi chuẩn (dự kiến)

### Thuộc TRN-005

- Module `apps/api/src/fare/` (DOMAIN-MAP §2).
- Bảng giá của nhà xe + quy tắc giá theo loại ghế / thời điểm; gắn bảng giá cho chuyến; tính giá từng ghế của chuyến.
- Lịch sử thay đổi giá (BR-40). Tiền `BIGINT` VND ≥ 0, **test money bắt buộc** (ADR-025).
- Zod DTO + OpenAPI + client TS/Dart; RLS + test tenant; màn Operator OS (M1: từ TRN-003 mỗi task làm cả BE lẫn màn — sau khi có đăng nhập web).

### Không tự kéo vào task

- Giá theo chặng (BR-41) — ngoài v1.
- Khuyến mãi / voucher / VXN Plus (PROM-001/002, LOY-001); phí dịch vụ phụ thu khách (MQ-04: chưa v1).
- Booking snapshot giá (BTP-002) — TRN-005 chỉ cung cấp hàm tính giá để BTP-002 chụp lại.
- Mở bán kiểm "đã có fare" (TRN-006). Hiển thị giá ở search công khai (TRN-004).
- Admin cấu hình khung trần/sàn (FR-ADM-09 → ADM-001) — xem Q6.

---

## Câu hỏi cần Khanh chốt

| ID | Điểm cần chốt | Khuyến nghị | Lý do / đánh đổi |
| --- | --- | --- | --- |
| Q1 | **Mô hình giá**: bảng giá dùng chung nhiều chuyến hay giá nhập riêng từng chuyến? | **Bảng giá (`Fare`) của nhà xe, gắn cho chuyến qua `trips.fare_id`** — nhiều chuyến cùng tuyến dùng chung một bảng giá. | Đúng OQ-08 ("Trip tham chiếu rule đang hiệu lực"); đổi giá một lần áp cho cả loạt chuyến; hợp với lịch lặp TRN-007. Giá nhập riêng từng chuyến đơn giản hơn nhưng sửa giá hàng loạt phải sửa từng chuyến. |
| Q2 | **Quy tắc giá (`FareRule`)**: dạng gì? | Mỗi rule = **giá tuyệt đối** (VND) cho **một loại ghế** (`SEAT`/`BED`, hoặc để trống = mọi loại), **có hoặc không có khung thời gian**. Rule không khung giờ = giá cơ bản; rule có khung giờ = giá dịp lễ/Tết. Rule cụ thể hơn thắng (có khung giờ > không; đúng loại ghế > mọi loại). DB chặn hai rule cùng loại ghế chồng khung giờ. | Giá tuyệt đối không cần làm tròn → tránh lỗi tiền; dễ hiểu với nhà xe ("Tết: giường 450.000"). Không làm tăng/giảm theo % ở v1 (cần chốt quy tắc làm tròn) — mở lại nếu cần. |
| Q3 | **"Theo thời điểm"** là thời điểm nào? | **Theo giờ khởi hành của chuyến** (ngày lễ, Tết, cuối tuần). | Khớp "khung trần/sàn vào dịp quan trọng" (OQ-17). Giá theo lúc mua vé (đặt sớm/sát giờ) là mô hình khác — ngoài v1. |
| Q4 | **Lịch sử giá (BR-40)** lưu ở đâu? | Bảng **`fare_revisions`** (Postgres, append-only, RLS): mỗi lần tạo/sửa bảng giá ghi một bản chụp toàn bộ rule (JSONB) + người sửa + thời điểm, trong **cùng transaction**. | Cùng transaction nên không mất lịch sử; truy vấn được theo bảng giá. Mongo `audit_event` (FND-007) khác DB, không cùng transaction. |
| Q5 | **API + quyền** | `GET/POST /operator/fares`, `GET/PUT /operator/fares/{fareId}` (PUT thay toàn bộ rule), `GET /operator/fares/{fareId}/revisions`; chuyến thêm trường **`fareId`** (null khi nháp, bắt buộc lúc mở bán — TRN-006); chi tiết chuyến trả **giá từng ghế**. Quyền: **dùng lại `trip:manage`** (Owner). | Security §7 gộp "Trip / fare / inventory" một dòng. Thêm `fareId` vào body chuyến là đổi hợp đồng TRN-003 (chưa phát hành nên được). |
| Q6 | **Khung trần/sàn (FR-OPS-09, OQ-17)** | **Để ADM-001** (Admin cấu hình, M4): TRN-005 chưa cảnh báo gì. | Chưa có mô hình khung giá (theo tuyến? theo tỉnh? theo dịp?) và chưa có Admin để nhập; làm trước là đoán. OQ-17 chỉ cảnh báo, không chặn → hoãn không làm sai tiền. |
| Q7 | **Sửa bảng giá đang được chuyến mở bán dùng** | **Cho sửa**, ghi lịch sử; vé đã bán không đổi (booking snapshot BTP-002); đặt vé mới dùng giá mới. Bảng giá `INACTIVE` không gắn mới cho chuyến. | Đúng BR-40 ("giá đã áp dụng vào booking không thay đổi ngược"). Chặn sửa sẽ buộc tạo bảng giá mới cho mỗi lần đổi giá. |

### Giả định (không cần chốt riêng — Khanh phản đối thì sửa)

- **A1** — Tiền trong JSON là **số nguyên đồng** (API §4), Zod `int ≥ 0`, trần kỹ thuật 100.000.000 đ/ghế để chặn gõ nhầm; trong code dùng `bigint` / `BIGINT`, không `number` cho phép tính tiền.
- **A2** — Tên bảng giá unique trong nhà xe; trạng thái `ACTIVE`/`INACTIVE`, không xoá cứng.
- **A3** — Bảng giá phải có giá cho mọi loại ghế của chuyến thì mới mở bán được (TRN-006 kiểm); TRN-005 trả ghế thiếu giá là `null`.
- **A4** — Khung giờ rule là `[từ, đến)` theo giờ khởi hành, lưu UTC như `trips`.

---

## Todo (ID = thứ tự thực hiện, sau khi chốt Q)

- [ ] #1 [TRN-005.1] Chốt Q1–Q7; cập nhật API §7.3, DB §7, Security §7, file 11.
- [ ] #2 [TRN-005.2] Schema + migration + RLS (`fares`, `fare_rules`, `fare_revisions`, `trips.fare_id`).
- [ ] #3 [TRN-005.3] Module `fare/` + API + tính giá ghế; `trip/` nhận `fareId`.
- [ ] #4 [TRN-005.4] OpenAPI + client TS/Dart.
- [ ] #5 [TRN-005.5] Test bắt buộc: money (BIGINT, rule nào thắng, khung giờ biên), tenant-RLS/IDOR, lịch sử append-only.
- [ ] #6 [TRN-005.6] Review + CI + màn Operator OS.

## Rủi ro phải test chủ động

- Hai rule chồng khung giờ cho cùng loại ghế → giá không xác định.
- Khung giờ biên (đúng giờ bắt đầu / kết thúc Tết) chọn sai rule.
- Gắn bảng giá của nhà xe khác cho chuyến (IDOR qua body).
- Sửa bảng giá mà không ghi lịch sử, hoặc lịch sử bị sửa/xoá.
- Tiền bị ép qua `number` rồi làm tròn sai khi cộng dồn.
