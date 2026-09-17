-- 2bis-C: additive preferences, least-privilege projection and reference labels.
alter table public.organization_settings add column default_locale text not null default 'fr-FR' check(default_locale in ('fr-FR','en-GB'));
alter table public.professional_profiles add column preferred_locale text check(preferred_locale in ('fr-FR','en-GB'));
drop trigger audit_mutation on public.organization_settings;
select private.attach_audit('public.organization_settings','timezone,default_locale');
drop trigger audit_mutation on public.professional_profiles;
select private.attach_audit('public.professional_profiles','status,preferred_locale');

create function public.get_locale_preferences() returns table(preferred_locale text,organization_locale text)
language sql stable security definer set search_path='' as $$
 select p.preferred_locale,s.default_locale from public.professional_profiles p
 join public.organization_memberships m on m.user_id=p.id
 join public.organization_settings s on s.organization_id=m.organization_id
 where p.id=auth.uid() and private.member(m.organization_id)
$$;
create function public.set_preferred_locale(p_locale text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.any_member() then raise exception 'Forbidden' using errcode='42501'; end if;
 update public.professional_profiles set preferred_locale=p_locale where id=auth.uid();
end $$;
create function public.set_organization_locale(p_org uuid,p_locale text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require_admin(p_org);
 update public.organization_settings set default_locale=p_locale where organization_id=p_org;
end $$;
grant execute on function public.get_locale_preferences(),public.set_preferred_locale(text),public.set_organization_locale(uuid,text) to authenticated;

-- Preserve the historical nonempty label contract: no new maximum length
-- may make a pre-existing French name impossible to backfill or update.
create table public.vertical_translations (
 id uuid primary key default gen_random_uuid(), vertical_id uuid not null references public.verticals(id),
 locale text not null check(locale in ('fr-FR','en-GB')), label text not null check(length(btrim(label))>0), unique(vertical_id,locale)
);
create table public.category_translations (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id),
 locale text not null check(locale in ('fr-FR','en-GB')), label text not null check(length(btrim(label))>0), unique(category_id,locale)
);
create table public.hold_reason_translations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, hold_reason_id uuid not null,
 locale text not null check(locale in ('fr-FR','en-GB')), label text not null check(length(btrim(label))>0),
 foreign key(organization_id,hold_reason_id) references public.hold_reasons(organization_id,id), unique(hold_reason_id,locale)
);
do $$ declare t text; begin
 foreach t in array array['vertical_translations','category_translations','hold_reason_translations'] loop
  perform private.secure_table(('public.'||t)::regclass);
  perform private.attach_audit(('public.'||t)::regclass,'vertical_id,category_id,hold_reason_id,locale,label');
 end loop;
end $$;
create policy translations_read on public.vertical_translations for select to authenticated using(private.any_member() or private.platform('catalog.manage') or private.platform('contracts.manage'));
create policy translations_read on public.category_translations for select to authenticated using(private.any_member() or private.platform('catalog.manage') or private.platform('contracts.manage'));
create policy translations_read on public.hold_reason_translations for select to authenticated using(private.member(organization_id,array['client_admin']));

-- Historical French label is authoritative until its eventual removal. Both
-- existing save_* RPCs and the translation RPC converge on this trigger.
create function private.sync_french_reference() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_TABLE_NAME='verticals' then
  insert into public.vertical_translations(vertical_id,locale,label) values(new.id,'fr-FR',new.name)
  on conflict(vertical_id,locale) do update set label=excluded.label where vertical_translations.label is distinct from excluded.label;
 elsif TG_TABLE_NAME='categories' then
  insert into public.category_translations(category_id,locale,label) values(new.id,'fr-FR',new.name)
  on conflict(category_id,locale) do update set label=excluded.label where category_translations.label is distinct from excluded.label;
 else
  insert into public.hold_reason_translations(organization_id,hold_reason_id,locale,label) values(new.organization_id,new.id,'fr-FR',new.label)
  on conflict(hold_reason_id,locale) do update set label=excluded.label where hold_reason_translations.label is distinct from excluded.label;
 end if;
 return new;
end $$;
create trigger sync_french after insert or update of name on public.verticals for each row execute function private.sync_french_reference();
create trigger sync_french after insert or update of name on public.categories for each row execute function private.sync_french_reference();
create trigger sync_french after insert or update of label on public.hold_reasons for each row execute function private.sync_french_reference();
create function private.guard_french_reference() returns trigger language plpgsql set search_path='' as $$
declare source text;
begin
 if new.locale<>'fr-FR' then return new; end if;
 if TG_TABLE_NAME='vertical_translations' then select name into source from public.verticals where id=new.vertical_id;
 elsif TG_TABLE_NAME='category_translations' then select name into source from public.categories where id=new.category_id;
 else select label into source from public.hold_reasons where id=new.hold_reason_id; end if;
 if new.label is distinct from source then raise exception 'French label must match source' using errcode='23514'; end if;
 return new;
end $$;
do $$ declare t text; begin foreach t in array array['vertical_translations','category_translations','hold_reason_translations'] loop
 execute format('create trigger french_source before insert or update on public.%I for each row execute function private.guard_french_reference()',t);
end loop; end $$;
insert into public.vertical_translations(vertical_id,locale,label) select id,'fr-FR',name from public.verticals;
insert into public.category_translations(category_id,locale,label) select id,'fr-FR',name from public.categories;
insert into public.hold_reason_translations(organization_id,hold_reason_id,locale,label) select organization_id,id,'fr-FR',label from public.hold_reasons;

create function public.save_reference_translation(p_kind text,p_entity uuid,p_locale text,p_label text) returns void language plpgsql security definer set search_path='' as $$
declare org uuid;
begin
 if p_locale is null or p_locale not in ('fr-FR','en-GB') or p_label is null or length(btrim(p_label)) not between 1 and 200 then raise exception 'Invalid translation' using errcode='23514'; end if;
 if p_kind='hold_reason' then
  select organization_id into org from public.hold_reasons where id=p_entity for update;
  perform private.require_admin(org);
  if p_locale='fr-FR' then update public.hold_reasons set label=p_label where id=p_entity;
  else insert into public.hold_reason_translations(organization_id,hold_reason_id,locale,label) values(org,p_entity,p_locale,p_label) on conflict(hold_reason_id,locale) do update set label=excluded.label; end if;
 elsif p_kind='vertical' then
  perform private.require_platform('catalog.manage');
  perform 1 from public.verticals where id=p_entity for update;
  if not found then raise exception 'Unknown reference' using errcode='23503'; end if;
  if p_locale='fr-FR' then update public.verticals set name=p_label where id=p_entity;
  else insert into public.vertical_translations(vertical_id,locale,label) values(p_entity,p_locale,p_label) on conflict(vertical_id,locale) do update set label=excluded.label; end if;
 elsif p_kind='category' then
  perform private.require_platform('catalog.manage');
  perform 1 from public.categories where id=p_entity for update;
  if not found then raise exception 'Unknown reference' using errcode='23503'; end if;
  if p_locale='fr-FR' then update public.categories set name=p_label where id=p_entity;
  else insert into public.category_translations(category_id,locale,label) values(p_entity,p_locale,p_label) on conflict(category_id,locale) do update set label=excluded.label; end if;
 else raise exception 'Invalid reference kind' using errcode='23514'; end if;
end $$;
grant execute on function public.save_reference_translation(text,uuid,text,text) to authenticated;
