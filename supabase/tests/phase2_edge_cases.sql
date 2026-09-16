begin;
set search_path=public,extensions;
select no_plan();
-- A hole is not covered; an inner-ring boundary is covered.
insert into territories(code,name,kind,geometry) values('hole','Hole','site',st_multi(st_geomfromtext('POLYGON((10 10,14 10,14 14,10 14,10 10),(11 11,11 12,12 12,12 11,11 11))',4326)));
select ok(not (select st_covers(geometry,st_setsrid(st_point(11.5,11.5),4326)) from territories where code='hole'),'polygon hole not covered');
select ok((select st_covers(geometry,st_setsrid(st_point(11,11),4326)) from territories where code='hole'),'hole boundary covered');
select throws_ok($$insert into territories(code,name,kind,geometry) values('invalid','invalid','site',st_multi(st_geomfromtext('POLYGON((0 0,2 2,0 2,2 0,0 0))',4326)))$$,'23514',null,'self-intersecting geometry rejected');
-- Platform context is distinct; forge no client membership.
insert into platform_admins(id,capabilities) values(md5('user-3-agent')::uuid,array['contracts.manage']);
select set_config('request.jwt.claim.sub',md5('user-3-agent')::uuid::text,true);
set local role authenticated;
select is((select count(*) from coverage_candidates(3.5,3.5,(select id from categories where code='blocked_access' limit 1))),2::bigint,'non-nested overlap returns two candidates');
select is((select count(*) from coverage_candidates(1.5,1.5,(select id from categories where code='blocked_access' limit 1))),2::bigint,'nested territories return both candidates');
select throws_ok($$select save_vertical('unauthorized','Unauthorized',true)$$,'42501',null,'platform capability is scoped');
reset role;
select set_config('request.jwt.claim.sub',md5('user-1-client_admin')::uuid::text,true);
set local role authenticated;
select lives_ok($$select publish_schedule(md5('org-1')::uuid,null,'Europe/Paris','weekly','[{"weekday":1,"open":true,"windows":[[0,3600],[3600,86400]]},{"weekday":2,"open":false,"windows":[]},{"weekday":3,"open":false,"windows":[]},{"weekday":4,"open":false,"windows":[]},{"weekday":5,"open":false,"windows":[]},{"weekday":6,"open":false,"windows":[]},{"weekday":7,"open":true,"windows":[[82800,86400]]}]')$$,'multiple adjacent windows and overnight segments');
select throws_ok($$select publish_schedule(md5('org-1')::uuid,null,'Europe/Paris','weekly','[{"weekday":1,"open":true,"windows":[[0,4000],[3600,86400]]}]')$$,'23514',null,'overlapping windows rejected');
select throws_ok($$select publish_schedule(md5('org-1')::uuid,null,'Europe/Paris','weekly','[{"weekday":1,"open":false,"windows":[[0,3600]]},{"weekday":2,"open":false,"windows":[]},{"weekday":3,"open":false,"windows":[]},{"weekday":4,"open":false,"windows":[]},{"weekday":5,"open":false,"windows":[]},{"weekday":6,"open":false,"windows":[]},{"weekday":7,"open":false,"windows":[]}]')$$,'23514',null,'closed day cannot have windows');
select throws_ok($$select publish_sla(md5('org-1')::uuid,null,null,(select id from service_schedule_versions limit 1),'[]')$$,'23514',null,'three SLA targets required');
reset role;
select throws_ok($$update sla_policies set service_id=md5('service-1')::uuid where organization_id=md5('org-1')::uuid$$,'23514',null,'published policy scope cannot change');
select throws_ok($$update service_schedules set service_id=md5('service-1')::uuid where organization_id=md5('org-1')::uuid$$,'23514',null,'published calendar scope cannot change');
-- Mutation and audit roll back together even after the event was successfully inserted.
select count(*) as prior_audits from audit_events \gset
savepoint mutation;
insert into services(organization_id,code,name) values(md5('org-1')::uuid,'rolled-back','Rolled back');
rollback to mutation;
select is((select count(*) from services where code='rolled-back'),0::bigint,'mutation rolled back');
select is((select count(*) from audit_events),:prior_audits::bigint,'audit rolled back with mutation');
select ok(not exists(select 1 from audit_events where changes::text ~* 'password|token|email|secret'),'audit payload excludes secret and email fields');
select * from finish();
rollback;
