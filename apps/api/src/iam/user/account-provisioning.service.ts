import { randomBytes, randomUUID } from "node:crypto";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import { AuditService, type AuditEventInput } from "../../audit/audit.service";
import { PrismaService } from "../../database/prisma.service";
import { EMAIL_NOTIFIER, type EmailNotifier, maskEmail } from "../../external/notification/email-notifier";
import { CredentialService } from "../auth/credential.service";
import { reauthRequired } from "../auth/auth.errors";
import type { Authorization } from "../role/authorization";
import { permissionDenied } from "../role/authorization.errors";
import { isPlatformAdminRole } from "../role/role";
import { SessionService } from "../session/session.service";
import { deviceLabel, maskIpAddress } from "../session/session.service";
import {
  accountStateConflict,
  accountUsernameConflict,
  isPrismaUniqueConflict,
  temporaryPasswordDeliveryFailed,
} from "./account.errors";
import type {
  AccountActor,
  AccountRequestContext,
  ProvisionedOperatorOwner,
  ProvisionOperatorOwnerInput,
} from "./account.types";
import { requireAccountReason } from "./account.types";
import { TemporaryCredentialEmailLimiter } from "./temporary-credential-email-limiter";

export const TEMPORARY_PASSWORD_TTL_MS = 24 * 60 * 60 * 1000;

const ProvisionOperatorOwnerSchema = z.object({
  operatorId: z.uuid().optional(),
  operatorSlug: z.string().trim().toLowerCase().min(3).max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/).refine((slug) => slug !== "platform"),
  displayName: z.string().trim().min(1).max(200),
  ownerUsername: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9._-]+$/),
  contactEmail: z.string().trim().pipe(z.email().max(254)).transform((email) => email.toLowerCase()),
  reason: z.string().trim().min(3).max(500),
});

@Injectable()
export class AccountProvisioningService {
  private readonly logger = new Logger(AccountProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialService,
    @Inject(EMAIL_NOTIFIER) private readonly email: EmailNotifier,
    private readonly audit: AuditService,
    private readonly sessions: SessionService,
    private readonly emailLimiter: TemporaryCredentialEmailLimiter,
  ) {}

  /**
   * Primitive cho OPR-001: tạo tenant + Owner đầu tiên, không mở endpoint/KYC giả.
   * Chỉ PlatformAdmin có recent re-auth mới gọi được kể cả khi bypass controller.
   */
  async provisionOperatorOwner(
    actor: AccountActor,
    authz: Authorization,
    input: ProvisionOperatorOwnerInput,
    context: AccountRequestContext = {},
  ): Promise<ProvisionedOperatorOwner> {
    if (
      actor.scope !== "platform" ||
      !isPlatformAdminRole(actor.role) ||
      !authz.db ||
      authz.db.kind !== "platform"
    ) {
      throw permissionDenied();
    }
    await this.assertRecentReauth(actor.sid);

    const parsed = ProvisionOperatorOwnerSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Thông tin cấp tài khoản Owner không hợp lệ.");
    }
    const valid = parsed.data;
    const operatorId = valid.operatorId ?? randomUUID();
    const ownerAccountId = randomUUID();
    const operatorSlug = valid.operatorSlug;
    const ownerUsername = valid.ownerUsername;
    const contactEmail = valid.contactEmail;
    const reason = valid.reason;

    await this.audit.recordAuditEvent({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.operator.provision.intent",
      targetType: "operator",
      targetId: operatorId,
      reason,
      after: auditSnapshot(context, {
        operatorSlug,
        ownerAccountId,
        ownerUsername,
        contactEmail: maskEmail(contactEmail),
      }),
    });

    await this.emailLimiter.reserve({
      operatorId,
      actorType: actor.scope,
      actorId: actor.sub,
    });

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await this.credentials.hash(temporaryPassword);
    const temporaryPasswordExpiresAt = new Date(Date.now() + TEMPORARY_PASSWORD_TTL_MS);

    let ownerVersion: number;
    try {
      const created = await this.prisma.withScope(authz.db, async (tx) => {
        await tx.operatorProfile.create({
          data: {
            id: operatorId,
            operatorSlug,
            displayName: valid.displayName,
            status: "ACTIVE",
          },
        });
        return tx.operatorAccount.create({
          data: {
            id: ownerAccountId,
            operatorId,
            operatorSlug,
            username: ownerUsername,
            contactEmail,
            passwordHash,
            passwordChangeRequired: true,
            credentialDeliveryPending: true,
            temporaryPasswordExpiresAt,
            role: "OPERATOR_OWNER",
            status: "ACTIVE",
          },
          select: { version: true },
        });
      });
      ownerVersion = created.version;
    } catch (error) {
      if (isPrismaUniqueConflict(error)) {
        throw accountUsernameConflict();
      }
      throw error;
    }

    try {
      if (!this.email.sendTemporaryPassword) {
        throw new Error("Temporary password delivery is not configured.");
      }
      await this.email.sendTemporaryPassword({
        email: contactEmail,
        temporaryPassword,
        loginIdentifier: `${operatorSlug}/${ownerUsername}`,
        expiresAt: temporaryPasswordExpiresAt,
      });
    } catch {
      this.recordBestEffort({
        actorId: actor.sub,
        actorRole: actor.role,
        action: "iam.operator.provision.delivery_failed",
        targetType: "operator_account",
        targetId: ownerAccountId,
        operatorId,
        reason,
      });
      throw temporaryPasswordDeliveryFailed();
    }

    const activated = await this.prisma.withScope(authz.db, (tx) =>
      tx.operatorAccount.updateMany({
        where: {
          id: ownerAccountId,
          operatorId,
          credentialDeliveryPending: true,
          version: ownerVersion,
        },
        data: { credentialDeliveryPending: false, version: { increment: 1 } },
      }),
    );
    if (activated.count !== 1) {
      throw accountStateConflict();
    }

    this.recordBestEffort({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.operator.provision.success",
      targetType: "operator",
      targetId: operatorId,
      operatorId,
      reason,
      after: auditSnapshot(context, { ownerAccountId, credentialDeliveryPending: false }),
    });
    return { operatorId, ownerAccountId };
  }

  /**
   * Recovery primitive cho OPR-001 khi lần gửi đầu lỗi: provision lại sẽ xung đột slug.
   * Chỉ xử lý account có cờ chờ gửi; không thay đổi trạng thái khóa hành chính.
   */
  async retryOwnerDelivery(
    actor: AccountActor,
    authz: Authorization,
    input: { operatorSlug: string; ownerUsername: string; reason: string },
    context: AccountRequestContext = {},
  ): Promise<void> {
    if (
      actor.scope !== "platform" ||
      !isPlatformAdminRole(actor.role) ||
      !authz.db ||
      authz.db.kind !== "platform"
    ) {
      throw permissionDenied();
    }
    await this.assertRecentReauth(actor.sid);
    const owner = await this.prisma.withScope(authz.db, (tx) =>
      tx.operatorAccount.findFirst({
        where: {
          operatorSlug: input.operatorSlug.trim().toLowerCase(),
          username: input.ownerUsername.trim(),
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
        },
        select: {
          id: true,
          operatorId: true,
          operatorSlug: true,
          username: true,
          contactEmail: true,
          version: true,
        },
      }),
    );
    if (!owner?.contactEmail) {
      throw accountStateConflict();
    }
    const reason = requireAccountReason(input.reason);
    await this.audit.recordAuditEvent({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.operator.provision_retry.intent",
      targetType: "operator_account",
      targetId: owner.id,
      operatorId: owner.operatorId,
      reason,
      after: auditSnapshot(context, { contactEmail: maskEmail(owner.contactEmail) }),
    });
    await this.emailLimiter.reserve({
      operatorId: owner.operatorId,
      actorType: actor.scope,
      actorId: actor.sub,
    });
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await this.credentials.hash(temporaryPassword);
    const temporaryPasswordExpiresAt = new Date(Date.now() + TEMPORARY_PASSWORD_TTL_MS);
    const [pending] = await this.prisma.withScope(authz.db, (tx) =>
      tx.operatorAccount.updateManyAndReturn({
        where: {
          id: owner.id,
          operatorId: owner.operatorId,
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
          version: owner.version,
        },
        data: {
          passwordHash,
          temporaryPasswordExpiresAt,
          authEpoch: { increment: 1 },
          version: { increment: 1 },
        },
        select: { version: true },
      }),
    );
    if (!pending) {
      throw accountStateConflict();
    }
    try {
      if (!this.email.sendTemporaryPassword) {
        throw new Error("Temporary password delivery is not configured.");
      }
      await this.email.sendTemporaryPassword({
        email: owner.contactEmail,
        temporaryPassword,
        loginIdentifier: `${owner.operatorSlug}/${owner.username}`,
        expiresAt: temporaryPasswordExpiresAt,
      });
    } catch {
      this.recordBestEffort({
        actorId: actor.sub,
        actorRole: actor.role,
        action: "iam.operator.provision_retry.delivery_failed",
        targetType: "operator_account",
        targetId: owner.id,
        operatorId: owner.operatorId,
        reason,
      });
      throw temporaryPasswordDeliveryFailed();
    }
    const activated = await this.prisma.withScope(authz.db, (tx) =>
      tx.operatorAccount.updateMany({
        where: {
          id: owner.id,
          operatorId: owner.operatorId,
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
          version: pending.version,
        },
        data: { credentialDeliveryPending: false, version: { increment: 1 } },
      }),
    );
    if (activated.count !== 1) {
      throw accountStateConflict();
    }
    this.recordBestEffort({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.operator.provision_retry.success",
      targetType: "operator_account",
      targetId: owner.id,
      operatorId: owner.operatorId,
      reason,
      after: auditSnapshot(context, { credentialDeliveryPending: false }),
    });
  }

  private async assertRecentReauth(sid: string): Promise<void> {
    if (!(await this.sessions.hasRecentReauth(sid))) {
      throw reauthRequired();
    }
  }

  private recordBestEffort(event: AuditEventInput): void {
    this.audit.recordAuditEvent(event).catch(() => {
      this.logger.error(`Ghi audit ${event.action} thất bại.`);
    });
  }
}

export function generateTemporaryPassword(): string {
  // 192 bit entropy; base64url không có ký tự gây lỗi HTML/URL và đủ mạnh không cần rule hình thức.
  return randomBytes(24).toString("base64url");
}

function auditSnapshot(
  context: AccountRequestContext,
  data: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...data,
    ...(context.ip ? { ip: maskIpAddress(context.ip) } : {}),
    ...(context.userAgent ? { device: deviceLabel(context.userAgent) } : {}),
  };
}
