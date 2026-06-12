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

## 7. Confirmación bilateral del marcador
El resultado no debe afectar el Elo hasta que ambos jugadores lo avalen
(evita diferencias entre lo que registra el ganador y lo que acepta el perdedor).

- Flujo: A registra → partido en estado `reported` → B ve el marcador exacto
  y elige **Confirmar** o **Corregir** → al confirmar corre `record_result`
  (Elo). Si B corrige, A confirma la versión de B.
- Dos desacuerdos seguidos → estado `disputed`: no puntúa y queda marcado.
- Timeout: si el otro jugador no responde en 72h, auto-confirmación (no
  bloquear el Elo por inactividad).
- DB: columnas `reported_score`, `reported_by`, nuevo estado en `matches`;
  `record_result` solo ejecutable tras confirmación.

## 8. Formulario estructurado de marcador
Reemplazar el campo de texto libre por un formulario por sets:

- Por cada set: games de cada jugador (ej. 6-4, 7-6) con validación de
  marcadores válidos de tenis (6-x con diferencia 2, 7-5, 7-6).
- El número de sets y el tie-break se infieren del marcador (7-6 ⇒ hubo
  tie-break; opcional registrar el puntaje del TB).
- Elo: por ahora el margen NO pondera (Elo clásico = solo gana/pierde).
  Ponderar por margen ("margin of victory") queda como experimento futuro
  cuando haya datos reales; el valor inmediato del dato estructurado es
  estadísticas de perfil, desempates de ranking y datos limpios.

---

**Orden de implementación acordado (2026-06-12):** primero #8 (formulario
estructurado), luego #7 (confirmación bilateral) — confirmar sobre marcador
validado es más sólido que sobre texto libre. El resto según prioridad de
Juanda, con Google OAuth (#1) como la de mayor impacto en fricción.

## 9. Matching automático estilo Focusmate
No habrá matching manual por WhatsApp: las personas publican su calendario y
el backend de Conectenis hace el match previo.

- Criterios de cruce: franja horaria coincidente + categoría compatible
  (misma o ±1, parametrizable) + zona o cancha en común.
- A ambos jugadores les llega la propuesta con "Aceptar"; el partido se
  confirma cuando ambos aceptan.
- La reserva de la cancha sigue siendo manual: quien reserva lo indica al
  confirmar (campo "yo reservo en X cancha").
- Implementación: función Postgres ejecutada con pg_cron (o trigger al
  publicar disponibilidad) que inserta propuestas en `matches`; la pestaña
  "Jugar" evoluciona de buscador a bandeja de matches sugeridos.

## 10. Perfil enriquecido (feedback de primeros usuarios)
Los usuarios quieren saber más del rival antes de jugar:

- **Foto de perfil real**: subida a Supabase Storage (bucket `avatars` con
  RLS), reemplaza el avatar de iniciales.
- **Disponibilidad visible en el perfil**: el PlayerSheet debe mostrar las
  próximas franjas publicadas del jugador — convierte el perfil en
  accionable ("está libre el jueves 7pm, le propongo ahí").
