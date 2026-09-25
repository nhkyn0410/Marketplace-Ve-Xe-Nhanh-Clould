import type { VerifiedAccessToken } from "../auth/token.service";

export type AccountActor = Pick<
  VerifiedAccessToken,
  "sub" | "sid" | "scope" | "role" | "operatorId" | "operatorSlug"
>;

export type AccountRequestContext = {
  ip?: string;
  userAgent?: string;
};

export type ProvisionOperatorOwnerInput = {
  /** OPR-001 có thể truyền id của hồ sơ KYC đã duyệt; bỏ trống thì service sinh UUID. */
  operatorId?: string;
  operatorSlug: string;
  displayName: string;
  ownerUsername: string;
  contactEmail: string;
  reason: string;
};

export type ProvisionedOperatorOwner = {
  operatorId: string;
  ownerAccountId: string;
};

/** DTO chặn ở HTTP; primitive/service vẫn chặn lại để caller nội bộ không bypass audit reason. */
export function requireAccountReason(value: string): string {
  const reason = value.trim();
  if (reason.length < 3) {
    throw new Error("Account mutation requires a reason of at least 3 characters.");
  }
  return reason;
}
