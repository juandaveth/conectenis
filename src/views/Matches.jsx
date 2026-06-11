import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmtDate, fmtTime } from '../lib/constants'
import { Avatar, Button, Sheet, Spinner, Field, inputCls, Star } from '../components/ui'
import { useApp } from '../App'

export default function Matches() {
  const { session, refreshPending, favorites, toggleFavorite } = useApp()
  const [matches, setMatches] = useState(null)
  const [scoreFor, setScoreFor] = useState(null) // partido al que se registra marcador
  const [score, setScore] = useState('')
  const [winner, setWinner] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const me = session.user.id

  const load = useCallback(async () => {
    const { data } = await supabase.from('matches')
      .select('*, proposer:profiles!matches_proposer_id_fkey(*), receiver:profiles!matches_receiver_id_fkey(*)')
      .or(`proposer_id.eq.${me},receiver_id.eq.${me}`)
      .order('starts_at', { ascending: false })
    setMatches(data || [])
  }, [me])

  useEffect(() => { load() }, [load])

  const respond = async (id, status) => {
    await supabase.from('matches').update({ status }).eq('id', id)
    refreshPending(); load()
  }

  const saveScore = async () => {
    setSaving(true); setError('')
    const { error } = await supabase.rpc('record_result', {
      p_match_id: scoreFor.id, p_score: score.trim(), p_winner_id: winner,
    })
    setSaving(false)
    if (error) setError(error.message)
    else { setScoreFor(null); setScore(''); setWinner(null); load() }
  }

  if (matches === null) return <div className="pt-6"><Spinner /></div>

  const other = (m) => m.proposer_id === me ? m.receiver : m.proposer
  const pending = matches.filter(m => m.status === 'pending')
  const upcoming = matches.filter(m => m.status === 'accepted')
  const played = matches.filter(m => m.status === 'played')

  return (
    <div className="p-4 pt-6">
      <h1 className="text-cream text-2xl font-extrabold mb-4">Mis partidos</h1>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎾</p>
          <p className="text-cream/60 text-sm">Aún no tienes partidos.</p>
          <p className="text-cream/35 text-xs mt-1">Busca un rival en la pestaña Jugar.</p>
        </div>
      )}

      <Section title="Propuestas" items={pending} render={m => (
        <MatchCard m={m} other={other(m)}>
          {m.receiver_id === me ? (
            <div className="flex gap-2 mt-3">
              <Button className="flex-1 !py-2" onClick={() => respond(m.id, 'accepted')}>Aceptar ✓</Button>
              <Button variant="danger" className="flex-1 !py-2" onClick={() => respond(m.id, 'declined')}>Rechazar</Button>
            </div>
          ) : <p className="text-cream/40 text-xs mt-2">⏳ Esperando respuesta…</p>}
        </MatchCard>
      )} />

      <Section title="Confirmados" items={upcoming} render={m => (
        <MatchCard m={m} other={other(m)}>
          <div className="flex gap-2 mt-3">
            {new Date(m.starts_at) < new Date() && (
              <Button className="flex-1 !py-2" onClick={() => { setScoreFor(m); setWinner(null); setScore('') }}>
                Registrar marcador 🏆
              </Button>
            )}
            <Button variant="ghost" className="!py-2" onClick={() => respond(m.id, 'cancelled')}>Cancelar</Button>
          </div>
        </MatchCard>
      )} />

      <Section title="Jugados" items={played} render={m => {
        const o = other(m)
        const won = m.winner_id === me
        return (
          <MatchCard m={m} other={o} extra={
            <Star filled={favorites.has(o.id)} onClick={() => toggleFavorite(o.id)} />
          }>
            <p className={`text-sm font-bold mt-2 ${won ? 'text-volt' : 'text-cream/50'}`}>
              {won ? '✓ Ganaste' : '✗ Perdiste'} · {m.score}
            </p>
          </MatchCard>
        )
      }} />

      {/* Sheet registrar marcador */}
      <Sheet open={!!scoreFor} onClose={() => setScoreFor(null)} title="Registrar marcador">
        {scoreFor && (
          <>
            <p className="text-cream/50 text-xs mb-4">El resultado ajusta los puntos de ambos y valida su nivel real. ¡Juego limpio! 🤝</p>
            <Field label="¿Quién ganó?">
              <div className="flex gap-2">
                {[scoreFor.proposer, scoreFor.receiver].map(p => (
                  <button key={p.id} onClick={() => setWinner(p.id)}
                    className={`flex-1 rounded-2xl border p-3 flex flex-col items-center gap-1.5 ${winner === p.id ? 'border-volt bg-volt/10' : 'border-white/10'}`}>
                    <Avatar name={p.name} size={36} />
                    <span className="text-cream text-xs font-semibold">{p.id === me ? 'Yo' : p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Marcador (sets)">
              <input className={inputCls} value={score} onChange={e => setScore(e.target.value)} placeholder="Ej: 6-3 6-4" />
            </Field>
            <Button className="w-full" disabled={!winner || !score.trim() || saving} onClick={saveScore}>
              {saving ? 'Guardando…' : 'Guardar resultado'}
            </Button>
            {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
          </>
        )}
      </Sheet>
    </div>
  )
}

function Section({ title, items, render }) {
  if (!items.length) return null
  return (
    <div className="mb-6">
      <h2 className="text-cream/60 text-xs font-semibold uppercase tracking-wide mb-2">{title} ({items.length})</h2>
      <div className="space-y-2.5">{items.map(m => <div key={m.id}>{render(m)}</div>)}</div>
    </div>
  )
}

function MatchCard({ m, other, children, extra }) {
  return (
    <div className="bg-court-light rounded-3xl border border-white/8 p-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={other.name} size={42} />
        <div className="flex-1 min-w-0">
          <p className="text-cream font-semibold text-sm truncate">vs {other.name}</p>
          <p className="text-cream/45 text-xs">{fmtDate(m.starts_at)} · {fmtTime(m.starts_at)}{m.court ? ` · 📍 ${m.court}` : ''}</p>
        </div>
        {extra}
      </div>
      {children}
    </div>
  )
}
