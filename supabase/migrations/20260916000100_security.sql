create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create extension if not exists postgis with schema extensions;
-- PostgreSQL's global PUBLIC EXECUTE default cannot be revoked per schema.
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public, anon, authenticated;

create function private.secure_table(target regclass) returns void language plpgsql as $$
begin
  execute format('alter table %s enable row level security', target);
  execute format('revoke all on %s from anon, authenticated', target);
  execute format('grant select on %s to authenticated', target);
end $$;
revoke all on function private.secure_table(regclass) from public, anon, authenticated;
