-- Add one explicit platform capability. No implicit grant, no quality tables.
alter table public.platform_admins drop constraint platform_admins_capabilities_check;
alter table public.platform_admins add constraint platform_admins_capabilities_check
check (capabilities <@ array['organizations.manage','contracts.manage','territories.manage','catalog.manage','organizations.recover','audit.read','quality.read']);
-- Existing RLS/grants and transactional audit trigger stay unchanged.
