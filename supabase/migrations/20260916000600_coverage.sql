create table public.territories (
 id uuid primary key default gen_random_uuid(),code text not null unique,name text not null,kind text not null,
 status text not null default 'active' check(status in ('active','inactive','archived')),
 geometry extensions.geometry(MultiPolygon,4326) not null,
 parent_id uuid references public.territories(id),check(parent_id<>id),
 check(not extensions.st_isempty(geometry) and extensions.st_isvalid(geometry)),
 check(extensions.st_xmin(geometry::extensions.box3d)>=-180 and extensions.st_xmax(geometry::extensions.box3d)<=180 and extensions.st_ymin(geometry::extensions.box3d)>=-90 and extensions.st_ymax(geometry::extensions.box3d)<=90)
);
create index territories_geometry_gist on public.territories using gist(geometry);
create table public.contracts (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),reference text not null,
 status text not null check(status in ('draft','active','expired','cancelled')),valid_from timestamptz not null,valid_until timestamptz,
 plan_code text not null,check(valid_until is null or valid_until>valid_from),unique(organization_id,id),unique(organization_id,reference)
);
create table public.contract_scopes(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),contract_id uuid not null,territory_id uuid not null references public.territories(id),foreign key(organization_id,contract_id) references public.contracts(organization_id,id),unique(organization_id,id),unique(contract_id,territory_id));
create table public.contract_scope_categories(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),scope_id uuid not null,category_id uuid not null references public.categories(id),foreign key(organization_id,scope_id) references public.contract_scopes(organization_id,id),unique(scope_id,category_id));
create table public.contract_scope_services(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),scope_id uuid not null,service_id uuid not null,foreign key(organization_id,scope_id) references public.contract_scopes(organization_id,id),foreign key(organization_id,service_id) references public.services(organization_id,id),unique(scope_id,service_id));
select private.secure_table('public.territories');
select private.attach_audit('public.territories','code,name,kind,status,parent_id');
do $$ declare t text; begin foreach t in array array['contracts','contract_scopes','contract_scope_categories','contract_scope_services'] loop
 perform private.secure_table(('public.'||t)::regclass);
 perform private.attach_audit(('public.'||t)::regclass,'reference,status,valid_from,valid_until,plan_code,contract_id,territory_id,scope_id,category_id,service_id');
 execute format('create policy contract_read on public.%I for select to authenticated using(private.member(organization_id,array[''client_admin'']) or private.platform(''contracts.manage''))',t);
 end loop; end $$;
create policy territory_read on public.territories for select to authenticated using(private.platform('territories.manage') or private.platform('contracts.manage') or exists(select 1 from public.contract_scopes s where s.territory_id=territories.id and private.member(s.organization_id,array['client_admin'])));
create function private.validate_territory() returns trigger language plpgsql set search_path='' as $$
begin
 perform pg_advisory_xact_lock(782341);
 if new.parent_id is not null then
  if not exists(select 1 from public.territories p where p.id=new.parent_id and extensions.st_covers(p.geometry,new.geometry) and not extensions.st_equals(p.geometry,new.geometry)) then raise exception 'Parent must strictly contain child' using errcode='23514'; end if;
  if exists(with recursive parents as (select id,parent_id from public.territories where id=new.parent_id union select t.id,t.parent_id from public.territories t join parents p on t.id=p.parent_id) select 1 from parents where id=new.id) then raise exception 'Territory cycle' using errcode='23514'; end if;
 end if;
 if exists(select 1 from public.territories c where c.parent_id=new.id and (not extensions.st_covers(new.geometry,c.geometry) or extensions.st_equals(new.geometry,c.geometry))) then raise exception 'Child outside new parent' using errcode='23514'; end if;
 return new;
end $$;
create trigger territory_integrity before insert or update on public.territories for each row execute function private.validate_territory();
create function public.save_territory(p_code text,p_name text,p_kind text,p_geometry jsonb,p_parent uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; g extensions.geometry;
begin
 perform private.require_platform('territories.manage');
 perform pg_advisory_xact_lock(782341);
 g:=extensions.st_geomfromgeojson(p_geometry::text);
 if extensions.st_srid(g)<>4326 then raise exception 'Expected SRID 4326' using errcode='23514'; end if;
 if extensions.geometrytype(g)='POLYGON' then g:=extensions.st_multi(g); end if;
 insert into public.territories(code,name,kind,geometry,parent_id) values(p_code,p_name,p_kind,g,p_parent)
 on conflict(code) do update set name=excluded.name,kind=excluded.kind,geometry=excluded.geometry,parent_id=excluded.parent_id returning id into result;
 return result;
end $$;
create function public.save_contract(p_org uuid,p_reference text,p_status text,p_from timestamptz,p_until timestamptz,p_plan text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require_platform('contracts.manage');
 insert into public.contracts(organization_id,reference,status,valid_from,valid_until,plan_code) values(p_org,p_reference,p_status,p_from,p_until,p_plan)
 on conflict(organization_id,reference) do update set status=excluded.status,valid_from=excluded.valid_from,valid_until=excluded.valid_until,plan_code=excluded.plan_code returning id into result;
 return result;
end $$;
create function public.set_contract_scope(p_contract uuid,p_territory uuid,p_categories uuid[],p_services uuid[]) returns uuid language plpgsql security definer set search_path='' as $$
declare org uuid; result uuid; item uuid;
begin
 perform private.require_platform('contracts.manage');
 select organization_id into strict org from public.contracts where id=p_contract for update;
 insert into public.contract_scopes(organization_id,contract_id,territory_id) values(org,p_contract,p_territory) on conflict(contract_id,territory_id) do update set territory_id=excluded.territory_id returning id into result;
 delete from public.contract_scope_categories where scope_id=result;
 delete from public.contract_scope_services where scope_id=result;
 foreach item in array p_categories loop insert into public.contract_scope_categories(organization_id,scope_id,category_id) values(org,result,item); end loop;
 foreach item in array p_services loop insert into public.contract_scope_services(organization_id,scope_id,service_id) values(org,result,item); end loop;
 return result;
end $$;
-- Security invoker deliberately preserves contract RLS; no public citizen routing API.
create function public.coverage_candidates(p_longitude double precision,p_latitude double precision,p_category uuid,p_at timestamptz default now())
returns table(organization_id uuid,contract_id uuid,territory_id uuid) language plpgsql stable set search_path='' as $$
begin
 if not (p_longitude between -180 and 180 and p_latitude between -90 and 90) or p_longitude is null or p_latitude is null then raise exception 'Invalid coordinates' using errcode='22023'; end if;
 return query select s.organization_id,c.id,t.id from public.contract_scopes s join public.contracts c on c.id=s.contract_id join public.territories t on t.id=s.territory_id join public.contract_scope_categories cc on cc.scope_id=s.id
 join public.organizations o on o.id=c.organization_id
 where cc.category_id=p_category and o.status='active' and c.status='active' and c.valid_from<=p_at and (c.valid_until is null or p_at<c.valid_until) and t.status='active'
 and extensions.st_covers(t.geometry,extensions.st_setsrid(extensions.st_makepoint(p_longitude,p_latitude),4326)) order by s.organization_id,c.id,t.id;
end $$;
grant execute on function public.save_territory(text,text,text,jsonb,uuid),public.save_contract(uuid,text,text,timestamptz,timestamptz,text),public.set_contract_scope(uuid,uuid,uuid[],uuid[]),public.coverage_candidates(double precision,double precision,uuid,timestamptz) to authenticated;
alter table public.territories add constraint territory_labels check(length(btrim(code))>0 and length(btrim(name))>0 and length(btrim(kind))>0);
alter table public.contracts add constraint contract_labels check(length(btrim(reference))>0 and length(btrim(plan_code))>0);
