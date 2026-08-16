# Migrations

Hand-written SQL applied outside the service. Files run in filename order and
are written to be idempotent, so re-applying one is safe.

The service does not run these. Table creation is handled separately: with
`data.database.auto_migrate` enabled ent creates the schema on boot, otherwise
apply the ent schema yourself first.

## Apply

```shell
mysql -h 127.0.0.1 -u root -p test < migrations/0001_seed_admin.sql
```

## Files

| File | Purpose |
|------|---------|
| `0001_seed_admin.sql` | Seeds the first admin (`admin` / `admin`) so a fresh deployment has someone who can log in. |

The seeded password is a throwaway development credential. Change it before
exposing the service to a network.
