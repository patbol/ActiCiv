create table public.organizations (
 id uuid primary key default gen_random_uuid(), code text not null unique check (length(btrim(code))>0), name text not null check(length(btrim(name))>0),
 status text not null default 'active' check(status in ('active','inactive','archived')), created_at timestamptz not null default now()
);
create table public.organization_settings (
 id uuid primary key references public.organizations(id), organization_id uuid not null unique references public.organizations(id),
 timezone text not null default 'Europe/Paris', check(id=organization_id)
);
create table public.professional_profiles (
 id uuid primary key references auth.users(id) on delete restrict,
 display_name text not null check(length(btrim(display_name))>0), status text not null default 'active' check(status in ('active','inactive'))
);
create table public.organization_memberships (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 user_id uuid not null unique references public.professional_profiles(id),
 role text not null check(role in ('agent','supervisor','client_admin')),
 status text not null default 'active' check(status in ('active','inactive')), unique(organization_id,id)
);
create table public.platform_admins (
 id uuid primary key references auth.users(id) on delete restrict, active boolean not null default true,
 capabilities text[] not null default '{}', check(capabilities <@ array['organizations.manage','contracts.manage','territories.manage','catalog.manage','organizations.recover','audit.read'])
);
select private.secure_table('public.organizations');
select private.secure_table('public.organization_settings');
select private.secure_table('public.professional_profiles');
select private.secure_table('public.organization_memberships');
select private.secure_table('public.platform_admins');

create function private.platform(capability text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.platform_admins where id=auth.uid() and active and capability=any(capabilities))
$$;
create function private.member(org uuid, roles text[] default array['agent','supervisor','client_admin']) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organization_memberships m join public.professional_profiles p on p.id=m.user_id
 join public.organizations o on o.id=m.organization_id
 where m.user_id=auth.uid() and m.organization_id=org and m.role=any(roles) and m.status='active' and p.status='active' and o.status='active')
$$;
grant execute on function private.platform(text), private.member(uuid,text[]) to authenticated;
create policy organization_read on public.organizations for select to authenticated using(private.member(id) or private.platform('organizations.manage') or private.platform('contracts.manage'));
create policy settings_read on public.organization_settings for select to authenticated using(private.member(organization_id,array['client_admin']) or private.platform('organizations.manage'));
create policy profile_read on public.professional_profiles for select to authenticated using(id=auth.uid() and status='active' and exists(select 1 from public.organization_memberships m where m.user_id=id and private.member(m.organization_id)));
create policy membership_read on public.organization_memberships for select to authenticated using(private.member(organization_id) and (user_id=auth.uid() or private.member(organization_id,array['client_admin'])));
create policy platform_self on public.platform_admins for select to authenticated using(id=auth.uid() and active);

create function private.require_admin(org uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.member(org,array['client_admin']) then raise exception 'Forbidden' using errcode='42501'; end if;
end $$;
create function private.require_platform(capability text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.platform(capability) then raise exception 'Forbidden' using errcode='42501'; end if;
end $$;
