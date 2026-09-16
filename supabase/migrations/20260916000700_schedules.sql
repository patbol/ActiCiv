create table public.service_schedules(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),service_id uuid,foreign key(organization_id,service_id) references public.services(organization_id,id),unique(organization_id,id),unique nulls not distinct(organization_id,service_id));
create table public.service_schedule_versions (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),schedule_id uuid not null,version integer not null check(version>0),
 state text not null default 'draft' check(state in ('draft','published')),timezone text not null,
 mode text not null check(mode in ('weekly','always_open')),published_at timestamptz,
 foreign key(organization_id,schedule_id) references public.service_schedules(organization_id,id),unique(schedule_id,version),unique(organization_id,id),
 check((state='published')=(published_at is not null))
);
create table public.service_schedule_days(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),version_id uuid not null,weekday integer not null check(weekday between 1 and 7),is_open boolean not null,foreign key(organization_id,version_id) references public.service_schedule_versions(organization_id,id),unique(version_id,weekday),unique(organization_id,id));
create table public.service_schedule_windows(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),day_id uuid not null,start_second integer not null,end_second integer not null,foreign key(organization_id,day_id) references public.service_schedule_days(organization_id,id),check(0<=start_second and start_second<end_second and end_second<=86400));
do $$ declare t text; begin foreach t in array array['service_schedules','service_schedule_versions','service_schedule_days','service_schedule_windows'] loop
 perform private.secure_table(('public.'||t)::regclass);
 perform private.attach_audit(('public.'||t)::regclass,'service_id,schedule_id,version,state,timezone,mode,weekday,is_open,start_second,end_second');
 execute format('create policy schedule_read on public.%I for select to authenticated using(private.member(organization_id,array[''client_admin'']))',t);
 end loop; end $$;
create function private.schedule_version_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP<>'INSERT' and old.state='published' then raise exception 'Published schedule is immutable' using errcode='23514'; end if;
 if TG_OP='DELETE' then return old; end if;
 if not exists(select 1 from pg_timezone_names where name=new.timezone) or new.timezone like 'posix/%' or new.timezone like 'right/%' then raise exception 'Unknown IANA timezone' using errcode='23514'; end if;
 if new.state='published' then
  if new.mode='always_open' and exists(select 1 from public.service_schedule_days where version_id=new.id) then raise exception '24/7 cannot contain weekly days' using errcode='23514'; end if;
  if new.mode='weekly' then
   if (select count(*) from public.service_schedule_days where version_id=new.id)<>7 then raise exception 'Seven explicit days required' using errcode='23514'; end if;
   if exists(select 1 from public.service_schedule_days d where d.version_id=new.id and d.is_open <> exists(select 1 from public.service_schedule_windows w where w.day_id=d.id)) then raise exception 'Open/closed day inconsistent' using errcode='23514'; end if;
  end if;
 end if;
 return new;
end $$;
create trigger schedule_version_guard before insert or update or delete on public.service_schedule_versions for each row execute function private.schedule_version_guard();
create function private.schedule_child_guard() returns trigger language plpgsql set search_path='' as $$
declare r record; vid uuid; other uuid;
begin
 if TG_OP='UPDATE' and (to_jsonb(old)->>'version_id' is distinct from to_jsonb(new)->>'version_id' or to_jsonb(old)->>'day_id' is distinct from to_jsonb(new)->>'day_id' or old.organization_id<>new.organization_id) then raise exception 'Cannot reparent schedule child' using errcode='23514'; end if;
 r:=coalesce(new,old);
 if TG_TABLE_NAME='service_schedule_days' then vid:=r.version_id; else select version_id into vid from public.service_schedule_days where id=r.day_id; end if;
 perform 1 from public.service_schedule_versions where id=vid and state='draft' for update;
 if not found then raise exception 'Published schedule is immutable' using errcode='23514'; end if;
 if TG_TABLE_NAME='service_schedule_windows' and TG_OP<>'DELETE' then
  select w.id into other from public.service_schedule_windows w where w.day_id=new.day_id and w.id<>new.id and int4range(w.start_second,w.end_second,'[)') && int4range(new.start_second,new.end_second,'[)') limit 1;
  if other is not null then raise exception 'Overlapping windows' using errcode='23514'; end if;
 end if;
 return r;
end $$;
create trigger schedule_child_guard before insert or update or delete on public.service_schedule_days for each row execute function private.schedule_child_guard();
create trigger schedule_child_guard before insert or update or delete on public.service_schedule_windows for each row execute function private.schedule_child_guard();
create function public.publish_schedule(p_org uuid,p_service uuid,p_timezone text,p_mode text,p_days jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare sid uuid; vid uuid; did uuid; d jsonb; w jsonb; v integer;
begin
 perform private.require_admin(p_org);
 perform 1 from public.organizations where id=p_org for update;
 insert into public.service_schedules(organization_id,service_id) values(p_org,p_service) on conflict(organization_id,service_id) do nothing;
 select id into strict sid from public.service_schedules where organization_id=p_org and service_id is not distinct from p_service;
 select coalesce(max(version),0)+1 into v from public.service_schedule_versions where schedule_id=sid;
 insert into public.service_schedule_versions(organization_id,schedule_id,version,timezone,mode) values(p_org,sid,v,p_timezone,p_mode) returning id into vid;
 for d in select * from jsonb_array_elements(p_days) loop
  insert into public.service_schedule_days(organization_id,version_id,weekday,is_open) values(p_org,vid,(d->>'weekday')::integer,(d->>'open')::boolean) returning id into did;
  for w in select * from jsonb_array_elements(d->'windows') loop
   insert into public.service_schedule_windows(organization_id,day_id,start_second,end_second) values(p_org,did,(w->>0)::integer,(w->>1)::integer);
  end loop;
 end loop;
 update public.service_schedule_versions set state='published',published_at=now() where id=vid;
 return vid;
end $$;
grant execute on function public.publish_schedule(uuid,uuid,text,text,jsonb) to authenticated;
create function private.schedule_scope_immutable() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.service_schedule_versions where schedule_id=old.id and state='published') and (old.organization_id<>new.organization_id or old.service_id is distinct from new.service_id) then raise exception 'Published calendar scope is immutable' using errcode='23514'; end if;
 return new;
end $$;
create trigger scope_immutable before update on public.service_schedules for each row execute function private.schedule_scope_immutable();
