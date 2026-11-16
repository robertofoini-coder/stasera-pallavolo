-- Gestione degli amministratori della piattaforma dalla dashboard.
-- Applicare una sola volta nel SQL Editor di Supabase dopo merge-mockup-migration.sql.

create or replace function public.admin_list_platform_admins()
returns table(user_id uuid, email text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_platform_admin() then raise exception 'Non autorizzato'; end if;
  return query
    select a.user_id, u.email::text
    from public.platform_admins a
    join auth.users u on u.id = a.user_id
    order by lower(u.email);
end $$;

create or replace function public.admin_set_platform_admin(p_email text, p_enabled boolean)
returns void
language plpgsql security definer set search_path = public, auth as $$
declare target_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Non autorizzato'; end if;
  if p_email is null or length(trim(p_email)) = 0 then raise exception 'Inserisci un indirizzo email'; end if;

  select id into target_id from auth.users where lower(email) = lower(trim(p_email));
  if target_id is null then raise exception 'Email non registrata: la persona deve prima creare un account nell’app'; end if;
  if target_id = auth.uid() and not p_enabled then raise exception 'Non puoi revocare il tuo stesso accesso'; end if;

  if p_enabled then
    insert into public.platform_admins(user_id) values (target_id) on conflict (user_id) do nothing;
  else
    if (select count(*) from public.platform_admins) <= 1 then raise exception 'Deve restare almeno un amministratore'; end if;
    delete from public.platform_admins where user_id = target_id;
  end if;
end $$;

revoke execute on function public.admin_list_platform_admins(), public.admin_set_platform_admin(text, boolean) from public, anon;
grant execute on function public.admin_list_platform_admins(), public.admin_set_platform_admin(text, boolean) to authenticated;
