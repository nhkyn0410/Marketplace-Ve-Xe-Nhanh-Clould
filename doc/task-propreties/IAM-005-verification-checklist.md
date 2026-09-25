# TASK-IAM-005 — Checklist nghiệm thu: closed enrollment + session theo thiết bị

> Mục tiêu: chứng minh chỉ actor có thẩm quyền mới cấp/quản lý account nội bộ, tenant không thể vượt biên và mỗi actor tự xem/thu hồi đúng device family của mình.
> Chạy theo thứ tự **A → G**; chỉ tick `[x]` khi có evidence. Lệnh: `IAM-005-guide.md`. Phạm vi/sub-task: `IAM-005-todo.md`.

## Snapshot trạng thái (25/09/2026)

- [x] **TASK-IAM-005 hoàn tất 25/09/2026**: Khanh xác nhận CI 5/5 job xanh (CI `Verify monorepo`, Contract `Dart client khớp OpenAPI`, DB integration `Postgres + Redis + Mongo thật`, Mobile `Verify Flutter apps` + `Verify mobile_shared`); PR #10 đã merge vào `develop`; task row §7.2 chuyển `Done`.
- [x] Rollout production 24/09/2026: preflight slug trên Supabase (có đặt `app.scope`) trả 0 Owner, 0 lệch → `prisma:migrate:deploy` áp 2 migration IAM-005, `migrate status` up to date → `db:app-role` pass → Render deploy live, kiểm tra RLS lúc khởi động qua, `GET /v1/health` 200. Chưa có smoke nghiệp vụ trên production (Supabase chưa có Owner; provisioning là primitive cho OPR-001).
- [x] Đã đối chiếu SDLC/code và tạo bộ ba todo/guide/checklist.
- [x] Q1–Q8 được Khanh chốt theo khuyến nghị ngày 22/09/2026; task đã qua design gate và đang triển khai.
- [x] Local evidence 24/09/2026: migration 7/7 trên PostgreSQL 16 test riêng; chạy lại `prisma:migrate:deploy` báo không còn migration và `db:app-role` idempotent/RLS-safe. `REQUIRE_DB_TESTS=1` với role app + Redis 7 + Mongo 7: 48/48 file, 433/433 test pass, 0 skip; gồm race thật cho provision/create, password-change với PostgreSQL+Redis, limiter Lua với Redis concurrent và HTTP route mới. `pnpm turbo run typecheck lint build`: 26/26 task pass; API lint/typecheck/build được chạy lại sau fix cuối. `pnpm gen:api-client` pass và TS/OpenAPI không có semantic diff; Dart 150/150 pass, analyzer không có error nhưng còn 7 warning từ generator. Hậu kiểm code/security không còn finding blocking/high/medium. Smoke local §4–§8 và Owner MFA đã chạy lại ngày 24/09/2026; chưa có CI branch hoặc smoke production.

## PHẦN A — Quyết định & ranh giới

- [x] Q1: duyệt session list/revoke endpoints và resource id theo family/device.
- [x] Q2: provisioning Operator+Owner là service primitive cho OPR-001, không dựng KYC giả.
- [x] Q3–Q4: temp password delivery/expiry + first-login one-time password-change challenge.
- [x] Q5–Q6: Employee lifecycle, namespace xuyên Owner/Employee và slug invariant.
- [x] Q7: v1 không hard cap device; list/revoke semantics/idempotency/current session rõ.
- [x] Q8: re-auth/audit/defer MFA reset/Platform employee/FE được ghi rõ.
- [x] Không mở public register/reset cho Operator, Employee hoặc Platform.
- [x] Không kéo assignment/KYC/UI ngoài owner task vào IAM-005.

## PHẦN B — Schema, migration & RLS

- [x] Fields temp credential/force-change/contact và `auth_epoch` đúng migration; không plaintext secret.
- [x] DB invariant cấm username trùng Owner/Employee trong một tenant, cho phép tenant khác trùng (`account-lifecycle.int.spec.ts`).
- [x] Compound FK/invariant chặn `operator_id`/`operator_slug` drift; slug immutable (`account-lifecycle.int.spec.ts`).
- [x] Migration 7/7 chạy trên DB test riêng và chạy lại không còn pending; corrective migration giữ checksum migration cũ, có preflight slug cho DB legacy.
- [x] `db:app-role` chạy lại idempotent trên DB test; app role không DDL, SUPERUSER, BYPASSRLS hay table owner.
- [x] Tenant tables/session giữ `ENABLE + FORCE RLS`; thiếu context → 0 row (`tenant-rls.int.spec.ts` + registry test).
- [x] Index phục vụ lookup username, subject/family, expiry; `EXPLAIN` bằng role app xác nhận `auth_sessions_family_id_idx` và `auth_sessions_user_ref_family_id_idx` dùng Index Scan cho revoke nóng, `auth_sessions_expires_at_idx` tồn tại cho expiry lookup.

## PHẦN C — Closed enrollment & password lifecycle

- [x] Chỉ PlatformAdmin provision Operator+Owner; PlatformSupport/Operator/Employee bị từ chối.
- [x] Provision transactionally: profile + Owner cùng DB transaction; delivery lỗi để Owner `ACTIVE` nhưng `credentialDeliveryPending=true`; retry cấp mật khẩu mới, tăng epoch, giữ nguyên trạng thái kỷ luật và chỉ xóa pending sau khi gửi thành công.
- [x] Server sinh temp password 192-bit; hash scrypt; plaintext chỉ đi qua delivery đã chốt và không vào response/audit/log.
- [x] Temp password hết hạn đúng TTL; expired/pending không cấp challenge/token.
- [x] Login temp password không cấp access/refresh token, MFA secret/backup code.
- [x] Password-change token TTL/one-time/bind subject+`authEpoch`; fake/expired/replay/reset/status/tenant-suspend trả lỗi generic.
- [x] PostgreSQL+Redis thật: hai consume đồng thời đúng một thành công; hash cũ chết sau đổi.
- [x] Owner smoke 24/09/2026: login password trả `mfaRequired/enrollmentRequired` và không có access/refresh token; verify TOTP enrollment trả token + đúng 10 backup codes; gọi lại session list trả 200.

## PHẦN D — Employee account & tenant isolation

- [x] Owner tạo/list Employee đúng tenant trên DB thật; unit test chặn role không có quyền create.
- [x] DTO chỉ nhận field cho phép; tenant/operator id không lấy từ body.
- [x] Chỉ nhận `DRIVER`, `TICKET_STAFF`, `SUPPORT_STAFF`.
- [x] Duplicate username trong namespace tenant → 409; concurrent create/provision trên PostgreSQL thật vẫn chỉ một account/tenant.
- [x] Tenant A query không filter vẫn chỉ thấy A qua RLS (`tenant-rls.int.spec.ts`); update id B trả 404 trên DB thật (`account-services.int.spec.ts`).
- [x] Role/status/password reset bắt reason + recent re-auth theo Q8.
- [x] Lock/disable/role-change/reset tăng `auth_epoch`, revoke mọi family; test DB thật chứng minh access cũ bị chặn dù cache `active`, refresh epoch cũ bị từ chối.
- [x] Unlock không tự cấp credential; tiếp tục tăng epoch và revoke để cả session legacy cũng không được phục hồi.
- [x] Audit intent fail-closed trước account mutation; success best-effort sau commit; residual cross-DB được ghi rõ; không password/hash/token/contact đầy đủ.

## PHẦN E — Session list/revoke (FR-IAM-15)

- [x] GET trả đúng một item/family, kể cả family đã rotate nhiều lần (`session.service.int.spec.ts`).
- [x] Response có current/timestamps/device label/IP masked; `sessionId` là public family id; không row `sid`/hash/token/raw user-agent.
- [x] Chỉ list subject hiện tại cho Passenger/Owner/Employee/Platform.
- [x] DELETE ownership check trong query; family subject khác và id giả cùng 404 generic.
- [x] DELETE idempotent 204; revoke current family được phép.
- [x] Revoke một family chặn access JWT + refresh của family đó, không ảnh hưởng device khác.
- [x] Redis down → 503/fail-closed, không success giả; retry sau recovery an toàn.
- [x] Không tự áp hard cap session ngoài quyết định IAM-002.

## PHẦN F — Contract, leak scan & regression

- [x] OpenAPI có đủ route, Bearer security, requestBody/response/RFC7807 error.
- [x] Generated TS + Dart client chứa contract mới; TS/OpenAPI regen không có semantic diff, Dart 150/150 test pass.
- [x] Log Pino/Mongo audit/Sentry/Redis/DB/response không lộ temp password, change token, refresh hash, MFA data.
- [x] IAM-001 namespace/OTP/OAuth regression xanh.
- [x] IAM-002 rotation/reuse/logout/re-auth regression xanh.
- [x] IAM-003 permission/TenantGuard/RLS regression xanh bằng role app.
- [x] IAM-004 MFA challenge/TOTP/backup/re-auth regression xanh.

## PHẦN G — Static, review, smoke & CI

- [x] Unit + integration/Supertest test happy/negative/race/IDOR/fail-closed.
- [x] `REQUIRE_DB_TESTS=1`; PostgreSQL/Redis/Mongo thật, 48/48 file và 433/433 test pass, không skip im lặng.
- [x] `pnpm gen:api-client` pass; TS/OpenAPI không semantic diff; `dart test` 150/150, analyzer 0 error/7 warning generator.
- [x] `pnpm turbo run typecheck lint build` xanh 26/26.
- [x] Guide smoke §4–§8 chạy local 24/09/2026: 10 suite integration/HTTP/race với PostgreSQL/Redis/Mongo thật, role app, `REQUIRE_DB_TESTS=1` — 63/63 test pass; kèm Owner login → MFA enrollment → token → session list HTTP smoke.
- [x] `code-reviewer` + `security-auditor` hậu kiểm sau fix không còn finding blocking/high/medium.
- [x] AI journal đã ghi cho code sinh/sửa; không commit journal.
- [x] CI branch xanh — Khanh xác nhận ngày 25/09/2026: 5/5 job pass.
- [x] Sau toàn bộ gate đã cập nhật task row/PROJECT-STATE; không thay đổi trạng thái Approved của tài liệu SDLC.

## PHẦN H — DoD theo sub-task

| Sub-task | DoD | ✓ |
| --- | --- | --- |
| `.1` Quyết định | Q1–Q8 chốt + contract/defer ghi rõ | [x] |
| `.2` Schema | Migration/invariant/RLS/index chạy DB thật | [x] |
| `.3` Temp credential | Delivery + force-change one-time/fail-closed | [x] |
| `.4` Owner provision | Platform-only, atomic, conflict/race safe | [x] |
| `.5` Employee API | RBAC + tenant filter + RLS + revoke-all | [x] |
| `.6` Session API | Family grouping + ownership + idempotent revoke | [x] |
| `.7` Security | Re-auth + audit + notification, không leak | [x] |
| `.8` Contract | OpenAPI + TS/Dart clients không drift | [x] |
| `.9` Test | Full regression + hạ tầng thật + mutation evidence | [x] |
| `.10` Đóng task | review + smoke + CI + state update đúng gate | [x] |

## PHẦN I — Ranh giới không chặn nghiệm thu nếu Q8 giữ khuyến nghị

- UI KYC/Admin/Employee/session hoàn chỉnh → task feature/UI sở hữu sau khi API ổn định.
- Employee assignment/trip/manifest → TASK-EMP-001.
- KYC document/review/status workflow → TASK-OPR-001/TASK-ADM-001.
- Platform employee provisioning và MFA recovery/regenerate backup code → TASK-ADM-001 hoặc task riêng sau khi có contract.
