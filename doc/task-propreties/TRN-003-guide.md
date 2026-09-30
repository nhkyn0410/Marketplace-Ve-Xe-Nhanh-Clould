# TASK-TRN-003 — Guide kiểm chứng: Trip + TripStop + TripSeat

> Mục tiêu: chứng minh Operator Owner tạo/sửa chuyến nháp đúng tenant, điểm dừng + ghế sinh đúng từ route/xe, và một xe không bao giờ chạy hai chuyến chồng giờ.
> Phạm vi/quyết định: `TRN-003-todo.md`. Checklist nghiệm thu: `TRN-003-verification-checklist.md`.
> **Hiện tại:** Q1–Q6 đã chốt 30/09/2026; code + test tự động đã chạy (evidence ở todo). Smoke HTTP §3 chưa chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q6 trong `TRN-003-todo.md` đã được Khanh chốt (30/09/2026).
- [x] API §7.3, DB §7, Security §7, file 11 đã đồng bộ, không đổi trạng thái tài liệu.
- [ ] `pnpm install` xong; đang ở nhánh của task.
- [ ] PostgreSQL 16 + Redis 7 + MongoDB 7 chạy theo [RB-05](../runbook/RB-05-local-infra.md).
- [ ] `DATABASE_URL` dùng role app; `MIGRATION_DATABASE_URL` dùng owner.
- [ ] Đã có route (TRN-002) và xe `ACTIVE` gắn SeatMap (TRN-001) của cùng nhà xe.

## 1. Migrate và kiểm RLS + ràng buộc chống trùng xe

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Migration tạo extension `btree_gist` (có sẵn trong Postgres 16 và Supabase) — phải chạy bằng owner. Kiểm bằng owner:

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class WHERE relname IN ('trips', 'trip_stops', 'trip_seats');
SELECT conname, contype FROM pg_constraint WHERE conname = 'trips_vehicle_no_overlap';
```

Kỳ vọng: 3 bảng `true/true`; ràng buộc có `contype = 'x'` (EXCLUDE).

## 2. Test tự động

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Không chấp nhận integration test bị skip. `trip.int.spec.ts` tạo route qua `RouteService` với provider giả (không gọi Goong).

## 3. Smoke HTTP

Cần access token Operator Owner đã qua MFA. Không lưu token vào file.

```powershell
$api = "http://localhost:3001/v1/operator"
$headers = @{ Authorization = "Bearer <OWNER_ACCESS_TOKEN>"; "Content-Type" = "application/json" }
$body = @{ routeId = "<ROUTE_ID>"; vehicleId = "<VEHICLE_ID>"; departureAt = "2031-01-01T07:00:00+07:00"; arrivalAt = "2031-01-01T15:00:00+07:00"; stopTimes = $null; note = $null } | ConvertTo-Json
$trip = Invoke-RestMethod "$api/trips" -Method Post -Headers $headers -Body $body
```

Kỳ vọng:

- **3A — Tạo:** `status = DRAFT`; `stops` đủ điểm của route, giờ điểm đầu/cuối = giờ đi/đến; `seats` đủ số ghế của SeatMap, đều `AVAILABLE`.
- **3B — Trùng xe:** tạo chuyến thứ hai cùng xe chồng giờ → 409 `VEHICLE_SCHEDULE_CONFLICT`; khởi hành đúng giờ đến của chuyến trước → 201.
- **3C — Dữ liệu sai:** giờ đến trước giờ đi / giờ đi quá khứ → 400; route ngừng dùng → 422 `ROUTE_UNAVAILABLE`; xe bảo dưỡng / chưa có sơ đồ → 422 `VEHICLE_UNAVAILABLE`.
- **3D — Tenant:** token nhà xe khác `GET/PUT /trips/{id}` → 404; dùng `routeId`/`vehicleId` của nhà xe khác → 422.
- **3E — UC-12 A3:** `PUT /seat-maps/{id}` của sơ đồ đang được chuyến dùng → 409 `SEAT_MAP_IN_USE`.
- **3F — Quyền:** không token → 401; token Employee / Platform → 403.

## 4. OpenAPI và client

```powershell
pnpm gen:api-client
```

Sinh client Dart theo [RB-04](../runbook/RB-04-api-client.md). Kiểm `git diff`: chỉ contract TRN-003 thay đổi.

## 5. Production rollout

Chỉ sau CI và review: backup → migrate bằng owner (migration tạo extension `btree_gist`; Supabase cho phép role `postgres`) → `db:app-role` → deploy API → smoke bằng Operator thử.

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence.
- Unit mock không thay bằng chứng RLS/FK/CHECK/EXCLUDE trên PostgreSQL thật.
- Không tự promote tài liệu SDLC.
