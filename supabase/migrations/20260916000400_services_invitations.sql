create table public.services (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 code text not null check(length(btrim(code))>0), name text not null check(length(btrim(name))>0), status text not null default 'active' check(status in ('active','inactive','archived')),
 unique(organization_id,id), unique(organization_id,code)
);
create table public.service_memberships (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 membership_id uuid not null, service_id uuid not null, active boolean not null default true,
 foreign key(organization_id,membership_id) references public.organization_memberships(organization_id,id),
 foreign key(organization_id,service_id) references public.services(organization_id,id), unique(membership_id,service_id)
);
create table public.professional_invitations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 email text not null check(email=lower(trim(email)) and position('@' in email)>1),
 role text not null check(role in ('agent','supervisor','client_admin')), initiator_id uuid not null references auth.users(id),
 state text not null default 'pending' check(state in ('pending','sent','accepted','cancelled')),
 expires_at timestamptz not null default now()+interval '7 days', idempotency_key uuid not null,
 auth_user_id uuid references auth.users(id), unique(organization_id,id), unique(organization_id,idempotency_key)
);
create unique index one_open_invitation on public.professional_invitations(organization_id,email) where state in ('pending','sent');
create table public.invitation_services (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), invitation_id uuid not null, service_id uuid not null,
 foreign key(organization_id,invitation_id) references public.professional_invitations(organization_id,id),
 foreign key(organization_id,service_id) references public.services(organization_id,id), unique(invitation_id,service_id)
);
select private.secure_table('public.services');
select private.secure_table('public.service_memberships');
select private.secure_table('public.professional_invitations');
select private.secure_table('public.invitation_services');
select private.attach_audit('public.services','code,name,status');
select private.attach_audit('public.service_memberships','membership_id,service_id,active');
select private.attach_audit('public.professional_invitations','role,state,expires_at');
select private.attach_audit('public.invitation_services','invitation_id,service_id');

create function private.service_access(org uuid, service uuid, roles text[] default array['agent','supervisor']) returns boolean language sql stable security definer set search_path='' as $$
 select private.member(org,roles) and exists(select 1 from public.service_memberships sm join public.organization_memberships m on m.id=sm.membership_id
 join public.services s on s.id=sm.service_id where m.user_id=auth.uid() and sm.organization_id=org and sm.service_id=service and sm.active and s.status='active')
$$;
create function private.can_read_member(org uuid, target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.member(org) and (private.member(org,array['client_admin']) or exists(select 1 from public.organization_memberships where id=target and user_id=auth.uid()) or
 exists(select 1 from public.service_memberships sm where sm.membership_id=target and sm.active and private.service_access(org,sm.service_id,array['supervisor'])))
$$;
grant execute on function private.service_access(uuid,uuid,text[]), private.can_read_member(uuid,uuid) to authenticated;
drop policy membership_read on public.organization_memberships;
create policy membership_read on public.organization_memberships for select to authenticated using(private.can_read_member(organization_id,id));
drop policy profile_read on public.professional_profiles;
create policy profile_read on public.professional_profiles for select to authenticated using(exists(select 1 from public.organization_memberships m where m.user_id=professional_profiles.id and private.can_read_member(m.organization_id,m.id)));
create policy services_read on public.services for select to authenticated using(private.member(organization_id,array['client_admin']) or private.service_access(organization_id,id) or private.platform('contracts.manage'));
create policy service_memberships_read on public.service_memberships for select to authenticated using(private.member(organization_id,array['client_admin']) or private.service_access(organization_id,service_id,array['supervisor']) or (private.member(organization_id) and exists(select 1 from public.organization_memberships m where m.id=membership_id and m.user_id=auth.uid())));
create policy invitations_read on public.professional_invitations for select to authenticated using(private.member(organization_id,array['client_admin']));
create policy invitation_services_read on public.invitation_services for select to authenticated using(private.member(organization_id,array['client_admin']));

create function private.protect_last_admin() returns trigger language plpgsql security definer set search_path='' as $$
declare org uuid; excluded uuid; removes boolean;
begin
 if TG_TABLE_NAME='professional_profiles' then
  select organization_id,id into org,excluded from public.organization_memberships where user_id=old.id and role='client_admin' and status='active';
  removes:=old.status='active' and (TG_OP='DELETE' or new.status<>'active');
 else
  org:=old.organization_id; excluded:=old.id;
  removes:=old.role='client_admin' and old.status='active' and (TG_OP='DELETE' or new.role<>'client_admin' or new.status<>'active');
 end if;
 if removes and org is not null then
  perform 1 from public.organizations where id=org for update;
  if not exists(select 1 from public.organization_memberships m join public.professional_profiles p on p.id=m.user_id where m.organization_id=org and m.id<>excluded and m.role='client_admin' and m.status='active' and p.status='active') then
   raise exception 'Last active administrator' using errcode='23514';
  end if;
 end if;
 return coalesce(new,old);
end $$;
create trigger last_admin before update or delete on public.organization_memberships for each row execute function private.protect_last_admin();
create trigger last_admin before update or delete on public.professional_profiles for each row execute function private.protect_last_admin();

create function public.change_member(p_member uuid,p_role text,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
declare org uuid;
begin
 select organization_id into strict org from public.organization_memberships where id=p_member;
 perform 1 from public.organizations where id=org for update;
 if not private.platform('organizations.recover') then perform private.require_admin(org); end if;
 update public.organization_memberships set role=p_role,status=case when p_active then 'active' else 'inactive' end where id=p_member;
end $$;
create function public.set_profile_active(p_user uuid,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
declare org uuid;
begin
 select organization_id into strict org from public.organization_memberships where user_id=p_user;
 perform 1 from public.organizations where id=org for update;
 if not private.platform('organizations.recover') then perform private.require_admin(org); end if;
 update public.professional_profiles set status=case when p_active then 'active' else 'inactive' end where id=p_user;
end $$;
create function public.save_service(p_org uuid,p_code text,p_name text,p_status text default 'active') returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require_admin(p_org);
 insert into public.services(organization_id,code,name,status) values(p_org,p_code,p_name,p_status)
 on conflict(organization_id,code) do update set name=excluded.name,status=excluded.status returning id into result;
 return result;
end $$;
create function public.set_service_member(p_org uuid,p_member uuid,p_service uuid,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require_admin(p_org);
 insert into public.service_memberships(organization_id,membership_id,service_id,active) values(p_org,p_member,p_service,p_active)
 on conflict(membership_id,service_id) do update set active=excluded.active;
end $$;
create function public.reserve_invitation(p_org uuid,p_email text,p_role text,p_services uuid[],p_key uuid) returns public.professional_invitations language plpgsql security definer set search_path='' as $$
declare result public.professional_invitations; sid uuid;
begin
 perform 1 from public.organizations where id=p_org for update;
 perform private.require_admin(p_org);
 select * into result from public.professional_invitations where organization_id=p_org and idempotency_key=p_key;
 if found then
  if result.email<>lower(trim(p_email)) or result.role<>p_role or
   (select coalesce(array_agg(service_id order by service_id),'{}'::uuid[]) from public.invitation_services where invitation_id=result.id) is distinct from (select coalesce(array_agg(distinct x order by x),'{}'::uuid[]) from unnest(p_services) x)
   then raise exception 'Idempotency payload mismatch' using errcode='23514'; end if;
  return result;
 end if;
 update public.professional_invitations set state='cancelled' where organization_id=p_org and email=lower(trim(p_email)) and state in ('pending','sent') and expires_at<=now();
 insert into public.professional_invitations(organization_id,email,role,initiator_id,idempotency_key) values(p_org,lower(trim(p_email)),p_role,auth.uid(),p_key) returning * into result;
 foreach sid in array p_services loop
  if not exists(select 1 from public.services where id=sid and organization_id=p_org and status='active') then raise exception 'Invalid service' using errcode='23514'; end if;
  insert into public.invitation_services(organization_id,invitation_id,service_id) values(p_org,result.id,sid) on conflict do nothing;
 end loop;
 return result;
end $$;
-- This command only binds an Auth identity; it never grants membership. Service role is scoped to this bridge.
create function public.mark_invitation_sent(p_invitation uuid,p_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare inv public.professional_invitations;
begin
 select * into strict inv from public.professional_invitations where id=p_invitation for update;
 if inv.state='sent' and inv.auth_user_id=p_user then return; end if;
 if inv.state<>'pending' or inv.expires_at<=now() or not exists(select 1 from auth.users where id=p_user and lower(email)=inv.email) then raise exception 'Invalid invitation' using errcode='23514'; end if;
 update public.professional_invitations set state='sent',auth_user_id=p_user where id=p_invitation;
end $$;
create function public.accept_invitation(p_invitation uuid,p_name text) returns void language plpgsql security definer set search_path='' as $$
declare inv public.professional_invitations; mid uuid;
begin
 select * into strict inv from public.professional_invitations where id=p_invitation for update;
 perform 1 from public.organizations where id=inv.organization_id and status='active' for update;
 if not found or inv.state<>'sent' or inv.expires_at<=now() or inv.auth_user_id is distinct from auth.uid() then raise exception 'Invalid invitation' using errcode='42501'; end if;
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and lower(email)=inv.email) then raise exception 'Unverified identity' using errcode='42501'; end if;
 if not exists(select 1 from public.organization_memberships m join public.professional_profiles p on p.id=m.user_id where m.user_id=inv.initiator_id and m.organization_id=inv.organization_id and m.role='client_admin' and m.status='active' and p.status='active') then raise exception 'Initiator no longer authorized' using errcode='42501'; end if;
 if exists(select 1 from public.invitation_services i join public.services s on s.id=i.service_id where i.invitation_id=inv.id and s.status<>'active') then raise exception 'Inactive service' using errcode='23514'; end if;
 insert into public.professional_profiles(id,display_name) values(auth.uid(),p_name);
 insert into public.organization_memberships(organization_id,user_id,role) values(inv.organization_id,auth.uid(),inv.role) returning id into mid;
 insert into public.service_memberships(organization_id,membership_id,service_id) select organization_id,mid,service_id from public.invitation_services where invitation_id=inv.id;
 update public.professional_invitations set state='accepted' where id=inv.id;
end $$;
create function public.pending_invitation() returns table(id uuid) language sql stable security definer set search_path='' as $$
 select id from public.professional_invitations where auth_user_id=auth.uid() and state='sent' and expires_at>now()
$$;
grant execute on function public.change_member(uuid,text,boolean),public.set_profile_active(uuid,boolean),public.save_service(uuid,text,text,text),public.set_service_member(uuid,uuid,uuid,boolean),public.reserve_invitation(uuid,text,text,uuid[],uuid),public.accept_invitation(uuid,text),public.pending_invitation() to authenticated;
grant execute on function public.mark_invitation_sent(uuid,uuid) to service_role;
create function public.save_organization(p_code text,p_name text,p_status text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require_platform('organizations.manage');
 insert into public.organizations(code,name,status) values(p_code,p_name,p_status) on conflict(code) do update set name=excluded.name,status=excluded.status returning id into result;
 insert into public.organization_settings(id,organization_id) values(result,result) on conflict do nothing;
 return result;
end $$;
create function public.recover_organization(p_org uuid,p_user uuid,p_name text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require_platform('organizations.recover');
 perform 1 from public.organizations where id=p_org for update;
 insert into public.professional_profiles(id,display_name) values(p_user,p_name) on conflict(id) do update set status='active';
 if exists(select 1 from public.organization_memberships where user_id=p_user and organization_id<>p_org) then raise exception 'Already a member of another organization' using errcode='23514'; end if;
 insert into public.organization_memberships(organization_id,user_id,role) values(p_org,p_user,'client_admin') on conflict(user_id) do update set role='client_admin',status='active';
end $$;
grant execute on function public.save_organization(text,text,text),public.recover_organization(uuid,uuid,text) to authenticated;
