# TASK-TRN-005 — Guide kiểm chứng: Fare + FareRule

> Mục tiêu: chứng minh Operator Owner tạo/sửa bảng giá theo tuyến đúng tenant, giá ghế của chuyến lấy đúng rule cụ thể nhất theo loại xe × loại chỗ × giờ khởi hành, và mọi lần đổi giá có lịch sử (audit Mongo) — audit lỗi thì không đổi giá.
> Phạm vi/quyết định: `TRN-005-todo.md`. Checklist nghiệm thu: `TRN-005-verification-checklist.md`.
> **Hiện tại:** Q1–Q7 đã chốt 30/09/2026; code + test tự động đã chạy (evidence ở todo). Smoke HTTP §3 chưa chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q7 trong `TRN-005-todo.md` đã được Khanh chốt (30/09/2026).
- [x] SRS, GLOSSARY, HLD, LLD, DB, API, Security, Test plan, file 11 đã đồng bộ, không đổi trạng thái tài liệu.
- [ ] `pnpm install` xong; đang ở nhánh `TASK-TRN-005` (đã có code TRN-003).
- [ ] PostgreSQL 16 + Redis 7 + **MongoDB 7** chạy theo [RB-05](../runbook/RB-05-local-infra.md) — lịch sử giá cần Mongo.
- [ ] `DATABASE_URL` dùng role app; `MIGRATION_DATABASE_URL` dùng owner; `MONGODB_AUDIT_URI` trỏ Mongo audit.
- [ ] Catalog có loại xe `ACTIVE` (vd Giường nằm, Limousine); có tuyến `ACTIVE` (TRN-002) và xe gắn sơ đồ ghế (TRN-001).

## 1. Migrate và kiểm RLS + ràng buộc

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Kiểm bằng owner:

```sql
SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('fares', 'fare_rules');
SELECT conname FROM pg_constraint WHERE conrelid = 'fare_rules'::regclass AND contype IN ('x', 'c') ORDER BY conname;
```

Kỳ vọng: 2 bảng `true/true`; có `fare_rules_base_unique`, `fare_rules_window_no_overlap` (EXCLUDE), `fare_rules_price_non_negative`, `fare_rules_window_consistent` (CHECK).

## 2. Test tự động

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Không chấp nhận integration test bị skip. `fare.int.spec.ts` cần cả Postgres lẫn Mongo thật.

## 3. Smoke HTTP

Cần access token Operator Owner đã qua MFA. Không lưu token vào file.

```powershell
$api = "http://localhost:3001/v1/operator"
$headers = @{ Authorization = "Bearer <OWNER_ACCESS_TOKEN>"; "Content-Type" = "application/json" }
$body = @{
  routeId = "<ROUTE_ID>"; status = "ACTIVE"; note = $null
  rules = @(
    @{ vehicleTypeId = "<SLEEPER_ID>"; seatType = $null; validFrom = $null; validTo = $null; price = 300000 },
    @{ vehicleTypeId = "<LIMOUSINE_ID>"; seatType = $null; validFrom = $null; validTo = $null; price = 450000 },
    @{ vehicleTypeId = $null; seatType = $null; validFrom = "2032-01-20T00:00:00+07:00"; validTo = "2032-01-27T00:00:00+07:00"; price = 600000 }
  )
} | ConvertTo-Json -Depth 5
$fare = Invoke-RestMethod "$api/fares" -Method Post -Headers $headers -Body $body
```

Kỳ vọng:

- **3A — Tạo / sửa:** 201; `GET /fares/{id}` trả rule sắp giá thường trước; tạo lần hai cho cùng tuyến → 409 `FARE_ROUTE_CONFLICT`; hai rule cùng loại xe × loại chỗ trùng → 400 `FARE_RULES_OVERLAP`.
- **3B — Giá ghế:** `GET /trips/{tripId}` của chuyến trên tuyến đó: xe giường nằm → 300.000; đổi sang xe Limousine (`PUT /trips/{id}`) → 450.000; chuyến khởi hành trong khung Tết → 600.000; `PUT /fares/{id}` với `status = INACTIVE` → `price = null`.
- **3C — Lịch sử:** `GET /fares/{id}/revisions` trả mỗi lần tạo/sửa một dòng, mới nhất trước, `before` của lần sửa = `after` của lần trước.
- **3D — Tenant / quyền:** token nhà xe khác → 404 ở `GET/PUT/revisions`, `routeId` của nhà xe khác → 422; không token → 401; token Employee / Platform → 403.

## 4. OpenAPI và client

```powershell
pnpm gen:api-client
```

Sinh client Dart theo [RB-04](../runbook/RB-04-api-client.md). Kiểm `git diff`: chỉ contract TRN-005 thay đổi.

## 5. Production rollout

Chỉ sau CI và review: backup → migrate bằng owner → `db:app-role` → deploy API. Sửa giá cần Mongo audit sống (Mongo sập → sửa giá bị từ chối, giống thao tác tài khoản IAM) — kiểm `/v1/health/mongo` trước khi mở tính năng.

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence.
- Unit mock không thay bằng chứng RLS/CHECK/EXCLUDE trên PostgreSQL thật.
- Không tự promote tài liệu SDLC.
