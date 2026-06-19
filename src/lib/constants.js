// Sistema de categorías de Colombia: 5ª (menor nivel) → 1ª (más avanzada)
export const CATEGORIES = {
  5: { label: 'Quinta', short: '5ª', baseElo: 1000, color: '#94a3b8' },
  4: { label: 'Cuarta', short: '4ª', baseElo: 1200, color: '#22c55e' },
  3: { label: 'Tercera', short: '3ª', baseElo: 1400, color: '#0ea5e9' },
  2: { label: 'Segunda', short: '2ª', baseElo: 1600, color: '#a855f7' },
  1: { label: 'Primera', short: '1ª', baseElo: 1800, color: '#f59e0b' },
}

export const CATEGORY_ORDER = [5, 4, 3, 2, 1]

// Elo → categoría validada
export function eloToCategory(elo) {
  if (elo < 1100) return 5
  if (elo < 1300) return 4
  if (elo < 1500) return 3
  if (elo < 1700) return 2
  return 1
}

export const MIN_MATCHES_TO_VALIDATE = 3

export function validatedCategory(profile) {
  if (!profile || profile.matches_played < MIN_MATCHES_TO_VALIDATE) return null
  return eloToCategory(profile.elo)
}

export const ZONES = [
  'Laureles–Estadio', 'El Poblado', 'Belén', 'Guayabal', 'Envigado', 'Sabaneta',
  'Itagüí', 'Centro', 'Robledo–Occidente', 'Bello–Norte', 'Calasanz–La América',
]

// `lat: true` marca las sedes de la Liga Antioqueña de Tenis. Foco inicial (P1):
// sembrar masa crítica en estas sedes para que sí haya con quién jugar.
export const COURTS = [
  { name: 'U.D. Atanasio Girardot', zone: 'Laureles–Estadio', lat: true },
  { name: 'U.D. Belén', zone: 'Belén', lat: true },
  { name: 'U.D. María Luisa Calle', zone: 'Guayabal', lat: true },
  { name: 'Parque Juanes de la Paz', zone: 'Bello–Norte' },
  { name: 'Club El Rodeo', zone: 'Belén' },
  { name: 'Club Campestre', zone: 'El Poblado' },
  { name: 'Canchas Cuarta Brigada', zone: 'Robledo–Occidente' },
  { name: 'Polideportivo Sur de Envigado', zone: 'Envigado' },
  { name: 'U.D. de Sabaneta', zone: 'Sabaneta' },
  { name: 'Ditaires Itagüí', zone: 'Itagüí' },
  { name: 'Club Deportivo Calasanz', zone: 'Calasanz–La América' },
]

// Invitación por WhatsApp para sembrar tenistas (P1). Apunta a producción.
export const APP_URL = 'https://conectenis.com'
export function inviteWhatsappUrl() {
  const msg = `¡Juguemos tenis! 🎾 Me uní a Conectenis para encontrar rivales de mi mismo nivel en Medellín. Únete y cuadramos partido: ${APP_URL}`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

export const HOURS = Array.from({ length: 17 }, (_, i) => i + 5) // 5:00 → 21:00

export const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function fmtDate(d) {
  const x = new Date(d)
  return `${DAYS_ES[x.getDay()]} ${x.getDate()} ${MONTHS_ES[x.getMonth()]}`
}
export function fmtTime(d) {
  const x = new Date(d)
  const h = x.getHours(), m = x.getMinutes()
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}
