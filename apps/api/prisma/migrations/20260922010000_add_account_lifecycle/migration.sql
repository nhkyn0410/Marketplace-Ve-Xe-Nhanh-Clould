-- TASK-IAM-005 — closed enrollment account lifecycle + shared Operator login namespace.
--
-- Legacy accounts remain usable: they are not forced through first-login and may have no
-- contact_email. Every account created/reset by IAM-005 must explicitly set the three temporary
-- credential fields together; the CHECK constraints below reject partial state.

-- Prisma does not add a PostgreSQL transaction around a migration automatically. Keep schema,
-- legacy backfill, registry and triggers atomic; this also keeps the RLS scope below local.
BEGIN;
-- Do not wait indefinitely behind a long-running production transaction. Re-run in a maintenance
-- window after investigating blockers; the transaction rolls back cleanly on timeout.
SET LOCAL lock_timeout = '10s';

-- CreateEnum
CREATE TYPE "OperatorLoginAccountType" AS ENUM ('OPERATOR', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "operator_accounts"
  ADD COLUMN "contact_email" TEXT,
  ADD COLUMN "auth_epoch" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "password_change_required" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "temporary_password_expires_at" TIMESTAMP(3);

ALTER TABLE "employee_accounts"
  ADD COLUMN "contact_email" TEXT,
  ADD COLUMN "auth_epoch" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "password_change_required" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "temporary_password_expires_at" TIMESTAMP(3);

-- Existing sessions keep epoch 0; sensitive IAM-005 mutations increment the account epoch.
-- Access/refresh tokens from a prior epoch fail even if Redis post-revoke is unavailable.
ALTER TABLE "auth_sessions" ADD COLUMN "auth_epoch" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "operator_accounts" ADD CONSTRAINT "operator_accounts_temporary_password_state"
  CHECK (
    ("password_change_required" AND "temporary_password_expires_at" IS NOT NULL AND "contact_email" IS NOT NULL)
    OR
    (NOT "password_change_required" AND "temporary_password_expires_at" IS NULL)
  );

ALTER TABLE "employee_accounts" ADD CONSTRAINT "employee_accounts_temporary_password_state"
  CHECK (
    ("password_change_required" AND "temporary_password_expires_at" IS NOT NULL AND "contact_email" IS NOT NULL)
    OR
    (NOT "password_change_required" AND "temporary_password_expires_at" IS NULL)
  );

-- Migration DML must also work when the migration owner is subject to FORCE RLS.
SELECT set_config('app.scope', 'system', true);

-- Canonicalizing a drifted slug is safe only when it cannot collapse two legacy Owner rows onto
-- the same tenant username. Abort with an actionable error instead of silently renaming accounts.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM "operator_accounts"
     GROUP BY "operator_id", "username"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'TASK-IAM-005 migration blocked: duplicate Owner username exists inside one operator';
  END IF;
END
$$;

UPDATE "operator_accounts" AS account
   SET "operator_slug" = profile."operator_slug"
  FROM "operator_profiles" AS profile
 WHERE profile."id" = account."operator_id"
   AND account."operator_slug" IS DISTINCT FROM profile."operator_slug";

-- Compound target required by the FK that prevents operator_id/operator_slug drift.
CREATE UNIQUE INDEX "operator_profiles_id_operator_slug_key"
  ON "operator_profiles"("id", "operator_slug");

ALTER TABLE "operator_accounts"
  DROP CONSTRAINT "operator_accounts_operator_id_fkey";
ALTER TABLE "operator_accounts"
  ADD CONSTRAINT "operator_accounts_operator_id_operator_slug_fkey"
  FOREIGN KEY ("operator_id", "operator_slug")
  REFERENCES "operator_profiles"("id", "operator_slug")
  ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Slug is the stable public/login namespace. The compound FK blocks drift in account rows; this
-- trigger also blocks changing the profile slug before the first account exists.
CREATE FUNCTION prevent_operator_slug_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."operator_slug" IS DISTINCT FROM OLD."operator_slug" THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'operator_slug is immutable';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER "operator_profiles_slug_immutable"
  BEFORE UPDATE OF "operator_slug" ON "operator_profiles"
  FOR EACH ROW EXECUTE FUNCTION prevent_operator_slug_update();

-- Fail before creating the shared registry when legacy Owner/Employee data already collides.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM (
        SELECT "operator_id", "username" FROM "operator_accounts"
        UNION ALL
        SELECT "operator_id", "username" FROM "employee_accounts"
      ) AS login_name
     GROUP BY "operator_id", "username"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'TASK-IAM-005 migration blocked: Owner/Employee username collision exists inside one operator';
  END IF;
END
$$;

-- CreateTable
CREATE TABLE "operator_login_names" (
  "operator_id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "account_type" "OperatorLoginAccountType" NOT NULL,
  "account_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "operator_login_names_pkey" PRIMARY KEY ("operator_id", "username"),
  CONSTRAINT "operator_login_names_account_type_account_id_key"
    UNIQUE ("account_type", "account_id") DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE "operator_login_names"
  ADD CONSTRAINT "operator_login_names_operator_id_fkey"
  FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id")
  ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Backfill existing namespaces before account rows start referencing the registry.
INSERT INTO "operator_login_names" ("operator_id", "username", "account_type", "account_id", "created_at")
SELECT "operator_id", "username", 'OPERATOR'::"OperatorLoginAccountType", "id", "created_at"
  FROM "operator_accounts"
UNION ALL
SELECT "operator_id", "username", 'EMPLOYEE'::"OperatorLoginAccountType", "id", "created_at"
  FROM "employee_accounts";

-- Deferrable FKs let the trigger atomically move a reservation when username/operator_id changes:
-- delete the old reservation, insert the new one, then validate the updated account at commit.
ALTER TABLE "operator_accounts"
  ADD CONSTRAINT "operator_accounts_operator_id_username_fkey"
  FOREIGN KEY ("operator_id", "username")
  REFERENCES "operator_login_names"("operator_id", "username")
  ON DELETE NO ACTION ON UPDATE NO ACTION
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "employee_accounts"
  ADD CONSTRAINT "employee_accounts_operator_id_username_fkey"
  FOREIGN KEY ("operator_id", "username")
  REFERENCES "operator_login_names"("operator_id", "username")
  ON DELETE NO ACTION ON UPDATE NO ACTION
  DEFERRABLE INITIALLY DEFERRED;

CREATE FUNCTION reserve_operator_login_name() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  expected_type "OperatorLoginAccountType";
BEGIN
  expected_type := CASE TG_TABLE_NAME
    WHEN 'operator_accounts' THEN 'OPERATOR'::"OperatorLoginAccountType"
    WHEN 'employee_accounts' THEN 'EMPLOYEE'::"OperatorLoginAccountType"
    ELSE NULL
  END;

  IF expected_type IS NULL THEN
    RAISE EXCEPTION 'reserve_operator_login_name attached to unsupported table %', TG_TABLE_NAME;
  END IF;

  IF TG_OP = 'UPDATE'
     AND (NEW."operator_id", NEW."username", NEW."id")
         IS NOT DISTINCT FROM (OLD."operator_id", OLD."username", OLD."id") THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    DELETE FROM "operator_login_names"
     WHERE "operator_id" = OLD."operator_id"
       AND "username" = OLD."username"
       AND "account_type" = expected_type
       AND "account_id" = OLD."id";
  END IF;

  INSERT INTO "operator_login_names" (
    "operator_id", "username", "account_type", "account_id", "created_at"
  ) VALUES (
    NEW."operator_id", NEW."username", expected_type, NEW."id", CURRENT_TIMESTAMP
  );

  RETURN NEW;
END
$$;

CREATE FUNCTION release_operator_login_name() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  expected_type "OperatorLoginAccountType";
BEGIN
  expected_type := CASE TG_TABLE_NAME
    WHEN 'operator_accounts' THEN 'OPERATOR'::"OperatorLoginAccountType"
    WHEN 'employee_accounts' THEN 'EMPLOYEE'::"OperatorLoginAccountType"
    ELSE NULL
  END;

  DELETE FROM "operator_login_names"
   WHERE "operator_id" = OLD."operator_id"
     AND "username" = OLD."username"
     AND "account_type" = expected_type
     AND "account_id" = OLD."id";

  RETURN OLD;
END
$$;

-- Registry rows are derived state. Even though the app role receives broad CRUD grants for Prisma
-- tables, reject direct writes so account_type/account_id cannot be tampered into an orphan. A
-- nested write from one of the account triggers below has depth >= 2 and is the only valid path.
CREATE FUNCTION protect_operator_login_names() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF pg_trigger_depth() < 2 THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'operator_login_names is trigger-managed';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER "operator_login_names_trigger_managed"
  BEFORE INSERT OR UPDATE OR DELETE ON "operator_login_names"
  FOR EACH ROW EXECUTE FUNCTION protect_operator_login_names();

CREATE TRIGGER "operator_accounts_reserve_login_name"
  BEFORE INSERT OR UPDATE OF "operator_id", "username", "id" ON "operator_accounts"
  FOR EACH ROW EXECUTE FUNCTION reserve_operator_login_name();
CREATE TRIGGER "operator_accounts_release_login_name"
  AFTER DELETE ON "operator_accounts"
  FOR EACH ROW EXECUTE FUNCTION release_operator_login_name();

CREATE TRIGGER "employee_accounts_reserve_login_name"
  BEFORE INSERT OR UPDATE OF "operator_id", "username", "id" ON "employee_accounts"
  FOR EACH ROW EXECUTE FUNCTION reserve_operator_login_name();
CREATE TRIGGER "employee_accounts_release_login_name"
  AFTER DELETE ON "employee_accounts"
  FOR EACH ROW EXECUTE FUNCTION release_operator_login_name();

-- Same tenant/platform/system semantics as the two account tables. The app-role provisioning
-- script grants CRUD/default privileges to newly migrated tables; FORCE keeps missing context
-- fail-closed even when a non-superuser table owner is used accidentally.
ALTER TABLE "operator_login_names" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "operator_login_names" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "operator_login_names"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

COMMIT;
