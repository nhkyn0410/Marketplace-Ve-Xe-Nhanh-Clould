import { randomUUID } from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AuditService, type AuditEventInput } from "../../audit/audit.service";
import { PrismaService } from "../../database/prisma.service";
import type { DbScope } from "../../database/db-scope";
import { SessionRevokeReason, SubjectType } from "../../database/prisma.types";
import { EMAIL_NOTIFIER, type EmailNotifier, maskEmail } from "../../external/notification/email-notifier";
import { CredentialService } from "../auth/credential.service";
import { reauthRequired } from "../auth/auth.errors";
import type { Authorization } from "../role/authorization";
import { can } from "../role/access-policy";
import { permissionDenied, tenantScopeViolation } from "../role/authorization.errors";
import { SessionService } from "../session/session.service";
import { deviceLabel, maskIpAddress } from "../session/session.service";
import {
  accountNotFound,
  accountStateConflict,
  accountUsernameConflict,
  isPrismaUniqueConflict,
  temporaryPasswordDeliveryFailed,
} from "./account.errors";
import { generateTemporaryPassword, TEMPORARY_PASSWORD_TTL_MS } from "./account-provisioning.service";
import { TemporaryCredentialEmailLimiter } from "./temporary-credential-email-limiter";
import {
  type AccountActor,
  type AccountRequestContext,
  requireAccountReason,
} from "./account.types";
import type {
  EmployeeAccountResponse,
  EmployeeCreateDto,
  EmployeeListQueryDto,
  EmployeeListResponse,
  EmployeePasswordResetDto,
  EmployeeUpdateDto,
} from "./dto/employee-account.dto";

type EmployeeRow = {
  id: string;
  operatorId: string;
  username: string;
  contactEmail: string | null;
  role: "DRIVER" | "TICKET_STAFF" | "SUPPORT_STAFF";
  status: "ACTIVE" | "LOCKED" | "DISABLED";
  credentialDeliveryPending: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class EmployeeAccountService {
  private readonly logger = new Logger(EmployeeAccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialService,
    @Inject(EMAIL_NOTIFIER) private readonly email: EmailNotifier,
    private readonly audit: AuditService,
    private readonly sessions: SessionService,
    private readonly emailLimiter: TemporaryCredentialEmailLimiter,
  ) {}

  async list(
    actor: AccountActor,
    authz: Authorization,
    query: EmployeeListQueryDto,
  ): Promise<EmployeeListResponse> {
    const { db, operatorId } = this.assertTenantAccess(actor, authz);
    const rows = await this.prisma.withScope(db, (tx) =>
      tx.employeeAccount.findMany({
        where: { operatorId },
        orderBy: { id: "asc" },
        take: query.limit + 1,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
        select: EMPLOYEE_PUBLIC_SELECT,
      }),
    );
    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    return {
      items: page.map(toResponse),
      nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
    };
  }

  async create(
    actor: AccountActor,
    authz: Authorization,
    input: EmployeeCreateDto,
    context: AccountRequestContext = {},
  ): Promise<EmployeeAccountResponse> {
    const { db, operatorId, operatorSlug } = this.assertTenantAccess(actor, authz);
    await this.assertRecentReauth(actor.sid);

    const id = randomUUID();
    const username = input.username.trim();
    const contactEmail = input.contactEmail.trim().toLowerCase();
    const reason = requireAccountReason(input.reason);

    await this.audit.recordAuditEvent({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.employee.create.intent",
      targetType: "employee_account",
      targetId: id,
      operatorId,
      reason,
      after: auditSnapshot(context, {
        username,
        contactEmail: maskEmail(contactEmail),
        role: input.role,
        status: "ACTIVE",
        credentialDeliveryPending: true,
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

    let created: EmployeeRow;
    try {
      created = await this.prisma.withScope(db, (tx) =>
        tx.employeeAccount.create({
          data: {
            id,
            operatorId,
            username,
            contactEmail,
            passwordHash,
            passwordChangeRequired: true,
            credentialDeliveryPending: true,
            temporaryPasswordExpiresAt,
            role: input.role,
            status: "ACTIVE",
          },
          select: EMPLOYEE_PUBLIC_SELECT,
        }),
      );
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
        loginIdentifier: `${operatorSlug}/${username}`,
        expiresAt: temporaryPasswordExpiresAt,
      });
    } catch {
      this.recordBestEffort({
        actorId: actor.sub,
        actorRole: actor.role,
        action: "iam.employee.create.delivery_failed",
        targetType: "employee_account",
        targetId: id,
        operatorId,
        reason,
      });
      throw temporaryPasswordDeliveryFailed(id);
    }

    const delivered = await this.prisma.withScope(db, (tx) =>
      tx.employeeAccount.updateManyAndReturn({
        where: { id, operatorId, credentialDeliveryPending: true, version: created.version },
        data: { credentialDeliveryPending: false, version: { increment: 1 } },
        select: EMPLOYEE_PUBLIC_SELECT,
      }),
    );
    const employee = delivered[0];
    if (!employee) {
      throw accountStateConflict();
    }

    this.recordBestEffort({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.employee.create.success",
      targetType: "employee_account",
      targetId: id,
      operatorId,
      reason,
      after: auditSnapshot(context, publicAudit(employee)),
    });
    return toResponse(employee);
  }

  async update(
    actor: AccountActor,
    authz: Authorization,
    employeeId: string,
    input: EmployeeUpdateDto,
    context: AccountRequestContext = {},
  ): Promise<EmployeeAccountResponse> {
    const { db, operatorId } = this.assertTenantAccess(actor, authz);
    await this.assertRecentReauth(actor.sid);
    const current = await this.find(db, operatorId, employeeId);
    if (current.status === "DISABLED" && input.status !== undefined && input.status !== "DISABLED") {
      throw accountStateConflict();
    }

    const reason = requireAccountReason(input.reason);
    const usernameChanged = input.username !== undefined && input.username.trim() !== current.username;
    const contactEmailChanged =
      input.contactEmail !== undefined &&
      input.contactEmail.trim().toLowerCase() !== current.contactEmail;
    const statusChanged = input.status !== undefined && input.status !== current.status;
    const data = {
      ...(input.username !== undefined ? { username: input.username.trim() } : {}),
      ...(input.contactEmail !== undefined
        ? { contactEmail: input.contactEmail.trim().toLowerCase() }
        : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      // A contact change must never leave the credential delivered to the old mailbox usable.
      // Block login until the owner explicitly performs password-reset to the new address.
      ...(contactEmailChanged
        ? {
            credentialDeliveryPending: true,
            passwordChangeRequired: true,
            // Existing DB invariant requires an expiry whenever change is required. Use an
            // already-expired marker: pending blocks login until password-reset delivers a
            // fresh credential and real expiry to the new mailbox.
            temporaryPasswordExpiresAt: new Date(0),
          }
        : {}),
    };
    await this.audit.recordAuditEvent({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.employee.update.intent",
      targetType: "employee_account",
      targetId: employeeId,
      operatorId,
      reason,
      before: publicAudit(current),
      after: auditSnapshot(context, sanitizeUpdate(data)),
    });

    // Gọi cả trước và sau update để đóng race login trong lúc đổi role/khóa.
    const mustRevoke =
      usernameChanged ||
      contactEmailChanged ||
      input.role !== undefined ||
      statusChanged;
    if (mustRevoke) {
      await this.sessions.revokeAllForSubject(
        SubjectType.EMPLOYEE,
        employeeId,
        SessionRevokeReason.ADMIN_FORCE,
      );
    }

    let updated: EmployeeRow[];
    try {
      updated = await this.prisma.withScope(db, (tx) =>
        tx.employeeAccount.updateManyAndReturn({
          where: { id: employeeId, operatorId, version: current.version },
          data: mustRevoke
            ? { ...data, authEpoch: { increment: 1 }, version: { increment: 1 } }
            : { ...data, version: { increment: 1 } },
          select: EMPLOYEE_PUBLIC_SELECT,
        }),
      );
    } catch (error) {
      if (isPrismaUniqueConflict(error)) {
        throw accountUsernameConflict();
      }
      throw error;
    }
    const employee = updated[0];
    if (!employee) {
      throw accountStateConflict();
    }
    if (mustRevoke) {
      await this.sessions.revokeAllForSubject(
        SubjectType.EMPLOYEE,
        employeeId,
        SessionRevokeReason.ADMIN_FORCE,
      );
    }

    this.recordBestEffort({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.employee.update.success",
      targetType: "employee_account",
      targetId: employeeId,
      operatorId,
      reason,
      before: publicAudit(current),
      after: auditSnapshot(context, publicAudit(employee)),
    });
    return toResponse(employee);
  }

  async resetPassword(
    actor: AccountActor,
    authz: Authorization,
    employeeId: string,
    input: EmployeePasswordResetDto,
    context: AccountRequestContext = {},
  ): Promise<void> {
    const { db, operatorId, operatorSlug } = this.assertTenantAccess(actor, authz);
    await this.assertRecentReauth(actor.sid);
    const current = await this.find(db, operatorId, employeeId);
    if (current.status === "DISABLED" || !current.contactEmail) {
      throw accountStateConflict();
    }

    const reason = requireAccountReason(input.reason);

    await this.audit.recordAuditEvent({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.employee.password_reset.intent",
      targetType: "employee_account",
      targetId: employeeId,
      operatorId,
      reason,
      before: publicAudit(current),
      after: auditSnapshot(context, {
        status: current.status,
        credentialDeliveryPending: true,
        passwordChangeRequired: true,
      }),
    });

    await this.emailLimiter.reserve({
      operatorId,
      actorType: actor.scope,
      actorId: actor.sub,
      employeeId,
    });

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await this.credentials.hash(temporaryPassword);
    const temporaryPasswordExpiresAt = new Date(Date.now() + TEMPORARY_PASSWORD_TTL_MS);

    await this.sessions.revokeAllForSubject(
      SubjectType.EMPLOYEE,
      employeeId,
      SessionRevokeReason.PASSWORD_RESET,
    );
    const pendingRows = await this.prisma.withScope(db, (tx) =>
      tx.employeeAccount.updateManyAndReturn({
        where: { id: employeeId, operatorId, version: current.version },
        data: {
          passwordHash,
          authEpoch: { increment: 1 },
          version: { increment: 1 },
          passwordChangeRequired: true,
          credentialDeliveryPending: true,
          temporaryPasswordExpiresAt,
        },
        select: EMPLOYEE_PUBLIC_SELECT,
      }),
    );
    const pending = pendingRows[0];
    if (!pending) {
      throw accountStateConflict();
    }
    // Sau khi credential đổi, quét lần hai để bắt session sinh trong race window.
    await this.sessions.revokeAllForSubject(
      SubjectType.EMPLOYEE,
      employeeId,
      SessionRevokeReason.PASSWORD_RESET,
    );

    try {
      if (!this.email.sendTemporaryPassword) {
        throw new Error("Temporary password delivery is not configured.");
      }
      await this.email.sendTemporaryPassword({
        email: current.contactEmail,
        temporaryPassword,
        loginIdentifier: `${operatorSlug}/${pending.username}`,
        expiresAt: temporaryPasswordExpiresAt,
      });
    } catch {
      this.recordBestEffort({
        actorId: actor.sub,
        actorRole: actor.role,
        action: "iam.employee.password_reset.delivery_failed",
        targetType: "employee_account",
        targetId: employeeId,
        operatorId,
        reason,
      });
      throw temporaryPasswordDeliveryFailed();
    }

    const delivered = await this.prisma.withScope(db, (tx) =>
      tx.employeeAccount.updateMany({
        where: { id: employeeId, operatorId, credentialDeliveryPending: true, version: pending.version },
        data: { credentialDeliveryPending: false, version: { increment: 1 } },
      }),
    );
    if (delivered.count !== 1) {
      throw accountStateConflict();
    }
    this.recordBestEffort({
      actorId: actor.sub,
      actorRole: actor.role,
      action: "iam.employee.password_reset.success",
      targetType: "employee_account",
      targetId: employeeId,
      operatorId,
      reason,
      after: auditSnapshot(context, {
        status: pending.status,
        credentialDeliveryPending: false,
        passwordChangeRequired: true,
      }),
    });
  }

  private async find(
    db: DbScope,
    operatorId: string,
    employeeId: string,
  ): Promise<EmployeeRow> {
    const employee = await this.prisma.withScope(db, (tx) =>
      tx.employeeAccount.findFirst({
        where: { id: employeeId, operatorId },
        select: EMPLOYEE_PUBLIC_SELECT,
      }),
    );
    if (!employee) {
      throw accountNotFound();
    }
    return employee;
  }

  private assertTenantAccess(
    actor: AccountActor,
    authz: Authorization,
  ): { db: DbScope; operatorId: string; operatorSlug: string } {
    const decision = can(actor, "employee:manage");
    if (!decision.allowed) {
      throw permissionDenied();
    }
    if (
      actor.scope !== "operator" ||
      !actor.operatorId ||
      !actor.operatorSlug ||
      !authz.db ||
      authz.db.kind !== "tenant" ||
      authz.db.operatorId !== actor.operatorId
    ) {
      throw tenantScopeViolation();
    }
    return {
      db: authz.db,
      operatorId: actor.operatorId,
      operatorSlug: actor.operatorSlug,
    };
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

const EMPLOYEE_PUBLIC_SELECT = {
  id: true,
  operatorId: true,
  username: true,
  contactEmail: true,
  role: true,
  status: true,
  credentialDeliveryPending: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toResponse(row: EmployeeRow): EmployeeAccountResponse {
  return {
    id: row.id,
    username: row.username,
    contactEmail: row.contactEmail,
    role: row.role,
    status: row.status,
    credentialDeliveryPending: row.credentialDeliveryPending,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function publicAudit(row: EmployeeRow): Record<string, unknown> {
  return {
    username: row.username,
    contactEmail: row.contactEmail ? maskEmail(row.contactEmail) : null,
    role: row.role,
    status: row.status,
    credentialDeliveryPending: row.credentialDeliveryPending,
  };
}

function sanitizeUpdate(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    ...(typeof data.contactEmail === "string"
      ? { contactEmail: maskEmail(data.contactEmail) }
      : {}),
  };
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
