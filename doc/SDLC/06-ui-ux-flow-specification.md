# 06. UI/UX Flow Specification - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                     |
| ------------- | --------------------------- |
| Tên tài liệu  | UI/UX Flow Specification    |
| Mã tài liệu   | 06-ui-ux-flow-specification |
| Dự án         | Marketplace-Ve-Xe-Nhanh     |
| Trạng thái    | Review                      |
| Người viết    | Nguyễn Hồng Khanh, AI Agent |
| Người duyệt   | Nguyễn Hồng Khanh           |
| Ngày tạo      | 11/05/2026                  |
| Ngày cập nhật | 23/09/2026                  |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp UI/UX Flow Specification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| v0.2      | 01/06/2026 | AI Agent       | **Rework** đồng bộ stack/quyết định (UI vốn tech-independent, chỉ chỉnh touchpoint): §4 kênh = Marketplace/Operator OS/Admin (Next.js) + 2 app Expo (Passenger/Employee) (ADR-013/014); §6.1 thêm flow đăng nhập Passenger (Email OTP + OAuth Google/FB/Apple, ADR-020); §6.2 payment = VNPay/MoMo redirect + seat hold timer 10 phút; §7/§9 login `{slug}/{username}` + `platform/{username}` + TOTP (ADR-017); §9 thêm flow payout confirm (manual + bank ref, ADR-022); KYC upload R2 (ADR-018). Đổi "User" → "Passenger". **Đóng UX-OQ-01** (guest checkout per SRS), **UX-OQ-02** (cookie+Bearer per ADR-017), **UX-OQ-05** (brand trung lập per OQ-20). |
| v0.3      | 17/09/2026 | AI Agent       | §3: component lib đã chốt **Shadcn/ui + Tailwind CSS 4** cho cả 3 app web (ADR-013, Khanh chốt). |
| v0.4      | 23/09/2026 | AI Agent       | **Viết lại §6 Passenger/Guest theo Figma** (section _Giao diện dành cho Khách hàng_, 24 frame): §6.1 danh mục 35 màn `SCR-PSG-NN` (24 Review = có frame; 11 Draft = AI bổ sung); §6.2 luồng; §6.3 mỗi màn 1 bảng 5 trạng thái (Ideal / Empty / Loading / Partial-Edge / Error) đánh dấu Review/Draft; §10.1 thêm quy tắc 5 Key UI States áp cho mọi màn §6–§9; §6.4 8 điểm Figma lệch ADR/SRS (auth mật khẩu, phương thức thanh toán, hold 15', bản đồ OSM, SMS, copy hoàn/đổi vé, loyalty, add-on). §5 IA Passenger theo nav Figma. §11 mở UX-OQ-06..09. Trạng thái doc Approved → **Review** (còn OQ ảnh hưởng code, 00a §3.2). §7–§9 chưa đổi. |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Kênh giao diện
5. Information architecture
6. Flow hành khách (Passenger / Guest)
7. Flow Operator
8. Flow Employee
9. Flow Admin
10. Screen state và validation
11. Open Questions / TBD

---

## 3. Giới thiệu

Tài liệu này mô tả luồng màn hình, trạng thái giao diện, form validation và xử lý lỗi ở mức UX. UI/UX độc lập tech-stack về bản chất; bản rework này chỉ đồng bộ các touchpoint kỹ thuật (auth, payment, kênh) với quyết định đã chốt. Tham chiếu: `01-srs`, `05-api` (v0.2, endpoint), `07-security` (v0.4, auth UX), `context/GLOSSARY` (actor naming). Visual/component/wireframe chi tiết phát triển sau khi flow được duyệt + trên component lib đã chốt (ADR-013 — Shadcn/ui + Tailwind CSS 4). Thiết kế trực quan nằm ở Figma [UI-UX](https://www.figma.com/design/6c81q3DdHVS0anfDw2sVVj/UI-UX); tài liệu này chỉ tham chiếu frame, không mô tả lại bố cục.

---

## 4. Kênh giao diện

Web = Next.js 16 (ADR-013); Mobile = Flutter 2 app tách (ADR-028).

| Kênh                              | Actor              | Mục tiêu                                                                |
| --------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| Marketplace (Web, RSC+SSG/ISR)    | Passenger, Guest   | Search, trip detail, booking, payment, ticket lookup                    |
| Operator OS (Web, CSR sau auth)   | Operator, Employee | Quản lý profile, vehicle, route, trip, booking, employee, finance       |
| Admin (Web, CSR sau auth)         | Admin              | KYC, catalog, policy, payment, payout, dispute, report, audit           |
| `apps/passenger_mobile` (Flutter) | Passenger          | Booking/ticket/notification/support trên mobile                         |
| `apps/employee_mobile` (Flutter)  | Employee           | Check-in, trip status, passenger list, incident report (background geo) |

---

## 5. Information architecture

| Portal                | Nhóm navigation chính                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Marketplace/Passenger | Nav theo Figma: Khám phá, Trang chủ, Mua vé, Dịch vụ bổ trợ ⚠, Hành trình (vé của tôi), Thành viên ⚠, Tra cứu vé, Khiếu nại, Câu hỏi thường gặp. Menu tài khoản: Hồ sơ, Hành khách đã lưu, Bảo mật, Thông báo, Đánh giá của tôi, Hỗ trợ. ⚠ = chờ UX-OQ-06/07 |
| Operator OS           | Dashboard, Profile/KYC, Vehicles, Seat maps, Routes, Trips, Bookings, Employees, Finance (escrow/payout), Reports, Support           |
| Employee              | Assigned trips, Passenger list, QR scan, Trip status, Journey log, Incidents, Profile                                                |
| Admin                 | Dashboard, Operators/KYC, Passengers, Catalog, Policy, Payments/Refunds, Payouts, Disputes, Promotions, Reports, Audit, Integrations |

---

## 6. Flow hành khách (Passenger / Guest)

Nguồn thiết kế trực quan: Figma **UI-UX**, section _Giao diện dành cho Khách hàng_ (node `381:2`) — [mở Figma](https://www.figma.com/design/6c81q3DdHVS0anfDw2sVVj/UI-UX?node-id=381-2). Figma hiện chỉ có **Marketplace web, desktop 1920px**. Mục này chỉ liệt kê màn hình và trạng thái, không mô tả bố cục (xem Figma).

Quy ước cột **Thiết kế**:

| Giá trị | Ý nghĩa                                                                       |
| ------- | ----------------------------------------------------------------------------- |
| Review  | Đã có frame Figma, chờ Khanh kiểm tra                                         |
| Draft   | AI bổ sung từ SRS/flow, chưa có frame Figma                                   |
| ⚠       | Frame lệch thiết kế đã chốt hoặc ngoài phạm vi SRS → xem §6.4 và §11         |

### 6.1. Danh mục màn hình

| Mã         | Màn hình                                                          | Figma node  | Thiết kế | Tham chiếu                     |
| ---------- | ----------------------------------------------------------------- | ----------- | -------- | ------------------------------ |
| **Chung**  |                                                                   |             |          |                                |
| SCR-PSG-01 | Trang chủ (form tìm chuyến)                                       | `373:588`   | Review   | FR-MKT-01                      |
| SCR-PSG-02 | Khám phá — cẩm nang & tin tức                                     | `384:3031`  | Review ⚠ | FR-ADM-13, UX-OQ-08            |
| SCR-PSG-03 | Câu hỏi thường gặp                                                | `385:16931` | Review   | FR-ADM-13                      |
| SCR-PSG-04 | Dịch vụ bổ trợ (frame còn skeleton TODO)                          | `383:598`   | Review ⚠ | UX-OQ-07                       |
| SCR-PSG-05 | Trang lỗi 404 / 403 / 500 / 503                                   | —           | Draft    | §10, ADR-015                   |
| SCR-PSG-06 | Trang pháp lý: điều khoản, bảo mật, hoàn tiền (footer đã có link) | —           | Draft    | NĐ 13/2023                     |
| **Tài khoản & xác thực** |                                                     |             |          |                                |
| SCR-PSG-07 | Đăng nhập                                                         | `385:18278` | Review ⚠ | FR-IAM-02a, ADR-017/020        |
| SCR-PSG-08 | Tạo tài khoản                                                     | `385:18113` | Review ⚠ | FR-IAM-01, ADR-020             |
| SCR-PSG-09 | Nhập OTP email (đăng nhập / đăng ký / xác minh lại)               | —           | Draft    | ADR-020, FR-IAM-10             |
| SCR-PSG-10 | OAuth callback / liên kết tài khoản                               | —           | Draft    | ADR-020                        |
| SCR-PSG-11 | Tài khoản của tôi (hồ sơ, hành khách đã lưu, bảo mật)             | `385:14020` | Review ⚠ | FR-IAM-11, FR-MKT-13           |
| SCR-PSG-12 | Cài đặt thông báo (tab đã có, chưa có frame)                      | —           | Draft    | FR-NSR-14                      |
| SCR-PSG-13 | Phiên đăng nhập / thiết bị                                        | —           | Draft    | FR-IAM-15                      |
| SCR-PSG-14 | Đánh giá của tôi + form đánh giá chuyến                           | —           | Draft    | FR-NSR-10                      |
| **Tìm chuyến → đặt vé** |                                                      |             |          |                                |
| SCR-PSG-15 | Danh sách chuyến (kết quả tìm, lọc, sắp xếp)                      | `385:7387`  | Review   | FR-MKT-01..04                  |
| SCR-PSG-16 | Chi tiết chuyến                                                   | `385:5411`  | Review ⚠ | FR-MKT-05, ADR-027             |
| SCR-PSG-17 | Trang nhà xe (link "Xem trang nhà xe" đã có, chưa có frame)       | —           | Draft    | FR-MKT-06, FR-NSR-15           |
| SCR-PSG-18 | B1 — Chọn điểm đón/trả + ghế                                      | `385:4627`  | Review ⚠ | FR-MKT-07/09, FR-BTP-01..03    |
| SCR-PSG-19 | B2 — Thông tin hành khách                                         | `385:3716`  | Review ⚠ | FR-MKT-08/10/13, UX-OQ-07      |
| SCR-PSG-20 | B3 — Thanh toán                                                   | `385:9097`  | Review ⚠ | FR-BTP-06/07, ADR-019          |
| SCR-PSG-21 | Chờ xác nhận thanh toán (quay về từ cổng)                         | —           | Draft    | FR-BTP-08/09                   |
| SCR-PSG-22 | B4 — Thanh toán thành công                                        | `385:8500`  | Review ⚠ | FR-BTP-10                      |
| SCR-PSG-23 | Thanh toán thất bại / hết hạn                                     | —           | Draft    | FR-BTP-09                      |
| **Vé**     |                                                                   |             |          |                                |
| SCR-PSG-24 | Vé của tôi                                                        | `385:9848`  | Review   | FR-MKT-11                      |
| SCR-PSG-25 | Chi tiết vé (+ QR)                                                | `385:10491` | Review ⚠ | FR-BTP-11, ADR-027             |
| SCR-PSG-26 | Hủy vé (modal xác nhận)                                           | `385:14793` | Review   | FR-BTP-12/13                   |
| **Tra cứu vé Guest** |                                                         |             |          |                                |
| SCR-PSG-27 | Tra cứu — B1 nhập SĐT / email                                     | `385:13572` | Review ⚠ | FR-MKT-12, UX-OQ-09            |
| SCR-PSG-28 | Tra cứu — B2 nhập OTP                                             | `385:13123` | Review   | FR-MKT-12                      |
| SCR-PSG-29 | Kết quả tra cứu                                                   | `385:12492` | Review   | FR-MKT-12                      |
| **Hỗ trợ / khiếu nại** |                                                       |             |          |                                |
| SCR-PSG-30 | Khiếu nại của tôi (danh sách + chi tiết + trao đổi)               | `385:17467` | Review   | FR-NSR-06/09                   |
| SCR-PSG-31 | Gửi khiếu nại (modal)                                             | `410:2`     | Review   | FR-NSR-06                      |
| SCR-PSG-32 | Khiếu nại của Guest (từ kết quả tra cứu)                          | —           | Draft    | FR-NSR-06 (Guest đã xác minh)  |
| **VXN Plus (ngoài SRS)** |                                                     |             |          |                                |
| SCR-PSG-33 | VXN Plus — hạng thành viên                                        | `383:4`     | Review ⚠ | UX-OQ-06                       |
| SCR-PSG-34 | Lịch sử điểm                                                      | `385:15629` | Review ⚠ | UX-OQ-06                       |
| SCR-PSG-35 | Đổi điểm lấy mã giảm giá (modal)                                  | `385:16127` | Review ⚠ | UX-OQ-06                       |

> **Draft — chưa có trong Figma cho cả nhóm:** bản **responsive mobile web** của mọi màn trên (DoD Frontend, `CLAUDE.md §6.3`) và toàn bộ **`apps/passenger_mobile`** (Flutter, ADR-028).

### 6.2. Luồng chính

| Luồng               | Chuỗi màn hình (SCR-PSG-)                                                  | Ghi chú                                                                                                   |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Đăng nhập / đăng ký | 07 hoặc 08 → 09 (OTP) hoặc 10 (OAuth) → quay lại trang trước               | Passenger không có mật khẩu (07 Security §5). Guest không cần đăng nhập để search/hold/book/pay/lookup     |
| Tìm → đặt → vé      | 01 → 15 → 16 → 18 → 19 → 20 → cổng VNPay/MoMo → 21 → 22 hoặc 23 → 25       | Hold 10 phút tính từ 18 (ADR-015, OQ-06); tổng tiền tách dòng vé / phí / giảm giá (CO-12)                  |
| Hủy vé / hoàn tiền  | 24 hoặc 29 → 25 → 26 → 09 (xác minh lại) → 25 (theo dõi refund)            | Chính sách hủy = snapshot lúc đặt (FR-BTP-12)                                                              |
| Tra cứu vé Guest    | 27 → 28 → 29 → 25 → 26 hoặc 32                                             | Guest session sau OTP có thời hạn                                                                         |
| Hỗ trợ / đánh giá   | 25 hoặc 30 → 31 → 30; 24 → 14                                              | Đánh giá chỉ khi trip `COMPLETED` và vé hợp lệ                                                             |

### 6.3. Trạng thái màn hình (5 Key UI States)

Mỗi màn hình là một bảng đủ 5 trạng thái theo §10.1. Cột **Thiết kế**: `Review` = đã có trong Figma · `Draft` = AI bổ sung, chưa có frame · `⚠ (#n)` = lệch thiết kế đã chốt, xem dòng #n ở §6.4 · `Chờ UX-OQ-NN` = phụ thuộc câu hỏi mở · `—` = không áp dụng. Tên trạng thái nghiệp vụ theo SRS §17.

#### SCR-PSG-01 — Trang chủ (`373:588`)

| Trạng thái     | Nội dung cần có                                                                                                             | Thiết kế       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Ideal          | Form tìm chuyến (điểm đi, điểm đến, ngày, số khách); tab "Theo nhà xe"; khối ưu đãi, tuyến phổ biến, nhà xe đối tác, tin tức | Review ⚠ (#6, #7) |
| Empty          | Chưa có tuyến phổ biến / nhà xe / bài viết → ẩn khối, form tìm chuyến vẫn dùng được                                          | Draft          |
| Loading        | Skeleton các khối nội dung; gợi ý địa điểm đang tải                                                                          | Draft          |
| Partial / Edge | Số lớn (12.840 đánh giá, 5.400+ chuyến — thống nhất dấu chấm, Figma đang lẫn "5,400+"); tên nhà xe / địa danh dài; chỉ 1–2 nhà xe; header đã đăng nhập | Review + Draft |
| Error          | Form invalid (thiếu điểm đi/đến, trùng điểm, ngày quá khứ); gợi ý địa điểm không có kết quả; lỗi tải khối (ẩn khối, không chặn tìm chuyến); offline | Draft          |

#### SCR-PSG-02 — Khám phá (`384:3031`) · Chờ UX-OQ-08

| Trạng thái     | Nội dung cần có                                                         | Thiết kế |
| -------------- | ----------------------------------------------------------------------- | -------- |
| Ideal          | Bài nổi bật + danh sách bài; lọc chuyên mục (đếm số bài); tìm kiếm       | Review   |
| Empty          | Chuyên mục chưa có bài → gợi ý chuyên mục khác / FAQ                     | Draft    |
| Loading        | Skeleton thẻ bài                                                        | Draft    |
| Partial / Edge | Tiêu đề / mô tả dài (cắt chữ); lượt xem lớn; chỉ 1–2 bài                 | Review   |
| Error          | Tìm không có kết quả; lỗi tải (thử lại); bài không tồn tại (404)         | Draft    |

> Chi tiết bài viết chưa có frame — Draft.

#### SCR-PSG-03 — Câu hỏi thường gặp (`385:16931`)

| Trạng thái     | Nội dung cần có                                                            | Thiết kế |
| -------------- | -------------------------------------------------------------------------- | -------- |
| Ideal          | Ô tìm kiếm + gợi ý nhanh; danh mục (đếm số câu); danh sách câu hỏi; khối liên hệ CSKH | Review   |
| Empty          | Danh mục chưa có câu hỏi → CTA liên hệ CSKH                                 | Draft    |
| Loading        | Skeleton danh sách                                                         | Draft    |
| Partial / Edge | Câu hỏi mở rộng, câu trả lời dài; danh mục chỉ 1–2 câu                      | Draft    |
| Error          | Tìm không có kết quả → CTA liên hệ CSKH; lỗi tải (thử lại)                  | Draft    |

#### SCR-PSG-04 — Dịch vụ bổ trợ (`383:598`) · Chờ UX-OQ-07

| Trạng thái     | Nội dung cần có                 | Thiết kế        |
| -------------- | ------------------------------- | --------------- |
| Ideal          | Frame mới là skeleton TODO       | Review ⚠ (#8)   |
| Empty          | —                               | Chờ UX-OQ-07    |
| Loading        | —                               | Chờ UX-OQ-07    |
| Partial / Edge | —                               | Chờ UX-OQ-07    |
| Error          | —                               | Chờ UX-OQ-07    |

#### SCR-PSG-05 — Trang lỗi hệ thống (chưa có frame)

| Trạng thái     | Nội dung cần có                                                                                          | Thiết kế |
| -------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| Ideal          | — (màn này là Error state dùng chung cho mọi màn)                                                        | —        |
| Empty          | —                                                                                                        | —        |
| Loading        | —                                                                                                        | —        |
| Partial / Edge | Bảo trì có giờ dự kiến; nút về trang trước / trang chủ                                                    | Draft    |
| Error          | 404 không tìm thấy; 403 không đủ quyền (không lộ dữ liệu bị chặn); 500; 503 "thử lại sau 30s" (ADR-015); offline | Draft    |

#### SCR-PSG-06 — Trang pháp lý (chưa có frame)

| Trạng thái     | Nội dung cần có                                         | Thiết kế |
| -------------- | ------------------------------------------------------- | -------- |
| Ideal          | Điều khoản / chính sách bảo mật / chính sách hoàn tiền + ngày hiệu lực | Draft    |
| Empty          | — (nội dung bắt buộc phải có)                           | —        |
| Loading        | Skeleton văn bản                                        | Draft    |
| Partial / Edge | Văn bản dài → mục lục neo                               | Draft    |
| Error          | Lỗi tải (thử lại)                                       | Draft    |

#### SCR-PSG-07 — Đăng nhập (`385:18278`)

| Trạng thái     | Nội dung cần có                                                                                                            | Thiết kế       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Ideal          | Figma: email/SĐT + mật khẩu, ghi nhớ, quên mật khẩu, link tra cứu vé → đổi sang nhập email + gửi OTP + nút Google / Facebook / Apple | Review ⚠ (#1)  |
| Empty          | Form trống → CTA vô hiệu                                                                                                   | Draft          |
| Loading        | Đang gửi OTP / đang chuyển sang OAuth                                                                                      | Draft          |
| Partial / Edge | Email dài; quay lại trang trước sau đăng nhập; tài khoản bị khóa                                                           | Draft          |
| Error          | Email sai định dạng; gửi OTP quá giới hạn; lỗi mạng                                                                         | Draft          |

#### SCR-PSG-08 — Tạo tài khoản (`385:18113`)

| Trạng thái     | Nội dung cần có                                                                                                  | Thiết kế      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| Ideal          | Figma: họ tên, email, SĐT, mật khẩu, xác nhận mật khẩu, đồng ý điều khoản → bỏ mật khẩu, xác minh bằng OTP email | Review ⚠ (#1) |
| Empty          | Form trống / chưa đồng ý điều khoản → CTA vô hiệu                                                                 | Draft         |
| Loading        | Đang tạo tài khoản / gửi OTP                                                                                     | Draft         |
| Partial / Edge | Họ tên dài; email đã tồn tại → gợi ý đăng nhập (UC A1)                                                           | Draft         |
| Error          | Lỗi tại field; lỗi mạng                                                                                          | Draft         |

#### SCR-PSG-09 — Nhập OTP email (chưa có frame; dùng lại mẫu SCR-PSG-28)

| Trạng thái     | Nội dung cần có                                   | Thiết kế |
| -------------- | ------------------------------------------------- | -------- |
| Ideal          | 6 ô OTP; đếm ngược hiệu lực; gửi lại; đổi email    | Draft    |
| Empty          | Chưa nhập đủ 6 số → CTA vô hiệu                    | Draft    |
| Loading        | Đang xác thực                                      | Draft    |
| Partial / Edge | Gửi lại có cooldown; dán mã từ clipboard; còn N lần thử | Draft    |
| Error          | Sai OTP; hết hạn; vượt số lần → khóa tạm; lỗi mạng | Draft    |

#### SCR-PSG-10 — OAuth callback / liên kết tài khoản (chưa có frame)

| Trạng thái     | Nội dung cần có                                                                              | Thiết kế |
| -------------- | -------------------------------------------------------------------------------------------- | -------- |
| Ideal          | Callback thành công → quay lại trang trước                                                   | Draft    |
| Empty          | —                                                                                            | —        |
| Loading        | Đang chuyển hướng / đang xác nhận với provider                                                | Draft    |
| Partial / Edge | Email trùng tài khoản Email-OTP → báo đã liên kết; provider không trả email (Apple ẩn email)  | Draft    |
| Error          | Người dùng hủy; provider lỗi; callback không hợp lệ → về SCR-PSG-07                           | Draft    |

#### SCR-PSG-11 — Tài khoản của tôi (`385:14020`)

| Trạng thái     | Nội dung cần có                                                                                                                     | Thiết kế            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Ideal          | Hồ sơ (họ tên, ngày sinh, giới tính, CCCD, email, SĐT); tiện ích tài khoản; khối bảo mật. Figma có đổi mật khẩu + 2FA, hạng thành viên, Ví voucher, tab Thanh toán "Sắp ra mắt" (ngoài v1) | Review ⚠ (#1, #7)   |
| Empty          | Hành khách đã lưu 0/5 + CTA thêm; hồ sơ chưa điền hiện "—"                                                                          | Review              |
| Loading        | Skeleton hồ sơ; đang lưu                                                                                                            | Draft               |
| Partial / Edge | Danh sách đầy 5/5 (ẩn nút thêm); tên / email dài; sửa hồ sơ; đổi email cần OTP; thêm / sửa / xóa hành khách đã lưu                   | Draft               |
| Error          | Lỗi tại field khi sửa; lưu thất bại; lỗi tải                                                                                        | Draft               |

#### SCR-PSG-12 — Cài đặt thông báo (chưa có frame)

| Trạng thái     | Nội dung cần có                                                                                               | Thiết kế |
| -------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| Ideal          | Bảng loại thông báo × kênh đang bật (email, push)                                                              | Draft    |
| Empty          | — (luôn có danh mục loại thông báo)                                                                           | —        |
| Loading        | Đang tải / đang lưu                                                                                           | Draft    |
| Partial / Edge | Thông báo bắt buộc (bảo mật, vé, thanh toán, đổi/hủy chuyến, dispute) khóa, không tắt được (FR-NSR-14)          | Draft    |
| Error          | Lưu thất bại → giữ giá trị cũ                                                                                 | Draft    |

#### SCR-PSG-13 — Phiên đăng nhập / thiết bị (chưa có frame)

| Trạng thái     | Nội dung cần có                                                            | Thiết kế |
| -------------- | -------------------------------------------------------------------------- | -------- |
| Ideal          | Danh sách phiên, đánh dấu phiên hiện tại; thu hồi 1 phiên / tất cả phiên khác | Draft    |
| Empty          | Chỉ có phiên hiện tại                                                      | Draft    |
| Loading        | Đang tải / đang thu hồi                                                    | Draft    |
| Partial / Edge | Đạt giới hạn số phiên (FR-IAM-15); tên thiết bị dài                         | Draft    |
| Error          | Thu hồi thất bại; phiên hiện tại bị force logout → về đăng nhập             | Draft    |

#### SCR-PSG-14 — Đánh giá của tôi + form đánh giá (chưa có frame)

| Trạng thái     | Nội dung cần có                                                                    | Thiết kế |
| -------------- | ---------------------------------------------------------------------------------- | -------- |
| Ideal          | Danh sách đánh giá đã viết + chuyến chờ đánh giá; form đánh giá (sao + nội dung)    | Draft    |
| Empty          | Chưa có đánh giá → CTA về vé đã đi                                                  | Draft    |
| Loading        | Skeleton; đang gửi                                                                  | Draft    |
| Partial / Edge | Nội dung dài; đánh giá bị ẩn do kiểm duyệt; chuyến chưa `COMPLETED` → chưa cho đánh giá | Draft    |
| Error          | Gửi thất bại; lỗi tải                                                               | Draft    |

#### SCR-PSG-15 — Danh sách chuyến (`385:7387`)

| Trạng thái     | Nội dung cần có                                                                                                                                  | Thiết kế |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Ideal          | Thanh tìm kiếm; lọc giá / giờ / loại xe / nhà xe / tiện ích; sắp xếp; thẻ chuyến (giờ, thời lượng, điểm dừng, giá, số chỗ còn)                    | Review   |
| Empty          | Không có chuyến nào đang mở bán → gợi ý tuyến phổ biến                                                                                           | Draft    |
| Loading        | Skeleton thẻ chuyến                                                                                                                              | Draft    |
| Partial / Edge | 1–2 chuyến; hàng trăm chuyến → phân trang / tải thêm; tên nhà xe / địa danh dài; sắp hết chỗ; chuyến qua đêm (đến ngày hôm sau); lọc điểm đón/trả + đánh giá, sắp xếp theo thời gian di chuyển (FR-MKT-03/04 — Figma thiếu) | Draft    |
| Error          | Không tìm thấy chuyến theo tiêu chí → gợi ý đổi ngày / xóa lọc; ghế đã đổi khi bấm chọn (stale); lỗi tải; 503                                    | Draft    |

#### SCR-PSG-16 — Chi tiết chuyến (`385:5411`)

| Trạng thái     | Nội dung cần có                                                                                                                  | Thiết kế      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Ideal          | Tóm tắt chuyến + giá; nhà xe; lộ trình + điểm dừng; bản đồ; tiện nghi; chính sách; CTA đặt vé                                     | Review ⚠ (#4) |
| Empty          | Chưa có đánh giá                                                                                                                 | Review        |
| Loading        | Skeleton; bản đồ đang tải                                                                                                        | Draft         |
| Partial / Edge | Nhiều điểm dừng; địa chỉ dài; có đánh giá (danh sách + điểm trung bình); ngừng bán (hết giờ bán online / hết ghế / chuyến bị khóa → CTA vô hiệu) | Draft         |
| Error          | Chuyến không tồn tại / đã hủy (404); bản đồ lỗi tải (vẫn hiện danh sách điểm dừng); lỗi tải                                       | Draft         |

#### SCR-PSG-17 — Trang nhà xe (chưa có frame)

| Trạng thái     | Nội dung cần có                                                                  | Thiết kế |
| -------------- | -------------------------------------------------------------------------------- | -------- |
| Ideal          | Thông tin công khai; scorecard; tuyến tiêu biểu; đánh giá; điều khoản dịch vụ     | Draft    |
| Empty          | Chưa có đánh giá / chưa có tuyến mở bán                                           | Draft    |
| Loading        | Skeleton                                                                         | Draft    |
| Partial / Edge | Tên nhà xe dài; số đánh giá lớn; scorecard chưa đủ dữ liệu                        | Draft    |
| Error          | Nhà xe không tồn tại / tạm ngừng hoạt động (404); lỗi tải                         | Draft    |

#### SCR-PSG-18 — B1 Chọn điểm đón/trả + ghế (`385:4627`)

| Trạng thái     | Nội dung cần có                                                                                                                    | Thiết kế      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Ideal          | Điểm đón/trả; sơ đồ ghế với chú thích Còn trống / Đang chọn / Đang giữ / Đã đặt; giới hạn "x/10 ghế"; tạm tính. Thiếu bộ đếm giữ ghế | Review ⚠ (#3) |
| Empty          | Chưa chọn ghế → CTA vô hiệu                                                                                                         | Draft         |
| Loading        | Đang tải sơ đồ ghế; đang tạo hold                                                                                                   | Draft         |
| Partial / Edge | Chỉ còn 1–2 ghế trống; ghế `BLOCKED`; xe 2 tầng; nhiều điểm đón/trả; đã chọn tối đa → khóa ghế còn lại                              | Draft         |
| Error          | Ghế vừa bị giữ/bán → từ chối cả nhóm, chọn lại (UC A1); chuyến bị khóa / seat map đổi (A2); hold hết hạn → chọn lại (A4); 503 giữ ghế (A5, ADR-015) | Draft         |

#### SCR-PSG-19 — B2 Thông tin hành khách (`385:3716`)

| Trạng thái     | Nội dung cần có                                                                                                                     | Thiết kế          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Ideal          | Thông tin liên hệ; form hành khách theo ghế; chọn từ hành khách đã lưu; lưu hành khách (≤5); điểm đón/trả chỉ đọc; mã giảm giá; dịch vụ bổ trợ; tóm tắt. Thiếu bộ đếm giữ ghế | Review ⚠ (#3, #8) |
| Empty          | "Chưa có mã ưu đãi phù hợp cho chuyến này"                                                                                           | Review            |
| Loading        | Đang áp mã giảm giá; đang lưu                                                                                                        | Draft             |
| Partial / Edge | n ghế → n form hành khách; Guest (không có hành khách đã lưu); họ tên dài; mã hợp lệ → dòng giảm giá tách riêng (CO-12)               | Draft             |
| Error          | Lỗi tại field (SĐT, email, CCCD, ngày sinh); mã không hợp lệ / hết hạn / hết lượt / không áp cho chuyến; hold hết hạn                  | Draft             |

#### SCR-PSG-20 — B3 Thanh toán (`385:9097`)

| Trạng thái     | Nội dung cần có                                                                                                      | Thiết kế          |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Ideal          | Chọn phương thức; chọn ngân hàng (VNPay); đồng ý điều khoản; bộ đếm giữ ghế; tóm tắt đơn tách dòng                    | Review ⚠ (#2, #3, #8) |
| Empty          | Chưa đồng ý điều khoản → CTA vô hiệu                                                                                  | Draft             |
| Loading        | Đang tạo payment + chuyển sang cổng                                                                                   | Draft             |
| Partial / Edge | Phương thức tạm không khả dụng (mẫu "Sắp hỗ trợ" đã có); tổng tiền lớn (nhiều ghế); bộ đếm < 1 phút → cảnh báo        | Review + Draft    |
| Error          | Giá/ghế đổi khi kiểm tra lại (FR-BTP-04) → xác nhận lại; hold hết hạn; cổng không phản hồi; booking đã thanh toán / đã hủy → chặn thanh toán lại (FR-BTP-07) | Draft             |

#### SCR-PSG-21 — Chờ xác nhận thanh toán (chưa có frame)

| Trạng thái     | Nội dung cần có                                                    | Thiết kế |
| -------------- | ------------------------------------------------------------------ | -------- |
| Ideal          | Có kết quả → chuyển SCR-PSG-22 (`SUCCESS`) hoặc SCR-PSG-23          | Draft    |
| Empty          | —                                                                  | —        |
| Loading        | `PROCESSING`: đang chờ cổng xác nhận, tự kiểm tra lại               | Draft    |
| Partial / Edge | `RECONCILING`: "đang đối soát, sẽ báo qua email"                    | Draft    |
| Error          | Quá thời gian chờ → hướng dẫn xem vé / tra cứu; lỗi mạng khi kiểm tra | Draft    |

#### SCR-PSG-22 — B4 Thanh toán thành công (`385:8500`)

| Trạng thái     | Nội dung cần có                                                                                                   | Thiết kế          |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------- |
| Ideal          | Thành công; mã đặt vé; vé điện tử; chi tiết đơn; xem QR / in vé / gửi lại email. Figma mẫu "Tiền mặt — Chưa thanh toán", có chữ "SMS" | Review ⚠ (#2, #5) |
| Empty          | —                                                                                                                 | —                 |
| Loading        | Đang phát hành vé (payment `SUCCESS`, ticket chưa sẵn sàng)                                                        | Draft             |
| Partial / Edge | Nhiều vé / nhiều hành khách; Guest → hướng dẫn tra cứu vé bằng email; gửi lại email quá giới hạn                   | Draft             |
| Error          | Gửi lại email thất bại; mở trực tiếp khi chưa thanh toán → chuyển SCR-PSG-20 / 23                                  | Draft             |

#### SCR-PSG-23 — Thanh toán thất bại / hết hạn (chưa có frame)

| Trạng thái     | Nội dung cần có                                              | Thiết kế |
| -------------- | ------------------------------------------------------------ | -------- |
| Ideal          | `FAILED` → thử lại (hold còn) / đổi phương thức               | Draft    |
| Empty          | —                                                            | —        |
| Loading        | Đang tạo lại payment                                         | Draft    |
| Partial / Edge | Người dùng hủy trên cổng (`CANCELLED`); hold chỉ còn ít phút  | Draft    |
| Error          | `EXPIRED` → ghế đã nhả, tìm lại chuyến                       | Draft    |

#### SCR-PSG-24 — Vé của tôi (`385:9848`)

| Trạng thái     | Nội dung cần có                                                                                                                      | Thiết kế       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Ideal          | Tab Sắp tới / Đã đi / Đã hủy / Tất cả (đếm số); tìm mã vé / tuyến; thẻ chuyến gần nhất; thẻ vé `VALID` đã thanh toán                  | Review         |
| Empty          | Tab không có vé → CTA đặt vé mới / tra cứu vé khách                                                                                  | Draft          |
| Loading        | Skeleton thẻ vé                                                                                                                      | Draft          |
| Partial / Edge | 1–2 vé (Figma: 2 vé); hàng trăm vé → phân trang; nhãn `CHECKED_IN` / `USED` / `NO_SHOW` / `CANCELLED` / `REFUNDED`; chuyến bị nhà xe hủy/đổi → cần hành động (BR-12); booking `PENDING_PAYMENT` còn hold → tiếp tục thanh toán | Review + Draft |
| Error          | Tìm không có kết quả; lỗi tải (thử lại)                                                                                              | Draft          |

#### SCR-PSG-25 — Chi tiết vé (`385:10491`)

| Trạng thái     | Nội dung cần có                                                                                                                                                  | Thiết kế              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Ideal          | Vé `VALID` ("Đã xác nhận") + QR; hành trình; hành khách & thanh toán; quy định lên xe; liên hệ nhà xe; bản đồ điểm đón; in / chia sẻ / hủy. Thiếu chính sách hủy snapshot (FR-BTP-12) | Review ⚠ (#2, #4) + Draft |
| Empty          | —                                                                                                                                                                | —                     |
| Loading        | Skeleton vé                                                                                                                                                      | Draft                 |
| Partial / Edge | Vé `CHECKED_IN` / `USED` / `NO_SHOW` / `CANCELLED` / `REFUNDED` (ẩn/khóa QR khi hết hiệu lực); refund `REQUESTED` → `PROCESSING` → `SUCCESS` / `FAILED` / `REJECTED` + lý do; chuyến bị nhà xe hủy/đổi; hết hạn hủy → nút Hủy vô hiệu; booking nhiều vé | Draft                 |
| Error          | Vé không tồn tại hoặc không thuộc người xem → 404, không lộ dữ liệu; lỗi tải                                                                                      | Draft                 |

#### SCR-PSG-26 — Hủy vé (`385:14793`)

| Trạng thái     | Nội dung cần có                                                                                                                      | Thiết kế       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Ideal          | Modal xác nhận (mã đặt vé, tuyến, khởi hành); lý do tùy chọn; lưu ý mức hoàn. Thiếu số tiền hoàn dự kiến + phí hủy theo policy snapshot (FR-BTP-12/13) | Review + Draft |
| Empty          | Lý do để trống vẫn cho hủy                                                                                                           | Review         |
| Loading        | Đang tính tiền hoàn; đang hủy                                                                                                        | Draft          |
| Partial / Edge | Hủy một phần vé trong booking nhiều vé (`PARTIALLY_CANCELLED`); xác minh lại OTP (FR-IAM-10); hủy thành công → refund `REQUESTED`     | Draft          |
| Error          | Không đủ điều kiện (quá hạn / đã check-in) + lý do; hủy thất bại                                                                      | Draft          |

#### SCR-PSG-27 — Tra cứu vé B1 (`385:13572`)

| Trạng thái     | Nội dung cần có                                                              | Thiết kế            |
| -------------- | ---------------------------------------------------------------------------- | ------------------- |
| Ideal          | Tab SĐT / Email; nhập SĐT; gửi OTP; khối giới thiệu tra cứu                   | Review ⚠ (#5, UX-OQ-09) |
| Empty          | Chưa nhập → CTA vô hiệu                                                      | Draft               |
| Loading        | Đang gửi OTP                                                                 | Draft               |
| Partial / Edge | Email dài; phản hồi trung tính (không tiết lộ contact có vé hay không)        | Draft               |
| Error          | SĐT / email sai định dạng; gửi quá giới hạn; lỗi mạng                         | Draft               |

#### SCR-PSG-28 — Tra cứu vé B2 — OTP (`385:13123`)

| Trạng thái     | Nội dung cần có                                  | Thiết kế |
| -------------- | ------------------------------------------------ | -------- |
| Ideal          | 6 ô OTP; đếm ngược 5 phút; gửi lại; đổi SĐT        | Review   |
| Empty          | Chưa nhập đủ 6 số → CTA vô hiệu                   | Draft    |
| Loading        | Đang xác thực                                     | Draft    |
| Partial / Edge | Gửi lại có cooldown; còn N lần thử                | Draft    |
| Error          | Sai OTP; hết hạn; vượt số lần → khóa tạm          | Draft    |

#### SCR-PSG-29 — Kết quả tra cứu (`385:12492`)

| Trạng thái     | Nội dung cần có                                                                                                        | Thiết kế       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------- |
| Ideal          | Xác thực thành công; tab theo trạng thái (đếm số); tìm mã vé; thẻ vé; xem QR / hủy vé                                   | Review         |
| Empty          | Không có vé gắn với contact → CTA đặt vé                                                                               | Draft          |
| Loading        | Skeleton                                                                                                               | Draft          |
| Partial / Edge | Thiếu dữ liệu (giờ đến "--:--", tên nhà xe mặc định — Figma đã có); nhãn trạng thái vé như SCR-PSG-24; header phải ở trạng thái Guest (Figma đang hiện header đã đăng nhập) | Review + Draft |
| Error          | Phiên tra cứu hết hạn → về B1; tìm không có kết quả                                                                    | Draft          |

#### SCR-PSG-30 — Khiếu nại của tôi (`385:17467`)

| Trạng thái     | Nội dung cần có                                                                                                                    | Thiết kế       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Ideal          | Danh sách khiếu nại; chi tiết (danh mục, mức độ, nội dung); dòng thời gian xử lý; ô phản hồi                                        | Review         |
| Empty          | Chưa có khiếu nại → CTA gửi khiếu nại                                                                                              | Draft          |
| Loading        | Skeleton danh sách / chi tiết                                                                                                      | Draft          |
| Partial / Edge | 1 khiếu nại (Figma); nội dung dài; `TRIAGED` / `WAITING_USER` (nổi bật yêu cầu bổ sung) / `WAITING_OPERATOR` / `IN_PROGRESS` / `ESCALATED_TO_DISPUTE` / `RESOLVED` / `CLOSED` (khóa phản hồi); phản hồi kèm tệp | Review + Draft |
| Error          | Gửi phản hồi thất bại; lỗi tải                                                                                                     | Draft          |

#### SCR-PSG-31 — Gửi khiếu nại (`410:2`)

| Trạng thái     | Nội dung cần có                                                                                               | Thiết kế       |
| -------------- | ------------------------------------------------------------------------------------------------------------- | -------------- |
| Ideal          | Danh mục; mức độ; tiêu đề (≤200); mô tả (≤2000); đính kèm (ảnh/PDF/Word ≤5MB). Thiếu chọn booking/vé liên quan (FR-NSR-06) | Review + Draft |
| Empty          | Form trống, bộ đếm 0/200 và 0/2000                                                                            | Review         |
| Loading        | Đang tải tệp; đang gửi                                                                                        | Draft          |
| Partial / Edge | Chạm giới hạn ký tự; nhiều tệp; mức độ do khách chọn chỉ là gợi ý, Admin phân loại (`TRIAGED`)                 | Draft          |
| Error          | Lỗi tại field; tệp quá dung lượng / sai định dạng / tải lỗi; gửi thất bại                                      | Draft          |

#### SCR-PSG-32 — Khiếu nại của Guest (chưa có frame)

| Trạng thái     | Nội dung cần có                                         | Thiết kế |
| -------------- | ------------------------------------------------------- | -------- |
| Ideal          | Như SCR-PSG-30/31, giới hạn trong vé đã tra cứu         | Draft    |
| Empty          | Chưa có khiếu nại → CTA gửi khiếu nại                    | Draft    |
| Loading        | Như SCR-PSG-30                                          | Draft    |
| Partial / Edge | Như SCR-PSG-30                                          | Draft    |
| Error          | Phiên tra cứu hết hạn → xác minh lại OTP                 | Draft    |

#### SCR-PSG-33 — VXN Plus (`383:4`) · Chờ UX-OQ-06

| Trạng thái     | Nội dung cần có                                                    | Thiết kế      |
| -------------- | ------------------------------------------------------------------ | ------------- |
| Ideal          | Hạng hiện tại; điểm hiện có; bảng 4 hạng; ưu đãi theo hạng           | Review ⚠ (#7) |
| Empty          | —                                                                  | Chờ UX-OQ-06  |
| Loading        | —                                                                  | Chờ UX-OQ-06  |
| Partial / Edge | —                                                                  | Chờ UX-OQ-06  |
| Error          | —                                                                  | Chờ UX-OQ-06  |

#### SCR-PSG-34 — Lịch sử điểm (`385:15629`) · Chờ UX-OQ-06

| Trạng thái     | Nội dung cần có                                              | Thiết kế      |
| -------------- | ------------------------------------------------------------ | ------------- |
| Ideal          | —                                                            | Chờ UX-OQ-06  |
| Empty          | "Bạn chưa có giao dịch điểm nào" + CTA tìm chuyến             | Review ⚠ (#7) |
| Loading        | —                                                            | Chờ UX-OQ-06  |
| Partial / Edge | —                                                            | Chờ UX-OQ-06  |
| Error          | —                                                            | Chờ UX-OQ-06  |

#### SCR-PSG-35 — Đổi điểm lấy mã giảm giá (`385:16127`) · Chờ UX-OQ-06

| Trạng thái     | Nội dung cần có                                                               | Thiết kế      |
| -------------- | ----------------------------------------------------------------------------- | ------------- |
| Ideal          | Modal: điểm hiện tại; số điểm muốn đổi; chọn nhanh; giảm giá nhận được; điểm còn lại | Review ⚠ (#7) |
| Empty          | —                                                                             | Chờ UX-OQ-06  |
| Loading        | —                                                                             | Chờ UX-OQ-06  |
| Partial / Edge | —                                                                             | Chờ UX-OQ-06  |
| Error          | —                                                                             | Chờ UX-OQ-06  |

### 6.4. Lệch giữa Figma và thiết kế đã chốt

| #   | Màn hình (SCR-PSG-) | Figma hiện tại                                                                                                              | Nguồn đã chốt                                                                                                     | Đề xuất                                                                                                                                         |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 07, 08, 11          | Đăng ký/đăng nhập bằng email/SĐT + mật khẩu; quên / đổi mật khẩu; 2FA                                                       | 07 Security §5 + ADR-017/020: Passenger = Email OTP + OAuth Google/Facebook/Apple, không có mật khẩu; TOTP post-v1 | Sửa Figma theo Email OTP + OAuth, bỏ mật khẩu / 2FA. SRS FR-IAM-01/03a còn ghi "SĐT", "quên mật khẩu" → cần đồng bộ lại SRS                      |
| 2   | 20, 22, 25          | 6 phương thức: MoMo (sắp hỗ trợ), VNPay, ZaloPay (sắp hỗ trợ), Visa/Master, ATM, Tiền mặt; màn thành công mẫu "Tiền mặt — Chưa thanh toán" | ADR-019: v1 chỉ VNPay + MoMo (ZaloPay không có trong ADR; VietQR defer v1.x). OQ-07: v1 thanh toán trước, không mở trả sau cho passenger | Giữ VNPay (QR / ATM / thẻ quốc tế là lựa chọn con trong VNPay) + bật MoMo; bỏ ZaloPay + Tiền mặt; màn thành công dùng mẫu thanh toán online      |
| 3   | 18, 19, 20          | Bộ đếm "Giữ ghế trong 14:56" (~15 phút), chỉ hiện từ bước thanh toán                                                        | ADR-015 / OQ-06: hold 10 phút (`EX 600`); SRS UC giữ ghế: hiện bộ đếm ngay khi giữ ghế                             | Đổi 10:00; hiện bộ đếm từ B1 sau khi hold thành công                                                                                            |
| 4   | 16, 25              | Bản đồ Leaflet + © OpenStreetMap                                                                                            | ADR-027: Goong Maps (hiển thị đúng Hoàng Sa / Trường Sa)                                                           | Thay bằng Goong                                                                                                                                 |
| 5   | 22, 27, 28          | "Vé gửi qua email & SMS"; tra cứu / OTP qua SMS                                                                             | ADR-020: SMS defer v1                                                                                             | Copy chỉ nói email; tra cứu theo UX-OQ-09                                                                                                       |
| 6   | 01, footer          | Copy "Hoàn 90% trước 24h", "Đổi chuyến miễn phí trước 24h", link "Đổi và hủy vé"                                            | FR-BTP-12: hoàn theo chính sách snapshot của từng chuyến; SRS không có đổi vé tự phục vụ (chỉ trong luồng chuyến bị hủy / dispute) | Sửa copy trung tính ("theo chính sách nhà xe"). Muốn có đổi vé tự phục vụ = mở rộng phạm vi, cần Khanh quyết                                     |
| 7   | 01, 11, 33–35       | "Tích điểm", hạng thành viên, VXN Plus, Ví voucher                                                                          | Không có trong SRS                                                                                                | UX-OQ-06                                                                                                                                        |
| 8   | 04, 19, 20          | Dịch vụ bổ trợ (bảo hiểm, hành lý, đưa đón) cộng vào tổng tiền                                                              | Không có trong SRS                                                                                                | UX-OQ-07                                                                                                                                        |

---

## 7. Flow Operator

Login `{operatorSlug}/{username}` + password; Owner bắt buộc TOTP (ADR-017).

| Flow            | Màn hình chính                                                           | Ghi chú                                                      |
| --------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| KYC onboarding  | Profile, KYC documents (upload R2 private), bank account, status tracker | Chờ Admin duyệt; Platform cấp slug + Owner sau KYC           |
| Vehicle/SeatMap | Vehicle list, vehicle form, seat map editor                              | Không sửa tùy tiện khi đã gắn trip có vé                     |
| Route/StopPoint | Route list, route form, stop point proposal (Goong geocoding)            | StopPoint mới cần Admin duyệt                                |
| Trip/Fare       | Trip calendar/list, trip form, fare form, open/lock sale                 | Thay đổi trip đã bán vé cần lý do + audit                    |
| Booking/Ticket  | Booking list, passenger list, export                                     | Mask dữ liệu cá nhân (`0*** *** 789`) theo quyền             |
| Employee        | Employee list, role, assignment                                          | Role: TICKET_STAFF, DRIVER, SUPPORT_STAFF; Owner cấp account |
| Finance         | Escrow balance, commission, payout history, reconciliation               | Dữ liệu chỉ thuộc Operator (tenant + RLS)                    |

---

## 8. Flow Employee

App `apps/employee_mobile`; login `{operatorSlug}/{username}` (ADR-028/017).

| Flow            | Màn hình chính           | Ghi chú                                    |
| --------------- | ------------------------ | ------------------------------------------ |
| Xem nhiệm vụ    | Assigned trips           | Chỉ chuyến được phân công                  |
| Xem khách       | Passenger list           | Search theo tên/mã vé/SĐT được phép        |
| Check-in        | QR scanner / manual code | Xác thực server-side (không tin QR encode) |
| Cập nhật chuyến | Trip status              | Chỉ role/quyền phù hợp                     |
| Báo sự cố       | Incident form            | Loại sự cố, mức độ, mô tả, attachment      |
| Offline/sync    | Pending sync state       | Chính sách conflict TBD (UX-OQ-04)         |

---

## 9. Flow Admin

Login `platform/{username}` + password + **TOTP bắt buộc** (ADR-017).

| Flow                      | Màn hình chính                                                              | Ghi chú                                                                                  |
| ------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| KYC Operator              | Pending KYC list, KYC detail (xem doc R2 presigned + audit), decision modal | Approve (cấp slug+Owner) / reject / request more info                                    |
| Catalog/policy            | Catalog list, policy editor, effective date                                 | Thay đổi policy cần audit, không áp ngược (PolicySnapshot)                               |
| Payment/refund            | Transaction list, detail, refund decision                                   | Re-auth/TOTP + audit                                                                     |
| Payout confirm            | Payout batch (T+3), review, **nhập mã giao dịch ngân hàng**                 | Manual confirm tới BankAccount verified → COMPLETED (ADR-022); maker-checker khi team >1 |
| Dispute                   | Dispute queue, evidence view, decision                                      | Admin là arbiter cuối cùng (MQ-03)                                                       |
| Content/review moderation | Review/content list                                                         | Ẩn/duyệt/từ chối theo policy                                                             |
| Report                    | Dashboard, filter, export job (async BullMQ)                                | Dữ liệu lớn không chặn luồng chính                                                       |
| Audit                     | Audit search (Mongo), detail, export                                        | Mask dữ liệu nhạy cảm                                                                    |

---

## 10. Screen state và validation

### 10.1. Quy tắc 5 trạng thái chính (5 Key UI States)

Mỗi màn hình ở §6–§9 được viết thành **một bảng đủ 5 trạng thái** dưới đây để dễ kiểm tra. Trạng thái không áp dụng vẫn giữ dòng, ghi `—` kèm lý do ngắn. §7–§9 chuyển sang dạng này khi đối chiếu Figma phần Operator / Employee / Admin.

| Trạng thái     | Định nghĩa                                                                                                                 | Với màn form / modal                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Ideal          | Đầy đủ dữ liệu, luồng chính thành công (bản vẽ thường làm đầu tiên)                                                        | Form nhập hợp lệ, gửi thành công       |
| Empty          | Người dùng chưa có dữ liệu; bắt buộc có gợi ý hành động tiếp theo (onboarding / CTA)                                        | Form trống ban đầu, CTA vô hiệu        |
| Loading        | Dữ liệu đang tải: skeleton / spinner                                                                                       | Đang gửi / đang xác thực               |
| Partial / Edge | Chỉ 1–2 item thay vì hàng chục; tên / địa chỉ quá dài gây tràn chữ (truncation); số lượng quá lớn (1.000.000+); biến thể trạng thái nghiệp vụ (SRS §17) | Chạm giới hạn nhập, biến thể theo actor |
| Error          | Lỗi mạng (offline), lỗi hệ thống (404, 500, 503), không tìm thấy kết quả tìm kiếm                                          | Lỗi tại field, gửi thất bại            |

### 10.2. Yêu cầu chung theo loại trạng thái

| Loại state          | Bắt buộc xử lý                                                                       |
| ------------------- | ------------------------------------------------------------------------------------ |
| Loading             | Skeleton/spinner phù hợp, không khóa toàn app nếu chỉ refresh một panel              |
| Empty               | Thông báo rõ, có hướng hành động kế tiếp                                             |
| Error               | Message rõ (RFC 7807 `code` map UX), không lộ dữ liệu nhạy cảm, có retry nếu phù hợp |
| Permission denied   | Hiển thị không đủ quyền, không lộ dữ liệu bị chặn                                    |
| Stale data          | Yêu cầu reload/xác nhận lại khi giá/ghế/policy thay đổi                              |
| Form invalid        | Báo lỗi tại field (Zod schema), không chỉ báo lỗi tổng quát                          |
| Service unavailable | Redis down → 503: báo "thử lại sau 30s" cho booking (ADR-015)                        |
| Offline mobile      | Hiển thị pending sync, retry, cảnh báo dữ liệu chưa đồng bộ                          |

---

## 11. Open Questions / TBD

| ID       | Câu hỏi                                                                  | Tác động            | Trạng thái                                                                   |
| -------- | ------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------- |
| UX-OQ-01 | Guest checkout có trong v1 không?                                        | Public booking flow | **Đóng theo SRS/GLOSSARY**: Guest có guest session cho hold/book/pay/lookup  |
| UX-OQ-02 | Web dùng token storage hay cookie session?                               | Auth UX và Security | **Đóng theo ADR-017**: Web = httpOnly cookie; Mobile = secure-store (Bearer) |
| UX-OQ-03 | Seat map editor dùng grid tự do hay template theo vehicle type?          | Operator UI         | Mở; chốt khi thiết kế component (LLD/UI detail)                              |
| UX-OQ-04 | Offline check-in cho Employee có cho xác nhận khi chưa gọi server không? | Mobile flow và risk | Mở; cần quyết risk (double check-in vs UX offline)                           |
| UX-OQ-05 | Brand positioning marketplace trung lập hay Platform brand nổi bật?      | Public UI           | **Đóng theo OQ-20**: marketplace trung lập; tên Operator là tín hiệu chính   |
| UX-OQ-06 | Chương trình thành viên **VXN Plus** (hạng, tích điểm, đổi điểm lấy mã giảm, Ví voucher, giảm theo hạng) có vào v1 không? Không có trong SRS; đụng money (quy đổi điểm → VND), ai chịu phần giảm (Platform hay Operator — ảnh hưởng commission/escrow), cần module mới | SRS, DB, API, booking total | Mở. Đề xuất: post-v1, ẩn khỏi nav v1 |
| UX-OQ-07 | **Dịch vụ bổ trợ** (bảo hiểm chuyến đi, hành lý ký gửi, đưa đón) có vào v1 không? Không có trong SRS; đụng price snapshot, tách dòng (CO-12), hoàn tiền, commission; bảo hiểm cần đối tác bên ngoài (vendor mới) | SRS, booking total, refund | Mở. Đề xuất: post-v1; Figma trang này còn skeleton TODO |
| UX-OQ-08 | Trang **Khám phá** (tin tức / cẩm nang): SRS chỉ có banner, FAQ, content page do Admin kiểm duyệt (FR-ADM-13). Bài viết có tính là content page không, ai soạn (Admin CMS)? | Admin CMS, SEO Marketplace | Mở |
| UX-OQ-09 | **Tra cứu vé Guest bằng SĐT**: SMS defer v1 (ADR-020) thì OTP gửi về đâu? (a) chỉ cho tra cứu bằng email; (b) SĐT chỉ dùng để tìm, OTP gửi về email liên hệ của booking | FR-MKT-12, `/guest/ticket-lookup` | Mở |

---

### Quy ước mã trong UI/UX Flow

- `UX-OQ-NN`: Câu hỏi mở của UI/UX Flow.
- `SCR-PSG-NN`: Màn hình Passenger / Guest (§6.1).
