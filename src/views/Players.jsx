import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CATEGORY_ORDER, ZONES, validatedCategory } from '../lib/constants'
import { Avatar, CategoryBadge, Spinner, Star } from '../components/ui'
import PlayerSheet from '../components/PlayerSheet'
import { useApp } from '../App'

export default function Players() {
  const { session, profile, favorites, toggleFavorite } = useApp()
  const [players, setPlayers] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(null)
  const [zone, setZone] = useState(null)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('*').neq('id', session.user.id)
      .then(({ data }) => setPlayers(data || []))
  }, [session])

  const filtered = useMemo(() => (players || [])
    .filter(p => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
      if (cat && p.declared_category !== cat && validatedCategory(p) !== cat) return false
      if (zone && p.zone !== zone) return false
      if (onlyFavs && !favorites.has(p.id)) return false
      return true
    })
    // primero favoritos, luego cercanos a mi zona
    .sort((a, b) =>
      (favorites.has(b.id) - favorites.has(a.id)) ||
      ((b.zone === profile.zone) - (a.zone === profile.zone))
    ), [players, q, cat, zone, onlyFavs, favorites, profile])

  return (
    <div className="p-4 pt-6">
      <h1 className="text-cream text-2xl font-extrabold mb-4">Jugadores</h1>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Buscar por nombre…"
        className="w-full bg-court-light rounded-2xl border border-white/10 px-4 py-3 text-cream text-sm outline-none focus:border-volt/60 placeholder:text-cream/30 mb-3" />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
        <Chip active={onlyFavs} onClick={() => setOnlyFavs(!onlyFavs)}>★ Favoritos</Chip>
        {CATEGORY_ORDER.map(c => (
          <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{CATEGORIES[c].short}</Chip>
        ))}
        {ZONES.map(z => (
          <Chip key={z} active={zone === z} onClick={() => setZone(zone === z ? null : z)}>{z}</Chip>
        ))}
      </div>

      {players === null ? <Spinner /> : filtered.length === 0 ? (
        <p className="text-cream/40 text-sm text-center py-12">No hay jugadores con esos filtros.</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(p => (
            <div key={p.id} className="bg-court-light rounded-3xl border border-white/8 p-3.5 flex items-center gap-3">
              <button onClick={() => setSel(p)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <Avatar name={p.name} size={46} />
                <div className="flex-1 min-w-0">
                  <p className="text-cream font-semibold text-sm truncate">{p.name}{p.age ? <span className="text-cream/35 font-normal"> · {p.age}</span> : null}</p>
                  <div className="mt-0.5"><CategoryBadge profile={p} /></div>
                  <p className="text-cream/40 text-[11px] mt-0.5">{p.zone}{p.zone === profile.zone ? ' · 📍 tu zona' : ''}</p>
                </div>
              </button>
              <Star filled={favorites.has(p.id)} onClick={() => toggleFavorite(p.id)} />
            </div>
          ))}
        </div>
      )}

      <PlayerSheet player={sel} open={!!sel} onClose={() => setSel(null)} />
    </div>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${active ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
      {children}
    </button>
  )
}
