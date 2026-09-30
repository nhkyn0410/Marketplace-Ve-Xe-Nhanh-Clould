# TASK-TRN-003 — Checklist nghiệm thu: Trip + TripStop + TripSeat

> Mục tiêu: chuyến nháp của nhà xe có schema + RLS + ràng buộc chống trùng xe ở DB, điểm dừng/ghế sinh đúng, API Owner đúng tenant, và SeatMap đang được chuyến dùng không sửa được.
> Chạy theo thứ tự **A → H**; chỉ tick `[x]` khi có evidence. Lệnh: `TRN-003-guide.md`. Phạm vi/sub-task: `TRN-003-todo.md`.

## Snapshot trạng thái (30/09/2026)

- [x] Đã đối chiếu SDLC/code và tạo bộ ba todo/guide/checklist.
- [x] Q1–Q6 được Khanh chốt 30/09/2026.

## PHẦN A — Quyết định & ranh giới

- [x] Q1: không có thời gian đệm quay đầu — xe rảnh ngay tại giờ đến.
- [ ] SRS `BR-14` sửa câu chữ cho khớp Q1 — chờ Khanh xác nhận.
- [x] Q2–Q6 theo khuyến nghị; API §7.3, DB §7, Security §7, file 11 cập nhật (giữ trạng thái Review).
- [x] Không kéo mở bán/khoá/huỷ, fare, search, lịch lặp, sửa chuyến đã bán, Employee/Admin vào TRN-003.

## PHẦN B — Schema, migration & RLS

- [x] 3 bảng + 2 enum đúng migration `20260930100000_add_trip`; mọi bảng có `operator_id`.
- [x] 3 bảng `ENABLE + FORCE RLS`, policy `tenant_isolation`; có trong `RLS_TABLES`; `rlsProblems()` rỗng (`trip.int.spec.ts`).
- [x] Tenant B không đọc/sửa/xoá chuyến, điểm, ghế của A dù query quên lọc; không ngữ cảnh → 0 dòng.
- [x] FK ghép chặn chuyến của A gắn route/xe của B, kể cả đi đường system.
- [x] CHECK giờ đến sau giờ đi (ghi thẳng DB vẫn bị chặn).
- [x] EXCLUDE `trips_vehicle_no_overlap` tồn tại (`contype = 'x'`).
- [x] 12 migration áp tuần tự trên PostgreSQL 16 trống; `db:app-role` pass; `prisma migrate diff` rỗng; `migrate status` up to date.
- [x] Mutation: bỏ EXCLUDE → 4 test đỏ; tắt RLS `trip_seats` → 2 test đỏ; bỏ FK ghép route → 1 test đỏ.

## PHẦN C — Tạo chuyến

- [x] Điểm dừng chép đúng thứ tự/vai trò/nguồn từ route; giờ chia theo tỉ lệ chặng (điểm giữa ở 1/3 khi chặng 60 s + 120 s).
- [x] `stopTimes` do Operator gửi được giữ nguyên; sai số điểm → 422 `TRIP_STOP_TIMES_INVALID`.
- [x] Ghế đủ số ghế của SeatMap, đều `AVAILABLE`, mã đúng; chuyến chưa gắn xe → 0 ghế.
- [x] Route ngừng dùng → 422 `ROUTE_UNAVAILABLE`; xe bảo dưỡng / chưa có sơ đồ → 422 `VEHICLE_UNAVAILABLE`.
- [x] Route/xe của tenant khác → 422 (như không tồn tại); chuyến của A với token B → 404.

## PHẦN D — BR-14 chống trùng xe

- [x] Chồng giờ ở 4 kiểu (bao đầu, bao cuối, nằm trong, bao trùm) → 409 `VEHICLE_SCHEDULE_CONFLICT`.
- [x] Khởi hành đúng giờ đến chuyến trước → được (không đệm quay đầu).
- [x] Xe khác / chuyến không xe không bị ảnh hưởng; chuyến `CANCELLED` không giữ xe.
- [x] Hai request đồng thời cùng xe trùng giờ → đúng một thành công (5 vòng).

## PHẦN E — Sửa chuyến (PUT)

- [x] Giữ xe → ghế giữ nguyên trạng thái (ghế `BLOCKED` còn nguyên); đổi xe → sinh lại ghế; bỏ xe → 0 ghế; điểm dừng chép lại theo route mới.
- [x] Route/xe đang gắn đã ngừng dùng vẫn sửa được chuyến; route mới ngừng dùng → 422.
- [x] Dời giờ chồng chuyến khác của xe → 409; dời trong khoảng của chính nó → được.
- [x] Chuyến đã rời `DRAFT` → 409 `TRIP_NOT_EDITABLE`, dữ liệu không đổi.

## PHẦN F — UC-12 A3 & List

- [x] `PUT` SeatMap đang được chuyến chưa kết thúc dùng → 409 `SEAT_MAP_IN_USE`; đổi SeatMap của xe → 409; sửa trường khác của xe vẫn được; chuyến huỷ → mở khoá.
- [x] Ghế chuyến là bản chụp — không đổi theo SeatMap.
- [x] List sắp theo giờ đi; cursor không lặp/sót kể cả trùng giờ đi; lọc route/xe/trạng thái/khoảng giờ; cursor lạ → trang rỗng.

## PHẦN G — Contract & quyền

- [x] OpenAPI có 4 route trip, Bearer, requestBody POST/PUT, path param, 409/422, query list khai tường minh (`openapi.spec.ts`).
- [x] HTTP: Owner được; không token 401; Driver/TicketStaff/SupportStaff/PlatformAdmin/PlatformSupport 403; body lạ (`status`, `operatorId`) bị bỏ; dữ liệu sai 400 không gọi service (`trip.http.spec.ts`).
- [x] Client TS sinh lại (chỉ thêm phần trip); Dart client v7.25.0 + `build_runner`; `dart analyze` 0 error; `dart test` 474/474; phép so CI Contract khớp.

## PHẦN H — Test, review, CI & đóng task

- [x] `REQUIRE_DB_TESTS=1`, role app, Postgres 16 + Redis 7 + Mongo 7: 67/67 file, **783/783** test, 0 skip (sau khi sửa review).
- [x] `pnpm turbo run lint typecheck test build --force` 35/35.
- [x] `code-reviewer` + `security-auditor` không còn finding blocking/high (bảng xử lý ở todo #7).
- [x] Đồng thời: hai `PUT` (đổi xe ↔ giữ xe), `PUT` xe đổi sơ đồ cùng lúc tạo chuyến, nháp quá hạn dời lịch, mốc giờ chỉ cho `DRAFT` — 4 test đỏ ổn định với code trước review, xanh sau sửa.
- [x] Mutation: EXCLUDE thiếu `operator_id` → test "không lộ lịch B" đỏ.
- [ ] Smoke guide §3 đầy đủ (token Owner qua MFA) — chưa chạy. Đã có: API build chạy thật trả `/v1/health` 200, `/v1/operator/trips` không token → 401 RFC 7807, OpenAPI runtime có 2 path trip; cộng `trip.http.spec.ts` (route + guard thật) và `trip.int.spec.ts` (Postgres thật).
- [x] AI journal đã ghi; không commit journal.
- [ ] CI branch xanh — Khanh xác nhận.
- [ ] Màn Operator OS (danh sách + form chuyến) — sub-task #8.
- [ ] Task row §7.3 → `Done`; không đổi trạng thái tài liệu SDLC.
