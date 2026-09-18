begin;
set search_path=public,extensions;
select no_plan();
select has_function('public','pending_invitation_context',array[]::text[],'observability invitation context projection exists');
select ok(not has_function_privilege('anon','public.pending_invitation_context()','EXECUTE'),'anonymous cannot inspect invitation context');
select ok(has_function_privilege('authenticated','public.pending_invitation_context()','EXECUTE'),'authenticated caller can inspect own pending context only');
select set_config('request.jwt.claim.sub',md5('user-1-agent')::uuid::text,true);
set local role authenticated;
select is((select count(*) from pending_invitation_context()),0::bigint,'unrelated authenticated user sees no invitation correlation');
reset role;
select ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='record_audit'),'no second application audit writer introduced');
-- Inject sensitive unwhitelisted values into real audited rows; reports contain labels only.
select set_config('acticiv.correlation_id','c011ec70-0000-4000-8000-0000000000f1',true);
update professional_profiles set display_name='private@example.test private-token private-password' where id=md5('user-1-agent')::uuid;
select is((select count(*) from audit_events where correlation_id='c011ec70-0000-4000-8000-0000000000f1'),1::bigint,'one mutation has exactly one authoritative audit');
select ok((select bool_and(changes='{}'::jsonb) from audit_events where correlation_id='c011ec70-0000-4000-8000-0000000000f1'),'profile free text never enters audit payload');
select ok((select bool_and(actor_id=md5('user-1-agent')::uuid) from audit_events where correlation_id='c011ec70-0000-4000-8000-0000000000f1'),'audit actor remains verified caller, independent of payload');
insert into professional_invitations(organization_id,email,role,initiator_id,state,expires_at,idempotency_key,auth_user_id)
values(md5('org-1')::uuid,'private-f@example.test','agent',md5('user-1-client_admin')::uuid,'sent',now()+interval '1 day',gen_random_uuid(),md5('user-1-agent')::uuid) returning id as invitation_id \gset
select ok(not exists(select 1 from audit_events where entity_id=:'invitation_id' and changes::text like '%private%'),'invitation email is excluded from SQL whitelist');
set local role authenticated;
select is((select count(*) from pending_invitation_context()),1::bigint,'owner sees own sent unexpired invitation');
reset role;
update professional_invitations set expires_at=now()-interval '1 second' where id=:'invitation_id';
set local role authenticated;
select is((select count(*) from pending_invitation_context()),0::bigint,'expired invitation context is hidden');
reset role;
update professional_invitations set state='cancelled',expires_at=now()+interval '1 day' where id=:'invitation_id';
set local role authenticated;
select is((select count(*) from pending_invitation_context()),0::bigint,'cancelled invitation context is hidden');
reset role;
select * from finish();
rollback;
