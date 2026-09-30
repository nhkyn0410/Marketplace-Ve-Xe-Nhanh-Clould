-- TASK-IAM-006 (Khanh chốt 27/09/2026): tách cổng đăng nhập nhân viên khỏi Owner nhà xe.
-- Nhân viên: `{slug}/nv.{tên}` qua `/auth/employee/login`; Owner: `{slug}/{username}` qua `/auth/operator/login`
-- và KHÔNG được dùng tiền tố `nv.`. Registry `operator_login_names` giữ nguyên (tên vẫn duy nhất trong tenant).

SELECT set_config('app.scope', 'system', true);

-- Owner đang dùng tiền tố nhân viên thì không tự đổi được (họ đang đăng nhập bằng tên đó) → dừng, xử lý tay.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "operator_accounts" WHERE "username" ~* '^nv\.') THEN
    RAISE EXCEPTION 'IAM-006: có Owner dùng tiền tố "nv." — đổi username Owner đó trước khi migrate.';
  END IF;
END
$$;

-- Nhân viên cũ (trước quy tắc) được đổi sang `nv.` + tên viết thường. Trigger registry dời chỗ giữ tên;
-- trùng tên trong tenant thì UPDATE lỗi unique và migration dừng. Báo lại nhân viên username mới.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "employee_accounts"
     WHERE "username" !~* '^nv\.'
       AND char_length('nv.' || "username") > 64
  ) THEN
    RAISE EXCEPTION 'IAM-006: username nhân viên quá dài để thêm tiền tố "nv." — rút gọn trước khi migrate.';
  END IF;
END
$$;

UPDATE "employee_accounts"
   SET "username" = CASE
     WHEN "username" ~* '^nv\.' THEN lower("username")
     ELSE 'nv.' || lower("username")
   END
 WHERE "username" !~ '^nv\.[a-z0-9._-]{2,61}$';

ALTER TABLE "employee_accounts" ADD CONSTRAINT "employee_accounts_username_employee_prefix"
  CHECK ("username" ~ '^nv\.[a-z0-9._-]{2,61}$');

ALTER TABLE "operator_accounts" ADD CONSTRAINT "operator_accounts_username_not_employee_prefix"
  CHECK ("username" !~* '^nv\.');
