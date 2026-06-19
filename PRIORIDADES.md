# Conectenis · Prioridades de producto

_El orden en que conviene construir/ajustar, según el objetivo._

## Objetivo (el filtro)
Que **se concreten más partidos parejos**. Hipótesis: **el nivel es lo primero**
a resolver. Alcance: **una sola zona** con masa crítica. Éxito: que **otros**
jueguen entre ellos, no solo se registren. (Detalle en `CLAUDE.md → Objetivo`.)

## Fugas que hoy frenan que se concreten partidos
- **A. La propuesta se muere sin aviso.** `Calendar.jsx:79` promete "Te avisamos
  cuando responda", pero no hay notificación (push ni email). En `Matches.jsx` la
  propuesta solo se ve si el otro abre la app → propuesta sin respuesta = sin
  partido.
- **B. Cold start / densidad.** `Calendar.jsx:148-154`: si nadie publicó
  disponibilidad, sale "🦗 Nadie disponible". Con pocos usuarios por zona ese es
  el estado por defecto.
- **C. Fricción de entrada.** Magic link: cada logout pide otro correo. Reduce el
  pool activo.
- **D. Sin medición.** No hay forma de ver el embudo ni de validar la hipótesis
  "el nivel primero".

## Orden propuesto (por impacto en "concretar partidos")

### P0 · Cerrar el loop de la propuesta — notificaciones _(nuevo, no en MEJORAS)_
Avisar (email con Resend, ya montado, y/o push de la PWA, ya existe) cuando:
1. te proponen partido, 2. te aceptan/rechazan, 3. recordatorio antes del
partido, 4. recordatorio de registrar marcador.
**Por qué primero:** es la palanca #1 para que la propuesta termine en partido
jugado y en Elo actualizado. Ataca la fuga A.

### P1 · Sembrar densidad en UNA zona
Decisión de producto + go-to-market: elegir 1 zona/club e invitar a mano a un
grupo concentrado en 2–3 categorías cercanas. En producto: que el estado vacío
empuje a publicar disponibilidad e **invitar a un rival**.
**Por qué:** sin densidad, nada de lo demás importa. Ataca la fuga B.

### P2 · Bajar fricción de entrada — Google OAuth (`MEJORAS #1`)
Más gente que entra y se queda = pool más grande = más matches posibles. Fuga C.

### P3 · Más oferta de partidos — UI de franjas horarias (`MEJORAS #4`)
Franjas claras en orden cronológico para que más gente publique disponibilidad
(más disponibilidad publicada = más con quién cuadrar).

### P4 · Medir para validar "el nivel primero"
Instrumentar el embudo (registro → publica disponibilidad → propuesta → aceptada
→ jugada → marcador) y ver si la cercanía de nivel se correlaciona con que la
propuesta se acepte y se juegue. Ataca la fuga D.

## Diferir (no aportan a concretar partidos a corto plazo)
- **`MEJORAS #3` Multi-zona** — **contradice** el alcance "una zona": dispersaría
  la densidad justo cuando la necesitamos concentrada. Retomar al escalar a una
  segunda zona.
- **`MEJORAS #2` Landing con tarjetas** y **`MEJORAS #5` subdominios + /blog** —
  captación/SEO; ayudan a crecer, no a que los que ya están concreten partidos.
- **`MEJORAS #6` test.conectenis.com** — infra de desarrollo transversal; montar
  cuando empiece a estorbar iterar, no antes.
