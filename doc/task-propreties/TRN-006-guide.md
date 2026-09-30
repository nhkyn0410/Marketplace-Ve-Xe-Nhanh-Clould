# TASK-TRN-006 — Guide kiểm chứng: vòng đời bán chuyến (chưa có vé) + khóa ghế thủ công

> Mục tiêu: chứng minh Operator Owner mở bán / khóa (tạm dừng) / mở lại / thu hồi về nháp / hủy chuyến **chưa có vé** đúng bảng chuyển trạng thái, mở bán bị chặn kèm **mọi** lý do khi chưa đủ điều kiện (BR-39), khóa / mở ghế theo lô không làm mất ghế đã bán ngoài Platform, và mọi đổi trạng thái có audit.
> Phạm vi/quyết định: `TRN-006-todo.md`. Checklist nghiệm thu: `TRN-006-verification-checklist.md`.
> **Hiện tại:** Q1–Q8 đã chốt 30/09/2026 (theo khuyến nghị); code + test tự động đã chạy (evidence ở checklist). Smoke HTTP §3 chưa chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q8 trong `TRN-006-todo.md` đã được Khanh chốt (30/09/2026).
- [x] SRS v1.31, GLOSSARY, LLD v0.12, DB v0.18, API v0.16, Security v0.13, Test plan v0.9, file 11 v0.29 đã đồng bộ, không đổi trạng thái tài liệu.
- [ ] `pnpm install` xong; đang ở nhánh `TASK-TRN-006` (đã có code TRN-003 + TRN-005).
- [ ] PostgreSQL 16 + Redis 7 + **MongoDB 7** chạy theo [RB-05](../runbook/RB-05-local-infra.md) — đổi trạng thái chuyến ghi audit Mongo.
- [ ] `DATABASE_URL` dùng role app; `MIGRATION_DATABASE_URL` dùng owner; `MONGODB_AUDIT_URI` trỏ Mongo audit.
- [ ] Có tuyến `ACTIVE` + bảng giá `ACTIVE` (TRN-005) có giá cho loại xe + mọi loại chỗ; xe `ACTIVE` gắn sơ đồ ghế (TRN-001).

## 1. Migrate và kiểm ràng buộc

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Kiểm bằng owner:

```sql
SELECT column_name, column_default FROM information_schema.columns
WHERE table_name = 'trips' AND column_name IN ('online_sale_cutoff_minutes', 'status_reason');
SELECT conname FROM pg_constraint WHERE conrelid = 'trips'::regclass AND contype = 'c' ORDER BY conname;
```

Kỳ vọng: `online_sale_cutoff_minutes` mặc định `60`, `status_reason` không mặc định; có CHECK `trips_online_sale_cutoff_range`, `trips_cancel_requires_reason` (cùng `trips_arrival_after_departure` cũ).

## 2. Test tự động

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Không chấp nhận integration test bị skip. `trip-sale.int.spec.ts` cần cả Postgres lẫn Mongo thật.

## 3. Smoke HTTP

Cần access token Operator Owner đã qua MFA. Không lưu token vào file.

```powershell
$api = "http://localhost:3001/v1/operator"
$headers = @{ Authorization = "Bearer <OWNER_ACCESS_TOKEN>"; "Content-Type" = "application/json" }
$open = @{ status = "OPEN_FOR_SALE"; reason = $null } | ConvertTo-Json
Invoke-RestMethod "$api/trips/<TRIP_ID>/status" -Method Put -Headers $headers -Body $open
$block = @{ seatCodes = @("A1", "A2"); status = "BLOCKED"; note = "Bán tại quầy" } | ConvertTo-Json
Invoke-RestMethod "$api/trips/<TRIP_ID>/seats/status" -Method Put -Headers $headers -Body $block
```

Kỳ vọng:

- **3A — Điều kiện mở bán:** chuyến chưa gắn xe / tuyến chưa có bảng giá / sát giờ đi → 422 `TRIP_NOT_READY_FOR_SALE`, body có `reasons` liệt kê đủ (vd `["VEHICLE_MISSING","FARE_MISSING","SALE_WINDOW_CLOSED"]`); đủ điều kiện → 200 `status = OPEN_FOR_SALE`.
- **3B — Chuyển trạng thái:** `LOCKED` (kèm lý do) → `statusReason` hiện lý do; mở lại → `OPEN_FOR_SALE`; `DRAFT` → sửa được bằng `PUT /trips/{id}`; `CANCELLED` không lý do → 400; có lý do → 200, sau đó mọi chuyển khác → 409 `TRIP_STATUS_TRANSITION_INVALID`.
- **3C — Khóa ghế:** A1, A2 → `BLOCKED`; gửi lại → 200 không đổi; mã `ZZ` → 422 `TRIP_SEAT_UNKNOWN` (A1 không đổi); chuyến đã hủy → 409 `TRIP_NOT_EDITABLE`. Đổi xe (thu hồi nháp → `PUT` xe khác có A1, A2) → ghế vẫn `BLOCKED`; xe mới thiếu A2 → 409 `TRIP_BLOCKED_SEATS_MISSING`.
- **3D — Tenant / quyền:** token nhà xe khác → 404; không token → 401; token Employee / Platform → 403.
- **3E — Audit:** Mongo `audit_event` có `trip.status.change` (trước / sau, lý do) cho mỗi lần đổi trạng thái; `trip.seats.block` / `trip.seats.unblock` chỉ liệt kê ghế thực sự đổi.

## 4. OpenAPI và client

```powershell
pnpm gen:api-client
```

Sinh client Dart theo [RB-04](../runbook/RB-04-api-client.md). Kiểm `git diff`: chỉ contract TRN-006 thay đổi (2 route, 2 DTO, 2 trường chuyến, `reasons`).

## 5. Production rollout

Chỉ sau CI và review, **sau** TRN-003 + TRN-005: backup → migrate bằng owner (`trip_sale_lifecycle`) → `db:app-role` → deploy API. Chuyến cũ nhận `online_sale_cutoff_minutes = 60`. Đổi trạng thái chuyến cần Mongo audit sống (Mongo sập / chậm quá 2 giây → 503, chuyến không đổi); khóa ghế vẫn chạy khi Mongo sập (audit bỏ qua, có log lỗi).

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence.
- Chưa có giữ ghế / booking (BTP-001/002): "chuyến đã có vé" hiện chỉ thử bằng ghi thẳng `BOOKED` vào DB trong test.
- Không tự promote tài liệu SDLC.
