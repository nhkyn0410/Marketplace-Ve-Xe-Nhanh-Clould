import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const UsernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[A-Za-z0-9._-]+$/, "Username chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.");
const ContactEmailSchema = z.email().transform((email) => email.toLowerCase());
const EmployeeRoleSchema = z.enum(["DRIVER", "TICKET_STAFF", "SUPPORT_STAFF"]);
const AccountStatusSchema = z.enum(["ACTIVE", "LOCKED", "DISABLED"]);
const ReasonSchema = z.string().trim().min(3).max(500);

export class EmployeeListQueryDto extends createZodDto(
  z.object({
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

export class EmployeeCreateDto extends createZodDto(
  z.object({
    username: UsernameSchema,
    contactEmail: ContactEmailSchema,
    role: EmployeeRoleSchema,
    reason: ReasonSchema,
  }),
) {}

export class EmployeeUpdateDto extends createZodDto(
  z
    .object({
      username: UsernameSchema.optional(),
      contactEmail: ContactEmailSchema.optional(),
      role: EmployeeRoleSchema.optional(),
      status: AccountStatusSchema.optional(),
      reason: ReasonSchema,
    })
    .refine(
      ({ username, contactEmail, role, status }) =>
        username !== undefined || contactEmail !== undefined || role !== undefined || status !== undefined,
      { message: "Cần ít nhất một trường cập nhật." },
    ),
) {}

export class EmployeePasswordResetDto extends createZodDto(
  z.object({ reason: ReasonSchema }),
) {}

export const EmployeeAccountResponseSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  /** Nullable chỉ cho account legacy; mọi create/reset IAM-005 đều bắt buộc email. */
  contactEmail: z.email().nullable(),
  role: EmployeeRoleSchema,
  status: AccountStatusSchema,
  credentialDeliveryPending: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type EmployeeAccountResponse = z.infer<typeof EmployeeAccountResponseSchema>;
export class EmployeeAccountResponseDto extends createZodDto(EmployeeAccountResponseSchema) {}

export const EmployeeListResponseSchema = z.object({
  items: z.array(EmployeeAccountResponseSchema),
  nextCursor: z.uuid().nullable(),
});
export type EmployeeListResponse = z.infer<typeof EmployeeListResponseSchema>;
export class EmployeeListResponseDto extends createZodDto(EmployeeListResponseSchema) {}

export const AccountMutationResponseSchema = z.object({ status: z.literal("ok") });
export type AccountMutationResponse = z.infer<typeof AccountMutationResponseSchema>;
export class AccountMutationResponseDto extends createZodDto(AccountMutationResponseSchema) {}
