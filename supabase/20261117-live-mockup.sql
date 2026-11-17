-- Additive migration: existing users, games, bookings, payments and admins stay intact.
begin;

create table if not exists public.feedback (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
 area text not null check(length(area) between 1 and 100),
 message text not null check(length(trim(message)) between 1 and 3000),
 created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists feedback_read on public.feedback;
create policy feedback_read on public.feedback for select to authenticated using(user_id=auth.uid() or public.is_platform_admin());
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to authenticated with check(user_id=auth.uid());
grant select,insert on public.feedback to authenticated;
revoke update,delete on public.feedback from anon,authenticated;

create table if not exists public.match_ratings (
 game_id uuid not null references public.games(id), user_id uuid not null references public.profiles(id),
 scores jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(game_id,user_id)
);
alter table public.match_ratings enable row level security;
drop policy if exists ratings_read on public.match_ratings;
create policy ratings_read on public.match_ratings for select to authenticated using(user_id=auth.uid() or public.is_platform_admin());
grant select on public.match_ratings to authenticated;
revoke insert,update,delete on public.match_ratings from anon,authenticated;

create or replace function public.app_game_stats()
returns table(game_id uuid, occupied bigint) language sql stable security definer set search_path=public as $$
 select g.id,count(b.id) from games g left join bookings b on b.game_id=g.id and b.status in ('pending','confirmed')
 where auth.uid() is not null and g.starts_at>=now() group by g.id
$$;

create or replace function public.app_game_players(p_game uuid)
returns table(user_id uuid,display_name text) language plpgsql stable security definer set search_path=public as $$
begin
 if not public.is_confirmed_player(p_game) and not public.is_platform_admin() and not public.is_group_admin((select group_id from games where id=p_game)) then raise exception 'Non autorizzato'; end if;
 return query select p.id,p.display_name from bookings b join profiles p on p.id=b.user_id where b.game_id=p_game and b.status='confirmed';
end $$;

create or replace function public.app_create_series(p_group uuid,p_name text,p_city text,p_venue text,p_dates timestamptz[],p_price_cents integer,p_court_spots integer,p_rotation_spots integer,p_approval boolean)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_group uuid:=p_group; v_date timestamptz;
begin
 if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
 if coalesce(cardinality(p_dates),0) not between 1 and 104 or p_price_cents is null or p_price_cents not between 0 and 50000
 or p_court_spots is null or p_court_spots not between 2 and 24 or p_rotation_spots is null or p_rotation_spots not between 0 and 12
 or p_approval is null or length(trim(coalesce(p_name,''))) not between 1 and 100 or length(trim(coalesce(p_city,''))) not between 1 and 100
 or length(trim(coalesce(p_venue,''))) not between 1 and 200 then raise exception 'Dati della serata non validi'; end if;
 foreach v_date in array p_dates loop
   if v_date is null or v_date<=now() then raise exception 'Scegli date future'; end if;
 end loop;
 if (select count(distinct d) from unnest(p_dates) d)<>cardinality(p_dates) then raise exception 'Date duplicate'; end if;
 if v_group is null then
   insert into groups(name,city,venue,founder_id) values(trim(p_name),trim(p_city),trim(p_venue),auth.uid()) returning id into v_group;
 elsif not public.is_group_admin(v_group) then raise exception 'Non sei organizzatore di questo gruppo'; end if;
 insert into games(group_id,starts_at,venue,price_cents,court_spots,rotation_spots,approval_required)
 select v_group,d,trim(p_venue),p_price_cents,p_court_spots,p_rotation_spots,p_approval from unnest(p_dates) d;
 return v_group;
end $$;

create or replace function public.app_submit_rating(p_game uuid,p_scores jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare entry record; target_id uuid;
begin
 if auth.uid() is null or not public.is_confirmed_player(p_game) then raise exception 'Serve una partecipazione confermata'; end if;
 if not exists(select 1 from games where id=p_game and starts_at+interval '2 hours'<=now()) then raise exception 'La partita non è ancora conclusa'; end if;
 if p_scores is null or jsonb_typeof(p_scores)<>'object' or p_scores='{}'::jsonb then raise exception 'Seleziona almeno una valutazione'; end if;
 for entry in select * from jsonb_each(p_scores) loop
   if jsonb_typeof(entry.value)<>'number' or entry.value::text not in ('1','2','3','4','5') then raise exception 'Voto non valido'; end if;
   if entry.key<>'venue' then
     if entry.key!~'^[0-9a-f-]{36}:(reliability|technique)$' then raise exception 'Voce non valida'; end if;
     target_id:=split_part(entry.key,':',1)::uuid;
     if target_id=auth.uid() or not exists(select 1 from bookings where game_id=p_game and user_id=target_id and status='confirmed') then raise exception 'Giocatore non valido'; end if;
   end if;
 end loop;
 insert into match_ratings(game_id,user_id,scores) values(p_game,auth.uid(),p_scores)
 on conflict(game_id,user_id) do update set scores=excluded.scores,updated_at=now();
end $$;

create or replace function public.app_my_rating_summary()
returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('reliability',avg((scores->>(auth.uid()::text||':reliability'))::numeric),
 'technique',avg((scores->>(auth.uid()::text||':technique'))::numeric),
 'count',count(*) filter(where scores ? (auth.uid()::text||':reliability') or scores ? (auth.uid()::text||':technique')))
 from match_ratings where auth.uid() is not null
$$;

revoke all on function public.app_game_stats(),public.app_game_players(uuid),public.app_create_series(uuid,text,text,text,timestamptz[],integer,integer,integer,boolean),public.app_submit_rating(uuid,jsonb),public.app_my_rating_summary() from public,anon;
grant execute on function public.app_game_stats(),public.app_game_players(uuid),public.app_create_series(uuid,text,text,text,timestamptz[],integer,integer,integer,boolean),public.app_submit_rating(uuid,jsonb),public.app_my_rating_summary() to authenticated;
notify pgrst,'reload schema';
commit;
