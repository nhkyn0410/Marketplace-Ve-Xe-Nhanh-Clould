# TASK-IAM-006 — Guide kiểm chứng: Web auth Operator OS + Admin

> Mục tiêu: chứng minh web đăng nhập bằng cookie httpOnly an toàn (CSRF + Origin + CORS đúng contract OQ-05) mà Mobile vẫn dùng JSON/Bearer như cũ.
> Phạm vi/quyết định: `IAM-006-todo.md`. Checklist nghiệm thu: `IAM-006-verification-checklist.md`.
> **Hiện tại (27/09/2026):** code xong, test + E2E xanh local; đang review. Evidence ở checklist.

## 0. Gate trước khi chạy

- [x] Q1–Q4 trong `IAM-006-todo.md` đã chốt.
- [ ] `pnpm install`; nhánh `TASK-IAM-006`.
- [ ] Postgres 16 + Redis 7 + Mongo 7 chạy ([RB-05](../runbook/RB-05-local-infra.md)); nếu cổng mặc định bị checkout khác chiếm thì dựng container riêng cổng khác.
- [ ] `apps/api/.env.development`: `OPERATOR_WEB_ORIGINS` (mặc định `http://localhost:3002`) + `ADMIN_WEB_ORIGINS` (mặc định `http://localhost:3003`), `WEB_CSRF_SECRET` (base64 32 byte: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`). Không commit.
- [ ] Dùng **`localhost`** thống nhất (không trộn `127.0.0.1`) — cookie `SameSite` tính theo site.
- [ ] Tài khoản thử: Owner mới (mật khẩu tạm, chưa TOTP) + Platform admin (seed IAM-001).

## 1. Test tự động

```powershell
$env:REQUIRE_DB_TESTS = "1"
pnpm --filter @vexenhanh/api test
pnpm turbo run typecheck lint build
```

## 2. Smoke API bằng curl (cookie mode)

```bash
API=http://localhost:3000/v1
ORIGIN=http://localhost:3002
# 1) Lấy CSRF: cookie vxn_csrf + body csrfToken
curl -si -c jar.txt -H "Origin: $ORIGIN" "$API/auth/csrf"
# 2) Login cookie mode (thay <CSRF> bằng csrfToken ở bước 1)
curl -si -b jar.txt -c jar.txt -H "Origin: $ORIGIN" -H "X-Auth-Transport: cookie" \
  -H "X-CSRF-Token: <CSRF>" -H "Content-Type: application/json" \
  -d '{"identifier":"<slug>/<username>","password":"<password>"}' "$API/auth/operator/login"
```

Kỳ vọng:

- Response login cookie mode **không** có `accessToken`/`refreshToken`; khi đã cấp session có `Set-Cookie` đủ 3 cookie đúng flags (bảng API §7.1.1) và header `X-CSRF-Token` mới.
- Bỏ `X-CSRF-Token` hoặc đổi `Origin` sang `http://evil.test` → 403 `AUTH_CSRF_INVALID` / `AUTH_ORIGIN_FORBIDDEN`.
- `X-Auth-Transport: foo` → 400 `AUTH_TRANSPORT_INVALID`; gửi cả `Authorization: Bearer …` lẫn cookie `vxn_access` → 400 `AUTH_TRANSPORT_AMBIGUOUS`.
- `OPTIONS` preflight từ origin hợp lệ → 204 kèm `Access-Control-Allow-Origin` đúng origin, `Access-Control-Allow-Credentials: true`, `Vary: Origin`; origin lạ → không có header allow.
- Không gửi `X-Auth-Transport` (Mobile) → response JSON token như trước, không `Set-Cookie`.
- Xoá file `jar.txt` sau khi thử (chứa cookie phiên).

## 3. Smoke trình duyệt + E2E Playwright (TC-SEC-008)

```powershell
pnpm --filter @vexenhanh/api build
pnpm --filter @vexenhanh/api start          # API http://localhost:3000 (DB đã migrate + db:app-role)
# E2E: Playwright tự bật Next dev 3002/3003; global-setup seed tài khoản ngẫu nhiên (cần MIGRATION_DATABASE_URL)
$env:PLAYWRIGHT_CHANNEL = "chrome"          # dùng Chrome đã cài; bỏ trống thì cần `npx playwright install chromium`
pnpm --filter @vexenhanh/operator-os test:e2e
pnpm --filter @vexenhanh/admin test:e2e
```

Seed E2E: `apps/api/prisma/e2e-web-auth-seed.ts` (từ chối production, mỗi lần chạy tạo nhà xe/tài khoản mới, mật khẩu chỉ nằm trong biến môi trường của tiến trình test).

- **Operator OS (Owner mới):** login bằng mật khẩu tạm → form đổi mật khẩu → quay về login → login lại → enrollment TOTP (QR + secret) → nhập mã → hiện backup code **một lần** → vào shell. Reload trang vẫn ở trong app (bootstrap `/auth/me`). DevTools: 3 cookie đúng flags, JS không đọc được `vxn_access`/`vxn_refresh`.
- **Hết hạn access:** xoá cookie `vxn_access` → reload → đúng **một** request `/auth/refresh` rồi vào lại app.
- **Logout:** cookie bị xoá; reload vẫn ở màn đăng nhập.
- **Nhân viên:** `{slug}/nv.{tên}` ở Operator OS → "Tên đăng nhập hoặc mật khẩu không đúng." (cổng Owner không tra bảng nhân viên), không có phiên. App Nhân viên dùng `/auth/employee/login` (Bearer).
- **Sai cổng (M1):** đang có phiên Admin, mở Operator OS → form đăng nhập + thông báo "không thuộc Trang quản lý nhà xe" (API chặn theo origin), phiên Admin không bị đăng xuất.
- **Admin:** `platform/<username>` → TOTP → shell. Tài khoản nhà xe ở Admin → "Tên đăng nhập hoặc mật khẩu không đúng.", không vào shell.
- **Return URL:** login hiển thị ngay tại URL đang mở (không có `?returnTo=`) → sau login ở lại đúng trang, không có tham số redirect để lạm dụng.
- **Một phiên/trình duyệt:** Operator OS và Admin dùng chung host API nên đăng nhập cổng này ghi đè cookie cổng kia (giới hạn topology, xem todo A7).

## 4. OpenAPI và client

`pnpm gen:api-client` + client Dart theo [RB-04](../runbook/RB-04-api-client.md): chỉ thêm `/auth/csrf`, `/auth/me` và header mới.

## 5. Production rollout

Custom domain same-site theo Deploy §4 (`api.` / `operator.` / `admin.` cùng `vexenhanh.vn`) → đặt `OPERATOR_WEB_ORIGINS` + `ADMIN_WEB_ORIGINS` (exact HTTPS, mỗi app một danh sách) + `WEB_CSRF_SECRET` trên Render → deploy API → deploy 2 app web → smoke §3 trên staging. Không dùng domain preview ngẫu nhiên cho cookie mode.

## Lưu ý phạm vi

- Không tick checklist nếu chưa có evidence.
- Không tự promote tài liệu SDLC sang Approved.
- Không lưu cookie/token/backup code vào file, log hay ảnh chụp màn hình commit.
