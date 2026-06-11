-- ============================================================
-- MatchPoint MDE · Esquema Supabase
-- Pegar completo en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- PERFILES ----------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int check (age between 10 and 99),
  bio text default '',
  declared_category int not null check (declared_category between 1 and 5),
  zone text not null,
  courts text[] not null default '{}',
  willing_to_travel boolean not null default true,
  elo int not null default 1200,
  matches_played int not null default 0,
  wins int not null default 0,
  created_at timestamptz default now()
);

-- DISPONIBILIDAD (calendario estilo Focusmate) ---------------
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  court text,
  created_at timestamptz default now(),
  unique (user_id, starts_at)
);

-- PARTIDOS ----------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  proposer_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  court text,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','played','cancelled')),
  score text,
  winner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- FAVORITOS ---------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  favorite_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, favorite_id)
);

-- RLS ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.availability enable row level security;
alter table public.matches enable row level security;
alter table public.favorites enable row level security;

create policy "perfiles visibles para autenticados" on public.profiles
  for select to authenticated using (true);
create policy "crear mi perfil" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "editar mi perfil" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "disponibilidad visible" on public.availability
  for select to authenticated using (true);
create policy "gestionar mi disponibilidad" on public.availability
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ver mis partidos" on public.matches
  for select to authenticated using (auth.uid() in (proposer_id, receiver_id));
create policy "proponer partido" on public.matches
  for insert to authenticated with check (auth.uid() = proposer_id);
create policy "responder partido" on public.matches
  for update to authenticated using (auth.uid() in (proposer_id, receiver_id));

create policy "ver mis favoritos" on public.favorites
  for select to authenticated using (auth.uid() = user_id);
create policy "gestionar mis favoritos" on public.favorites
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ELO INICIAL según categoría declarada -----------------------
-- 5ª=1000 · 4ª=1200 · 3ª=1400 · 2ª=1600 · 1ª=1800
create or replace function public.set_initial_elo()
returns trigger language plpgsql as $$
begin
  new.elo := 2000 - new.declared_category * 200;
  return new;
end $$;

create trigger trg_initial_elo before insert on public.profiles
  for each row execute function public.set_initial_elo();

-- REGISTRAR RESULTADO + actualizar Elo (anti-trampa: server-side)
create or replace function public.record_result(p_match_id uuid, p_score text, p_winner_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  m matches%rowtype;
  ra int; rb int; ea numeric; loser_id uuid; k int := 64;
begin
  select * into m from matches where id = p_match_id;
  if m.id is null then raise exception 'Partido no existe'; end if;
  if auth.uid() not in (m.proposer_id, m.receiver_id) then
    raise exception 'No autorizado';
  end if;
  if m.status = 'played' then raise exception 'Resultado ya registrado'; end if;
  if p_winner_id not in (m.proposer_id, m.receiver_id) then
    raise exception 'Ganador inválido';
  end if;

  loser_id := case when p_winner_id = m.proposer_id then m.receiver_id else m.proposer_id end;
  select elo into ra from profiles where id = p_winner_id;
  select elo into rb from profiles where id = loser_id;
  ea := 1.0 / (1.0 + power(10.0, (rb - ra) / 400.0));

  update profiles set elo = elo + round(k * (1 - ea)),
    matches_played = matches_played + 1, wins = wins + 1
    where id = p_winner_id;
  update profiles set elo = greatest(800, elo - round(k * (1 - ea))),
    matches_played = matches_played + 1
    where id = loser_id;

  update matches set status = 'played', score = p_score, winner_id = p_winner_id
    where id = p_match_id;
end $$;
