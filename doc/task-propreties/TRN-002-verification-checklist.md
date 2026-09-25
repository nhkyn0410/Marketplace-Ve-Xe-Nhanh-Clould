# TASK-TRN-002 — Checklist nghiệm thu: Route + StopPoint + Goong

> Mục tiêu: Route/RouteStop và StopPoint/proposal đúng contract, đúng tenant, metrics routing được persist cache-once và đủ nền cho TRN-003.
> Chạy theo thứ tự **A → G**; chỉ tick `[x]` khi có evidence. Lệnh: `TRN-002-guide.md`. Phạm vi: `TRN-002-todo.md`.

## Snapshot trạng thái (25/09/2026)

- [x] Đã đối chiếu SDLC/code và tạo bộ ba todo/guide/checklist trên nhánh `TASK-TRN-002`.
- [ ] Khanh đặt `GOONG_API_KEY` trên Render trước khi deploy nhánh này (production bắt buộc key).
- [x] Q1–Q8 được Khanh chốt 26/09/2026.
- [x] Contract API §7.3 / DB §5.2,§7 / Security §7 / GLOSSARY được đồng bộ.

## PHẦN A — Quyết định & ranh giới

- [x] Q1: private StopPoint và proposal/catalog lifecycle.
- [x] Q2: route/stop-point/proposal endpoints.
- [x] Q3: RouteStop reference, role (suy từ vị trí) và quy tắc vòng lặp.
- [x] Q4: Route/StopPoint/proposal state enum.
- [x] Q5: Goong metrics, invalidation và failure behavior.
- [x] Q6: permission/actor/scope.
- [x] Q7: BE-only. Q8: ước lượng ở dev, production bắt buộc key.
- [x] Không kéo Admin approval, Trip/Fare/Sales/Search/turn-by-turn vào task.

## PHẦN B — Schema, migration & RLS

- [x] Model/migration đúng contract đã duyệt; mọi bảng Operator-owned có `operator_id`.
- [x] RouteStop có sequence unique và tham chiếu đúng một nguồn StopPoint (CHECK + test + mutation).
- [x] FK ghép chặn private StopPoint/RouteStop khác tenant (test + mutation).
- [x] CHECK chặn tọa độ/metrics/state dữ liệu sai ở mức DB (điểm đầu không có chặng trước, đề xuất nhất quán trạng thái).
- [x] FK RESTRICT; không cascade vượt RLS.
- [x] Mọi bảng tenant có `ENABLE + FORCE RLS`, policy fail-closed và nằm trong `RLS_TABLES`; đề xuất có 4 policy theo lệnh khoá state machine phía tenant.
- [x] 10 migration áp tuần tự trên DB trống; `db:app-role` pass.

## PHẦN C — StopPoint & proposal

- [x] CRUD/list private StopPoint đúng tenant; validate tỉnh–phường, tọa độ và type.
- [x] Điểm INACTIVE/khác tenant không gắn được vào Route (422).
- [x] Proposal tạo ở `PENDING`; rejected giữ reason và resubmit hợp lệ (xoá reason, về `PENDING`).
- [x] Proposal ở state không cho phép bị từ chối sửa bằng state guard (service 409 + RLS ở DB).
- [x] Khác tenant/không tồn tại trả cùng 404, không lộ IDOR.

## PHẦN D — Route & routing

- [x] Tạo/sửa/list/detail Route đúng shape và thứ tự RouteStop.
- [x] Chặn dưới hai điểm, điểm lặp (kéo theo đầu = cuối), hai nguồn/không nguồn; role suy từ vị trí nên không sai được.
- [x] Chỉ dùng catalog/private point còn hiệu lực (kể cả phường/tỉnh của điểm).
- [x] Provider được gọi khi tạo hoặc đổi chuỗi/toạ độ; không gọi cho GET/list hoặc đổi tên/ghi chú/trạng thái.
- [x] Persist leg + total distance/duration đúng; provider lỗi/sai số chặng/số âm → 503, không dữ liệu nửa vời.
- [x] Hai update đồng thời không trộn stop/metrics.
- [x] `route:manage` chỉ cấp Owner scope tenant (HTTP: 3 role Employee + 2 role Platform → 403).

## PHẦN E — Contract

- [x] OpenAPI có đủ route, Bearer security, request body/path/query/response/RFC 7807 (kể cả 503).
- [x] `openapi.spec.ts` chặn mất controller/requestBody/path param + chặn trùng tên DTO.
- [x] Client TS + Dart sinh lại, chỉ thêm phần TRN-002 (so ngữ nghĩa); `dart test` 373/373.
- [x] Mã lỗi mới có trong contract (API §7.3, OpenAPI) và test assertion.

## PHẦN F — Test & regression

- [x] Unit DTO, validator và adapter/provider mapping (fetch giả, không gọi mạng).
- [x] HTTP auth/RBAC/400 qua guard/filter thật; 404/409/422/503 qua test DB thật.
- [x] PostgreSQL thật bằng role app: RLS/IDOR/FK/CHECK/unique/transaction/concurrency (19 test).
- [x] Mutation tắt RLS/nới policy đề xuất/bỏ CHECK/FK làm 6 test đỏ.
- [x] `REQUIRE_DB_TESTS=1` pass, 0 skip: 59/59 file, 635/635 test (sau khi sửa review, xanh 2 lần liên tiếp); regression IAM/CAT/Vehicle xanh.
- [x] Key Goong không lộ qua Sentry (breadcrumb/span/request được che); Goong ≤ 4 request song song, huỷ khi lỗi.
- [x] Typecheck, lint và build toàn monorepo xanh 26/26.

## PHẦN G — Review, CI & đóng task

- [x] `code-reviewer` không còn finding blocking/high (H1 đã sửa + test; bảng ở todo #8).
- [x] `security-auditor` không finding blocking/high; medium đã sửa trừ rate limit theo tenant (chờ Khanh quyết).
- [x] AI journal đã ghi (5 dòng `add` + 1 `ops` key Goong); không commit `.ai-journal/`.
- [ ] Smoke API theo guide có evidence hoặc có test tương đương được ghi rõ.
- [ ] CI branch xanh — Khanh xác nhận.
- [ ] Task row §7.3 chuyển `Done`; không đổi trạng thái Approved của tài liệu SDLC.

## PHẦN H — DoD theo sub-task

| Sub-task | DoD | ✓ |
| --- | --- | --- |
| `.1` Quyết định | Q1–Q8 chốt + docs đồng bộ | [x] |
| `.2` Schema | Migration/FK/CHECK/RLS chạy DB thật | [x] |
| `.3` Provider | Goong adapter + fake + error mapping | [x] |
| `.4` StopPoint | Private point/proposal đúng tenant/state | [x] |
| `.5` Route | Route/RouteStop/metrics nguyên tử | [x] |
| `.6` Contract | OpenAPI + TS/Dart không drift | [x] |
| `.7` Test | Hạ tầng thật + mutation + regression | [x] |
| `.8` Đóng task | Review + CI + state update | [ ] |

## PHẦN I — Ranh giới không chặn nghiệm thu

- Admin approval/catalog CRUD → `TASK-ADM-001`.
- Trip/TripStop/Fare/open-sale → `TASK-TRN-003/005/006`.
- Sửa route ảnh hưởng trip tương lai/đã bán vé → `TASK-TRN-008`.
- Operator OS UI → sau `TASK-IAM-006` nếu Q7 chọn BE-only.
- Goong live smoke cần key/quota; test tự động chỉ dùng fake provider.
