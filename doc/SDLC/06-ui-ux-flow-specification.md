# 06. UI/UX Flow Specification - Hệ thống đặt vé xe khách

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                          |
| ------------- | -------------------------------- |
| Tên tài liệu  | UI/UX Flow Specification         |
| Mã tài liệu   | 06-ui-ux-flow-specification      |
| Dự án         | Marketplace-Ve-Xe-Nhanh          |
| Trạng thái    | Approved                            |
| Người viết    | Nguyễn Hồng Khanh, AI Agent      |
| Người duyệt   | Nguyễn Hồng Khanh                |
| Ngày tạo      | 11/05/2026                       |
| Ngày cập nhật | 01/06/2026                       |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                         |
| --------- | ---------- | -------------- | ----------------------------------------- |
| v0.1      | 11/05/2026 | AI Agent       | Tạo bản nháp UI/UX Flow Specification     |
| v0.2      | 01/06/2026 | AI Agent       | **Rework** đồng bộ stack/quyết định (UI vốn tech-independent, chỉ chỉnh touchpoint): §4 kênh = Marketplace/Operator OS/Admin (Next.js) + 2 app Expo (Passenger/Employee) (ADR-013/014); §6.1 thêm flow đăng nhập Passenger (Email OTP + OAuth Google/FB/Apple, ADR-020); §6.2 payment = VNPay/MoMo redirect + seat hold timer 10 phút; §7/§9 login `{slug}/{username}` + `platform/{username}` + TOTP (ADR-017); §9 thêm flow payout confirm (manual + bank ref, ADR-022); KYC upload R2 (ADR-018). Đổi "User" → "Passenger". **Đóng UX-OQ-01** (guest checkout per SRS), **UX-OQ-02** (cookie+Bearer per ADR-017), **UX-OQ-05** (brand trung lập per OQ-20). |

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

Tài liệu này mô tả luồng màn hình, trạng thái giao diện, form validation và xử lý lỗi ở mức UX. UI/UX độc lập tech-stack về bản chất; bản rework này chỉ đồng bộ các touchpoint kỹ thuật (auth, payment, kênh) với quyết định đã chốt. Tham chiếu: `01-srs`, `05-api` (v0.2, endpoint), `07-security` (v0.4, auth UX), `context/GLOSSARY` (actor naming). Visual/component/wireframe chi tiết phát triển sau khi flow được duyệt + sau khi chốt component lib (ADR-013 — Shadcn/ui recommend).

---

## 4. Kênh giao diện

Web = Next.js 16 (ADR-013); Mobile = Expo 2 app tách (ADR-014).

| Kênh | Actor | Mục tiêu |
| ---- | ----- | -------- |
| Marketplace (Web, RSC+SSG/ISR) | Passenger, Guest | Search, trip detail, booking, payment, ticket lookup |
| Operator OS (Web, CSR sau auth) | Operator, Employee | Quản lý profile, vehicle, route, trip, booking, employee, finance |
| Admin (Web, CSR sau auth) | Admin | KYC, catalog, policy, payment, payout, dispute, report, audit |
| `apps/passenger-mobile` (Expo) | Passenger | Booking/ticket/notification/support trên mobile |
| `apps/employee-mobile` (Expo) | Employee | Check-in, trip status, passenger list, incident report (background geo) |

---

## 5. Information architecture

| Portal | Nhóm navigation chính |
| ------ | --------------------- |
| Marketplace/Passenger | Search, Trip detail, Booking stepper, Payment result, My tickets, Support, Profile, Notification settings |
| Operator OS | Dashboard, Profile/KYC, Vehicles, Seat maps, Routes, Trips, Bookings, Employees, Finance (escrow/payout), Reports, Support |
| Employee | Assigned trips, Passenger list, QR scan, Trip status, Journey log, Incidents, Profile |
| Admin | Dashboard, Operators/KYC, Passengers, Catalog, Policy, Payments/Refunds, Payouts, Disputes, Promotions, Reports, Audit, Integrations |

---

## 6. Flow hành khách (Passenger / Guest)

### 6.1. Đăng nhập / đăng ký Passenger

| Bước | Màn hình | Trạng thái chính |
| ---- | -------- | ---------------- |
| 1 | Chọn phương thức | Email OTP / OAuth Google / Facebook / Apple (ADR-020) |
| 2 | Email OTP | nhập email, gửi OTP (Resend), nhập OTP, lỗi/hết hạn/rate-limit |
| 3 | OAuth redirect | redirect provider, callback, account linking (email khớp → merge) |
| 4 | Kết quả | success (token httpOnly cookie Web / secure-store Mobile), failed |

> Guest không cần đăng nhập cho search/hold/book/pay/lookup; chỉ verify email/OTP cho thao tác nhạy cảm + lookup (SRS/GLOSSARY).

### 6.2. Search → booking → ticket

| Bước | Màn hình | Trạng thái chính |
| ---- | -------- | ---------------- |
| 1 | Search form | default, invalid input, loading |
| 2 | Search result | loading, empty, result, filter/sort active, stale availability |
| 3 | Trip detail | loading, unavailable, open for sale, seat map loaded (Goong map điểm đón/trả) |
| 4 | Seat selection | available/holding/booked/blocked, **hold timer 10 phút** (OQ-06), hold conflict |
| 5 | Passenger/contact form | valid, invalid, promotion valid/invalid |
| 6 | Booking summary | price snapshot (BIGINT VND), policy confirmation, expired hold |
| 7 | Payment redirect/result | chọn **VNPay / MoMo** → redirect cổng → processing, success, failed, reconciling (ADR-019) |
| 8 | Ticket detail | valid, cancelled, checked-in, refunded; QR token |

### 6.3. Hủy vé / hoàn tiền

| Bước | Màn hình | Ghi chú |
| ---- | -------- | ------- |
| 1 | Ticket detail | Hiển thị chính sách hủy snapshot |
| 2 | Cancel/refund preview | Số tiền hoàn dự kiến, phí, lý do đủ/không đủ điều kiện |
| 3 | Confirmation | Re-auth nếu cần |
| 4 | Refund status | requested, processing, success, failed, rejected |

### 6.4. Support / complaint / review

| Bước | Màn hình | Ghi chú |
| ---- | -------- | ------- |
| 1 | Support center | Chọn booking/ticket/trip liên quan |
| 2 | Create ticket | Loại vấn đề, mô tả, attachment (upload R2) |
| 3 | Ticket thread | Trao đổi, trạng thái, yêu cầu bổ sung |
| 4 | Review form | Chỉ sau khi trip completed và ticket hợp lệ |

---

## 7. Flow Operator

Login `{operatorSlug}/{username}` + password; Owner bắt buộc TOTP (ADR-017).

| Flow | Màn hình chính | Ghi chú |
| ---- | -------------- | ------- |
| KYC onboarding | Profile, KYC documents (upload R2 private), bank account, status tracker | Chờ Admin duyệt; Platform cấp slug + Owner sau KYC |
| Vehicle/SeatMap | Vehicle list, vehicle form, seat map editor | Không sửa tùy tiện khi đã gắn trip có vé |
| Route/StopPoint | Route list, route form, stop point proposal (Goong geocoding) | StopPoint mới cần Admin duyệt |
| Trip/Fare | Trip calendar/list, trip form, fare form, open/lock sale | Thay đổi trip đã bán vé cần lý do + audit |
| Booking/Ticket | Booking list, passenger list, export | Mask dữ liệu cá nhân (`0*** *** 789`) theo quyền |
| Employee | Employee list, role, assignment | Role: TICKET_STAFF, DRIVER, SUPPORT_STAFF; Owner cấp account |
| Finance | Escrow balance, commission, payout history, reconciliation | Dữ liệu chỉ thuộc Operator (tenant + RLS) |

---

## 8. Flow Employee

App `apps/employee-mobile`; login `{operatorSlug}/{username}` (ADR-014/017).

| Flow | Màn hình chính | Ghi chú |
| ---- | -------------- | ------- |
| Xem nhiệm vụ | Assigned trips | Chỉ chuyến được phân công |
| Xem khách | Passenger list | Search theo tên/mã vé/SĐT được phép |
| Check-in | QR scanner / manual code | Xác thực server-side (không tin QR encode) |
| Cập nhật chuyến | Trip status | Chỉ role/quyền phù hợp |
| Báo sự cố | Incident form | Loại sự cố, mức độ, mô tả, attachment |
| Offline/sync | Pending sync state | Chính sách conflict TBD (UX-OQ-04) |

---

## 9. Flow Admin

Login `platform/{username}` + password + **TOTP bắt buộc** (ADR-017).

| Flow | Màn hình chính | Ghi chú |
| ---- | -------------- | ------- |
| KYC Operator | Pending KYC list, KYC detail (xem doc R2 presigned + audit), decision modal | Approve (cấp slug+Owner) / reject / request more info |
| Catalog/policy | Catalog list, policy editor, effective date | Thay đổi policy cần audit, không áp ngược (PolicySnapshot) |
| Payment/refund | Transaction list, detail, refund decision | Re-auth/TOTP + audit |
| Payout confirm | Payout batch (T+3), review, **nhập mã giao dịch ngân hàng** | Manual confirm tới BankAccount verified → COMPLETED (ADR-022); maker-checker khi team >1 |
| Dispute | Dispute queue, evidence view, decision | Admin là arbiter cuối cùng (MQ-03) |
| Content/review moderation | Review/content list | Ẩn/duyệt/từ chối theo policy |
| Report | Dashboard, filter, export job (async BullMQ) | Dữ liệu lớn không chặn luồng chính |
| Audit | Audit search (Mongo), detail, export | Mask dữ liệu nhạy cảm |

---

## 10. Screen state và validation

| Loại state | Bắt buộc xử lý |
| ---------- | -------------- |
| Loading | Skeleton/spinner phù hợp, không khóa toàn app nếu chỉ refresh một panel |
| Empty | Thông báo rõ, có hướng hành động kế tiếp |
| Error | Message rõ (RFC 7807 `code` map UX), không lộ dữ liệu nhạy cảm, có retry nếu phù hợp |
| Permission denied | Hiển thị không đủ quyền, không lộ dữ liệu bị chặn |
| Stale data | Yêu cầu reload/xác nhận lại khi giá/ghế/policy thay đổi |
| Form invalid | Báo lỗi tại field (Zod schema), không chỉ báo lỗi tổng quát |
| Service unavailable | Redis down → 503: báo "thử lại sau 30s" cho booking (ADR-015) |
| Offline mobile | Hiển thị pending sync, retry, cảnh báo dữ liệu chưa đồng bộ |

---

## 11. Open Questions / TBD

| ID | Câu hỏi | Tác động | Trạng thái |
| -- | ------- | -------- | ---------- |
| UX-OQ-01 | Guest checkout có trong v1 không? | Public booking flow | **Đóng theo SRS/GLOSSARY**: Guest có guest session cho hold/book/pay/lookup |
| UX-OQ-02 | Web dùng token storage hay cookie session? | Auth UX và Security | **Đóng theo ADR-017**: Web = httpOnly cookie; Mobile = secure-store (Bearer) |
| UX-OQ-03 | Seat map editor dùng grid tự do hay template theo vehicle type? | Operator UI | Mở; chốt khi thiết kế component (LLD/UI detail) |
| UX-OQ-04 | Offline check-in cho Employee có cho xác nhận khi chưa gọi server không? | Mobile flow và risk | Mở; cần quyết risk (double check-in vs UX offline) |
| UX-OQ-05 | Brand positioning marketplace trung lập hay Platform brand nổi bật? | Public UI | **Đóng theo OQ-20**: marketplace trung lập; tên Operator là tín hiệu chính |

---

### Quy ước mã trong UI/UX Flow

- `UX-OQ-NN`: Câu hỏi mở của UI/UX Flow.
