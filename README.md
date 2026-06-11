# 🎾 Conectenis

**Encuentra rival de tenis de tu nivel, cuando tú puedes jugar — Medellín.**

MVP para conectar tenistas según nivel de juego (sistema de categorías de
Colombia), disponibilidad horaria (calendario estilo Focusmate) y cercanía
geográfica (zonas y canchas de Medellín).

🌐 **Producción:** [conectenis.com](https://conectenis.com)

## Cómo funciona

1. **Landing** (`/`): explica el problema y captura interesados en una
   `waitlist` (nombre, WhatsApp, categoría, zona, disponibilidad) sin login.
2. **Cuenta**: magic link por correo (Supabase Auth) o email+contraseña para
   usuarios de prueba.
3. **Onboarding**: perfil con categoría declarada (5ª iniciación → 1ª avanzada),
   zona, canchas cercanas y disposición a moverse.
4. **Calendario**: cada tenista publica las horas en que puede jugar; los demás
   filtran por categoría, cercanía o favoritos y proponen partido.
5. **Partidos**: propuesta → aceptar/rechazar → registrar marcador.
6. **Nivel validado**: cada resultado ajusta un puntaje tipo Elo. Con 3+
   partidos registrados, el perfil muestra la categoría *validada* junto a la
   *declarada* (resuelve el clásico "dice que es 3ª pero juega como 4ª").
7. **Ranking**: tabla por puntos con insignias de validación.

### Sistema de nivel (Elo simplificado)

| Categoría | Elo inicial | Rango validado |
|---|---|---|
| 5ª (iniciación) | 1000 | < 1100 |
| 4ª | 1200 | 1100–1299 |
| 3ª | 1400 | 1300–1499 |
| 2ª | 1600 | 1500–1699 |
| 1ª (avanzada) | 1800 | ≥ 1700 |

K=64 para que el nivel converja rápido con pocos partidos. El cálculo corre
**server-side** en Postgres (función `record_result`, `SECURITY DEFINER`) para
que no se pueda manipular desde el cliente.

## Stack

- **Frontend:** React 18 + Vite 5 + Tailwind CSS 4 — SPA mobile-first.
- **PWA:** `vite-plugin-pwa` (manifest + service worker, instalable).
- **Backend:** [Supabase](https://supabase.com) — Postgres, Auth (magic link y
  password) y API REST autogenerada con Row Level Security.
- **Deploy:** Vercel (build estático).

## Estructura

```
src/
├── App.jsx              # Auth gate + navegación por tabs
├── lib/
│   ├── supabase.js      # Cliente Supabase (env vars)
│   └── constants.js     # Categorías, Elo, zonas y canchas de Medellín
├── components/
│   ├── ui.jsx           # Sistema de diseño (Button, Card, Sheet, badges…)
│   └── PlayerSheet.jsx  # Perfil de jugador en bottom-sheet
└── views/
    ├── Landing.jsx      # Landing + formulario waitlist (sin login)
    ├── Auth.jsx         # Magic link / contraseña
    ├── Onboarding.jsx   # Creación de perfil (3 pasos)
    ├── Calendar.jsx     # Disponibilidad + búsqueda de rival
    ├── Players.jsx      # Directorio con filtros y favoritos
    ├── Matches.jsx      # Propuestas, confirmados, marcadores
    ├── Ranking.jsx      # Ranking por Elo
    └── Profile.jsx      # Mi perfil
```

## Modelo de datos (Supabase)

- `profiles` — perfil 1:1 con `auth.users`: categoría declarada, zona,
  canchas (`text[]`), `elo`, partidos y victorias.
- `availability` — franjas publicadas (`user_id`, `starts_at`).
- `matches` — propuestas y resultados (`pending → accepted → played`).
- `favorites` — jugadores marcados (PK compuesta).
- `waitlist` — registros de la landing (solo INSERT para `anon`; nadie puede
  leerla desde la app).

Todas las tablas tienen **RLS activado**: los perfiles y la disponibilidad son
visibles para usuarios autenticados, pero cada quien solo escribe lo suyo; los
partidos solo los ven sus dos participantes. Esquema completo en
[`supabase.sql`](./supabase.sql) y [`supabase_waitlist.sql`](./supabase_waitlist.sql).

## Correr en local

```bash
git clone https://github.com/<tu-usuario>/conectenis.git
cd conectenis
npm install

# Configura tu proyecto de Supabase:
# 1. Crea un proyecto en supabase.com
# 2. Ejecuta supabase.sql y supabase_waitlist.sql en el SQL Editor
# 3. Crea .env.local con:
#    VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
#    VITE_SUPABASE_ANON_KEY=<tu publishable key>

npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
```

## Deploy

Cualquier hosting estático sirve. En Vercel: importa el repo, framework
**Vite**, y define las dos variables `VITE_SUPABASE_*` en el proyecto.
En Supabase → Authentication → URL Configuration, apunta **Site URL** al
dominio de producción para que los magic links rediríjan bien.

## Mejoras planeadas

Ver [`MEJORAS.md`](./MEJORAS.md): login con Google, landing con tarjetas
expandibles, multi-zona con canchas filtradas, franjas horarias rediseñadas y
separación app.conectenis.com / conectenis.com (+ blog).
