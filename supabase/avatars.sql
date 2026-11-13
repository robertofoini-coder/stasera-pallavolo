-- StaseraVolley v0.4: foto profilo con approvazione manuale (nessun costo).
-- Eseguire UNA volta nello SQL Editor di Supabase, dopo schema.sql.

-- 1) Campi foto nel profilo (solo la funzione decide_avatar li imposta)
alter table public.profiles
  add column if not exists avatar_path text,
  add column if not exists avatar_status text not null default 'none' check (avatar_status in ('none','approved'));

-- Gli utenti NON possono scrivere i campi della foto (altrimenti si auto-approverebbero).
revoke update on public.profiles from anon, authenticated;
grant update (display_name, city, role, experience, bio, discoverable, open_to_clubs) on public.profiles to authenticated;

-- 2) Amministratori della piattaforma (chi approva le foto)
create table if not exists public.platform_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.platform_admins enable row level security;
drop policy if exists pa_self on public.platform_admins;
create policy pa_self on public.platform_admins for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.platform_admins from anon, authenticated;

create or replace function public.is_platform_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.platform_admins where user_id = auth.uid())
$$;

-- 3) Richieste di approvazione
create table if not exists public.avatar_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','replaced')),
  reasons text[] not null default '{}',
  checks jsonb not null default '{}',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table public.avatar_submissions enable row level security;
drop policy if exists sub_read_own on public.avatar_submissions;
create policy sub_read_own on public.avatar_submissions for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.avatar_submissions from anon, authenticated;

-- 4) Funzioni
create or replace function public.submit_avatar(p_path text, p_checks jsonb default '{}') returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  if p_path is null or split_part(p_path,'/',1) <> auth.uid()::text or p_path !~ '^[^/]+/[A-Za-z0-9_-]{8,64}\.jpg$' then
    raise exception 'Percorso non valido';
  end if;
  if (select count(*) from avatar_submissions where user_id = auth.uid() and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'Troppi tentativi oggi. Riprova domani.';
  end if;
  update avatar_submissions set status = 'replaced', decided_at = now() where user_id = auth.uid() and status = 'pending';
  insert into avatar_submissions(user_id, path, checks) values (auth.uid(), p_path, coalesce(p_checks, '{}'::jsonb)) returning id into v_id;
  return v_id;
end $$;

create or replace function public.remove_avatar() returns text[]
language plpgsql security definer set search_path = public as $$
declare r text[];
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  select coalesce(array_agg(x), '{}') into r from (
    select avatar_path as x from profiles where id = auth.uid() and avatar_path is not null
    union all select path from avatar_submissions where user_id = auth.uid() and status = 'pending') t;
  update profiles set avatar_path = null, avatar_status = 'none' where id = auth.uid();
  update avatar_submissions set status = 'replaced', decided_at = now() where user_id = auth.uid() and status = 'pending';
  return r;
end $$;

create or replace function public.pending_avatars() returns table (id uuid, user_id uuid, display_name text, path text, checks jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not is_platform_admin() then raise exception 'Non autorizzato'; end if;
  return query select s.id, s.user_id, p.display_name, s.path, s.checks, s.created_at
    from avatar_submissions s join profiles p on p.id = s.user_id where s.status = 'pending' order by s.created_at;
end $$;

-- Restituisce il percorso del file da cancellare (la vecchia foto se approvata, la nuova se rifiutata).
create or replace function public.decide_avatar(p_id uuid, p_approve boolean, p_reasons text[] default '{}') returns text
language plpgsql security definer set search_path = public as $$
declare s avatar_submissions; old text;
  codes text[] := array['FACE_NOT_VISIBLE','MULTIPLE_PEOPLE','LOW_IMAGE_QUALITY','POSSIBLE_MINOR','ADULT_CONTENT','VIOLENCE','WEAPON','DRUGS','PERSONAL_DATA','ADVERTISEMENT','QR_CODE','SCREENSHOT','LOGO','AVATAR_OR_AI_IMAGE','COPYRIGHT_CONTENT','OFFENSIVE_CONTENT','NOT_PROFILE_PHOTO'];
begin
  if not is_platform_admin() then raise exception 'Non autorizzato'; end if;
  select * into s from avatar_submissions where id = p_id and status = 'pending' for update;
  if not found then raise exception 'Richiesta non trovata o già gestita'; end if;
  if p_approve then
    select avatar_path into old from profiles where id = s.user_id;
    update profiles set avatar_path = s.path, avatar_status = 'approved' where id = s.user_id;
    update avatar_submissions set status = 'approved', decided_at = now() where id = p_id;
    return old;
  end if;
  if coalesce(array_length(p_reasons, 1), 0) = 0 or not (p_reasons <@ codes) then raise exception 'Seleziona almeno un motivo valido'; end if;
  update avatar_submissions set status = 'rejected', reasons = p_reasons, decided_at = now() where id = p_id;
  return s.path;
end $$;

revoke execute on function public.submit_avatar(text, jsonb), public.remove_avatar(), public.pending_avatars(), public.decide_avatar(uuid, boolean, text[]) from public, anon;
grant execute on function public.submit_avatar(text, jsonb), public.remove_avatar(), public.pending_avatars(), public.decide_avatar(uuid, boolean, text[]) to authenticated;

-- 5) Storage: bucket pubblico "avatars"; i file hanno nomi casuali e il loro link è noto solo al
-- proprietario e agli amministratori finché la foto non è approvata.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg'])
on conflict (id) do nothing;

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists avatars_delete_admin on storage.objects;
create policy avatars_delete_admin on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and public.is_platform_admin());

-- 6) DA FARE UNA VOLTA: rendi amministratore te stesso (sostituisci l'email con la tua, poi esegui questa riga)
-- insert into public.platform_admins (user_id) select id from auth.users where email = 'LA-TUA-EMAIL@esempio.it';
