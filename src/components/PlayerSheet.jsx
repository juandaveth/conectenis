import { CATEGORIES, validatedCategory, MIN_MATCHES_TO_VALIDATE } from '../lib/constants'
import { Avatar, CategoryBadge, Sheet, Star } from './ui'
import { useApp } from '../App'

// Perfil de jugador en bottom-sheet (patrón móvil: contexto sin perder navegación)
export default function PlayerSheet({ player, open, onClose, footer }) {
  const { favorites, toggleFavorite } = useApp()
  if (!player) return null
  const val = validatedCategory(player)
  const winRate = player.matches_played ? Math.round((player.wins / player.matches_played) * 100) : null

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={player.name} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-cream font-extrabold text-xl truncate">{player.name}</h2>
            <Star filled={favorites.has(player.id)} onClick={() => toggleFavorite(player.id)} />
          </div>
          <p className="text-cream/50 text-sm">{player.age ? `${player.age} años · ` : ''}{player.zone}</p>
          <div className="mt-1.5"><CategoryBadge profile={player} detailed /></div>
        </div>
      </div>

      {player.bio && <p className="text-cream/70 text-sm mb-4 bg-court rounded-2xl p-3">"{player.bio}"</p>}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Partidos" value={player.matches_played} />
        <Stat label="Victorias" value={winRate !== null ? `${winRate}%` : '—'} />
        <Stat label="Puntos" value={player.elo} />
      </div>

      {!val && (
        <p className="text-cream/40 text-[11px] mb-4">
          ⚖️ Nivel aún sin validar: necesita {MIN_MATCHES_TO_VALIDATE}+ partidos con marcador registrado.
        </p>
      )}
      {val && val !== player.declared_category && (
        <p className="text-[11px] mb-4 px-3 py-2 rounded-xl" style={{ background: '#f59e0b18', color: '#f59e0b' }}>
          ⚠️ Sus resultados indican nivel de {CATEGORIES[val].label.toLowerCase()} categoría, distinto al declarado.
        </p>
      )}

      <div className="mb-4">
        <p className="text-cream/60 text-xs font-semibold uppercase tracking-wide mb-2">Canchas cercanas</p>
        <div className="flex flex-wrap gap-1.5">
          {(player.courts || []).map(c => (
            <span key={c} className="px-2.5 py-1 rounded-full bg-white/8 text-cream/70 text-[11px]">📍 {c}</span>
          ))}
        </div>
        {player.willing_to_travel && <p className="text-volt/70 text-[11px] mt-2">✓ Dispuesto/a a moverse por la ciudad</p>}
      </div>

      {footer}
    </Sheet>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-court rounded-2xl p-3 text-center">
      <p className="text-volt font-extrabold text-lg">{value}</p>
      <p className="text-cream/40 text-[10px] uppercase tracking-wide">{label}</p>
    </div>
  )
}
