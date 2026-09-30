# Nhật ký — Tách cổng đăng nhập nhân viên khỏi Owner nhà xe (TASK-IAM-006)

> Ngày 27/09/2026 · Nhánh `TASK-IAM-006` · Người quyết định: Khanh · Thực hiện: AI Agent (Claude Code)

## Vì sao đổi

- Khi làm web auth, phát hiện `operator_accounts` (Owner) và `employee_accounts` (nhân viên) là **hai bảng riêng** nhưng dùng **chung** namespace `{slug}/{username}` và chung cổng `POST /auth/operator/login`, nên nhân viên vẫn đăng nhập được vào Operator OS web.
- Q4 lúc đầu chặn ở tầng UI (báo "không có dữ liệu" rồi thu hồi phiên). Khanh quyết định tách hẳn ở tầng API và định danh.

## Quyết định (Khanh chốt 27/09/2026)

| # | Nội dung |
| --- | --- |
| 1 | Hai cổng riêng: `POST /auth/operator/login` **chỉ Owner**; `POST /auth/employee/login` **chỉ nhân viên, chỉ Bearer** (app Nhân viên, không có cookie mode). |
| 2 | Username nhân viên bắt buộc tiền tố **`nv.`** do Owner đặt phần sau: `nv.` + 2–61 ký tự thường `[a-z0-9._-]` (vd `phuongtrang/nv.tuan`). Owner **cấm** tiền tố `nv.` (không phân biệt hoa/thường). |
| 3 | Làm ngay trong IAM-006. Registry `operator_login_names` giữ nguyên, nên username vẫn duy nhất trong một nhà xe. |
| 4 | Sai cổng = lỗi chung `AUTH_INVALID_CREDENTIALS` (401). Không cấp phiên, không lộ tài khoản có tồn tại. |

## Đã thay đổi

- **API:** `AuthService.operatorLogin` và `employeeLogin` dùng chung lõi `operatorSideLogin`; mỗi cổng chỉ tra đúng bảng của mình. Thêm `AuthController.employeeLogin` (gửi `X-Auth-Transport: cookie` → 400 `AUTH_TRANSPORT_INVALID`).
- **DB:** migration `20260927010000_split_employee_login`:
  - CHECK `employee_accounts_username_employee_prefix` và `operator_accounts_username_not_employee_prefix`.
  - Tự đổi username nhân viên cũ thành `nv.` + tên viết thường.
  - **Dừng** nếu có Owner đang dùng `nv.`, hoặc tên sau khi đổi dài quá 64 ký tự.
- **Validation:** DTO tạo/sửa nhân viên bắt buộc `nv.`; provisioning Owner từ chối `nv.`.
- **Seed:** dev `phuongtrang/nv.driver042`; seed E2E `nv.driver-<tag>`.

## Kiểm chứng

- Unit `auth.service.spec`: cổng Owner không tra bảng nhân viên và ngược lại; khóa nhân viên giữa chừng vẫn tự thu hồi phiên.
- HTTP `web-auth.http.spec`: cổng nhân viên trả token JSON, không set cookie; cookie mode → 400.
- DB thật `web-auth.int.spec`:
  - Nhân viên đúng mật khẩu ở cổng Owner → 401, không tạo phiên.
  - Owner đúng mật khẩu ở cổng nhân viên → 401, không trả challenge MFA.
  - `/auth/me` đọc đúng nhân viên.
- `account-lifecycle.int.spec`: DB từ chối nhân viên thiếu `nv.` và Owner dùng `NV.`.
- Toàn bộ API `REQUIRE_DB_TESTS=1`: **718/718**.
- Migration trên dữ liệu cũ:
  - `Driver01` → `nv.driver01`, `nv.Tuan` → `nv.tuan`, registry đồng bộ theo.
  - Có Owner `NV.boss` → migration dừng kèm thông báo.

## Ảnh hưởng & việc cần làm tay

- **Trước khi migrate production:** kiểm không có Owner nào dùng `nv.`. Nếu production đã có nhân viên thì báo họ username mới (`nv.` + tên cũ viết thường).
- **App Nhân viên (Flutter):** gọi `authControllerEmployeeLogin` (client Dart sinh lại), không gọi `operator/login`.
- **Operator OS:** nhân viên đăng nhập sẽ nhận lỗi chung ngay từ API. Bước kiểm role ở FE được giữ làm lớp phòng thủ thứ hai.
- **Tài liệu** cập nhật cùng nhánh: ADR-017 (amend), HLD, LLD §6.5, DB, API §6/§7.1, Security §5, UI §4/§7/§8, Test, Task, GLOSSARY.
