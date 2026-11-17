-- Real seat selection. Additive and transactional; no payments or bookings deleted.
begin;
alter table public.bookings add column if not exists court_slot integer;
-- Preserve existing positions; assign old active bookings deterministically.
with ranked as (
 select id,row_number() over(partition by game_id order by created_at,id)::integer slot
 from public.bookings where status in ('pending','confirmed')
) update public.bookings b set court_slot=r.slot from ranked r where b.id=r.id and b.court_slot is null;
create unique index if not exists bookings_active_seat on public.bookings(game_id,court_slot)
 where status in ('pending','confirmed') and court_slot is not null;

create or replace function public.enforce_court_seat() returns trigger
language plpgsql security definer set search_path=public as $$
declare capacity integer;
begin
 if new.status not in ('pending','confirmed') then new.court_slot:=null;return new;end if;
 select court_spots+rotation_spots into capacity from games where id=new.game_id for update;
 if new.court_slot is null then
   select s into new.court_slot from generate_series(1,capacity) s
   where not exists(select 1 from bookings b where b.game_id=new.game_id and b.status in ('pending','confirmed') and b.court_slot=s and b.id<>new.id)
   order by s limit 1;
 end if;
 if new.court_slot is null or new.court_slot not between 1 and capacity then raise exception 'Posto non disponibile';end if;
 if exists(select 1 from bookings b where b.game_id=new.game_id and b.status in ('pending','confirmed') and b.court_slot=new.court_slot and b.id<>new.id) then raise exception 'Il posto è appena stato prenotato: scegline un altro';end if;
 return new;
end $$;
drop trigger if exists enforce_court_seat on public.bookings;
create trigger enforce_court_seat before insert or update of status,court_slot,game_id on public.bookings
 for each row execute function public.enforce_court_seat();

create or replace function public.app_seat_map(p_game uuid)
returns table(slot integer,is_mine boolean,status text) language sql stable security definer set search_path=public as $$
 select b.court_slot,b.user_id=auth.uid(),b.status from bookings b
 where auth.uid() is not null and b.game_id=p_game and b.status in ('pending','confirmed')
$$;

create or replace function public.app_book_seat(p_game uuid,p_slot integer,p_method text default null)
returns text language plpgsql security definer set search_path=public as $$
declare g games; result text;
begin
 if auth.uid() is null then raise exception 'Accesso richiesto';end if;
 select * into g from games where id=p_game for update;
 if not found or g.starts_at<=now() then raise exception 'Partita non disponibile';end if;
 if p_slot is null or p_slot not between 1 and g.court_spots+g.rotation_spots then raise exception 'Seleziona un posto valido';end if;
 if exists(select 1 from bookings where game_id=p_game and status in ('pending','confirmed') and court_slot=p_slot) then raise exception 'Il posto è appena stato prenotato: scegline un altro';end if;
 if g.approval_required then result:=book_game(p_game);
 else result:=book_game_paid(p_game,p_method);end if;
 update bookings set court_slot=p_slot where game_id=p_game and user_id=auth.uid();
 return result;
end $$;
revoke all on function public.enforce_court_seat(),public.app_seat_map(uuid),public.app_book_seat(uuid,integer,text) from public,anon;
grant execute on function public.app_seat_map(uuid),public.app_book_seat(uuid,integer,text) to authenticated;
create or replace function public.app_game_roster(p_game uuid)
returns table(user_id uuid,display_name text,role text,experience text,bio text,avatar_path text,avatar_status text,slot integer)
language sql stable security definer set search_path=public as $$
 select p.id,p.display_name,p.role,p.experience,p.bio,p.avatar_path,p.avatar_status,b.court_slot
 from bookings b join profiles p on p.id=b.user_id join games g on g.id=b.game_id
 where auth.uid() is not null and b.game_id=p_game and b.status='confirmed'
 and (p.discoverable or p.id=auth.uid() or is_confirmed_player(p_game) or is_group_admin(g.group_id) or is_platform_admin())
 order by b.court_slot
$$;
revoke all on function public.app_game_roster(uuid) from public,anon;
grant execute on function public.app_game_roster(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
