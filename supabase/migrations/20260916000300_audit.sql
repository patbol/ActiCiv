create table public.audit_events (
 id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id),
 actor_kind text not null check(actor_kind in ('user','system')), organization_id uuid references public.organizations(id),
 occurred_at timestamptz not null default clock_timestamp(), entity_type text not null, entity_id uuid not null,
 action text not null, changes jsonb not null, transaction_id bigint not null default txid_current(),
 check((actor_kind='user')=(actor_id is not null))
);
select private.secure_table('public.audit_events');
create index audit_organization_time on public.audit_events(organization_id,occurred_at desc);
create policy audit_read on public.audit_events for select to authenticated using(private.member(organization_id,array['client_admin']) or private.platform('audit.read'));
create function private.audit_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Audit is append-only' using errcode='42501'; end $$;
create trigger immutable_audit before update or delete on public.audit_events for each row execute function private.audit_immutable();

create function private.audit_row() returns trigger language plpgsql security definer set search_path='' as $$
declare old_data jsonb; new_data jsonb; row_data jsonb; fields text[]; k text; changes jsonb:='{}'; org uuid;
begin
 fields:=string_to_array(TG_ARGV[0],',');
 if TG_OP<>'INSERT' then old_data:=to_jsonb(old); end if;
 if TG_OP<>'DELETE' then new_data:=to_jsonb(new); end if;
 row_data:=coalesce(new_data,old_data);
 foreach k in array fields loop
  if old_data->k is distinct from new_data->k then changes:=changes||jsonb_build_object(k,jsonb_build_object('old',old_data->k,'new',new_data->k)); end if;
 end loop;
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
create function private.attach_audit(target regclass, fields text) returns void language plpgsql as $$
begin execute format('create trigger audit_mutation after insert or update or delete on %s for each row execute function private.audit_row(%L)',target,fields); end $$;
revoke all on function private.attach_audit(regclass,text) from public,anon,authenticated;
select private.attach_audit('public.organizations','code,name,status');
select private.attach_audit('public.organization_settings','timezone');
select private.attach_audit('public.professional_profiles','status');
select private.attach_audit('public.organization_memberships','role,status');
select private.attach_audit('public.platform_admins','active,capabilities');
