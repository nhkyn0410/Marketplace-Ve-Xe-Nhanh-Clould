# TASK-TRN-005 — Todo: Fare + FareRule

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 — Fare + FareRule theo chuyến / loại ghế / thời điểm (= giờ khởi hành), lưu lịch sử giá, VND `BIGINT` không âm; giá theo chặng ngoài v1; **test money bắt buộc**. Nguồn chi tiết: SRS `FR-OPS-08`, `UC-14` bước 4, `BR-40`, `BR-41`, `OQ-08` (Fare/FareRule bảng riêng, Trip tham chiếu rule đang hiệu lực, booking lưu snapshot), `MQ-02`; DB §5.2 (`fares`, `fare_rules`), `DB-PRIN-03`, `DB-OQ-02`; LLD `LLD-PRIN-03` (thao tác tạo/sửa tiền phải audit), `LLD-PRIN-06` (tiền `BIGINT` + Decimal.js); ADR-011 (Mongo = audit/log); API §4 (VND = số nguyên đồng); UI §5 "fare form"; DOMAIN-MAP `fare/`; GLOSSARY `Fare / FareRule`, `VehicleType`.
> **Dependency:** TASK-TRN-003 (chuyến) — nhánh `TASK-TRN-005` tách từ nhánh TRN-003 (`claude/admiring-thompson-38d7s8`), chưa merge `develop`. Merge TRN-003 trước rồi đưa `develop` vào nhánh này.
> **Mở khóa:** TASK-TRN-006 (mở bán cần fare hợp lệ — BR-39), TASK-TRN-004 (search hiển thị giá), TASK-BTP-002 (booking snapshot giá).

## Trạng thái (30/09/2026) — ⏸ **CHỜ KHANH CHỐT Q1 + Q4 TRƯỚC KHI CODE**

- ✅ Tạo nhánh `TASK-TRN-005`; đối chiếu SDLC (mới có nguyên tắc, chưa có cột bảng / endpoint / cách tính giá / nơi lưu lịch sử).
- ✅ Khanh chốt **Q2, Q3, Q5, Q6, Q7** theo khuyến nghị (30/09/2026). Tài liệu đã đồng bộ ngay: SRS `BR-41` v1.29 + GLOSSARY (Q3 — thời điểm = giờ khởi hành); file 11 TRN-005 + **ADM-001** (Q6 — cảnh báo trần/sàn chuyển sang ADM-001). Q2/Q5/Q7 đồng bộ vào API §7.3 / DB §7 / Security §7 cùng lúc với Q1/Q4 (phụ thuộc mô hình bảng).
- ⏳ **Q1** — Khanh muốn giá **tách bạch theo loại xe** (cùng tuyến, xe thường khác xe VIP): đề xuất lại 3 phương án bên dưới.
- ⏳ **Q4** — Khanh yêu cầu xem xét phương án Mongo: so sánh bên dưới.

---

## Phạm vi chuẩn

### Thuộc TRN-005

- Module `apps/api/src/fare/` (DOMAIN-MAP §2).
- Bảng giá + quy tắc giá theo loại xe / loại chỗ / khung giờ khởi hành; tính giá từng ghế của chuyến.
- Lịch sử thay đổi giá (BR-40) + audit (LLD-PRIN-03). Tiền `BIGINT` VND ≥ 0, **test money bắt buộc** (ADR-025).
- Zod DTO + OpenAPI + client TS/Dart; RLS + test tenant; màn Operator OS (M1 — sau khi có đăng nhập web).

### Không tự kéo vào task

- Giá theo chặng (BR-41); giá theo lúc mua vé (Q3).
- Khuyến mãi / voucher / VXN Plus (PROM-001/002, LOY-001); phí dịch vụ phụ thu khách (MQ-04: chưa v1).
- Booking snapshot giá (BTP-002) — TRN-005 chỉ cung cấp hàm tính giá để BTP-002 chụp lại.
- Mở bán kiểm "đã có giá" (TRN-006). Hiển thị giá ở search công khai (TRN-004).
- Khung trần/sàn + cảnh báo (FR-OPS-09, FR-ADM-09, OQ-17) → **TASK-ADM-001** (Q6).

---

## Quyết định đã chốt (30/09/2026)

| ID | Điểm | Quyết định |
| --- | --- | --- |
| Q2 | Dạng quy tắc giá | ✅ Mỗi rule = **giá tuyệt đối (VND)**, có hoặc không có khung giờ khởi hành. Rule không khung giờ = giá thường; có khung giờ = giá dịp lễ/Tết. **Rule cụ thể hơn thắng**; DB chặn hai rule cùng phạm vi chồng khung giờ. Không tăng/giảm theo % ở v1. |
| Q3 | "Theo thời điểm" | ✅ Theo **giờ khởi hành** của chuyến. Giá theo lúc mua vé ngoài v1. (SRS `BR-41` v1.29.) |
| Q5 | API + quyền | ✅ `GET/POST /operator/fares`, `GET/PUT /operator/fares/{fareId}` (PUT thay toàn bộ rule), `GET /operator/fares/{fareId}/revisions`; chi tiết chuyến trả **giá từng ghế**; quyền **dùng lại `trip:manage`** (Owner). Việc chuyến có trường `fareId` hay không phụ thuộc Q1. |
| Q6 | Khung trần/sàn (OQ-17) | ✅ **Chuyển sang TASK-ADM-001** (Admin cấu hình khung, M4). TRN-005 không cảnh báo. |
| Q7 | Sửa bảng giá đang được chuyến mở bán dùng | ✅ **Cho sửa**, ghi lịch sử; vé đã bán giữ giá (booking snapshot — BTP-002), đặt mới dùng giá mới. Bảng giá `INACTIVE` không dùng cho chuyến mới. |

---

## Q1 — Giá tách bạch theo loại xe (đề xuất lại theo yêu cầu Khanh)

**Yêu cầu:** cùng một tuyến, xe thường và xe VIP có giá khác nhau; đổi xe của chuyến (thường → VIP) thì giá đổi theo.

Hiện catalog loại xe (Platform quản lý, TRN-001 chỉ cho chọn từ catalog) có 4 loại: **Ghế ngồi** (`SEATER`), **Giường nằm** (`SLEEPER`), **Limousine**, **Cabin**. Mỗi xe có đúng một loại + mỗi ghế có loại chỗ `SEAT` (ghế) / `BED` (giường).

| Phương án | Giá được xác định bởi | Ví dụ SG → Đà Lạt | Ưu | Nhược |
| --- | --- | --- | --- | --- |
| **PA1 — Bảng giá theo tuyến, tách theo loại xe catalog** *(khuyến nghị)* | **Tuyến** × **loại xe** (catalog) × loại chỗ × khung giờ khởi hành. Mỗi tuyến một bảng giá; chuyến **tự** lấy giá theo tuyến + loại xe của xe đang gắn — **không cần chọn bảng giá cho chuyến**. | Giường nằm 300.000 · Limousine 450.000 · Cabin 550.000 · Tết: Limousine 600.000 | Tách bạch rõ nhất theo loại xe; đổi xe thường → VIP giá tự đổi; lịch lặp (TRN-007) tự có giá; không thêm khái niệm mới. | "VIP" phải là một loại xe trong catalog. Nhà xe có "giường nằm VIP" khác "giường nằm thường" → Admin thêm loại xe vào catalog (ADM-001), không đổi code. Không đặt được giá riêng cho một chuyến lẻ (mở lại nếu cần). |
| **PA2 — Như PA1 nhưng theo "hạng xe" do nhà xe tự đặt** | Tuyến × **hạng xe** (vd Thường / VIP / Royal — nhà xe tự tạo, gắn cho từng xe) × loại chỗ × khung giờ. | Thường 300.000 · VIP 450.000 | Linh hoạt nhất: hai xe cùng loại catalog (cùng giường nằm) vẫn tách giá theo chất lượng. | **Thêm khái niệm mới** ngoài SDLC: bảng hạng xe + cột trên xe + màn quản lý → mở rộng phạm vi TRN-001, sửa SRS/DB/API. |
| **PA3 — Bảng giá rời, chọn cho từng chuyến (`fareId`), có cột loại xe** *(khuyến nghị cũ + loại xe)* | Bảng giá do nhà xe đặt tên (nhiều bảng / tuyến), mỗi chuyến chọn một bảng; rule theo loại xe × loại chỗ × khung giờ. | "Giá thường", "Giá VIP cuối tuần"… chọn cho từng chuyến | Linh hoạt từng chuyến (chuyến đặc biệt giá riêng). | Mỗi chuyến phải chọn bảng giá; đổi xe mà bảng giá thiếu dòng cho loại xe mới → chuyến mất giá; dễ gắn nhầm bảng giá. |

**Khuyến nghị PA1**: đáp ứng đúng ví dụ (xe thường ≠ xe VIP, đổi xe là đổi giá) mà không thêm khái niệm; phần "VIP cùng loại catalog" xử lý bằng thêm loại xe ở catalog. Nếu Khanh xác nhận nhà xe **cần** VIP trong cùng một loại catalog → PA2.

Hệ quả của PA1 lên Q5: `POST /operator/fares` có `routeId` (một bảng giá / tuyến, unique), **không** thêm `fareId` vào chuyến; rule = (`vehicleTypeId` | mọi loại, `seatType` | mọi loại, khung giờ | không) → giá. Rule cụ thể hơn thắng theo thứ tự: có khung giờ > không; đúng loại xe > mọi loại; đúng loại chỗ > mọi loại. TRN-006 mở bán kiểm tuyến có giá cho loại xe của chuyến × mọi loại chỗ trên xe.

---

## Q4 — Lịch sử giá: Postgres hay Mongo? (xem xét phương án Mongo theo yêu cầu)

Bối cảnh:
- ADR-011: Mongo (cluster riêng) = **audit/log**, append-only (`audit_event`, FND-007; production chỉ cấp quyền `find` + `insert`).
- `LLD-PRIN-03`: tạo/sửa **tiền** phải audit → sửa bảng giá **dù sao cũng phải ghi `audit_event`**.
- Giá dùng để **thu tiền** được chụp vào booking (BTP-002, DB-PRIN-03) → lịch sử bảng giá chỉ để **xem lại + kiểm tra**, không dùng để tính tiền.
- IAM (IAM-005) đã có mẫu ghi audit Mongo: ghi "ý định" **trước** khi đổi Postgres (Mongo lỗi → không đổi gì), kết quả ghi sau (best-effort).

| Tiêu chí | **P — bảng `fare_revisions` (Postgres)** | **M — `audit_event` (Mongo)** |
| --- | --- | --- |
| Khớp thiết kế hiện có | Thêm bảng mới ngoài DB §5.2 | Dùng đúng hạ tầng ADR-011/FND-007; DB §5.2 không đổi |
| Số lần ghi mỗi lần sửa giá | 2 (revision Postgres + audit Mongo bắt buộc theo LLD-PRIN-03) | **1** (audit event chính là lịch sử) |
| Nhất quán với thay đổi giá | Tuyệt đối (cùng transaction) | Gần tuyệt đối: ghi audit **bên trong** transaction Postgres, **trước commit** → Mongo lỗi thì huỷ sửa giá; chỉ lệch nếu commit Postgres lỗi sau khi đã ghi Mongo (rất hiếm) → một dòng lịch sử "ma" |
| Chống sửa/xoá lịch sử | Cần policy RLS chỉ INSERT/SELECT (làm được, mẫu `stop_point_proposals`) | Mạnh hơn: app guard + user Mongo production không có quyền update/delete |
| Cách ly tenant khi đọc | RLS tự động | Chỉ ở tầng app: kiểm bảng giá thuộc tenant (Postgres) rồi lọc `operatorId` + `targetId` ở Mongo |
| Khi Mongo sập | Sửa giá vẫn chạy | Sửa giá bị chặn (giống thao tác tài khoản IAM); xem lịch sử lỗi |
| Báo cáo (RPT, ADM-001 khung giá) | JOIN SQL trực tiếp | Qua Mongo aggregation (RPT-002 vốn đọc audit Mongo) |

**Khuyến nghị sau khi xem xét: M (Mongo `audit_event`)** — vì sửa giá **bắt buộc** ghi audit Mongo (LLD-PRIN-03), dùng chính bản ghi đó làm lịch sử thì chỉ một nguồn, không thêm bảng ngoài DB §5.2; độ lệch hiếm gặp chấp nhận được vì lịch sử giá **không dùng để tính tiền** (tiền đã chụp vào booking). Cách ghi: bên trong transaction Postgres, sau khi ghi bảng giá, trước commit: `audit_event { action: "fare.create" | "fare.update", targetType: "fare", targetId, operatorId, actorId, before, after }` (before/after = toàn bộ rule). `GET /operator/fares/{fareId}/revisions` đọc từ Mongo sau khi kiểm bảng giá thuộc tenant.

Chọn **P** nếu Khanh muốn lịch sử giá vẫn xem/sửa giá được khi Mongo sập, hoặc báo cáo giá cần JOIN SQL.

---

### Giả định (không cần chốt riêng — Khanh phản đối thì sửa)

- **A1** — Tiền trong JSON là **số nguyên đồng** (API §4), Zod `int ≥ 0`, trần kỹ thuật 100.000.000 đ/ghế để chặn gõ nhầm; trong code dùng `bigint` / `BIGINT`, không `number` cho phép tính tiền.
- **A2** — Trạng thái bảng giá `ACTIVE`/`INACTIVE`, không xoá cứng.
- **A3** — Ghế không tìm được giá → `null` trong chi tiết chuyến; TRN-006 chặn mở bán khi còn ghế thiếu giá.
- **A4** — Khung giờ rule là `[từ, đến)` theo giờ khởi hành, lưu UTC như `trips`.

---

## Todo (ID = thứ tự thực hiện, sau khi chốt Q1 + Q4)

- [x] #0 Chốt Q2, Q3, Q5, Q6, Q7; đồng bộ SRS BR-41, GLOSSARY, file 11 (TRN-005 + ADM-001).
- [ ] #1 [TRN-005.1] Chốt Q1 + Q4; cập nhật API §7.3, DB §5.2/§7, Security §7, LLD, Test plan, file 11 — **rà mọi tài liệu nhắc tới fare** (bài học TRN-003).
- [ ] #2 [TRN-005.2] Schema + migration + RLS.
- [ ] #3 [TRN-005.3] Module `fare/` + API + tính giá ghế trong chi tiết chuyến.
- [ ] #4 [TRN-005.4] OpenAPI + client TS/Dart.
- [ ] #5 [TRN-005.5] Test bắt buộc: money (BIGINT, rule nào thắng, biên khung giờ), tenant-RLS/IDOR, lịch sử append-only.
- [ ] #6 [TRN-005.6] Review + CI + màn Operator OS.

## Rủi ro phải test chủ động

- Hai rule cùng phạm vi chồng khung giờ → giá không xác định.
- Khung giờ biên (đúng giờ bắt đầu / kết thúc Tết) chọn sai rule.
- Gắn bảng giá / tuyến của nhà xe khác (IDOR qua body).
- Sửa giá mà không có lịch sử, hoặc lịch sử bị sửa/xoá.
- Tiền bị ép qua `number` rồi làm tròn sai.
