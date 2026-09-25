# TASK-TRN-002 — Todo: Route + RouteStop + StopPoint + Goong

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.3 — Route + RouteStop từ StopPoint chuẩn hoặc StopPoint riêng; đề xuất StopPoint mới; adapter Goong lưu distance/duration lúc cấu hình route. Nguồn chi tiết: SRS `FR-OPS-04..05`, `UC-13`, `BR-23`, `BR-38`, `AC-18`; LLD §5.2 Transport Resource; DB §5.2/§7; API §7.3; Security §6–7; ADR-006/027; DOMAIN-MAP `route/`, `stop-point/`, `external/routing/goong/`.
> **Dependency:** TASK-CAT-001 — schema/API catalog đã có trên nhánh nền; task vẫn `In Progress` vì seed hành chính production chưa hoàn tất.
> **Mở khóa:** TASK-TRN-003 (Trip/TripStop/TripSeat).
> **Cách dùng:** Lệnh kiểm chứng ở `TRN-002-guide.md`; nghiệm thu ở `TRN-002-verification-checklist.md`.

## Trạng thái (26/09/2026) — 🔨 **ĐANG TRIỂN KHAI**

- ✅ Nhánh `TASK-TRN-002` đã tồn tại và bắt đầu từ code TRN-001/CAT-001 (TRN-001 commit `f95b86f`).
- ✅ Đã đối chiếu task với SRS, LLD, DB, API, Security, Test, ADR-027, DOMAIN-MAP, GLOSSARY và code hiện tại.
- ✅ Đã tạo bộ ba todo/guide/checklist.
- ✅ Khanh duyệt **Q1–Q8 theo khuyến nghị** ngày 26/09/2026 (Q8 bổ sung: ước lượng đường chim bay ở dev khi thiếu key; production bắt buộc key).
- ✅ Đối chiếu tài liệu Goong Distance Matrix (26/09/2026): `GET https://rsapi.goong.io/distancematrix?origins=lat,lng&destinations=lat,lng|…&vehicle=car&api_key=…` → `rows[].elements[] { status: "OK", distance.value (m), duration.value (s) }`. Tài liệu **không nêu giới hạn** số origin/destination → adapter gọi **từng chặng 1×1** (n−1 phần tử quota, không phụ thuộc giới hạn chưa biết); tối đa 25 điểm/route.

### Chi tiết hiện thực bám Q1–Q8 (AI đặt, Khanh phản đối thì sửa)

- **Role RouteStop suy ra từ vị trí** (điểm đầu `ORIGIN`, cuối `DESTINATION`, giữa `INTERMEDIATE`); client chỉ gửi danh sách điểm theo thứ tự — không có cách gửi role sai.
- **Proposal: DB tự giữ state machine cho tenant** — policy RLS chỉ cho scope tenant tạo/ghi row ở trạng thái `PENDING` và chỉ sửa row đang `REJECTED`; CHECK nhất quán (`PENDING` không có lý do/link catalog, `REJECTED` bắt buộc lý do, `APPROVED` bắt buộc `catalog_stop_point_id`). Operator không thể tự duyệt kể cả khi service có bug. Admin (scope platform) duyệt ở ADM-001.
- **Route lưu `metricsSource`** (`GOONG`/`ESTIMATE`) để không nhầm số ước lượng ở dev với số thật.
- **Gọi provider ngoài transaction**; ghi Route + RouteStop trong một transaction, khoá dòng Route trước khi thay điểm (mẫu TRN-001) → hai PUT đồng thời không trộn.
- Mã lỗi địa giới (phường/tỉnh không tồn tại, INACTIVE, phường khác tỉnh) dùng lại `CATALOG_ITEM_UNAVAILABLE` 422 của TRN-001 (chuyển helper sang `catalog/`); `requireTenant` chuyển sang `iam/role/` để 3 module dùng chung.

---

## Phạm vi chuẩn

### Thuộc TRN-002

- Module `apps/api/src/route/` cho Route/RouteStop.
- Module `apps/api/src/stop-point/` cho StopPoint riêng và proposal của Operator.
- Port `RoutingProvider` và adapter `apps/api/src/external/routing/goong/` theo ADR-006/027.
- Bảng Operator-owned có `operator_id`, lọc tenant tường minh và `ENABLE + FORCE RLS`.
- Route có tối thiểu điểm đầu/cuối, các điểm có thứ tự, vai trò, ghi chú và trạng thái; chỉ dùng catalog/điểm riêng còn hiệu lực.
- Distance/duration được tính lúc tạo hoặc thay đổi chuỗi điểm và lưu DB; GET/search không gọi Goong.
- Zod/OpenAPI/RFC 7807; client TS/Dart; test RLS/IDOR/provider bắt buộc.

### Không tự kéo vào task

- Admin duyệt/từ chối proposal và CRUD catalog chuẩn → `TASK-ADM-001`.
- Trip/TripStop, fare, mở bán và kiểm route khi mở bán → `TASK-TRN-003/005/006`.
- Sửa route đang có trip tương lai/đã bán vé, audit/reason/notification → `TASK-TRN-008`.
- Search Redis và gọi routing khi search → không làm; ADR-027 yêu cầu cache-once trong DB.
- Turn-by-turn navigation, dispatch realtime, tối ưu đội xe, PostGIS proximity → ngoài baseline TRN-002.
- UI Operator OS nếu Q7 chọn chỉ BE.

---

## Quyết định đã chốt ngày 26/09/2026 (Khanh: "Duyệt tất cả" + Q8 theo khuyến nghị)

| ID | Điểm cần chốt | Quyết định (= khuyến nghị) |
| --- | --- | --- |
| Q1 | **Điểm riêng và proposal:** điểm riêng có được dùng ngay trong tenant hay luôn phải chờ Admin? | Điểm riêng `ACTIVE` được dùng ngay trong route của tenant; gửi lên catalog là một proposal riêng `PENDING/APPROVED/REJECTED`. Admin duyệt ở ADM-001 và tạo/link `stop_points_catalog`; từ chối lưu reason và cho resubmit. |
| Q2 | **API contract** | `GET/POST /operator/routes`, `GET/PUT /operator/routes/{routeId}`; `GET/POST /operator/stop-points`, `GET/PUT /operator/stop-points/{stopPointId}`; `GET/POST /operator/stop-point-proposals`, `PUT /operator/stop-point-proposals/{proposalId}` chỉ để sửa/resubmit bản `REJECTED`. `PUT` thay toàn bộ. |
| Q3 | **Mô hình RouteStop và vòng lặp** | Hai FK nullable (`catalog_stop_point_id`, `stop_point_id`) + CHECK đúng một nguồn; unique `(route_id, sequence)`; không cho cùng logical point xuất hiện hai lần; đầu/cuối khác nhau; role `ORIGIN`, `INTERMEDIATE`, `DESTINATION`; điểm trung gian dùng cho cả pickup/dropoff ở TRN-002, cửa sổ phục vụ chi tiết thuộc TripStop. |
| Q4 | **State** | `RouteStatus = ACTIVE/INACTIVE`; `StopPointStatus = ACTIVE/INACTIVE`; `StopPointProposalStatus = PENDING/APPROVED/REJECTED`. Không xóa cứng. RouteStop không có state riêng. |
| Q5 | **Goong persistence/failure** | Lưu `distance_meters_from_previous`, `duration_seconds_from_previous` trên từng RouteStop và tổng trên Route. Chỉ gọi lại khi tọa độ/thứ tự đổi. Timeout/lỗi/response sai → `503 ROUTING_PROVIDER_UNAVAILABLE`, transaction không lưu route nửa vời; unit/integration dùng fake provider, không gọi mạng thật. |
| Q6 | **Permission** | Thêm `route:manage`, chỉ `OPERATOR_OWNER` có scope `tenant`; không dùng lại `vehicle:manage`. Khác tenant/không tồn tại cùng trả 404. Employee/Admin API để task sau. |
| Q7 | **Phạm vi FE** | Chỉ BE + OpenAPI + client TS/Dart trong TRN-002, giống TRN-001. Operator OS chưa có IAM-006 hoàn tất; UI route/form/proposal làm sau khi web auth sẵn sàng. |

| Q8 | **Chạy khi chưa có key Goong** (bổ sung 25/09/2026) | Chọn provider theo config giống `EmailNotifier`: có `GOONG_API_KEY` → Goong; **production bắt buộc key** (env fail-fast). Dev/test không có key → provider ước lượng đường chim bay (haversine, tốc độ giả định 50 km/h), log cảnh báo — để dev/demo tạo route được mà không tốn quota. Test tự động luôn dùng fake provider. |

### Giả định (không cần chốt riêng — Khanh phản đối thì sửa)

- **A1** — UC-13 A2 chỉ yêu cầu **cảnh báo** route trùng chuỗi điểm: BE không chặn; chỉ tên Route unique trong tenant (`ROUTE_NAME_CONFLICT`). FE cảnh báo dựa trên danh sách route.
- **A2** — "Thời gian dự kiến giữa các điểm" (UC-13 bước 4) ở TRN-002 = duration Goong đã lưu; giờ đến/đi thực tế từng điểm do Operator chỉnh ở TripStop (TRN-003).
- **A3** — Catalog StopPoint dùng được khi chính nó, phường và tỉnh của nó đều `ACTIVE` (cùng quy tắc API công khai CAT-001).
- **A4** — Khanh cần tạo tài khoản Goong + API key (REST) và đặt `GOONG_API_KEY` trên Render trước khi deploy production — ghi ở nhật ký `ops`.
- **Lưu ý:** ADR-027 (Goong) trong file 10 vẫn ghi trạng thái `Proposed`, dù CLAUDE.md/AGENTS.md coi Goong là đã chốt. TRN-002 hiện thực theo ADR-027; Khanh xác nhận/promote ADR khi tiện.

---

## Contract dự kiến sau khi Q1–Q7 được duyệt

| Method | Path | Mục đích |
| --- | --- | --- |
| `GET` | `/operator/routes` | List cursor 20/max 100, lọc `status` |
| `GET` | `/operator/routes/{routeId}` | Chi tiết kèm RouteStop theo sequence |
| `POST` | `/operator/routes` | Tạo route và tính/persist Goong metrics |
| `PUT` | `/operator/routes/{routeId}` | Thay toàn bộ route/stops; tính lại khi chuỗi điểm đổi |
| `GET/POST` | `/operator/stop-points` | List/tạo điểm riêng trong tenant |
| `GET/PUT` | `/operator/stop-points/{stopPointId}` | Xem/thay toàn bộ điểm riêng |
| `GET/POST` | `/operator/stop-point-proposals` | List/tạo proposal catalog |
| `PUT` | `/operator/stop-point-proposals/{proposalId}` | Sửa/resubmit proposal bị từ chối |

Mã lỗi dự kiến: `ROUTE_NOT_FOUND`, `ROUTE_NAME_CONFLICT`, `ROUTE_STOPS_INVALID`, `STOP_POINT_NOT_FOUND`, `STOP_POINT_NAME_CONFLICT`, `STOP_POINT_UNAVAILABLE`, `STOP_POINT_PROPOSAL_NOT_FOUND`, `STOP_POINT_PROPOSAL_STATE_INVALID`, `ROUTING_PROVIDER_UNAVAILABLE`.

---

## Todo

### ✅ #1 — [TRN-002.1] Khóa Q1–Q8 và đồng bộ contract

Sau khi Khanh duyệt: cập nhật API §7.3, DB §5.2/§7, Security permission, GLOSSARY/DOMAIN-MAP nếu cần và revision history; không đổi trạng thái Approved.

**Success:** không còn quyết định schema/API/state/permission/provider ngầm.

### ✅ #2 — [TRN-002.2] Schema + migration + RLS

Model Prisma + migration SQL cho Route/RouteStop/StopPoint/proposal, FK ghép tenant, CHECK source/sequence/coordinate, index/unique và RLS; thêm bảng vào `RLS_TABLES`.

**Success:** DB chặn source rỗng/kép, sequence trùng, gắn điểm riêng khác tenant; role app không đọc/ghi tenant khác. — ✅ 26/09/2026: `20260926010000_add_route` áp trên PostgreSQL 16 trống (10/10 migration), `db:app-role` pass. `route_stops` lưu thêm toạ độ đã dùng để tính (so với toạ độ hiện tại của điểm → biết khi nào phải tính lại, kể cả khi Operator sửa toạ độ điểm riêng). Mutation (tắt RLS `routes`, nới policy đề xuất, bỏ CHECK nguồn điểm, bỏ FK ghép điểm riêng) làm đúng 6 test đỏ.

### ✅ #3 — [TRN-002.3] RoutingProvider + Goong adapter

Port framework-agnostic, adapter HTTP Goong, config secret/timeout, mapping lỗi ổn định; fake provider cho test.

**Success:** route create/update gọi provider đúng lúc, persist metrics; GET/list không gọi; lỗi không lưu dữ liệu dở dang. — ✅ `external/routing/`: port + Goong (1×1 mỗi chặng, timeout 5 s, lỗi không mang URL/key) + ước lượng haversine cho dev; `GOONG_API_KEY` bắt buộc ở production (env fail-fast; đã thêm `render.yaml`, `.env.example`). Unit test bằng `fetch` giả, không gọi mạng.

### ✅ #4 — [TRN-002.4] StopPoint riêng + proposal API

Zod DTO, service tenant-safe, state transition proposal, controller mỏng và RFC 7807.

**Success:** địa giới/toạ độ/type/state hợp lệ; rejected resubmit đúng; cross-tenant → 404. — ✅ Test DB thật: tỉnh/phường INACTIVE/lệch/không tồn tại → 422, trùng tên 409, khác tenant 404; đề xuất PENDING gửi lại → 409, REJECTED gửi lại → PENDING (xoá lý do). **DB tự chặn** tenant tự duyệt/từ chối/xoá hoặc sửa bản PENDING.

### ✅ #5 — [TRN-002.5] Route API

Zod kiểm sequence/role/duplicate; service resolve catalog/điểm riêng còn hiệu lực; transaction tạo/thay toàn bộ stops + metrics.

**Success:** route hợp lệ được lưu nguyên tử; route sai/point unavailable/cross-tenant bị chặn. — ✅ Provider giả đếm lần gọi: tạo = 1 lần; GET/list = 0; đổi tên/ghi chú/trạng thái = 0; đổi thứ tự hoặc toạ độ điểm riêng = gọi lại; số ước lượng được tính lại khi đã có Goong. Provider lỗi / sai số chặng / số âm → 503, không tạo, route cũ giữ nguyên. 5 loại điểm không dùng được → 422, không gọi provider. PUT đồng thời không trộn điểm.

### ✅ #6 — [TRN-002.6] OpenAPI + client TS/Dart

Thêm controller vào OpenApiModule, khai body/path/query/response; sinh lại hai client.

**Success:** OpenAPI 3.1 và clients không drift ngoài phạm vi TRN-002. — ✅ Bắt được lỗi thật khi so ngữ nghĩa: `StopPointListResponseDto` trùng tên class giữa catalog và stop-point → schema của API công khai `/catalog/stop-points` bị ghi đè. Đã đổi tên DTO điểm riêng sang `Operator*` + test chặn trùng tên DTO toàn `src/`. Sau sửa: chỉ thêm 6 path + 9 schema, phần cũ trùng khít. Dart: `dart test` 373/373, `dart analyze` 0 error / 19 warning (6 mới = import thừa của 3 file api mới, cùng mẫu generator).

### ✅ #7 — [TRN-002.7] Test bắt buộc + regression

Unit DTO/provider; HTTP auth/RBAC/400/404/409/422/503; Postgres thật bằng role app cho RLS/IDOR/FK/CHECK/transaction; regression toàn bộ.

**Success:** `REQUIRE_DB_TESTS=1` không skip; lint/typecheck/test/build xanh. — ✅ 26/09/2026 (sau khi sửa review): role app + PostgreSQL 16 + Redis 7 + Mongo 7 (container riêng cổng 55432/36379/37017): 59/59 file, 635/635 test, 0 skip, xanh 2 lần liên tiếp. `pnpm turbo run typecheck lint build` 26/26. Hai fixture "cấu hình production hợp lệ" của test IAM được thêm `GOONG_API_KEY` (hệ quả trực tiếp của biến bắt buộc mới).

### 🔶 #8 — [TRN-002.8] Review, AI journal, CI và đóng task

Chạy `code-reviewer` + `security-auditor`; xử lý finding; ghi AI journal; chỉ chuyển `Done` sau khi Khanh xác nhận CI xanh.

**Success:** không finding blocking/high; CI xanh và checklist có evidence. — ✅ Review 26/09/2026: security 0 blocking/high; code-reviewer 0 blocking, 1 high (H1) đã sửa; các medium đã sửa trừ rate limit theo tenant (cần Khanh quyết). ⏳ Chờ commit/CI khi Khanh yêu cầu + key Goong trên Render.

#### Finding review và xử lý (26/09/2026)

| Nguồn | Mức | Finding | Xử lý |
| --- | --- | --- | --- |
| code-reviewer | High | Route/điểm riêng không sửa được (kể cả tạm ngưng) khi một điểm/phường/tỉnh đang dùng bị vô hiệu hoá | ✅ Chỉ điểm **mới thêm** phải `ACTIVE`, điểm đã có được giữ (mẫu TRN-001); điểm riêng chỉ kiểm tỉnh/phường khi **đổi**. Test DB cho cả hai. TRN-006 phải kiểm lại toàn bộ điểm khi mở bán |
| security | Medium | Key Goong có thể lộ sang Sentry qua breadcrumb/span của `fetch` (integration `NodeFetch` mặc định của SDK v10) | ✅ `beforeBreadcrumb` + `beforeSend(Transaction)` che mọi query param dạng key/token trong breadcrumb, span, trace context, `request.url`; test |
| cả hai | Medium | Goong: gọi song song không giới hạn, chặng lỗi không huỷ chặng khác, POST trùng tên vẫn đốt quota | ✅ Tối đa 4 request cùng lúc + huỷ phần còn lại khi lỗi (test: 4 lần gọi rồi dừng); kiểm trùng tên **trước** khi gọi provider (test: 0 lần gọi) |
| security | Medium | Không rate limit theo tenant cho POST/PUT route → một Owner có thể đốt quota Goong chung | ⏸ Cần thêm limiter Redis (mẫu `OtpRateLimiter`) — mở rộng phạm vi nhỏ, **Khanh quyết** làm ở TRN-002 hay task rate-limit chung |
| cả hai | Low | Provider trả số quá lớn → tràn INT4 thành 500 | ✅ Trần 5.000 km / 7 ngày mỗi chặng → 503; test |
| security | Low | Response lỗi không đọc bỏ body; hết quota (HTTP 200 + status lỗi) chỉ log "sai định dạng" | ✅ `body.cancel()`; log `element status …` |
| code-reviewer | Nit | CHECK cho `REJECTED` chấp nhận lý do rỗng | ✅ Bắt lý do không rỗng (`btrim`); test |
| security | Test | Thiếu test tenant tạo/chuyển đề xuất sang `operator_id` tenant khác | ✅ Đã thêm |
| — | Test | Test IAM `password-change.int` (scrypt nặng) vượt 5 s khi cả suite chạy song song (chạy riêng ~3 s) | ✅ Timeout riêng 20 s cho test đó; suite xanh 2 lần liên tiếp |
| security | Low | Chỉ dựa `NODE_ENV` để biết production (thiếu biến → âm thầm dùng số ước lượng) | ⏸ Render đặt `NODE_ENV=production`; `metricsSource` lưu kèm route để phát hiện |
| security | Low | Path id không ép kiểu UUID | ⏸ Nhất quán các controller hiện có (vô hại: truy vấn có tham số, trả 404) |
| code-reviewer | Low | Điểm bị đổi/tắt trong ~5 s chờ Goong vẫn được gắn; sửa toạ độ điểm riêng không tự cập nhật route | ⏸ Tự sửa ở lần PUT route kế tiếp (so toạ độ snapshot); ghi chú cho TRN-003/TRN-008 |
| code-reviewer | Nit | Lỗi 422 của vehicle giờ có title "Catalog error" (helper dùng chung) | Chấp nhận — cùng `code` `CATALOG_ITEM_UNAVAILABLE` |

#### Bàn giao cho TRN-003 / TRN-006

- TRN-006 (mở bán) phải kiểm **mọi** điểm của route còn `ACTIVE` (route được phép giữ điểm đã ngừng để Owner vẫn sửa/tạm ngưng).
- `route_stops.latitude/longitude` là toạ độ đã dùng để tính số liệu; tên/địa chỉ trả về là giá trị hiện tại của điểm.

---

## Rủi ro phải test chủ động

- RouteStop tham chiếu đồng thời catalog và private, hoặc không tham chiếu nguồn nào.
- Dùng catalog `INACTIVE`/private point khác tenant bằng id đoán được.
- Hai PUT đồng thời làm trộn sequence/metrics.
- Goong timeout sau khi đã xóa stops cũ khiến route mất dữ liệu.
- Đổi mô tả/tên nhưng vẫn gọi Goong; ngược lại đổi tọa độ/thứ tự mà không tính lại.
- Provider trả âm, thiếu leg hoặc số leg khác `stops - 1`.
- Proposal bị duyệt vẫn bị Operator sửa/resubmit.
- OpenAPI thiếu request body/controller nên client sinh thiếu route.
