import { createConnection, type Connection } from "mongoose";
import { AUDIT_EVENT_COLLECTION } from "./audit-event.schema";
import { SYSTEM_LOG_COLLECTION } from "./system-log.schema";

const AUDIT_APPEND_ONLY_ROLE = "auditAppendOnly";
const DEFAULT_AUDIT_DB = "vexenhanh_audit";
const DEFAULT_APP_USER = "vexenhanh_audit_app";

type MongoDb = NonNullable<Connection["db"]>;
type MongoRoleInfo = { roles?: unknown[] };
type MongoUserInfo = { users?: unknown[] };

async function main(): Promise<void> {
  const adminUri = readRequiredEnv("MONGODB_ADMIN_URI");
  const auditDbName = readEnv("MONGODB_AUDIT_DB", DEFAULT_AUDIT_DB);
  const appUser = readEnv("MONGODB_AUDIT_APP_USER", DEFAULT_APP_USER);
  const appPassword = readRequiredEnv("MONGODB_AUDIT_APP_PASSWORD");

  const connection = await createConnection(adminUri, { dbName: auditDbName }).asPromise();

  try {
    if (!connection.db) {
      throw new Error("Mongo audit database handle is not available.");
    }

    await ensureAuditCollections(connection.db);
    await upsertAppendOnlyRole(connection.db, auditDbName);
    await upsertAppUser(connection.db, appUser, appPassword);

    console.log(
      `Mongo audit hardening applied for db "${auditDbName}" and app user "${appUser}".`
    );
    console.log(`Set MONGODB_AUDIT_URI with authSource=${auditDbName} for the app user.`);
  } finally {
    await connection.close();
  }
}

async function ensureAuditCollections(db: MongoDb): Promise<void> {
  await ensureTimeSeriesCollection(db, AUDIT_EVENT_COLLECTION);
  await ensureTimeSeriesCollection(db, SYSTEM_LOG_COLLECTION);

  await db.collection(AUDIT_EVENT_COLLECTION).createIndexes([
    { key: { actorId: 1, createdAt: -1 }, name: "actorId_1_createdAt_-1" },
    { key: { targetType: 1, targetId: 1, createdAt: -1 }, name: "targetType_1_targetId_1_createdAt_-1" },
    { key: { operatorId: 1, createdAt: -1 }, name: "operatorId_1_createdAt_-1" }
  ]);

  await db.collection(SYSTEM_LOG_COLLECTION).createIndexes([
    { key: { source: 1, createdAt: -1 }, name: "source_1_createdAt_-1" },
    { key: { level: 1, createdAt: -1 }, name: "level_1_createdAt_-1" }
  ]);
}

async function ensureTimeSeriesCollection(db: MongoDb, collection: string): Promise<void> {
  const existing = await db.listCollections({ name: collection }, { nameOnly: true }).toArray();

  if (existing.length > 0) {
    return;
  }

  await db.createCollection(collection, {
    timeseries: { timeField: "createdAt", granularity: "seconds" }
  });
}

async function upsertAppendOnlyRole(db: MongoDb, auditDbName: string): Promise<void> {
  const privileges = [
    appendOnlyPrivilege(auditDbName, AUDIT_EVENT_COLLECTION),
    appendOnlyPrivilege(auditDbName, SYSTEM_LOG_COLLECTION)
  ];

  if (await roleExists(db, auditDbName)) {
    await db.command({ updateRole: AUDIT_APPEND_ONLY_ROLE, privileges, roles: [] });
    return;
  }

  await db.command({ createRole: AUDIT_APPEND_ONLY_ROLE, privileges, roles: [] });
}

function appendOnlyPrivilege(dbName: string, collection: string): {
  resource: { db: string; collection: string };
  actions: string[];
} {
  return {
    actions: ["find", "insert"],
    resource: { db: dbName, collection }
  };
}

async function roleExists(db: MongoDb, auditDbName: string): Promise<boolean> {
  const result = (await db.command({
    rolesInfo: { role: AUDIT_APPEND_ONLY_ROLE, db: auditDbName }
  })) as MongoRoleInfo;

  return Array.isArray(result.roles) && result.roles.length > 0;
}

async function upsertAppUser(db: MongoDb, user: string, password: string): Promise<void> {
  const roles = [{ role: AUDIT_APPEND_ONLY_ROLE, db: db.databaseName }];

  if (await userExists(db, user)) {
    await db.command({ updateUser: user, pwd: password, roles });
    return;
  }

  await db.command({ createUser: user, pwd: password, roles });
}

async function userExists(db: MongoDb, user: string): Promise<boolean> {
  const result = (await db.command({ usersInfo: { user, db: db.databaseName } })) as MongoUserInfo;

  return Array.isArray(result.users) && result.users.length > 0;
}

function readEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
