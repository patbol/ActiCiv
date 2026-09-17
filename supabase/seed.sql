-- Local/CI fictitious fixtures. No password is stored; provision-dev.mjs assigns ephemeral credentials.
do $$
declare n integer; r text; org uuid; uid uuid; mid uuid; sid uuid; sid2 uuid; vid uuid; cid uuid; territory uuid; contract uuid; scope uuid; calendar uuid; schedule uuid; policy uuid; pv uuid; target text; day_number integer; day_id uuid;
begin
 insert into public.verticals(code,name) values('accessibility','Accessibilité') returning id into vid;
 insert into public.categories(vertical_id,code,name,default_priority) values(vid,'blocked_access','Accès ou rampe bloqué','important') returning id into cid;
 insert into public.categories(vertical_id,code,name) values
 (vid,'occupied_accessible_parking','Place PMR occupée'),
 (vid,'unavailable_accessibility_equipment','Ascenseur / équipement d’accessibilité indisponible'),
 (vid,'unsafe_path','Cheminement dangereux ou obstrué'),
 (vid,'other_accessibility','Autre problème d’accessibilité');
 for n in 1..3 loop
  org:=md5('org-'||n)::uuid; sid:=md5('service-'||n)::uuid; sid2:=md5('service-other-'||n)::uuid;
  insert into public.organizations(id,code,name) values(org,'demo-'||n,'Organisation fictive '||n);
  insert into public.organization_settings(id,organization_id) values(org,org);
  insert into public.services(id,organization_id,code,name) values(sid,org,'accessibility','Accessibilité'),(sid2,org,'buildings','Bâtiments');
  foreach r in array array['client_admin','supervisor','agent'] loop
   uid:=md5('user-'||n||'-'||r)::uuid; mid:=md5('member-'||n||'-'||r)::uuid;
   insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change_token_new,email_change) values(uid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',r||n||'@example.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','','','');
   insert into auth.identities(id,user_id,provider_id,identity_data,provider,created_at,updated_at) values(gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid,'email',r||n||'@example.test'),'email',now(),now());
   insert into public.professional_profiles(id,display_name) values(uid,'Professionnel fictif '||n||' '||r);
   insert into public.organization_memberships(id,organization_id,user_id,role) values(mid,org,uid,r);
   if r<>'client_admin' then insert into public.service_memberships(organization_id,membership_id,service_id) values(org,mid,sid); end if;
  end loop;
  insert into public.organization_categories(organization_id,category_id) values(org,cid);
  territory:=md5('territory-'||n)::uuid;
  insert into public.territories(id,code,name,kind,geometry) values(territory,'demo-'||n,'Territoire fictif '||n,'site',extensions.st_multi(extensions.st_geomfromtext(case n when 1 then 'POLYGON((0 0,4 0,4 4,0 4,0 0))' when 2 then 'POLYGON((1 1,2 1,2 2,1 2,1 1))' else 'POLYGON((3 3,5 3,5 5,3 5,3 3))' end,4326)));
  if n=2 then update public.territories set parent_id=md5('territory-1')::uuid where id=territory; end if;
  insert into public.contracts(organization_id,reference,status,valid_from,plan_code) values(org,'demo','active','2026-01-01Z','mvp') returning id into contract;
  insert into public.contract_scopes(organization_id,contract_id,territory_id) values(org,contract,territory) returning id into scope;
  insert into public.contract_scope_categories(organization_id,scope_id,category_id) values(org,scope,cid);
  insert into public.contract_scope_services(organization_id,scope_id,service_id) values(org,scope,sid);
  insert into public.service_schedules(organization_id) values(org) returning id into schedule;
  insert into public.service_schedule_versions(organization_id,schedule_id,version,timezone,mode) values(org,schedule,1,'Europe/Paris',case when n=2 then 'weekly' else 'always_open' end) returning id into calendar;
  if n=2 then
   for day_number in 1..7 loop
    insert into public.service_schedule_days(organization_id,version_id,weekday,is_open) values(org,calendar,day_number,day_number<=5) returning id into day_id;
    if day_number<=5 then insert into public.service_schedule_windows(organization_id,day_id,start_second,end_second) values(org,day_id,28800,43200),(org,day_id,46800,64800); end if;
   end loop;
  end if;
  update public.service_schedule_versions set state='published',published_at=now() where id=calendar;
  insert into public.sla_policies(organization_id) values(org) returning id into policy;
  insert into public.sla_policy_versions(organization_id,policy_id,version,schedule_version_id) values(org,policy,1,calendar) returning id into pv;
  foreach target in array array['acknowledgment','intervention','resolution'] loop insert into public.sla_targets(organization_id,version_id,kind,duration_seconds,counting_mode) values(org,pv,target,3600,'business_hours'); end loop;
  update public.sla_policy_versions set state='published',published_at=now() where id=pv;
  insert into public.hold_reasons(organization_id,code,label) values(org,'external','Attente d’un tiers');
 end loop;
end $$;

-- Synthetic reference translations only; IDs and business codes stay unchanged.
insert into public.vertical_translations(vertical_id,locale,label)
select id,'en-GB','Accessibility' from public.verticals where code='accessibility' and name='Accessibilité'
on conflict(vertical_id,locale) do update set label=excluded.label;
insert into public.category_translations(category_id,locale,label)
select c.id,'en-GB',t.label from public.categories c join (values
 ('blocked_access','Blocked access or ramp'),
 ('occupied_accessible_parking','Occupied accessible parking space'),
 ('unavailable_accessibility_equipment','Unavailable lift or accessibility equipment'),
 ('unsafe_path','Dangerous or obstructed pathway'),
 ('other_accessibility','Other accessibility issue')
) t(code,label) on t.code=c.code join public.verticals v on v.id=c.vertical_id and v.code='accessibility'
on conflict(category_id,locale) do update set label=excluded.label;
insert into public.hold_reason_translations(organization_id,hold_reason_id,locale,label)
select organization_id,id,'en-GB','Awaiting a third party' from public.hold_reasons where code='external' and label='Attente d’un tiers'
on conflict(hold_reason_id,locale) do update set label=excluded.label;
