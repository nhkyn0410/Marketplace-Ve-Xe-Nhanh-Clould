# TASK-IAM-006 — Checklist nghiệm thu: Web auth Operator OS + Admin

> Mục tiêu: web đăng nhập bằng cookie httpOnly đúng contract OQ-05; CSRF/Origin/CORS chặn đúng; Mobile JSON/Bearer không đổi.
> Chạy theo thứ tự **A → G**; chỉ tick `[x]` khi có evidence. Lệnh: `IAM-006-guide.md`. Phạm vi: `IAM-006-todo.md`.

## Snapshot trạng thái (27/09/2026)

- [x] Tạo bộ ba todo/guide/checklist; nhánh `TASK-IAM-006` từ `develop` (`5eb6b75`).
- [x] Q1–Q4 được Khanh chốt; task row `Ready → In Progress` (11 Task v0.19).
- [ ] Khanh đặt `OPERATOR_WEB_ORIGINS` + `ADMIN_WEB_ORIGINS` + `WEB_CSRF_SECRET` trên Render trước khi deploy (production thiếu → API không khởi động); kiểm không có Owner dùng `nv.`.

## PHẦN A — Quyết định & ranh giới

- [x] Q1 viết riêng từng app · Q2 QR (`qrcode`) + secret · Q3 Playwright tối thiểu trong task · Q4 Employee vào Operator OS → báo không có dữ liệu + thu hồi phiên.
- [x] Tài liệu Q4 cập nhật theo yêu cầu Khanh: UI v0.6 §4/§7, API v0.10 §7.1/§7.1.1, Test v0.4 TC-SEC-008.
- [x] Không kéo auth Passenger/Marketplace, Employee mobile, màn nghiệp vụ, Platform employee, recovery MFA.

## PHẦN B — BE transport & cookie

- [x] `X-Auth-Transport` áp đúng 6 endpoint (+ khai OpenAPI); thiếu = bearer; lạ = 400 `AUTH_TRANSPORT_INVALID` (`auth-transport.spec`, `web-auth.http.spec`).
- [x] Cookie mode: `vxn_access` (HttpOnly, Lax, `/v1`, 900 s), `vxn_refresh` (HttpOnly, Strict, `/v1/auth/refresh`, 30 ngày), `vxn_csrf` (không HttpOnly, Strict, `/v1`); host-only; có `Max-Age` + `Expires`; `Secure` ở production (`web-auth.service.spec`).
- [x] Body cookie mode không có access/refresh token thô; `backupCodes` đúng một lần khi vừa enrollment (HTTP + DB thật).
- [x] Bearer + `vxn_access` cùng lúc → 400 `AUTH_TRANSPORT_AMBIGUOUS` (GET và unsafe).
- [x] Logout / refresh hỏng (reuse, hết hạn) / revoke current family xoá cả 3 cookie đúng Path (Max-Age=0); revoke family khác không xoá.
- [x] Hồi quy Mobile: không header → JSON token, không `Set-Cookie` (HTTP + DB thật); IAM-001..005 xanh; Dart client 423/423, 2 app Flutter analyze sạch.

## PHẦN C — CSRF / Origin / CORS / bootstrap

- [x] `GET /auth/csrf` cấp cookie + `{csrfToken}`, khôi phục token còn hợp lệ; rotate khi cấp session / refresh / đổi mật khẩu.
- [x] Unsafe cookie request trong `/v1/**` (kể cả route nghiệp vụ giả `/probe`) thiếu/sai/cũ/trùng CSRF → 403 `AUTH_CSRF_INVALID`; Origin thiếu/lạ/`null`/khác port → 403 `AUTH_ORIGIN_FORBIDDEN`; Bearer và GET được miễn.
- [x] CORS echo exact origin, `credentials: true`, `Vary: Origin`, không `*`; preflight 204 không qua auth/CSRF; origin lạ không có header CORS.
- [x] `GET /auth/me` đúng field (`sessionId` = family id công khai), `no-store`, không token/secret/backup code, không tự refresh.
- [x] Env `OPERATOR_WEB_ORIGINS` + `ADMIN_WEB_ORIGINS` + `WEB_CSRF_SECRET` fail-fast ở production (thiếu, HTTP, localhost, trùng secret khác); origin không exact hoặc thuộc cả hai app bị từ chối mọi môi trường.
- [x] M1: phiên cookie từ origin app khác scope → 403 `AUTH_ORIGIN_FORBIDDEN` (GET/mutation/login); refresh sai origin bị chặn trước khi xoay, không xoá cookie (HTTP + DB thật).

## PHẦN D — FE Operator OS + Admin

- [x] Bootstrap: CSRF → `/auth/me` → 401 thì refresh single-flight đúng một lần → retry; thất bại về login (Vitest + Playwright đếm đúng 1 `/auth/refresh`).
- [x] First login Owner: mật khẩu tạm → đổi → login lại → TOTP enrollment (QR + secret) → backup code một lần → shell; reload giữ phiên.
- [x] Admin: `platform/{username}` → TOTP → shell; tài khoản nhà xe ở Admin → lỗi chung, không vào shell.
- [x] Nhân viên ở Operator OS → lỗi đăng nhập chung từ cổng Owner, không có phiên (Playwright).
- [x] Cổng nhân viên `/auth/employee/login` (Bearer, `nv.`) tách khỏi Owner: unit + HTTP + DB thật; migration đổi tên nhân viên cũ và dừng khi Owner dùng `nv.` (thử trên dữ liệu cũ).
- [x] Không render sidebar/dữ liệu trước khi bootstrap xong; login hiển thị tại URL hiện tại (không tham số redirect).
- [x] Logout xoá phiên (cookie mất, reload vẫn ở login); lỗi đăng nhập generic.

## PHẦN E — Contract

- [x] OpenAPI có `/auth/csrf`, `/auth/me`, header transport/CSRF, union login/MFA/refresh; `openapi.spec.ts` khoá các điểm này (và bắt được lỗi thiếu provider làm test bị bỏ qua).
- [x] Client TS + Dart sinh lại, chỉ đổi phần IAM-006 (16 file Dart sửa + 32 file mới).

## PHẦN F — Test & regression

- [x] Vitest BE: TC-SEC-005/006/007 + cookie flags + clear cookie + luồng cookie trên DB thật.
- [x] Test FE auth client: single-flight, retry một lần, CSRF retry, login sai không refresh (6/6 mỗi app).
- [x] E2E TC-SEC-008: Operator 3/3 (gồm nhân viên nhận lỗi chung), Admin 2/2 (Chrome local, API + DB thật) — chạy lại sau tách cổng.
- [x] `REQUIRE_DB_TESTS=1` **734/734**, 0 skip (sau tách cổng + M1 + sửa review); monorepo typecheck/lint/build 26/26, test FE 10/10 mỗi app.

## PHẦN G — Review, CI & đóng task

- [x] `code-reviewer` + `security-auditor` không còn finding blocking/high (2 High + M1/M2 + các Low đã xử lý — bảng todo #8; L2 phần Domain cha để OPS-001).
- [x] Smoke guide §2–§3 có evidence tương đương (HTTP spec + DB int + Playwright).
- [x] AI journal đã ghi; không commit `.ai-journal/`.
- [ ] CI xanh — Khanh xác nhận; task row → `Done`; không đổi trạng thái Approved của tài liệu SDLC.
- [ ] Job CI Playwright (dựng API + DB + 2 app) — để TASK-TEST-001/OPS-001 theo Q3.
