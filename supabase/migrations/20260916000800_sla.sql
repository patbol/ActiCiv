create table public.sla_policies(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),service_id uuid,category_id uuid references public.categories(id),foreign key(organization_id,service_id) references public.services(organization_id,id),unique(organization_id,id),unique nulls not distinct(organization_id,service_id,category_id));
create table public.sla_policy_versions(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),policy_id uuid not null,version integer not null check(version>0),schedule_version_id uuid not null,state text not null default 'draft' check(state in ('draft','published')),published_at timestamptz,foreign key(organization_id,policy_id) references public.sla_policies(organization_id,id),foreign key(organization_id,schedule_version_id) references public.service_schedule_versions(organization_id,id),unique(policy_id,version),unique(organization_id,id),check((state='published')=(published_at is not null)));
create table public.sla_targets(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),version_id uuid not null,kind text not null check(kind in ('acknowledgment','intervention','resolution')),duration_seconds integer not null check(duration_seconds>0),counting_mode text not null check(counting_mode in ('elapsed','business_hours')),foreign key(organization_id,version_id) references public.sla_policy_versions(organization_id,id),unique(version_id,kind),unique(organization_id,id));
create table public.hold_reasons(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),code text not null,label text not null,active boolean not null default true,unique(organization_id,code),unique(organization_id,id));
create table public.sla_pause_rules(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),target_id uuid not null,hold_reason_id uuid not null,foreign key(organization_id,target_id) references public.sla_targets(organization_id,id),foreign key(organization_id,hold_reason_id) references public.hold_reasons(organization_id,id),unique(target_id,hold_reason_id));
do $$ declare t text; begin foreach t in array array['sla_policies','sla_policy_versions','sla_targets','hold_reasons','sla_pause_rules'] loop
 perform private.secure_table(('public.'||t)::regclass);
 perform private.attach_audit(('public.'||t)::regclass,'service_id,category_id,policy_id,version,state,schedule_version_id,kind,duration_seconds,counting_mode,code,label,active,target_id,hold_reason_id');
 execute format('create policy sla_read on public.%I for select to authenticated using(private.member(organization_id,array[''client_admin'']))',t);
 end loop; end $$;
create function private.sla_version_guard() returns trigger language plpgsql set search_path='' as $$
declare service uuid; calendar_service uuid;
begin
 if TG_OP<>'INSERT' and old.state='published' then raise exception 'Published SLA is immutable' using errcode='23514'; end if;
 if TG_OP='DELETE' then return old; end if;
 if new.state='published' then
  if (select count(*) from public.sla_targets where version_id=new.id)<>3 then raise exception 'Three SLA targets required' using errcode='23514'; end if;
  if not exists(select 1 from public.service_schedule_versions where id=new.schedule_version_id and state='published') then raise exception 'Published calendar required' using errcode='23514'; end if;
  select service_id into service from public.sla_policies where id=new.policy_id;
  select s.service_id into calendar_service from public.service_schedules s join public.service_schedule_versions v on v.schedule_id=s.id where v.id=new.schedule_version_id;
  if calendar_service is not null and calendar_service is distinct from service then raise exception 'Incompatible calendar scope' using errcode='23514'; end if;
 end if;
 return new;
end $$;
create trigger sla_version_guard before insert or update or delete on public.sla_policy_versions for each row execute function private.sla_version_guard();
create function private.sla_child_guard() returns trigger language plpgsql set search_path='' as $$
declare r record; vid uuid;
begin
 if TG_OP='UPDATE' and (to_jsonb(old)->>'version_id' is distinct from to_jsonb(new)->>'version_id' or to_jsonb(old)->>'target_id' is distinct from to_jsonb(new)->>'target_id' or old.organization_id<>new.organization_id) then raise exception 'Cannot reparent SLA child' using errcode='23514'; end if;
 r:=coalesce(new,old);
 if TG_TABLE_NAME='sla_targets' then vid:=r.version_id; else select version_id into vid from public.sla_targets where id=r.target_id; end if;
 perform 1 from public.sla_policy_versions where id=vid and state='draft' for update;
 if not found then raise exception 'Published SLA is immutable' using errcode='23514'; end if;
 return r;
end $$;
create trigger sla_child_guard before insert or update or delete on public.sla_targets for each row execute function private.sla_child_guard();
create trigger sla_child_guard before insert or update or delete on public.sla_pause_rules for each row execute function private.sla_child_guard();
create function public.publish_sla(p_org uuid,p_service uuid,p_category uuid,p_calendar uuid,p_targets jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare pid uuid; vid uuid; tid uuid; t jsonb; reason jsonb; v integer;
begin
 perform private.require_admin(p_org);
 perform 1 from public.organizations where id=p_org for update;
 insert into public.sla_policies(organization_id,service_id,category_id) values(p_org,p_service,p_category) on conflict(organization_id,service_id,category_id) do nothing;
 select id into strict pid from public.sla_policies where organization_id=p_org and service_id is not distinct from p_service and category_id is not distinct from p_category;
 select coalesce(max(version),0)+1 into v from public.sla_policy_versions where policy_id=pid;
 insert into public.sla_policy_versions(organization_id,policy_id,version,schedule_version_id) values(p_org,pid,v,p_calendar) returning id into vid;
 for t in select * from jsonb_array_elements(p_targets) loop
  insert into public.sla_targets(organization_id,version_id,kind,duration_seconds,counting_mode) values(p_org,vid,t->>'kind',(t->>'durationSeconds')::integer,t->>'countingMode') returning id into tid;
  for reason in select * from jsonb_array_elements(coalesce(t->'pauseReasons','[]')) loop
   insert into public.sla_pause_rules(organization_id,target_id,hold_reason_id) values(p_org,tid,(reason#>>'{}')::uuid);
  end loop;
 end loop;
 update public.sla_policy_versions set state='published',published_at=now() where id=vid;
 return vid;
end $$;
grant execute on function public.publish_sla(uuid,uuid,uuid,uuid,jsonb) to authenticated;
create function public.save_hold_reason(p_org uuid,p_code text,p_label text,p_active boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require_admin(p_org);
 insert into public.hold_reasons(organization_id,code,label,active) values(p_org,p_code,p_label,p_active) on conflict(organization_id,code) do update set label=excluded.label,active=excluded.active returning id into result;
 return result;
end $$;
grant execute on function public.save_hold_reason(uuid,text,text,boolean) to authenticated;
create function private.sla_scope_immutable() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.sla_policy_versions where policy_id=old.id and state='published') and (old.organization_id<>new.organization_id or old.service_id is distinct from new.service_id or old.category_id is distinct from new.category_id) then raise exception 'Published SLA scope is immutable' using errcode='23514'; end if;
 return new;
end $$;
create trigger scope_immutable before update on public.sla_policies for each row execute function private.sla_scope_immutable();
alter table public.hold_reasons add constraint reason_labels check(length(btrim(code))>0 and length(btrim(label))>0);
