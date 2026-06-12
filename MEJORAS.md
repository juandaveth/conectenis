# Conectenis · Mejoras a futuro

_Notas del testing con usuarios reales — 2026-06-11_

## 1. Login con Google (OAuth)
**Problema detectado:** con el enlace mágico, cada vez que el usuario cierra sesión
hay que enviar un nuevo correo. Fricción alta.

**Solución:** botón "Continuar con Google" (Supabase soporta Google OAuth nativo).
Un tap y entra, sin correos. De paso abre la puerta a integración futura con
Google Calendar para sincronizar disponibilidad.

Pasos técnicos: crear OAuth Client en Google Cloud Console → habilitar proveedor
Google en Supabase (Authentication → Sign In / Providers) → agregar botón
`supabase.auth.signInWithOAuth({ provider: 'google' })` en Auth.jsx.

## 2. Landing: tarjetas expandibles
Las 3 secciones del problema (nivel / horarios / canchas) deben ser clicables:
al tocar cada una, expandir una explicación de qué significa encontrar a alguien
del mismo nivel, cómo funcionan los horarios y la ubicación de las canchas.
(Patrón acordeón, mobile-first.)

## 3. Multi-zona + canchas filtradas por zona
- Permitir seleccionar **más de una zona** de la ciudad en perfil y landing.
- Al seleccionar zona(s), mostrar **solo las canchas asociadas a esas zonas**.
  Ej.: si está en Bello–Norte, no mostrar canchas de Belén.
- Implementación: el dato ya existe (`COURTS` tiene `zone`); falta filtrar el
  selector de canchas por las zonas elegidas y cambiar `zone` (texto) a
  `zones` (array) en perfil y waitlist.

## 4. UI de franjas horarias
Las franjas deben ser **secciones de ancho completo** (no chips), en orden
cronológico:

1. L–V mañana
2. L–V mediodía
3. L–V tarde
4. L–V noche
5. Sábado
6. Domingo

Aplica en la landing (waitlist) y donde se edite disponibilidad.

## 5. Separar app y sitio de contenido (subdominios)
- **app.conectenis.com** → la PWA con toda la funcionalidad (calendario, matches,
  ranking, perfil). Instalable en el celular.
- **conectenis.com** → sitio público de la comunidad: qué es, cómo funciona,
  testimonios, y secciones de contenido como **/blog** (SEO para captar
  tenistas que buscan "con quién jugar tenis en Medellín").

Implementación: dos proyectos en Vercel (o uno con monorepo). El subdominio
`app` se agrega como dominio del proyecto de la app (CNAME en Namecheap:
`app` → cname de Vercel). El sitio de contenido puede ser estático (Astro o
similar, ideal para blog + SEO). Actualizar Site URL/Redirects de Supabase a
app.conectenis.com cuando se haga el cambio.

## 6. Subdominio de pruebas: test.conectenis.com
Dominio fijo para el entorno **Preview** de Vercel, en vez de las URLs
aleatorias (`conectenis-git-rama-xxx.vercel.app`).

- En Vercel: Settings → Environments → Preview → agregar dominio
  `test.conectenis.com` (se puede asociar a una rama fija, ej. `test` o
  `develop`).
- En Namecheap: CNAME `test` → el valor que indique Vercel.
- En Supabase: agregar `https://test.conectenis.com/**` a Redirect URLs para
  que el login funcione también en pruebas.
- Flujo: push a la rama de pruebas → se publica en test.conectenis.com →
  validar → merge a `main` → producción en conectenis.com.

Opcional: considerar un proyecto de Supabase separado para pruebas, y así no
mezclar datos de test con usuarios reales.
