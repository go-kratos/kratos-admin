-- Seeds the first admin so a fresh deployment has someone who can log in.
--
-- Run this after the `admins` table exists. With `data.database.auto_migrate`
-- enabled the service creates it on boot; otherwise apply the ent schema first.
--
-- Credentials: admin / admin
--
-- The password below is a bcrypt hash (cost 10, matching bcrypt.DefaultCost in
-- internal/biz) of the string "admin". It is a throwaway credential for local
-- development — change it before exposing the service to a network.

-- `id` is supplied explicitly because the UUID is generated in the application
-- layer (IDMixin), so the column carries no database-side default. The value is
-- pinned rather than random to keep this script idempotent.
--
-- `WHERE NOT EXISTS` rather than `INSERT IGNORE`: the table has no unique index
-- on `name`, and LoginByUsername resolves the account with ent's `Only`, which
-- errors when more than one row matches. Re-running this must not create a
-- second "admin". A soft-deleted row (status 3) is not treated as a conflict,
-- so the account can be restored by running this again.
INSERT INTO admins (id, created_at, updated_at, name, email, avatar, access, password, status)
SELECT
  '01920000-0000-7000-8000-000000000001',
  NOW(),
  NOW(),
  'admin',
  'admin@go-kratos.dev',
  '',
  -- Matches HasAdminAccess in pkg/auth, which compares against "admin".
  'admin',
  '$2a$10$HVdqJaqApfGNMIn0SzInd.2l7AH4lg7.OrU1vRFlWqmOazgtTwZKW',
  -- 1 is kratos.admin.v1.Admin.Status.ACTIVE.
  1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE name = 'admin' AND status <> 3
);
