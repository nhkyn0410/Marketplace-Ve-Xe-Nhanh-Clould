# TASK-IAM-006 — Todo: Web auth cho Operator OS + Platform Admin

> **Nguồn task:** `doc/SDLC/11-project-task-breakdown.md` §7.2 — login đúng namespace; state machine mật khẩu tạm → đổi bắt buộc → login lại → TOTP enrollment/verify + backup code một lần → cookie httpOnly; `GET /auth/csrf` + `/auth/me`; protected route; refresh single-flight; logout/revoke + clear cookie; signed double-submit CSRF; exact CORS allowlist. Giữ JSON/Bearer cho Mobile.
> **Contract đã chốt (TASK-OQ-05, 25/09/2026):** API §7.1.1–§7.1.2 · Security §5.1/§11 · LLD §6.5 bước 2–8 + §7 (4 mã lỗi) · UI §7 (bảng trạng thái auth) + §9 · Test TC-SEC-005..008 · Deploy §4 topology + `CORS_ALLOWED_ORIGINS`, `WEB_CSRF_SECRET` · GLOSSARY `AUTH_TRANSPORT_*`, `AUTH_CSRF_INVALID`, `AUTH_ORIGIN_FORBIDDEN`.
> **Dependency:** TASK-FND-010, TASK-IAM-004, TASK-IAM-005 — đều Done.
> **Mở khóa:** màn nghiệp vụ Operator OS (Xe/SeatMap TRN-001, Route/StopPoint TRN-002, …) và Admin.
> **Cách dùng:** Guide `IAM-006-guide.md`. Nghiệm thu `IAM-006-verification-checklist.md`.

## Trạng thái (27/09/2026) — 🔍 **CODE XONG, ĐANG REVIEW** (Q1–Q4 đã chốt)

- ⚠️ **Trước khi merge/deploy:** Khanh đặt `OPERATOR_WEB_ORIGINS` + `ADMIN_WEB_ORIGINS` + `WEB_CSRF_SECRET` trên Render (`vexenhanh-api`) — production thiếu thì API không khởi động; kiểm không có Owner dùng tiền tố `nv.` (migration sẽ dừng).
- ✅ **Vòng 2 (27/09/2026, Khanh chốt):** tách cổng đăng nhập nhân viên `/auth/employee/login` + tiền tố `nv.` (amend ADR-017) — nhật ký: `IAM-006-nhat-ky-tach-login-nhan-vien.md`; M1 ràng origin ↔ scope; sửa route `oauth/session`; xử lý toàn bộ finding High/Medium của 2 review (bảng #8).

- ✅ Nhánh `TASK-IAM-006` tạo từ `develop` (`5eb6b75`, đã gồm CAT-001/TRN-001/TRN-002).
- ✅ Đã đối chiếu contract OQ-05 ở API/Security/LLD/UI/Test/Deploy/GLOSSARY với code IAM-001..005 (`auth.controller.ts`, `access-token.guard.ts`, `session.controller.ts`, `main.ts`) và 2 app Next sau FND-010 (mới có khung layout, chưa form/fetch client).
- ✅ Contract API/cookie/CSRF/CORS **đã chốt** ở OQ-05 — không hỏi lại. Q1–Q4 (tổ chức FE, dependency, E2E, Employee) Khanh chốt 27/09/2026 — xem bảng "Quyết định đã chốt".
- ⚠️ Working tree có sẵn thay đổi không thuộc task: xoá `apps/api/prisma/preflight-iam005-owner-slug.sql` (Khanh làm trước đó) — sẽ không gộp vào commit IAM-006 nếu Khanh không yêu cầu.

---

## Phạm vi chuẩn

### Thuộc IAM-006

**BE (`apps/api`)**
- Dual transport theo `X-Auth-Transport: cookie | bearer` (thiếu = `bearer`, lạ = 400 `AUTH_TRANSPORT_INVALID`) cho operator/platform login, MFA verify, đổi mật khẩu bắt buộc, refresh, logout, re-auth.
- Cookie mode: set `vxn_access` / `vxn_refresh` / `vxn_csrf` đúng bảng flags API §7.1.1 (host-only, `Max-Age` + `Expires`); response metadata không chứa token thô; `backupCodes` một lần.
- `AccessTokenGuard` nhận **đúng một** credential: Bearer **hoặc** `vxn_access`; có cả hai → 400 `AUTH_TRANSPORT_AMBIGUOUS`. Refresh cookie mode đọc `vxn_refresh`.
- `GET /auth/csrf` (cookie `vxn_csrf` + body `{csrfToken}`), `GET /auth/me` (`no-store`, không tự refresh).
- Guard toàn cục cho mọi `POST/PUT/PATCH/DELETE` dùng cookie trong `/v1/**`: CSRF signed double-submit + `Origin` exact allowlist → 403 `AUTH_CSRF_INVALID` / `AUTH_ORIGIN_FORBIDDEN`. Bearer và method an toàn được miễn.
- Rotate CSRF khi cấp session / refresh / đổi mật khẩu; clear cookie khi logout, reuse hoặc revoke current family.
- CORS credentialed exact-origin (`OPERATOR_WEB_ORIGINS` ∪ `ADMIN_WEB_ORIGINS`, ràng scope phiên), `Vary: Origin`, headers allow/expose theo contract; `OPTIONS` không qua auth/CSRF.
- Env `OPERATOR_WEB_ORIGINS` + `ADMIN_WEB_ORIGINS` + `WEB_CSRF_SECRET` (base64 32 byte, tách khỏi key khác) — staging/production thiếu/sai → fail startup.

**FE (`apps/operator-os`, `apps/admin`)**
- State machine UI §7: bootstrap (CSRF → `/auth/me` → 401 thì refresh single-flight một lần → retry) → login → đổi mật khẩu bắt buộc → login lại → MFA (enrollment QR/secret hoặc TOTP/backup code) → backup code hiện một lần → shell được bảo vệ; logout; hết phiên về login giữ safe return URL nội bộ.
- Operator OS: identifier `{slug}/{username}`; Admin: `platform/{username}`, chỉ render shell khi `/auth/me` đúng scope/role.

**Test:** Vitest BE (cookie flags, CSRF/Origin/CORS, ambiguity, `/auth/me`, hồi quy Mobile Bearer — TC-SEC-005..007) + FE (auth client single-flight) + E2E theo Q3.

### Không tự kéo vào task

- Auth Passenger/Marketplace, Employee mobile, màn nghiệp vụ, provisioning Platform employee, recovery/reset MFA (task row ghi rõ).
- Rate limit toàn cục, CSP (Security §11 "CSP TBD").
- Custom domain staging/production (Deploy §4) — việc cấu hình hạ tầng của Khanh, ghi `ops` khi tới bước deploy.

---

## Quyết định đã chốt (Khanh, 27/09/2026)

| ID | Chốt | Cách hiện thực |
| --- | --- | --- |
| Q1 | **Viết riêng từng app** (không tạo package dùng chung) | `apps/operator-os/lib/auth/*` và `apps/admin/lib/auth/*` mỗi app tự có client fetch cookie mode + provider + form; hai bản giữ cùng cấu trúc để review song song. |
| Q2 | **QR + secret** | Thêm `qrcode` (+ `@types/qrcode`) cho 2 app; QR vẽ tại trình duyệt từ `otpAuthUri`, luôn kèm secret dạng chữ. |
| Q3 | **Playwright tối thiểu trong IAM-006** | 2 luồng TC-SEC-008 chạy local với API + DB thật; job CI Playwright để TASK-TEST-001/OPS-001. |
| Q4 | **Nhân viên đăng nhập Operator OS → báo không có dữ liệu** | Thực tế code: `operator_accounts` và `employee_accounts` là 2 bảng riêng nhưng **chung namespace `{slug}/{username}` và chung `/auth/operator/login`** (app Nhân viên dùng cổng này), nên BE vẫn cấp phiên cho nhân viên. FE Operator OS: `/auth/me` role ≠ `OPERATOR_OWNER` → màn "Tài khoản nhân viên không có dữ liệu trên Operator OS — dùng ứng dụng Nhân viên", thu hồi phiên ngay (logout), không render shell/dữ liệu. Khanh yêu cầu cập nhật tài liệu (27/09): UI v0.6 §4/§7, API v0.10 §7.1/§7.1.1, Test v0.4 TC-SEC-008. |

### Đề xuất ban đầu (lưu lại để đối chiếu)

| ID | Điểm cần chốt | Khuyến nghị |
| --- | --- | --- |
| Q1 | **Code auth FE dùng chung 2 app đặt ở đâu** | **Package mới `packages/web-auth`** (TS + React, xuất source như `packages/ui`): client fetch cookie mode (`credentials: "include"`, `X-Auth-Transport: cookie`, CSRF trong memory, refresh single-flight + retry một lần), `AuthProvider`/`useAuth`, guard route và 3 form (login / đổi mật khẩu / MFA). Hai app chỉ khác cấu hình: endpoint login, gợi ý định danh, scope/role được vào. Tránh viết 2 lần phần nhạy cảm nhất. |
| Q2 | **QR khi enrollment TOTP** (UI §7 "QR/secret enrollment") | Thêm dependency FE **`qrcode`** (MIT, sinh ảnh QR tại trình duyệt từ `otpAuthUri`, không gửi secret đi đâu) + luôn hiện secret dạng chữ để nhập tay. Không thêm = chỉ hiện secret/URI. |
| Q3 | **E2E Playwright** (TC-SEC-008 "Rất cao"; TASK-TEST-001 chưa làm) | Setup **Playwright tối thiểu trong IAM-006** cho 2 luồng TC-SEC-008 (Operator first-login → TOTP → backup code → reload; Admin password → TOTP) chạy local với API + DB thật; job CI Playwright để TASK-TEST-001/OPS-001 (cần dựng cả API + 2 app trong CI). |
| Q4 | **Employee đăng nhập Operator OS web?** (UI §4 ghi Operator OS cho "Operator, Employee"; FND-010 chốt "không làm phần Employee") | IAM-006 chỉ cho **`OPERATOR_OWNER`** vào Operator OS; Employee đăng nhập thành công nhưng được báo "dùng ứng dụng Nhân viên" và logout (không lộ dữ liệu). Mở cho SUPPORT_STAFF/TICKET_STAFF khi có màn nghiệp vụ tương ứng. |

### Giả định (không cần chốt riêng)

- **A1** — FE gọi API **trực tiếp** từ trình duyệt (cross-origin cùng site, CORS credentialed) theo topology Deploy §4; không dựng BFF/proxy Next. Base URL qua `NEXT_PUBLIC_API_BASE_URL` (local `http://localhost:3000/v1`).
- **A2** — Đọc cookie bằng parser nhỏ (giá trị là token base64url) thay vì thêm `cookie-parser`.
- **A3** — CSRF token = `v1.<issuedAt>.<nonce>.<HMAC-SHA256(WEB_CSRF_SECRET)>`; hợp lệ khi header trùng cookie (so sánh constant-time), chữ ký đúng và chưa quá 30 ngày. Không gắn `sid`: `/auth/refresh` chạy khi access cookie đã hết hạn nên server không biết `sid` để kiểm; token "cũ" bị chặn bởi việc cookie đã rotate (header ≠ cookie). `GET /auth/csrf` trả lại token còn hợp lệ trong cookie (khôi phục sau reload, không làm tab khác chết); chỉ cấp mới khi thiếu/sai.
- **A4** — Không thêm thư viện form/state (React Hook Form, React Query) ở task này: 3 form nhỏ dùng state React.
- **A5** — Login hiển thị **tại chỗ** (gate ở root layout) thay vì route `/login?returnTo=`: URL giữ nguyên nên "return URL nội bộ" tự đúng và không có tham số redirect để bị lợi dụng (open redirect).
- **A6** — Response cookie mode được khai trong OpenAPI dưới dạng `oneOf` (login/MFA verify/refresh), `refreshToken` trong body refresh thành optional (cookie mode đọc `vxn_refresh`). JSON trên dây của Mobile không đổi; kiểu Dart sinh lại của 3 endpoint này đổi sang union (app Mobile hiện chưa dùng 3 endpoint này).
- **A7** — Giới hạn đã biết của topology Deploy §4: Operator OS và Admin cùng gọi một host API nên **một trình duyệt chỉ giữ một phiên web** tại một thời điểm; đăng nhập cổng này sẽ ghi đè cookie cổng kia (cổng còn lại thấy sai scope → logout về login theo UI §9).

---

## Todo (ID = thứ tự thực hiện)

### ✅ #1 — [IAM-006.1] Chốt Q1–Q4, task row `Ready → In Progress`

Khanh chốt 27/09/2026 (bảng trên); tài liệu Q4 cập nhật theo yêu cầu (UI v0.6, API v0.10, Test v0.4).

### ✅ #2 — [IAM-006.2] BE transport + cookie + guard đọc credential

`apps/api/src/iam/auth/web/auth-transport.ts` (header/cookie/credential XOR), `web-auth.service.ts` (ghi/xoá cookie, CSRF), `access-token.guard.ts` (Bearer hoặc `vxn_access`), `auth.controller.ts` (login/MFA/đổi mật khẩu/refresh/logout/re-auth theo transport), `session.controller.ts` (revoke family hiện tại → xoá cookie). DTO response login/MFA/refresh thành union (A6).

### ✅ #3 — [IAM-006.3] CSRF + Origin + CORS + `/auth/csrf` + `/auth/me` + env

`web-csrf.guard.ts` (APP_GUARD toàn cục), `csrf-token.ts`, `common/web-cors.ts` + `main.ts`, `AuthService.me()`, env `OPERATOR_WEB_ORIGINS`/`ADMIN_WEB_ORIGINS`/`WEB_CSRF_SECRET` fail-fast production (+ `render.yaml`, `.env.example`).

### ✅ #4 — [IAM-006.4] FE auth client + provider + guard (theo Q1)

Mỗi app: `lib/auth/api-client.ts` (cookie mode, CSRF memory, refresh single-flight, retry một lần, CSRF retry khi tab khác rotate), `lib/auth/auth-context.tsx` (bootstrap `/auth/me`, chặn scope/role), `components/auth/auth-gate.tsx` (login tại chỗ — A5).

### ✅ #5 — [IAM-006.5] Màn login / đổi mật khẩu / MFA cho Operator OS + Admin

`components/auth/login-flow.tsx` mỗi app: login → đổi mật khẩu tạm (Operator) → TOTP (QR `qrcode` + secret) → backup code một lần; `app-shell.tsx` thêm tài khoản + đăng xuất (prop `account` mới của `DashboardShell`).

### ✅ #6 — [IAM-006.6] OpenAPI + client TS/Dart

`pnpm gen:api-client` + Dart v7.25.0: thêm model `/auth/me`, `/auth/csrf`, union login/MFA/refresh, header transport/CSRF. `dart test` 423/423, `mobile_shared` 30/30, `flutter analyze` 2 app sạch. Hoàn nguyên 230 file chỉ khác EOL.

### ✅ #7 — [IAM-006.7] Test + E2E (theo Q3) + regression

API `REQUIRE_DB_TESTS=1`: 64/64 file, **705/705** test, 0 skip (mới: `web/*.spec.ts` 5 file, gồm `web-auth.int.spec.ts` trên DB thật). FE: `api-client.test.ts` 6/6 mỗi app. Playwright TC-SEC-008: Operator 3/3 (first-login→TOTP→backup→reload, access hết hạn→1 refresh, Employee bị chặn), Admin 2/2. Monorepo typecheck/lint/test/build 28/28 xanh.

### ⏳ #8 — [IAM-006.8] Review, AI journal, CI và đóng task

`code-reviewer` + `security-auditor` (auth/cookie/CSRF là vùng nhạy cảm nhất); chỉ `Done` sau khi Khanh xác nhận CI.

| Nguồn | Finding | Xử lý |
| --- | --- | --- |
| code-reviewer High 1 | Refresh dùng CSRF cũ (tab khác đã rotate) → đăng xuất oan | ✅ `refreshSession` gặp `AUTH_CSRF_INVALID` thì lấy CSRF mới, thử lại một lần (test) |
| code-reviewer High 2 | Nhiều tab refresh cùng lúc → reuse → thu hồi cả phiên | ✅ `navigator.locks` (`vxn-auth-refresh`) quanh refresh (test) |
| code-reviewer Medium 3 | Mạng/429/503 bị coi là hết phiên | ✅ `RefreshOutcome` 3 trạng thái; lỗi tạm thời → 503 cho UI thử lại (test) |
| code-reviewer Low 4–9 | CSRF cũ sau logout; mất thông báo hết phiên, thiếu trạng thái lỗi; preflight mọi GET; re-auth khoá không xoá cookie; seed E2E; thiếu test | ✅ `forgetCsrf`; trạng thái `error` + nút thử lại; chỉ `/auth/*` gửi `X-Auth-Transport`; re-auth khoá xoá cookie; seed chỉ DB localhost; test `me()` 4 nhánh + refresh 429/503 |
| security M1 | XSS ở app này mượn cookie phiên app kia | ✅ Khanh duyệt: env theo app + ràng origin ↔ scope (GET/mutation/login/refresh) |
| security M2 | Seed E2E tạo PLATFORM_ADMIN trên DB remote | ✅ Từ chối host ngoài localhost (đã thử với host Supabase giả) |
| security L1 | CSRF token nằm trong log | ✅ Redact `x-csrf-token` (pino 2 chiều + Sentry) có test |
| security L2 | Cookie tossing từ subdomain; comment HMAC nói quá | ⚠️ Sửa comment + ghi Security §5.1. Chưa xoá cookie `Domain=` cha — cần domain production thật, để OPS-001 |
| security L3 | `otp/verify`, `oauth/session` trả token thô khi cookie mode | ✅ Endpoint chỉ Bearer → 400 `AUTH_TRANSPORT_INVALID` |
| security L4 | Web thiếu header chống iframe; fallback localhost khi build production | ✅ `frame-ancestors 'none'`, `X-Frame-Options`, `Referrer-Policy`; production thiếu env → `/v1` tương đối. CSP đầy đủ chờ Security §11 |
| security L5 | Vào nhầm cổng tự đăng xuất phiên kia | ✅ Hết do M1: phiên cổng khác chỉ bị chặn, FE không gọi logout |
| Kiểm tra API (Khanh yêu cầu) | `POST /auth/oauth/session` không bao giờ chạy (route `oauth/:provider` che) | ✅ Đổi thứ tự route + test hồi quy |

---

## Rủi ro phải test chủ động

- Mobile gửi thiếu header bị chuyển sang cookie mode → vỡ app Flutter (phải giữ mặc định Bearer).
- Bearer + cookie cùng lúc được chấp nhận ngầm → credential confusion.
- Unsafe request qua cookie thiếu CSRF/Origin lọt ở route nghiệp vụ (không chỉ route auth).
- CORS echo origin tùy ý hoặc `*` với credentials.
- Cookie không bị xoá đúng attributes khi logout/revoke → vẫn còn trong trình duyệt.
- `/auth/me` tự refresh hoặc trả token/secret; response bị cache.
- FE refresh lặp vô hạn hoặc nhiều refresh song song (reuse detection revoke cả family → đăng xuất oan).
- Open redirect qua return URL sau login.
- Backup code/secret TOTP còn trong state/log sau khi rời màn.
