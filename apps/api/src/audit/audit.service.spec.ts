import { createConnection } from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { APPEND_ONLY_ERROR_MESSAGE } from "./append-only.schema";
import { AuditEventSchema } from "./audit-event.schema";
import { AuditService } from "./audit.service";
import { SystemLogSchema } from "./system-log.schema";

describe("AuditService", () => {
  it("appends audit events with schema version and timestamp", async () => {
    const createdAt = new Date("2026-06-06T00:00:00.000Z");
    const auditEventModel = createModelMock();
    const systemLogModel = createModelMock();
    const service = new AuditService(auditEventModel.model, systemLogModel.model);

    await service.recordAuditEvent({
      actorId: "user_1",
      actorRole: "PlatformAdmin",
      action: "operator.approve",
      targetType: "operator",
      targetId: "operator_1",
      operatorId: "operator_1",
      before: { status: "PENDING_KYC" },
      after: { status: "ACTIVE" },
      reason: "KYC passed",
      requestId: "req-12345678",
      traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
      createdAt
    });

    expect(auditEventModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: 1,
        action: "operator.approve",
        targetType: "operator",
        targetId: "operator_1",
        createdAt
      })
    );
  });

  it("appends system logs with schema version and timestamp", async () => {
    const createdAt = new Date("2026-06-06T00:00:00.000Z");
    const auditEventModel = createModelMock();
    const systemLogModel = createModelMock();
    const service = new AuditService(auditEventModel.model, systemLogModel.model);

    await service.recordSystemLog({
      level: "info",
      source: "notification",
      event: "delivery.sent",
      message: "Notification delivery logged.",
      context: { provider: "resend" },
      requestId: "req-12345678",
      createdAt
    });

    expect(systemLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: 1,
        level: "info",
        source: "notification",
        event: "delivery.sent",
        createdAt
      })
    );
  });

  it.each([
    ["operatorId rỗng", { operatorId: "" }],
    ["targetId rỗng", { targetId: "" }],
    ["không liệt kê action", { actions: [] }]
  ])("listAuditEvents từ chối bộ lọc rỗng (%s) trước khi chạm Mongo", async (_case, override) => {
    const service = new AuditService(createModelMock().model, createModelMock().model);
    await expect(
      service.listAuditEvents({
        targetType: "fare",
        targetId: "fare_1",
        operatorId: "operator_1",
        actions: ["fare.update"],
        limit: 10,
        ...override
      })
    ).rejects.toThrow(/cần operatorId/);
  });
});

describe("audit schemas", () => {
  it("rejects unknown audit_event fields", () => {
    const connection = createConnection();
    const model = connection.model("AuditEventStrictSpec", AuditEventSchema.clone());

    expect(
      () =>
        new model({
          action: "operator.approve",
          targetType: "operator",
          targetId: "operator_1",
          unexpected: true
        })
    ).toThrow(/not in schema/);

    void connection.destroy();
  });

  it("blocks audit_event updates before hitting Mongo", async () => {
    const connection = createConnection();
    const model = connection.model("AuditEventAppendOnlySpec", AuditEventSchema.clone());

    await expect(model.updateOne({}, { action: "changed" }).exec()).rejects.toThrow(
      APPEND_ONLY_ERROR_MESSAGE
    );

    await connection.destroy();
  });

  it("blocks system_log deletes before hitting Mongo", async () => {
    const connection = createConnection();
    const model = connection.model("SystemLogAppendOnlySpec", SystemLogSchema.clone());

    await expect(model.deleteOne({}).exec()).rejects.toThrow(APPEND_ONLY_ERROR_MESSAGE);

    await connection.destroy();
  });

  it("blocks audit_event bulk writes before hitting Mongo", async () => {
    const connection = createConnection();
    const model = connection.model("AuditEventBulkWriteSpec", AuditEventSchema.clone());

    await expect(
      model.bulkWrite([
        {
          updateOne: {
            filter: { targetId: "operator_1" },
            update: { action: "changed" }
          }
        }
      ])
    ).rejects.toThrow(APPEND_ONLY_ERROR_MESSAGE);

    await connection.destroy();
  });

  it("blocks system_log insertMany so writes stay on the AuditService path", async () => {
    const connection = createConnection();
    const model = connection.model("SystemLogInsertManySpec", SystemLogSchema.clone());

    await expect(
      model.insertMany([
        {
          level: "info",
          source: "test",
          event: "audit.insert_many",
          message: "Bypass attempt."
        }
      ])
    ).rejects.toThrow(APPEND_ONLY_ERROR_MESSAGE);

    await connection.destroy();
  });
});

function createModelMock(): {
  create: ReturnType<typeof vi.fn>;
  model: never;
} {
  const create = vi.fn().mockResolvedValue({});

  return {
    create,
    model: { create } as never
  };
}
