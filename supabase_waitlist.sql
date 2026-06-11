-- ============================================================
-- Conectenis · Tabla waitlist (landing page, sin login)
-- Pegar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  declared_category int check (declared_category between 1 and 5),
  zone text,
  availability text[] default '{}',
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Cualquiera puede registrarse desde la landing (sin login)
create policy "registro abierto en waitlist" on public.waitlist
  for insert to anon, authenticated with check (true);

-- Nadie puede leer la lista desde la app (solo tú, desde el dashboard)
