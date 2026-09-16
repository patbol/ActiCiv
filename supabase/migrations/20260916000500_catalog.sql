create table public.verticals(id uuid primary key default gen_random_uuid(),code text not null unique,name text not null,active boolean not null default true);
create table public.categories(id uuid primary key default gen_random_uuid(),vertical_id uuid not null references public.verticals(id),code text not null,name text not null,active boolean not null default true,default_priority text not null default 'normal' check(default_priority in ('normal','important','urgent')),unique(vertical_id,code));
create table public.organization_categories(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),category_id uuid not null references public.categories(id),active boolean not null default true,default_priority text check(default_priority in ('normal','important','urgent')),unique(organization_id,category_id));
select private.secure_table('public.verticals');
select private.secure_table('public.categories');
select private.secure_table('public.organization_categories');
select private.attach_audit('public.verticals','code,name,active');
select private.attach_audit('public.categories','vertical_id,code,name,active,default_priority');
select private.attach_audit('public.organization_categories','category_id,active,default_priority');
create function private.any_member() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organization_memberships m where m.user_id=auth.uid() and private.member(m.organization_id))
$$;
grant execute on function private.any_member() to authenticated;
create policy catalog_read on public.verticals for select to authenticated using(private.any_member() or private.platform('catalog.manage') or private.platform('contracts.manage'));
create policy catalog_read on public.categories for select to authenticated using(private.any_member() or private.platform('catalog.manage') or private.platform('contracts.manage'));
create policy config_read on public.organization_categories for select to authenticated using(private.member(organization_id,array['client_admin']));
create function public.save_category(p_vertical uuid,p_code text,p_name text,p_priority text,p_active boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require_platform('catalog.manage');
 insert into public.categories(vertical_id,code,name,default_priority,active) values(p_vertical,p_code,p_name,p_priority,p_active)
 on conflict(vertical_id,code) do update set name=excluded.name,default_priority=excluded.default_priority,active=excluded.active returning id into result;
 return result;
end $$;
create function public.configure_category(p_org uuid,p_category uuid,p_active boolean,p_priority text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require_admin(p_org);
 insert into public.organization_categories(organization_id,category_id,active,default_priority) values(p_org,p_category,p_active,p_priority)
 on conflict(organization_id,category_id) do update set active=excluded.active,default_priority=excluded.default_priority;
end $$;
grant execute on function public.save_category(uuid,text,text,text,boolean),public.configure_category(uuid,uuid,boolean,text) to authenticated;
create function public.save_vertical(p_code text,p_name text,p_active boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require_platform('catalog.manage');
 insert into public.verticals(code,name,active) values(p_code,p_name,p_active) on conflict(code) do update set name=excluded.name,active=excluded.active returning id into result;
 return result;
end $$;
grant execute on function public.save_vertical(text,text,boolean) to authenticated;
alter table public.verticals add constraint vertical_labels check(length(btrim(code))>0 and length(btrim(name))>0);
alter table public.categories add constraint category_labels check(length(btrim(code))>0 and length(btrim(name))>0);
