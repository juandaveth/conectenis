import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, validatedCategory, MIN_MATCHES_TO_VALIDATE } from '../lib/constants'
import { Avatar, CategoryBadge, Spinner } from '../components/ui'
import PlayerSheet from '../components/PlayerSheet'
import { useApp } from '../App'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Ranking() {
  const { session } = useApp()
  const [players, setPlayers] = useState(null)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('*')
      .order('elo', { ascending: false }).limit(100)
      .then(({ data }) => setPlayers(data || []))
  }, [])

  return (
    <div className="p-4 pt-6">
      <h1 className="text-cream text-2xl font-extrabold mb-1">Ranking</h1>
      <p className="text-cream/50 text-xs mb-4">
        El nivel se valida con marcadores reales. Con {MIN_MATCHES_TO_VALIDATE}+ partidos registrados aparece la insignia <span className="text-volt font-bold">✓ validado</span>.
      </p>

      {players === null ? <Spinner /> : (
        <div className="space-y-2">
          {players.map((p, i) => {
            const val = validatedCategory(p)
            const mismatch = val && val !== p.declared_category
            const me = p.id === session.user.id
            return (
              <button key={p.id} onClick={() => setSel(p)}
                className={`w-full text-left rounded-3xl border p-3 flex items-center gap-3 ${me ? 'border-volt/50 bg-volt/8' : 'border-white/8 bg-court-light'}`}>
                <span className="w-8 text-center font-extrabold text-cream/60">
                  {MEDALS[i] || <span className="text-xs">#{i + 1}</span>}
                </span>
                <Avatar name={p.name} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-cream font-semibold text-sm truncate">{p.name}{me && <span className="text-volt text-xs"> · tú</span>}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CategoryBadge profile={p} />
                    {mismatch && <span className="text-[10px]" style={{ color: '#f59e0b' }}>⚠️</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-volt font-extrabold">{p.elo}</p>
                  <p className="text-cream/35 text-[10px]">{p.matches_played} partidos</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <PlayerSheet player={sel} open={!!sel} onClose={() => setSel(null)} />
    </div>
  )
}
