-- Correlation is a command identifier, never an authorization credential.
create function private.command_correlation() returns uuid language plpgsql volatile set search_path='' as $$
declare value text; result uuid;
begin
 value:=nullif(current_setting('acticiv.correlation_id',true),'');
 if value is null then
  value:=nullif(current_setting('request.headers',true),'')::jsonb->>'x-acticiv-command-id';
 end if;
 if value is not null and value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then result:=value::uuid;
 else result:=gen_random_uuid(); end if;
 perform set_config('acticiv.correlation_id',result::text,true);
 return result;
end $$;
-- Legacy events receive standalone identifiers; no historical request correlation is invented.
alter table public.audit_events add column correlation_id uuid not null default gen_random_uuid();
alter table public.audit_events alter column correlation_id set default private.command_correlation();
create index audit_correlation on public.audit_events(correlation_id);
alter table public.professional_invitations add column correlation_id uuid not null default private.command_correlation();
create or replace function private.audit_row() returns trigger language plpgsql security definer set search_path='' as $$
declare old_data jsonb; new_data jsonb; row_data jsonb; fields text[]; k text; changes jsonb:='{}'; org uuid;
begin
 fields:=string_to_array(TG_ARGV[0],',');
 if TG_OP<>'INSERT' then old_data:=to_jsonb(old); end if;
 if TG_OP<>'DELETE' then new_data:=to_jsonb(new); end if;
 row_data:=coalesce(new_data,old_data);
 foreach k in array fields loop
  if old_data->k is distinct from new_data->k then changes:=changes||jsonb_build_object(k,jsonb_build_object('old',old_data->k,'new',new_data->k)); end if;
 end loop;
 if TG_TABLE_NAME='professional_invitations' then
  perform set_config('acticiv.correlation_id',row_data->>'correlation_id',true);
 end if;
 if TG_TABLE_NAME='territories' and old_data->'geometry' is distinct from new_data->'geometry' then
  changes:=changes||jsonb_build_object('geometry_hash',jsonb_build_object('old',md5(old_data->>'geometry'),'new',md5(new_data->>'geometry')));
 end if;
 org:=(row_data->>'organization_id')::uuid;
 if TG_TABLE_NAME='organizations' then org:=(row_data->>'id')::uuid; end if;
 if TG_TABLE_NAME='professional_profiles' then select organization_id into org from public.organization_memberships where user_id=(row_data->>'id')::uuid; end if;
 insert into public.audit_events(actor_id,actor_kind,organization_id,entity_type,entity_id,action,changes)
 values(auth.uid(),case when auth.uid() is null then 'system' else 'user' end,org,TG_TABLE_NAME,(row_data->>'id')::uuid,TG_OP,changes);
 return coalesce(new,old);
end $$;
create or replace function public.accept_invitation(p_invitation uuid,p_name text) returns void language plpgsql security definer set search_path='' as $$
declare inv public.professional_invitations; mid uuid;
begin
 select * into strict inv from public.professional_invitations where id=p_invitation for update;
 perform 1 from public.organizations where id=inv.organization_id and status='active' for update;
 if not found or inv.state<>'sent' or inv.expires_at<=now() or inv.auth_user_id is distinct from auth.uid() then raise exception 'Invalid invitation' using errcode='42501'; end if;
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and lower(email)=inv.email) then raise exception 'Unverified identity' using errcode='42501'; end if;
 if not exists(select 1 from public.organization_memberships m join public.professional_profiles p on p.id=m.user_id where m.user_id=inv.initiator_id and m.organization_id=inv.organization_id and m.role='client_admin' and m.status='active' and p.status='active') then raise exception 'Initiator no longer authorized' using errcode='42501'; end if;
 if exists(select 1 from public.invitation_services i join public.services s on s.id=i.service_id where i.invitation_id=inv.id and s.status<>'active') then raise exception 'Inactive service' using errcode='23514'; end if;
 perform set_config('acticiv.correlation_id',inv.correlation_id::text,true);
 insert into public.professional_profiles(id,display_name) values(auth.uid(),p_name);
 insert into public.organization_memberships(organization_id,user_id,role) values(inv.organization_id,auth.uid(),inv.role) returning id into mid;
 insert into public.service_memberships(organization_id,membership_id,service_id) select organization_id,mid,service_id from public.invitation_services where invitation_id=inv.id;
 update public.professional_invitations set state='accepted' where id=inv.id;
end $$;
create or replace function private.validate_territory() returns trigger language plpgsql set search_path='' as $$
begin
 perform pg_advisory_xact_lock(782341);
 if new.parent_id is not null then
  if exists(with recursive parents as (select id,parent_id from public.territories where id=new.parent_id union select t.id,t.parent_id from public.territories t join parents p on t.id=p.parent_id) select 1 from parents where id=new.id) then raise exception 'Territory cycle' using errcode='23514'; end if;
  if not exists(select 1 from public.territories p where p.id=new.parent_id and extensions.st_covers(p.geometry,new.geometry) and not extensions.st_equals(p.geometry,new.geometry)) then raise exception 'Parent must strictly contain child' using errcode='23514'; end if;
 end if;
 if exists(select 1 from public.territories c where c.parent_id=new.id and (not extensions.st_covers(new.geometry,c.geometry) or extensions.st_equals(new.geometry,c.geometry))) then raise exception 'Child outside new parent' using errcode='23514'; end if;
 return new;
end $$;
