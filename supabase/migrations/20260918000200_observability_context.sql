-- Additive read-only projection. No mutation/audit trigger or existing RPC is rewritten.
-- Auth invitees can already read their pending invitation ID; correlation grants no right.
create function public.pending_invitation_context()
returns table(id uuid,correlation_id uuid)
language sql stable security definer set search_path='' as $$
 select i.id,i.correlation_id from public.professional_invitations i
 where i.auth_user_id=auth.uid() and i.state='sent' and i.expires_at>now()
$$;
revoke all on function public.pending_invitation_context() from public,anon;
grant execute on function public.pending_invitation_context() to authenticated;
