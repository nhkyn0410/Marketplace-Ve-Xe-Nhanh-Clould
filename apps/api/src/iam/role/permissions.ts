import { Role } from "./role";

/**
 * Danh mục quyền — chép từ Security §7 (permission matrix) + API §7.3 + FR-IAM-05/08. Chỉ ô RÕ
 * NGHĨA của ma trận; ô có điều kiện ("có thể hỗ trợ nếu được phép", "log tenant nếu được cấp") để
 * task sở hữu quyết (TASK-IAM-003 todo). Tên = `resource:action`.
 */
export const PERMISSIONS = [
  "trip:search", // §7 Search trip
  "booking:create", // §7 Create booking
  "payment:create", // §7 Payment
  "payment:monitor", // §7 Payment — "giám sát/đối soát"
  "refund:request", // §7 Cancel/refund request
  "vehicle:manage", // §7 Vehicle/SeatMap
  "vehicle:read", // §7 Vehicle/SeatMap — "xem nếu được phân công"
  "route:manage", // §7 Route/StopPoint (TASK-TRN-002, SRS permission matrix) — route, điểm riêng, đề xuất
  "checkin:perform", // §7 Check-in
  "checkin:read", // §7 Check-in — "xem kết quả" / "giám sát"
  "kyc:submit", // §7 KYC — "hồ sơ của mình"
  "kyc:review", // §7 KYC — "duyệt/quản lý"
  "finance:read", // §7 Policy/commission/payout — "xem phần liên quan"
  "finance:configure", // §7 Policy/commission/payout — "cấu hình"
  "audit:read", // §7 Audit log
  "employee:manage", // API §7.3 /operator/employees, FR-IAM-05
  "account:lock", // FR-IAM-08 (Admin, Nhà xe)
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Phạm vi một grant — cho service biết phải lọc gì:
 * - `any`: toàn hệ thống (chỉ PLATFORM_*, hoặc dữ liệu công khai như tìm chuyến).
 * - `tenant`: trong Operator của chính actor → DbScope tenant + RLS.
 * - `assigned`: trong tenant VÀ theo phân công — lọc phân công là ABAC, task EMP làm.
 * - `own`: của chính actor (booking của mình, guest session) — service kiểm ownership.
 */
export type GrantScope = "any" | "tenant" | "assigned" | "own";

type Grants = Readonly<Partial<Record<Permission, GrantScope>>>;

/** 3 role Employee dùng chung tới khi task EMP tách quyền theo từng role (BR-43). */
const EMPLOYEE: Grants = {
  "vehicle:read": "assigned",
  "checkin:perform": "assigned",
};

/**
 * Bảng role → quyền. `Record<Role, …>`: thêm role mà quên dòng ở đây thì TypeScript báo lỗi.
 * Test bất biến (`permissions.spec.ts`) chặn thêm: role phía Operator không được grant `any`, enum
 * Postgres có role mà bảng này không có, quyền không ai được cấp.
 */
export const ROLE_GRANTS: Readonly<Record<Role, Grants>> = {
  [Role.ANONYMOUS]: {
    "trip:search": "any",
    "booking:create": "own", // guest session
    "payment:create": "own",
    "refund:request": "own", // sau khi xác minh mã booking + contact (Security §8)
  },
  [Role.PASSENGER]: {
    "trip:search": "any",
    "booking:create": "own",
    "payment:create": "own",
    "refund:request": "own",
  },
  [Role.OPERATOR_OWNER]: {
    "trip:search": "tenant",
    "refund:request": "tenant",
    "vehicle:manage": "tenant",
    "vehicle:read": "tenant",
    "route:manage": "tenant",
    "checkin:read": "tenant",
    "kyc:submit": "tenant",
    "finance:read": "tenant",
    "employee:manage": "tenant",
    "account:lock": "tenant",
  },
  [Role.DRIVER]: EMPLOYEE,
  [Role.TICKET_STAFF]: EMPLOYEE,
  [Role.SUPPORT_STAFF]: EMPLOYEE,
  [Role.PLATFORM_ADMIN]: {
    "trip:search": "any",
    "payment:monitor": "any",
    "refund:request": "any",
    "vehicle:read": "any",
    "checkin:read": "any",
    "kyc:review": "any",
    "finance:read": "any",
    "finance:configure": "any",
    "audit:read": "any",
    "account:lock": "any",
  },
  // GIẢ ĐỊNH (Security §7 chỉ có một cột "Admin"): tối thiểu quyền — chỉ đọc/giám sát, không duyệt,
  // cấu hình hay hoàn tiền. Khanh đổi thì chỉ sửa dòng này.
  [Role.PLATFORM_SUPPORT]: {
    "trip:search": "any",
    "payment:monitor": "any",
    "vehicle:read": "any",
    "checkin:read": "any",
    "finance:read": "any",
  },
};
