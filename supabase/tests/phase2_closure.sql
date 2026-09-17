begin;
set search_path=public,extensions;
select no_plan();

-- Graph validation is asserted by its exact error, independently of containment.
select throws_ok($$update territories set parent_id=md5('territory-2')::uuid where id=md5('territory-1')::uuid$$,'23514','Territory cycle','cycle branch is reached before geometric containment');
select throws_ok($$update territories set parent_id=md5('territory-3')::uuid where id=md5('territory-2')::uuid$$,'23514','Parent must strictly contain child','non-cyclic invalid inclusion remains rejected');

insert into platform_admins(id,capabilities) values(md5('user-3-agent')::uuid,array['catalog.manage','contracts.manage']);
select count(*) as old_category_links from contract_scope_categories \gset
select set_config('request.jwt.claim.sub',md5('user-3-agent')::uuid::text,true);
set local role authenticated;
select save_category((select id from verticals where code='accessibility'),'closure-category','Nouvelle catégorie','normal',true) as new_category \gset
select is((select count(*) from contract_scope_categories),:old_category_links::bigint,'creating category does not extend any existing contract');
select is((select count(*) from coverage_candidates(1.5,1.5,:'new_category'::uuid)),0::bigint,'new category has no implicit geographic coverage');
select is((select count(*) from coverage_candidates(1.5,1.5,(select id from categories where code='blocked_access'))),2::bigint,'previous category retains its two contractual candidates');
select throws_ok($$select save_category((select id from verticals where code='accessibility'),'bad-priority','Bad','critical',true)$$,'23514',null,'catalog rejects an unknown backend priority');
reset role;

create temporary table original_sla as select v.id,to_jsonb(v) as version,(select jsonb_agg(to_jsonb(t) order by t.id) from sla_targets t where t.version_id=v.id) as targets from sla_policy_versions v where organization_id=md5('org-1')::uuid;
select set_config('request.jwt.claim.sub',md5('user-1-client_admin')::uuid::text,true);
set local role authenticated;
select publish_sla(md5('org-1')::uuid,null,null,(select id from service_schedule_versions limit 1),'[{"kind":"acknowledgment","durationSeconds":600,"countingMode":"elapsed","pauseReasons":[]},{"kind":"intervention","durationSeconds":1200,"countingMode":"business_hours","pauseReasons":[]},{"kind":"resolution","durationSeconds":3600,"countingMode":"business_hours","pauseReasons":[]}]') as sla_v2 \gset
select publish_sla(md5('org-1')::uuid,null,null,(select id from service_schedule_versions limit 1),'[{"kind":"acknowledgment","durationSeconds":900,"countingMode":"elapsed","pauseReasons":[]},{"kind":"intervention","durationSeconds":1800,"countingMode":"business_hours","pauseReasons":[]},{"kind":"resolution","durationSeconds":7200,"countingMode":"business_hours","pauseReasons":[]}]') as sla_v3 \gset
select isnt(:'sla_v2'::text,:'sla_v3'::text,'successive publications have distinct identities');
select is((select count(*) from sla_policy_versions),3::bigint,'both new SLA versions and original remain visible');
select is((select duration_seconds from sla_targets where version_id=:'sla_v2'::uuid and kind='resolution'),3600,'second publication keeps its own target');
select is((select duration_seconds from sla_targets where version_id=:'sla_v3'::uuid and kind='resolution'),7200,'third publication has the changed target');
reset role;
select ok((select to_jsonb(v)=o.version and (select jsonb_agg(to_jsonb(t) order by t.id) from sla_targets t where t.version_id=v.id)=o.targets from original_sla o join sla_policy_versions v on v.id=o.id),'original published version and all targets are byte-equivalent as JSON');

select set_config('acticiv.correlation_id','',true);
select set_config('request.headers','{"x-acticiv-command-id":"c011ec70-0000-4000-8000-000000000001"}',true);
set local role authenticated;
select save_service(md5('org-1')::uuid,'correlated-one','One');
select save_service(md5('org-1')::uuid,'correlated-two','Two');
select is((select count(*) from audit_events where correlation_id='c011ec70-0000-4000-8000-000000000001'),2::bigint,'all business events share the server command correlation');
select ok(not exists(select 1 from audit_events where correlation_id='c011ec70-0000-4000-8000-000000000001' and actor_id<>auth.uid()),'correlation does not replace the real actor');
reset role;
select set_config('acticiv.correlation_id','',true);
select set_config('request.headers','{"x-acticiv-command-id":"invalid"}',true);
select lives_ok($$insert into services(organization_id,code,name) values(md5('org-1')::uuid,'safe-correlation','Safe')$$,'malformed correlation creates a safe server UUID');
select ok((select correlation_id is not null from audit_events where entity_id=(select id from services where code='safe-correlation')),'fallback correlation is persisted');
select * from finish();
rollback;
