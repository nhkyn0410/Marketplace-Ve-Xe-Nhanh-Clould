# TASK-TRN-002 — Guide kiểm chứng: Route + StopPoint + Goong

> Mục tiêu: chứng minh Operator Owner quản lý Route/StopPoint đúng tenant, proposal đi đúng state và distance/duration chỉ được tính lúc cấu hình rồi lưu DB.
> Phạm vi/quyết định: `TRN-002-todo.md`. Checklist nghiệm thu: `TRN-002-verification-checklist.md`.
> **Hiện tại:** Q1–Q8 đã chốt 26/09/2026; code + test tự động đã chạy (evidence ở todo). Smoke HTTP §3 chưa chạy.

## 0. Gate trước khi chạy

- [x] Q1–Q8 trong `TRN-002-todo.md` đã được Khanh chốt (26/09/2026).
- [x] API §7.3, DB §5.2/§7, Security §7, GLOSSARY đã đồng bộ, không đổi trạng thái Approved.
- [ ] Dev: `GOONG_API_KEY` để trống → route dùng số ước lượng (`metricsSource = ESTIMATE`, log cảnh báo). Muốn thử Goong thật thì đặt key vào `apps/api/.env.development` (không commit).
- [ ] `pnpm install` xong; đang ở nhánh `TASK-TRN-002`.
- [ ] PostgreSQL 16 + Redis 7 + MongoDB 7 chạy theo [RB-05](../runbook/RB-05-local-infra.md).
- [ ] `DATABASE_URL` dùng role app; `MIGRATION_DATABASE_URL` dùng owner.
- [ ] Catalog có tỉnh/phường/StopPoint chuẩn `ACTIVE`.
- [ ] Test dùng fake `RoutingProvider`; không dùng quota/key Goong thật trong CI.

## 1. Migrate và kiểm RLS

```powershell
pnpm --filter @vexenhanh/api run prisma:migrate:deploy
pnpm --filter @vexenhanh/api run db:app-role
pnpm --filter @vexenhanh/api run prisma:generate
```

Kiểm bằng owner; thay danh sách bảng theo contract đã duyệt:

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN ('routes', 'route_stops', 'stop_points', 'stop_point_proposals');
```

Kỳ vọng mọi bảng Operator-owned có `relrowsecurity = true` và `relforcerowsecurity = true`.

## 2. Test tự động

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm --filter @vexenhanh/api run typecheck
pnpm --filter @vexenhanh/api run lint
pnpm --filter @vexenhanh/api run build
```

Không chấp nhận integration test bị skip. Test provider phải fake/mocked, xác nhận số lần gọi; không gọi Internet.

## 3. Smoke HTTP sau khi contract được duyệt

Cần access token Operator Owner đã qua MFA. Không lưu token vào file.

```powershell
$api = "http://localhost:3001/v1"
$headers = @{ Authorization = "Bearer <OWNER_ACCESS_TOKEN>" }
$catalog = Invoke-RestMethod "$api/catalog/stop-points?limit=20"
```

### 3A. StopPoint riêng

Gửi payload theo DTO đã duyệt với `name`, `address`, `provinceId`, `wardId`, `latitude`, `longitude`, `type`, `description`, `status`.

Kỳ vọng:

- Tạo/list/detail/update chỉ thấy dữ liệu tenant hiện tại.
- Phường không thuộc tỉnh, tọa độ ngoài range hoặc type lạ → 400/422 theo contract, không ghi DB.
- Token tenant B đọc/sửa id tenant A → 404.
- Điểm `INACTIVE` không được gắn mới vào Route.

### 3B. Proposal

Tạo proposal, kiểm trạng thái ban đầu `PENDING`. Với fixture `REJECTED`, sửa payload + resubmit phải quay về `PENDING`; proposal `PENDING/APPROVED` không được Operator sửa.

Admin duyệt/từ chối bằng HTTP không thuộc guide này; tạo fixture bằng owner/platform helper trong integration test cho tới `TASK-ADM-001`.

### 3C. Route

Tạo route với ít nhất hai stop theo thứ tự. Fake provider trả metrics xác định để kiểm:

- RouteStop thứ hai trở đi lưu distance/duration từ điểm trước.
- Route lưu tổng đúng bằng tổng legs.
- GET/list không tăng số lần gọi provider.
- PUT chỉ đổi tên/ghi chú không gọi lại provider.
- PUT đổi thứ tự/tọa độ gọi lại đúng một lần và thay toàn bộ metrics nguyên tử.

Kỳ vọng lỗi: dưới hai điểm; đầu/cuối trùng; sequence/role sai; point lặp; catalog/private point INACTIVE; private point tenant khác; provider timeout/response thiếu leg.

## 4. OpenAPI và client

```powershell
pnpm gen:api-client
```

Sinh client Dart theo [RB-04](../runbook/RB-04-api-client.md). Kiểm `git diff`: chỉ contract TRN-002 thay đổi.

## 5. Production rollout

Chỉ sau CI và review: backup → migrate bằng owner → `db:app-role` → **đặt `GOONG_API_KEY` trên Render (service `vexenhanh-api`; worker chưa bật production) TRƯỚC khi deploy** → deploy API → smoke bằng Operator thử. Thiếu key thì API production **từ chối khởi động** (env fail-fast, Q8) — đây là chủ đích, không phải lỗi. Không ghi key/token vào log hoặc file.

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence.
- Unit mock không thay bằng chứng RLS/FK/CHECK trên PostgreSQL thật.
- Không tự promote tài liệu SDLC sang Approved.
- Không chạy Goong thật trong test suite/CI; smoke vendor thủ công chỉ thực hiện khi có key và quota được Khanh cho phép.
