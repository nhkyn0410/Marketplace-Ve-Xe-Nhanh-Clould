# TASK-TRN-006 — Checklist nghiệm thu: vòng đời bán chuyến + khóa ghế thủ công

> Mục tiêu: chỉ chuyến đủ điều kiện (BR-39) mới mở bán, chuyển trạng thái đúng bảng (LLD §8) kể cả khi request đồng thời, ghế bán ngoài Platform không bị mất khi đổi xe, mọi đổi trạng thái có audit, tenant khác không chạm được.
> Chạy theo thứ tự **A → H**; chỉ tick `[x]` khi có evidence. Lệnh: `TRN-006-guide.md`. Phạm vi/sub-task: `TRN-006-todo.md`.

## Snapshot trạng thái (30/09/2026)

- [x] Tạo nhánh `TASK-TRN-006` (tách từ nhánh TRN-005); todo/guide/checklist.
- [x] Q1–Q8 được Khanh chốt 30/09/2026 theo khuyến nghị; Q5 ghi chú "hệ thống quầy" chưa có trong tài liệu.

## PHẦN A — Quyết định & tài liệu

- [x] Tài liệu đồng bộ **trước khi code** (commit `951a761`): SRS v1.31, GLOSSARY, LLD v0.12, DB v0.18, API v0.16, Security v0.13, Test plan v0.9, file 11 v0.29.
- [x] Cửa sổ đón khách chuyển sang TASK-EMP-002 (file 11); đồng bộ hệ thống quầy / đại lý không làm (chưa có trong tài liệu).
- [x] Không kéo đổi / hủy chuyến đã có vé (TRN-008), giữ ghế Redis (BTP-001), `SOLD_OUT`, Admin khóa chuyến, search (TRN-004) vào task.

## PHẦN B — Schema & migration

- [x] Migration `20260930130000_trip_sale_lifecycle`: `online_sale_cutoff_minutes` (mặc định 60, CHECK 0–1440), `status_reason`, CHECK hủy phải có lý do.
- [x] Ghi thẳng DB (kể cả đường system): hủy không lý do, cutoff −1 / 1441 bị chặn.
- [x] 15 migration áp tuần tự; `db:app-role` pass; `prisma migrate diff` rỗng.

## PHẦN C — Điều kiện mở bán (BR-39, Q3)

- [x] Thiếu nhiều điều kiện → 422 `TRIP_NOT_READY_FOR_SALE` kèm **mọi** lý do; trạng thái và audit không đổi.
- [x] Từng lý do riêng: thiếu giá một loại chỗ, giá 0, xe bảo dưỡng, điểm dừng ngừng dùng, tuyến ngừng dùng, nhà xe bị đình chỉ.
- [x] Biên thời điểm ngừng bán online: đúng mốc là đóng; 0 phút = bán tới giờ khởi hành (unit).
- [x] Khóa → bảng giá tắt → mở lại bị chặn `FARE_MISSING`; bật lại → mở lại được (Q8: chỉ kiểm lúc mở bán / mở lại).
- [x] `reasons` đi qua filter RFC 7807 (chỉ mảng chuỗi) và có trong OpenAPI `ProblemDetailsDto`.

## PHẦN D — Chuyển trạng thái (Q1, Q2)

- [x] Bảng chuyển 10 × 4 cặp đúng LLD §8 (unit); sang chính nó → 409.
- [x] Thu hồi nháp → sửa được bằng `PUT`; hủy có lý do → xe rảnh ngay (gắn lại cùng xe, cùng giờ được); hủy xong không mở lại.
- [x] Chuyến đã có ghế `BOOKED`: thu hồi nháp / hủy → 409; khóa bán vẫn được.
- [x] Hai request mở bán đồng thời → đúng một thành công, một 409, đúng một audit.
- [x] Audit lỗi → 503, trạng thái không đổi. Mutation bỏ kiểm điều kiện mở bán → 3 test đỏ; bỏ chặn chuyến đã có vé → 1 test đỏ.

## PHẦN E — Khóa ghế thủ công (Q5, BR-42)

- [x] Khóa / mở theo lô, ghế đã ở trạng thái đích bỏ qua; audit sau commit chỉ ghi ghế thực sự đổi.
- [x] Được cả lô hoặc không: mã lạ → 422, ghế đã bán → 409, không ghế nào đổi.
- [x] Chuyến hủy → 409 `TRIP_NOT_EDITABLE`; Mongo lỗi vẫn khóa được ghế.
- [x] Đổi xe giữ ghế khóa theo mã; xe mới thiếu ghế đã khóa → 409 `TRIP_BLOCKED_SEATS_MISSING`. Mutation bỏ giữ ghế khóa → test đỏ.

## PHẦN F — Tenant & quyền

- [x] Nhà xe B đổi trạng thái / khóa ghế chuyến của A → 404; query quên lọc vẫn bị RLS chặn.
- [x] HTTP: Owner được; không token 401; Employee / Platform 403; người thực hiện lấy từ token; body không mang `operatorId`; dữ liệu sai 400 không gọi service.

## PHẦN G — Contract

- [x] OpenAPI: 2 route mới (Bearer, requestBody, path param, 400/404/409/422, 503 cho `/status`); chi tiết chuyến có `onlineSaleCutoffMinutes`, `statusReason` (`openapi.spec.ts`).
- [x] Client TS sinh lại (chỉ thêm phần TRN-006, đổi một dòng mô tả); Dart v7.25.0 + `build_runner`: `dart analyze` 0 error, `dart test` 533/533.

## PHẦN H — Test, review, CI & đóng task

- [x] `REQUIRE_DB_TESTS=1`, role app, Postgres 16 + Redis 7 + Mongo 7: 74/74 file, 942/942 test, 0 skip.
- [x] API lint + typecheck + build sạch; typecheck monorepo 10/10.
- [ ] `code-reviewer` + `security-auditor` không còn finding blocking/high.
- [ ] Smoke guide §3 trên API chạy thật — chưa chạy. Tương đương: `trip.http.spec.ts` (route + guard thật) + `trip-sale.int.spec.ts` (Postgres + Mongo thật).
- [x] AI journal đã ghi; không commit journal.
- [ ] CI branch xanh — Khanh xác nhận.
- [ ] Màn Operator OS (mở / khóa bán, sơ đồ ghế khóa) — sau khi có đăng nhập web (M1).
- [ ] Task row §7.3 → `Done`.
