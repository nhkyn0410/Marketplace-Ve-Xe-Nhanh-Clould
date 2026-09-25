-- Keep administrative account status independent of temporary-credential delivery.
-- Existing LOCKED rows remain LOCKED; legacy rows are never inferred to be pending.
BEGIN;
SET LOCAL lock_timeout = '10s';

ALTER TABLE "operator_accounts"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "credential_delivery_pending" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "employee_accounts"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "credential_delivery_pending" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "operator_accounts"
  ADD CONSTRAINT "operator_accounts_delivery_pending_check"
  CHECK (NOT "credential_delivery_pending" OR "password_change_required");

ALTER TABLE "employee_accounts"
  ADD CONSTRAINT "employee_accounts_delivery_pending_check"
  CHECK (NOT "credential_delivery_pending" OR "password_change_required");

-- Existing trigger functions were created without an explicit search_path. Keep catalog first,
-- then the known application schema, and temporary objects last for invoker-safe name lookup.
ALTER FUNCTION public.prevent_operator_slug_update()
  SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.reserve_operator_login_name()
  SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.release_operator_login_name()
  SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.protect_operator_login_names()
  SET search_path = pg_catalog, public, pg_temp;

COMMIT;
