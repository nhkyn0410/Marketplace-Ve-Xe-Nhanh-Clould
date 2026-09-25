-- Read-only preflight BEFORE 20260922010000_add_account_lifecycle.
-- A mismatched legacy Owner slug currently blocks login; the IAM-005 migration canonicalizes it,
-- which could unexpectedly re-enable that Owner. Review every returned ID and decide manually
-- whether its administrative account status should remain ACTIVE. Do not auto-unlock any account.
SELECT
  account.id AS owner_account_id,
  account.operator_id,
  account.operator_slug AS previous_slug,
  profile.operator_slug AS canonical_slug,
  account.status
FROM public.operator_accounts AS account
JOIN public.operator_profiles AS profile ON profile.id = account.operator_id
WHERE account.operator_slug IS DISTINCT FROM profile.operator_slug
ORDER BY account.operator_id, account.id;
