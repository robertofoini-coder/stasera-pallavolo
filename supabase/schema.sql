-- Run in a NEW Supabase project's SQL Editor. Requires pgcrypto (normally available).
create extension if not exists pgcrypto;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', city text default '', role text default '', experience text default '',
 bio text default '', discoverable boolean not null default true, open_to_clubs boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.groups (
 id uuid primary key default gen_random_uuid(), name text not null, city text not null,
 description text not null default '', venue text not null default '', founder_id uuid not null references public.profiles(id),
 tournament_ready boolean not null default false, created_at timestamptz not null default now()
);
create table public.group_members (
 group_id uuid not null references public.groups(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role text not null default 'member' check(role in ('member','admin')),
 primary key(group_id,user_id)
);
create table public.games (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
 starts_at timestamptz not null, venue text not null, price_cents integer not null check(price_cents>=0),
 court_spots integer not null default 12 check(court_spots between 2 and 24),
 rotation_spots integer not null default 0 check(rotation_spots between 0 and 12),
 approval_required boolean not null default false,
 created_at timestamptz not null default now(), unique(group_id,starts_at)
);
create table public.bookings (
 id uuid primary key default gen_random_uuid(), game_id uuid not null references public.games(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null check(status in ('pending','confirmed','cancelled','rejected')),
 paid boolean not null default false, created_at timestamptz not null default now(),
 unique(game_id,user_id)
);
create table public.invitations (
 id uuid primary key default gen_random_uuid(), game_id uuid not null references public.games(id) on delete cascade,
 sender_id uuid not null references public.profiles(id), recipient_id uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), unique(game_id,sender_id,recipient_id),
 check(sender_id <> recipient_id)
);
create index on public.games(group_id,starts_at);
create index on public.bookings(game_id,status);
create index on public.invitations(recipient_id);
create function public.on_signup() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','')); return new; end $$;
create trigger create_profile after insert on auth.users for each row execute function public.on_signup();
create function public.is_group_admin(g uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from group_members where group_id=g and user_id=auth.uid() and role='admin') $$;
create function public.on_group_created() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into group_members(group_id,user_id,role) values(new.id,new.founder_id,'admin'); return new; end $$;
create trigger add_founder after insert on public.groups for each row execute function public.on_group_created();
-- All booking mutations go through transactional RPCs to prevent overbooking and enforce deadlines.
create function public.book_game(p_game uuid) returns text language plpgsql security definer set search_path=public as $$
declare g record; occupied integer; result text;
begin
 if auth.uid() is null then raise exception 'Login richiesto'; end if;
 select * into g from games where id=p_game for update;
 if not found then raise exception 'Partita non trovata'; end if;
 if g.starts_at <= now() then raise exception 'Partita già iniziata'; end if;
 select count(*) into occupied from bookings where game_id=p_game and status in ('pending','confirmed');
 if occupied >= g.court_spots+g.rotation_spots then raise exception 'Partita completa'; end if;
 result := case when g.approval_required then 'pending' else 'confirmed' end;
 insert into bookings(game_id,user_id,status) values(p_game,auth.uid(),result)
 on conflict(game_id,user_id) do update set status=excluded.status, paid=false
 where bookings.status in ('cancelled','rejected');
 if not found then raise exception 'Hai già una prenotazione o candidatura attiva'; end if;
 return result;
end $$;
create function public.cancel_booking(p_game uuid) returns void language plpgsql security definer set search_path=public as $$
declare g record; b record;
begin
 select * into g from games where id=p_game for update;
 if not found then raise exception 'Partita non trovata'; end if;
 select * into b from bookings where game_id=p_game and user_id=auth.uid() for update;
 if not found or b.status not in ('pending','confirmed') then raise exception 'Nessuna prenotazione attiva'; end if;
 if b.status='confirmed' and g.starts_at <= now()+interval '12 hours' then raise exception 'Cancellazione bloccata nelle ultime 12 ore'; end if;
 update bookings set status='cancelled',paid=false where id=b.id;
end $$;
create function public.decide_booking(p_booking uuid,p_approve boolean) returns void language plpgsql security definer set search_path=public as $$
declare b record; g record;
begin
 select * into b from bookings where id=p_booking;
 if not found then raise exception 'Candidatura non trovata'; end if;
 select * into g from games where id=b.game_id for update;
 if not public.is_group_admin(g.group_id) then raise exception 'Non autorizzato'; end if;
 if b.status <> 'pending' then raise exception 'Candidatura già gestita'; end if;
 if g.starts_at <= now()+interval '12 hours' and p_approve then
   raise exception 'Approvazione tardiva: serve un flusso di accettazione esplicita';
 end if;
 update bookings set status=case when p_approve then 'confirmed' else 'rejected' end where id=p_booking;
end $$;
create function public.mark_paid(p_booking uuid,p_paid boolean) returns void language plpgsql security definer set search_path=public as $$
declare g uuid;
begin
 select games.group_id into g from bookings join games on games.id=bookings.game_id where bookings.id=p_booking;
 if not public.is_group_admin(g) then raise exception 'Non autorizzato'; end if;
 update bookings set paid=p_paid where id=p_booking and status='confirmed';
end $$;
create function public.invite_player(p_game uuid,p_recipient uuid) returns void language plpgsql security definer set search_path=public as $$
declare g record;
begin
 if auth.uid() is null or auth.uid()=p_recipient then raise exception 'Invito non consentito'; end if;
 select * into g from games where id=p_game;
 if not found or g.starts_at <= now() then raise exception 'Partita non disponibile'; end if;
 if not public.is_group_admin(g.group_id) and not exists(select 1 from bookings where game_id=p_game and user_id=auth.uid() and status='confirmed') then raise exception 'Solo iscritti confermati o amministratori possono invitare'; end if;
 if not exists(select 1 from profiles where id=p_recipient and discoverable=true) then raise exception 'Giocatore non disponibile'; end if;
 insert into invitations(game_id,sender_id,recipient_id) values(p_game,auth.uid(),p_recipient) on conflict do nothing;
end $$;
-- Security policies
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.games enable row level security;
alter table public.bookings enable row level security;
alter table public.invitations enable row level security;
create policy profile_read on profiles for select to authenticated using(discoverable or id=auth.uid());
create policy profile_edit on profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy groups_read on groups for select to authenticated using(true);
create policy groups_insert on groups for insert to authenticated with check(founder_id=auth.uid());
create policy groups_update on groups for update to authenticated using(is_group_admin(id)) with check(is_group_admin(id));
create policy members_read on group_members for select to authenticated using(true);
create policy games_read on games for select to authenticated using(true);
create policy games_insert on games for insert to authenticated with check(is_group_admin(group_id));
create policy games_update on games for update to authenticated using(is_group_admin(group_id)) with check(is_group_admin(group_id));
create policy bookings_read on bookings for select to authenticated using(user_id=auth.uid() or is_group_admin((select group_id from games where id=game_id)) or exists(select 1 from bookings b2 where b2.game_id=bookings.game_id and b2.user_id=auth.uid() and b2.status='confirmed'));
create policy invitations_read on invitations for select to authenticated using(recipient_id=auth.uid() or sender_id=auth.uid());
-- Restrict direct RPC usage to authenticated clients.
revoke execute on function public.book_game(uuid),public.cancel_booking(uuid),public.decide_booking(uuid,boolean),public.mark_paid(uuid,boolean),public.invite_player(uuid,uuid) from public,anon;
grant execute on function public.book_game(uuid),public.cancel_booking(uuid),public.decide_booking(uuid,boolean),public.mark_paid(uuid,boolean),public.invite_player(uuid,uuid) to authenticated;
-- Replace self-referential bookings visibility with a SECURITY DEFINER helper.
create function public.is_confirmed_player(p_game uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from bookings where game_id=p_game and user_id=auth.uid() and status='confirmed') $$;
drop policy bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated using(user_id=auth.uid() or is_group_admin((select group_id from games where id=game_id)) or is_confirmed_player(game_id));
-- Realtime for public game lists and participant status (RLS still applies).
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.invitations;
