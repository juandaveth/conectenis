# CLAUDE.md — Contexto del proyecto Conectenis

## Qué es
MVP en producción para conectar tenistas en Medellín por nivel de juego,
disponibilidad horaria y cercanía. Dueño: Juan David (Juanda), no developer —
explicar decisiones técnicas en lenguaje claro y en español.

- **Producción:** https://conectenis.com (Vercel, deploy automático al hacer
  push a `main`)
- **Repo:** github.com/juandaveth/conectenis
- **Backend:** Supabase (proyecto `cpislbjsoanfqzplroll`) — Postgres + Auth +
  RLS. Esquema en `supabase.sql` y `supabase_waitlist.sql` (ya ejecutados en
  producción; cambios de esquema nuevos van en archivos SQL incrementales que
  Juanda ejecuta a mano en el SQL Editor).
- **Correo:** Resend (SMTP custom en Supabase), sender `juanda@conectenis.com`.

## Stack y convenciones
- React 18 + Vite 5 + Tailwind CSS 4 (`@theme` en `src/index.css`: colores
  `court` verde oscuro, `volt` lima, `cream`). PWA vía `vite-plugin-pwa`.
- Sin router: navegación por tabs con estado en `src/App.jsx` (auth gate:
  Landing → Auth → Onboarding → app).
- Componentes de UI compartidos en `src/components/ui.jsx`. Vistas en
  `src/views/`. Constantes de dominio (categorías, Elo, zonas, canchas) en
  `src/lib/constants.js`.
- Mobile-first, todo en español, tono cercano paisa-neutro.
- Env vars: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (en Vercel y en
  `.env.local` para desarrollo; nunca commitearlas).

## Lógica de negocio clave
- Categorías Colombia: 5ª (iniciación, Elo 1000) → 1ª (avanzada, Elo 1800).
- Nivel validado: Elo tipo K=64 calculado **server-side** en la función
  Postgres `record_result` (SECURITY DEFINER). Con 3+ partidos aparece la
  insignia "validado". No mover este cálculo al cliente.
- RLS en todas las tablas; `waitlist` solo permite INSERT a `anon`.
- Login: magic link (principal) + email/contraseña (usuarios de prueba
  creados a mano en el dashboard de Supabase con Auto Confirm).

## Comandos
- `npm run dev` — desarrollo local
- `npm run build` — verificar build antes de push (obligatorio)
- Deploy: solo `git push` a `main`; Vercel hace el resto.

## Trabajo pendiente
Ver `MEJORAS.md` (priorizado por Juanda): 1) Google OAuth, 2) landing con
tarjetas expandibles, 3) multi-zona + canchas filtradas por zona, 4) franjas
horarias de ancho completo en orden cronológico, 5) separar
app.conectenis.com / conectenis.com (+ /blog), 6) test.conectenis.com para
el entorno Preview.
