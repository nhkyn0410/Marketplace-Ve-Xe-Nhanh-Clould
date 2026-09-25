# TASK-CAT-001 — Checklist nghiệm thu: Catalog nền cho Transport

> Mục tiêu: catalog chuẩn Platform có schema + invariant DB + seed tối thiểu + API đọc công khai, đủ nền cho TRN-001/TRN-002, và không route nào ngoài platform/system ghi được catalog.
> Chạy theo thứ tự **A → G**; chỉ tick `[x]` khi có evidence. Lệnh: `CAT-001-guide.md`. Phạm vi/sub-task: `CAT-001-todo.md`.

## Snapshot trạng thái (25/09/2026)

- [x] Đã đối chiếu SDLC/code và tạo bộ ba todo/guide/checklist; nhánh `TASK-CAT-001` tạo từ `develop`.
- [x] Q1–Q4 được Khanh chốt 25/09/2026 (Q4: import file danh mục chính thức).
- [ ] File danh mục chính thức `administrative-units.csv` đã được Khanh cung cấp.

## PHẦN A — Quyết định & ranh giới

- [x] Q1: endpoint đọc công khai (path, query, phân trang) được duyệt.
- [x] API §7.6 + revision v0.6 cập nhật 25/09/2026, giữ Approved.
- [x] Q2: schema, `CatalogStatus`, `StopPointType` 4 loại, tọa độ không PostGIS.
- [x] Q3: RLS `public_read` + ghi chỉ `platform`/`system`.
- [x] Q4: seed create-only; tỉnh/xã từ file chính thức; bến xe mẫu chỉ dev.
- [ ] Không kéo Admin CRUD, đề xuất StopPoint, `content_pages`, PostGIS, cache vào CAT-001.

## PHẦN B — Schema, migration & RLS

- [x] 5 bảng + 2 enum đúng migration; không cột `operator_id`.
- [x] `code` unique ở tỉnh/phường/loại xe/tiện ích (`catalog.int.spec.ts`).
- [x] FK ghép `(ward_id, province_id)` chặn phường khác tỉnh (`catalog.int.spec.ts`).
- [x] CHECK phạm vi `latitude`/`longitude`; mutation bỏ CHECK làm test đỏ.
- [x] FK `RESTRICT`, không cascade; xóa tỉnh còn phường bị chặn.
- [x] 5 bảng `ENABLE + FORCE RLS`; có trong `RLS_TABLES`; `rlsProblems()` (chính là kiểm tra lúc khởi động production) trả rỗng với role app.
- [x] Role app: không scope/tenant đọc được, không ghi được; platform/system ghi được; mutation tắt RLS `provinces` làm test đỏ.
- [x] 8 migration áp tuần tự trên PostgreSQL 16 trống (7 cũ rồi `add_catalog`; migration chỉ tạo đối tượng mới); `db:app-role` chạy 2 lần idempotent.

## PHẦN C — Seed

- [x] File CSV sai định dạng (tiêu đề, mất số 0 đầu mã, tỉnh hai tên, trùng mã xã, thiếu cột, nháy chưa đóng) → dừng, không ghi dòng nào (unit + smoke CLI).
- [x] `db:seed:catalog` chạy 2 lần không nhân dòng (smoke CLI bằng CSV fixture tạm + test tích hợp).
- [x] Create-only: dòng đã sửa tay không bị ghi đè (`catalog.int.spec.ts`).
- [x] Bến xe mẫu chỉ có khi `--with-samples`; production kèm cờ → từ chối; file không phải UTF-8 → từ chối (unit + smoke CLI).
- [ ] Số tỉnh/xã trong DB khớp file chính thức — chờ file của Khanh. Loại xe (4) và tiện ích (6) đúng danh sách đã chốt.

## PHẦN D — API đọc

- [x] 5 route `GET /v1/catalog/*` trả đúng shape, không cần token (`catalog.http.spec.ts`).
- [x] Chỉ trả item `ACTIVE`; không trả `status`/timestamps (serializer cắt field thừa; test DB thật).
- [x] `wards` bắt buộc `provinceId`; `stop-points` lọc `provinceId`/`wardId`/`type` đúng.
- [x] Cursor: mặc định 20, tối đa 100, không lặp/sót item, trang cuối `nextCursor = null`; dòng cursor bị vô hiệu hoá giữa hai trang không làm sót item.
- [x] Query sai → `400 application/problem+json` (7 ca).
- [x] Controller mỏng; logic ở service; không gọi `withSystem/withPlatform` ngoài `iam/`, `database/` (ESLint xanh).

## PHẦN E — Contract

- [x] OpenAPI có 5 path, query param khai báo tường minh, không `security`.
- [x] `openapi.spec.ts` chặn mất route catalog / thiếu `@ApiQuery`.
- [x] `pnpm gen:api-client` (diff chỉ thêm phần catalog) + Dart client sinh lại (v7.25.0 + build_runner); `dart test` 181/181; `dart analyze` 0 error, 9 warning generator (2 mới từ `catalog_api.dart`).

## PHẦN F — Test & regression

- [x] Unit: DTO (default/giới hạn/enum/uuid qua HTTP), service (lọc ACTIVE, cursor, map field), controller.
- [x] Tích hợp Postgres thật bằng role app: invariant, cấu hình policy 5 bảng, RLS đọc/ghi, lọc ACTIVE (kể cả cha INACTIVE), phân trang, seed idempotent (16 test).
- [x] `REQUIRE_DB_TESTS=1` pass, 0 skip: 52/52 file, 490/490 test (25/09/2026, sau khi sửa review).
- [x] Regression IAM-001..005 xanh (cùng lượt chạy trên).
- [x] `pnpm turbo run typecheck lint build` xanh 26/26.

## PHẦN G — Review, CI & đóng task

- [x] `code-reviewer` + `security-auditor` không còn finding blocking/high (1 high H1 đã sửa; bảng xử lý ở todo #7).
- [ ] Smoke guide §5 trên API chạy thật — chưa chạy (cần env đầy đủ + file danh mục). Đã có tương đương: `catalog.http.spec.ts` (route thật) + `catalog.int.spec.ts` (Postgres thật).
- [x] AI journal đã ghi cho code sinh/sửa (5 dòng `add` + 1 `ops` xin file danh mục); thẻ sổ tay RB-08; không commit journal.
- [ ] CI branch xanh — Khanh xác nhận.
- [ ] Sau toàn bộ gate: task row §7.3 → `Done`, PROJECT-STATE cập nhật; không đổi trạng thái Approved của tài liệu SDLC.

## PHẦN H — DoD theo sub-task

| Sub-task | DoD | ✓ |
| --- | --- | --- |
| `.1` Quyết định | Q1–Q4 chốt + API doc cập nhật | [x] |
| `.2` Schema | Migration/invariant/RLS chạy DB thật | [x] |
| `.3` Seed | Idempotent, create-only, tách production (còn chạy với file chính thức) | [ ] |
| `.4` API đọc | 5 route công khai, chỉ ACTIVE, 400 đúng chuẩn | [x] |
| `.5` Contract | OpenAPI + TS/Dart client không drift | [x] |
| `.6` Test | Hạ tầng thật + regression, 0 skip | [x] |
| `.7` Đóng task | Review + CI + state update đúng gate | [ ] |

## PHẦN I — Ranh giới không chặn nghiệm thu

- Admin CRUD/vô hiệu hóa catalog, duyệt StopPoint đề xuất → TASK-ADM-001.
- Operator đề xuất StopPoint, bảng `stop_points` riêng, Goong distance/duration → TASK-TRN-002.
- Gán loại xe/tiện ích cho Vehicle → TASK-TRN-001.
- Tìm kiếm không dấu, gợi ý theo khoảng cách, cache Redis → TASK-TRN-004 hoặc khi đo được tải.
- Bến xe/điểm đón chuẩn cho production → Admin nhập qua TASK-ADM-001 (seed chỉ có bến mẫu cho dev).
