-- StaseraVolley: pagamenti simulati, rimborsi e amministrazione globale.
-- Eseguire UNA volta nel SQL Editor del progetto Supabase dopo schema.sql e avatars.sql.
-- I pagamenti sono registrazioni demo: nessun addebito o rimborso reale viene inviato.

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  game_id uuid not null references public.games(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  event_type text not null check (event_type in ('charge','refund')),
  method text not null check (method in ('Satispay','PayPal','Manuale')),
  quota_cents integer not null check (quota_cents >= 0),
  fee_cents integer not null default 0 check (fee_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  status text not null check (status in ('paid','refunded','retained','recorded','void')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists payment_transactions_game_created_idx
  on public.payment_transactions(game_id, created_at desc);
create index if not exists payment_transactions_user_created_idx
  on public.payment_transactions(user_id, created_at desc);

alter table public.payment_transactions enable row level security;
drop policy if exists payment_read_owner_admin on public.payment_transactions;
create policy payment_read_owner_admin on public.payment_transactions
  for select to authenticated using (
    user_id = auth.uid()
    or public.is_platform_admin()
    or public.is_group_admin((select group_id from public.games where id = game_id))
  );
revoke insert, update, delete on public.payment_transactions from anon, authenticated;

-- El ruolo amministratore è globale e si assegna solo da Supabase SQL Editor.
create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
drop policy if exists platform_admin_self_read on public.platform_admins;
create policy platform_admin_self_read on public.platform_admins
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.platform_admins from anon, authenticated;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid())
$$;

drop policy if exists platform_admin_games_read on public.games;
create policy platform_admin_games_read on public.games for select to authenticated
  using (public.is_platform_admin());
drop policy if exists platform_admin_games_update on public.games;
create policy platform_admin_games_update on public.games for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists platform_admin_groups_read on public.groups;
create policy platform_admin_groups_read on public.groups for select to authenticated
  using (public.is_platform_admin());
drop policy if exists platform_admin_bookings_read on public.bookings;
create policy platform_admin_bookings_read on public.bookings for select to authenticated
  using (public.is_platform_admin());
drop policy if exists platform_admin_profiles_read on public.profiles;
create policy platform_admin_profiles_read on public.profiles for select to authenticated
  using (public.is_platform_admin());
drop policy if exists platform_admin_bookings_update on public.bookings;

create or replace function public.record_game_payment(p_booking uuid, p_method text)
returns uuid language plpgsql security definer set search_path = public as $$
declare b public.bookings; g public.games; v_fee integer; v_id uuid;
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  if p_method not in ('Satispay','PayPal') then raise exception 'Metodo di pagamento non valido'; end if;
  select * into b from public.bookings where id = p_booking for update;
  if not found or b.user_id <> auth.uid() or b.status <> 'confirmed' then
    raise exception 'Serve una prenotazione confermata';
  end if;
  if exists (select 1 from public.payment_transactions c where c.booking_id = b.id and c.event_type = 'charge' and c.status in ('paid','recorded')) then
    raise exception 'Pagamento già registrato';
  end if;
  select * into g from public.games where id = b.game_id;
  v_fee := round(g.price_cents * 0.05)::integer;
  insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
  values (b.id,b.game_id,b.user_id,'charge',p_method,g.price_cents,v_fee,g.price_cents+v_fee,'paid','Pagamento simulato')
  returning id into v_id;
  update public.bookings set paid = true where id = b.id;
  return v_id;
end $$;

-- I pagamenti diretti sono obbligatori per le prenotazioni senza approvazione.
-- book_game resta utilizzabile solo per le candidature che richiedono approvazione.
create or replace function public.book_game(p_game uuid)
returns text language plpgsql security definer set search_path = public as $$
declare g public.games; occupied integer;
begin
  if auth.uid() is null then raise exception 'Login richiesto'; end if;
  select * into g from public.games where id=p_game for update;
  if not found then raise exception 'Partita non trovata'; end if;
  if g.starts_at <= now() then raise exception 'Partita già iniziata'; end if;
  if not g.approval_required then raise exception 'Seleziona un metodo di pagamento per prenotare'; end if;
  select count(*) into occupied from public.bookings where game_id=p_game and status in ('pending','confirmed');
  if occupied >= g.court_spots+g.rotation_spots then raise exception 'Partita completa'; end if;
  insert into public.bookings(game_id,user_id,status) values(p_game,auth.uid(),'pending')
    on conflict(game_id,user_id) do update set status='pending',paid=false
    where public.bookings.status in ('cancelled','rejected');
  if not found then raise exception 'Hai già una prenotazione o candidatura attiva'; end if;
  return 'pending';
end $$;

create or replace function public.mark_paid(p_booking uuid,p_paid boolean)
returns void language plpgsql security definer set search_path=public as $$
declare b public.bookings; g public.games; active_charge public.payment_transactions;
begin
  select * into b from public.bookings where id=p_booking for update;
  if not found then raise exception 'Iscrizione non trovata'; end if;
  select * into g from public.games where id=b.game_id;
  if not public.is_group_admin(g.group_id) and not public.is_platform_admin() then raise exception 'Non autorizzato'; end if;
  if b.status <> 'confirmed' then raise exception 'Serve una prenotazione confermata'; end if;
  select * into active_charge from public.payment_transactions c where c.booking_id=b.id and c.event_type='charge' and c.status in ('paid','recorded')
    order by c.created_at desc limit 1;
  if p_paid and active_charge.id is null then
    insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
      values(b.id,g.id,b.user_id,'charge','Manuale',g.price_cents,0,g.price_cents,'recorded','Pagamento registrato manualmente dall’organizzatore');
  elsif not p_paid and active_charge.id is not null then
    update public.payment_transactions set status='void' where id=active_charge.id;
    insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
      values(b.id,g.id,b.user_id,'refund',active_charge.method,0,0,0,'recorded','Registrazione manuale annullata dall’organizzatore');
  end if;
  update public.bookings set paid=p_paid where id=b.id;
end $$;

-- Prenotazione e registrazione pagamento demo in un'unica transazione.
create or replace function public.book_game_paid(p_game uuid, p_method text)
returns text language plpgsql security definer set search_path = public as $$
declare g public.games; b public.bookings; occupied integer; v_fee integer;
begin
  if auth.uid() is null then raise exception 'Login richiesto'; end if;
  if p_method not in ('Satispay','PayPal') then raise exception 'Metodo di pagamento non valido'; end if;
  select * into g from public.games where id = p_game for update;
  if not found then raise exception 'Partita non trovata'; end if;
  if g.starts_at <= now() then raise exception 'Partita già iniziata'; end if;
  if g.approval_required then raise exception 'Questa partita richiede approvazione: paga dopo la conferma'; end if;
  select count(*) into occupied from public.bookings where game_id = p_game and status in ('pending','confirmed');
  if occupied >= g.court_spots + g.rotation_spots then raise exception 'Partita completa'; end if;
  insert into public.bookings(game_id,user_id,status,paid) values(p_game,auth.uid(),'confirmed',true)
    on conflict (game_id,user_id) do update set status='confirmed',paid=true
    where public.bookings.status in ('cancelled','rejected') returning * into b;
  if not found then raise exception 'Hai già una prenotazione o candidatura attiva'; end if;
  v_fee := round(g.price_cents * 0.05)::integer;
  insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
    values(b.id,g.id,auth.uid(),'charge',p_method,g.price_cents,v_fee,g.price_cents+v_fee,'paid','Pagamento simulato');
  return 'confirmed';
end $$;

-- La prenotazione resta disdicibile; a meno di 24 ore si trattiene la quota,
-- mentre oltre 24 ore si registra il rimborso della sola quota. La commissione resta sempre trattenuta.
create or replace function public.cancel_booking(p_game uuid)
returns void language plpgsql security definer set search_path = public as $$
declare g public.games; b public.bookings; charge public.payment_transactions; v_refund integer;
begin
  select * into g from public.games where id = p_game for update;
  if not found then raise exception 'Partita non trovata'; end if;
  if g.starts_at <= now() then raise exception 'La partita è già iniziata'; end if;
  select * into b from public.bookings where game_id = p_game and user_id = auth.uid() for update;
  if not found or b.status not in ('pending','confirmed') then raise exception 'Nessuna prenotazione attiva'; end if;
  select * into charge from public.payment_transactions c where c.booking_id = b.id and c.event_type='charge' and c.status in ('paid','recorded')
    order by c.created_at desc limit 1 for update;
  update public.bookings set status='cancelled',paid=false where id=b.id;
  if found and charge.id is not null then
    v_refund := case when g.starts_at >= now() + interval '24 hours' then charge.quota_cents else 0 end;
    update public.payment_transactions set status=case when v_refund>0 then 'refunded' else 'retained' end where id=charge.id;
    if v_refund > 0 then
      insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
      values(b.id,g.id,b.user_id,'refund',charge.method,v_refund,0,v_refund,'refunded','Rimborso simulato: oltre 24 ore');
    else
      insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
      values(b.id,g.id,b.user_id,'refund',charge.method,0,charge.fee_cents,0,'retained','Ritiro entro 24 ore: quota e commissione trattenute');
    end if;
  end if;
end $$;

create or replace function public.admin_set_booking_status(p_booking uuid,p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare b public.bookings; g public.games; charge public.payment_transactions; v_refund integer;
begin
  if not public.is_platform_admin() then raise exception 'Non autorizzato'; end if;
  if p_status not in ('pending','confirmed','cancelled','rejected') then raise exception 'Stato non valido'; end if;
  select * into b from public.bookings where id=p_booking for update;
  if not found then raise exception 'Iscrizione non trovata'; end if;
  select * into g from public.games where id=b.game_id for update;
  if p_status='cancelled' and b.status <> 'cancelled' then
    select * into charge from public.payment_transactions c where c.booking_id=b.id and c.event_type='charge' and c.status in ('paid','recorded')
      order by c.created_at desc limit 1 for update;
    if charge.id is not null then
      v_refund := case when g.starts_at >= now() + interval '24 hours' then charge.quota_cents else 0 end;
      update public.payment_transactions set status=case when v_refund>0 then 'refunded' else 'retained' end where id=charge.id;
      insert into public.payment_transactions(booking_id,game_id,user_id,event_type,method,quota_cents,fee_cents,total_cents,status,note)
      values(b.id,g.id,b.user_id,'refund',charge.method,v_refund,case when v_refund=0 then charge.fee_cents else 0 end,v_refund,
        case when v_refund=0 then 'retained' else 'refunded' end,
        case when v_refund=0 then 'Annullamento admin entro 24 ore: quota trattenuta' else 'Annullamento admin: rimborso quota simulato' end);
    end if;
  end if;
  update public.bookings set status=p_status, paid=case when p_status='cancelled' then false else paid end where id=b.id;
end $$;

create or replace function public.admin_set_game(p_game uuid,p_starts_at timestamptz,p_venue text,p_price_cents integer,p_court_spots integer,p_rotation_spots integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Non autorizzato'; end if;
  if p_price_cents < 0 or p_court_spots not between 2 and 24 or p_rotation_spots not between 0 and 12 then raise exception 'Valori non validi'; end if;
  update public.games set starts_at=p_starts_at,venue=p_venue,price_cents=p_price_cents,court_spots=p_court_spots,rotation_spots=p_rotation_spots where id=p_game;
  if not found then raise exception 'Partita non trovata'; end if;
end $$;

create or replace function public.admin_overview()
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.is_platform_admin() then raise exception 'Non autorizzato'; end if;
  select jsonb_build_object(
    'games', coalesce((select jsonb_agg(to_jsonb(g) || jsonb_build_object('group_name',gr.name,'city',gr.city,
      'confirmed_count',(select count(*) from public.bookings b where b.game_id=g.id and b.status='confirmed'),
      'pending_count',(select count(*) from public.bookings b where b.game_id=g.id and b.status='pending')) order by g.starts_at desc)
      from public.games g join public.groups gr on gr.id=g.group_id), '[]'::jsonb),
    'bookings', coalesce((select jsonb_agg(to_jsonb(b) || jsonb_build_object('display_name',p.display_name,'email',u.email,'game_date',g.starts_at,'game_venue',g.venue,'group_name',gr.name) order by b.created_at desc)
      from public.bookings b join public.profiles p on p.id=b.user_id join auth.users u on u.id=b.user_id join public.games g on g.id=b.game_id join public.groups gr on gr.id=g.group_id), '[]'::jsonb),
    'payments', coalesce((select jsonb_agg(to_jsonb(t) || jsonb_build_object('display_name',p.display_name,'email',u.email,'group_name',gr.name,'game_date',g.starts_at) order by t.created_at desc)
      from public.payment_transactions t join public.profiles p on p.id=t.user_id join auth.users u on u.id=t.user_id join public.games g on g.id=t.game_id join public.groups gr on gr.id=g.group_id), '[]'::jsonb),
    'stats', jsonb_build_object(
      'games', (select count(*) from public.games where starts_at >= now()),
      'bookings', (select count(*) from public.bookings where status in ('pending','confirmed')),
      'gross', coalesce((select sum(total_cents) from public.payment_transactions where event_type='charge' and status<>'void'),0),
      'fees', coalesce((select sum(fee_cents) from public.payment_transactions where event_type='charge' and status<>'void'),0),
      'refunds', coalesce((select sum(total_cents) from public.payment_transactions where event_type='refund' and status='refunded'),0)
    )
  ) into result;
  return result;
end $$;

revoke execute on function public.record_game_payment(uuid,text),public.book_game_paid(uuid,text),public.admin_set_booking_status(uuid,text),public.admin_set_game(uuid,timestamptz,text,integer,integer,integer),public.admin_overview() from public,anon;
grant execute on function public.record_game_payment(uuid,text),public.book_game_paid(uuid,text) to authenticated;
grant execute on function public.admin_set_booking_status(uuid,text),public.admin_set_game(uuid,timestamptz,text,integer,integer,integer),public.admin_overview() to authenticated;

-- Assegna l'admin DOPO aver creato l'account con la tua email. Esegui una sola volta:
-- insert into public.platform_admins(user_id)
-- select id from auth.users where lower(email)=lower('LA-TUA-EMAIL@esempio.it')
-- on conflict (user_id) do nothing;
