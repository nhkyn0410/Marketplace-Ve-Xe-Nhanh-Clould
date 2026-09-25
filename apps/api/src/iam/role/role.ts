/**
 * 8 role RBAC v1 (ADR-017: hardcoded enum, ABAC defer). MỘT nguồn duy nhất.
 *
 * Guard và controller KHÔNG BAO GIỜ so sánh tên role — chỉ hỏi quyền qua `can()`. Nhờ vậy thêm role
 * chỉ là: giá trị enum Postgres (nếu là role tài khoản) + một dòng ở đây + một dòng `ROLE_GRANTS`.
 * Playbook đầy đủ: `doc/task-propreties/IAM-003-todo.md` — "Cách thêm role mới".
 */
export const Role = {
  /** Không token. Chỉ để `can()` trả lời cho route công khai — không bao giờ nằm trong JWT. */
  ANONYMOUS: "ANONYMOUS",
  PASSENGER: "PASSENGER",
  OPERATOR_OWNER: "OPERATOR_OWNER",
  DRIVER: "DRIVER",
  TICKET_STAFF: "TICKET_STAFF",
  SUPPORT_STAFF: "SUPPORT_STAFF",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_SUPPORT: "PLATFORM_SUPPORT",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * Namespace token của từng role (ADR-017: passenger / operator / platform). TokenService từ chối token
 * mà `role` không khớp `scope` — role lạ hay token "platform" mang role PASSENGER không bao giờ tới
 * được guard. `Record<Role, …>`: thêm role mà quên khai scope thì TypeScript báo lỗi.
 */
export const ROLE_SCOPE: Readonly<Record<Role, "passenger" | "operator" | "platform" | null>> = {
  [Role.ANONYMOUS]: null,
  [Role.PASSENGER]: "passenger",
  [Role.OPERATOR_OWNER]: "operator",
  [Role.DRIVER]: "operator",
  [Role.TICKET_STAFF]: "operator",
  [Role.SUPPORT_STAFF]: "operator",
  [Role.PLATFORM_ADMIN]: "platform",
  [Role.PLATFORM_SUPPORT]: "platform",
};

/**
 * Role phải qua TOTP/backup code trước khi được cấp token (ADR-017, Security §5.2; TASK-IAM-004).
 * Employee (Driver/TicketStaff/SupportStaff) là "optional" — defer, nên hiện `false`.
 * `Record<Role, …>`: thêm role mà quên quyết định MFA thì TypeScript báo lỗi.
 */
export const ROLE_REQUIRES_MFA: Readonly<Record<Role, boolean>> = {
  [Role.ANONYMOUS]: false,
  [Role.PASSENGER]: false,
  [Role.OPERATOR_OWNER]: true,
  [Role.DRIVER]: false,
  [Role.TICKET_STAFF]: false,
  [Role.SUPPORT_STAFF]: false,
  [Role.PLATFORM_ADMIN]: true,
  [Role.PLATFORM_SUPPORT]: true,
};

const ROLES: ReadonlySet<string> = new Set(Object.values(Role));

/** Claim `role` là chuỗi trong JWT — role lạ thì KHÔNG được coi là role nào (fail-closed). */
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.has(value);
}

/** Role lạ → `false` ở đây, nhưng TokenService đã từ chối role lạ trước đó (fail-closed). */
export function requiresMfa(role: string): boolean {
  return isRole(role) && ROLE_REQUIRES_MFA[role];
}

/** Keep role-name decisions in iam/role; callers use intent-specific predicates. */
export function isPlatformAdminRole(role: string): boolean {
  return role === Role.PLATFORM_ADMIN;
}

export function isOperatorOwnerRole(role: string): boolean {
  return role === Role.OPERATOR_OWNER;
}
