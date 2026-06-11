import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CATEGORY_ORDER, HOURS, DAYS_ES, MONTHS_ES, fmtTime, validatedCategory } from '../lib/constants'
import { Avatar, CategoryBadge, Button, Sheet, Spinner, Field } from '../components/ui'
import PlayerSheet from '../components/PlayerSheet'
import { useApp } from '../App'

function dayKey(d) { return d.toISOString().slice(0, 10) }

export default function Calendar() {
  const { session, profile, favorites, refreshPending } = useApp()
  const [mode, setMode] = useState('find') // find | mine
  const [dayIdx, setDayIdx] = useState(0)
  const [slots, setSlots] = useState(null)        // disponibilidad de otros
  const [mySlots, setMySlots] = useState([])      // mi disponibilidad
  const [catFilter, setCatFilter] = useState(null)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [onlyNear, setOnlyNear] = useState(false)
  const [selSlot, setSelSlot] = useState(null)    // slot a proponer
  const [court, setCourt] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0); return d
  }), [])
  const day = days[dayIdx]

  const load = useCallback(async () => {
    const from = new Date(day); const to = new Date(day); to.setDate(to.getDate() + 1)
    const [others, mine] = await Promise.all([
      supabase.from('availability')
        .select('*, profiles(*)')
        .gte('starts_at', from.toISOString()).lt('starts_at', to.toISOString())
        .neq('user_id', session.user.id).order('starts_at'),
      supabase.from('availability')
        .select('*').eq('user_id', session.user.id)
        .gte('starts_at', from.toISOString()).lt('starts_at', to.toISOString()),
    ])
    setSlots(others.data || [])
    setMySlots(mine.data || [])
  }, [day, session])

  useEffect(() => { setSlots(null); load() }, [load])

  // toggle de mi disponibilidad por hora
  const toggleMine = async (hour) => {
    const at = new Date(day); at.setHours(hour, 0, 0, 0)
    const existing = mySlots.find(s => new Date(s.starts_at).getHours() === hour)
    if (existing) {
      setMySlots(p => p.filter(s => s.id !== existing.id))
      await supabase.from('availability').delete().eq('id', existing.id)
    } else {
      const { data } = await supabase.from('availability')
        .insert({ user_id: session.user.id, starts_at: at.toISOString() }).select().single()
      if (data) setMySlots(p => [...p, data])
    }
  }

  const filtered = useMemo(() => (slots || []).filter(s => {
    const p = s.profiles
    if (!p) return false
    if (new Date(s.starts_at) < new Date()) return false
    if (catFilter && p.declared_category !== catFilter && validatedCategory(p) !== catFilter) return false
    if (onlyFavs && !favorites.has(p.id)) return false
    if (onlyNear && !(p.zone === profile.zone || (p.courts || []).some(c => profile.courts.includes(c)))) return false
    return true
  }), [slots, catFilter, onlyFavs, onlyNear, favorites, profile])

  const propose = async () => {
    setSending(true)
    const { error } = await supabase.from('matches').insert({
      proposer_id: session.user.id, receiver_id: selSlot.profiles.id,
      starts_at: selSlot.starts_at, court: court || null,
    })
    setSending(false)
    if (!error) {
      setSelSlot(null); setCourt('')
      setToast('🎾 ¡Propuesta enviada! Te avisamos cuando responda.')
      setTimeout(() => setToast(''), 3500)
      refreshPending()
    }
  }

  // canchas en común para sugerir punto de encuentro
  const commonCourts = selSlot
    ? (selSlot.profiles.courts || []).filter(c => profile.courts.includes(c))
    : []

  return (
    <div className="p-4 pt-6">
      <header className="mb-4">
        <h1 className="text-cream text-2xl font-extrabold">Hola, {profile.name.split(' ')[0]} 👋</h1>
        <p className="text-cream/50 text-sm">¿Cuándo quieres jugar?</p>
      </header>

      {/* Selector modo */}
      <div className="flex bg-court-light rounded-2xl p-1 mb-4 border border-white/8">
        {[['find', 'Buscar rival'], ['mine', 'Mi disponibilidad']].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === id ? 'bg-volt text-court' : 'text-cream/50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Selector de día */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {days.map((d, i) => (
          <button key={dayKey(d)} onClick={() => setDayIdx(i)}
            className={`shrink-0 w-14 py-2.5 rounded-2xl border text-center ${i === dayIdx ? 'bg-volt border-volt text-court' : 'border-white/10 text-cream/60'}`}>
            <p className="text-[10px] font-semibold uppercase">{i === 0 ? 'Hoy' : DAYS_ES[d.getDay()]}</p>
            <p className="font-extrabold text-lg leading-tight">{d.getDate()}</p>
            <p className="text-[9px] opacity-60">{MONTHS_ES[d.getMonth()]}</p>
          </button>
        ))}
      </div>

      {mode === 'mine' ? (
        <>
          <p className="text-cream/50 text-xs mb-3">Toca las horas en las que puedes jugar. Otros tenistas las verán y te propondrán partido.</p>
          <div className="grid grid-cols-4 gap-2">
            {HOURS.map(h => {
              const active = mySlots.some(s => new Date(s.starts_at).getHours() === h)
              const past = dayIdx === 0 && h <= new Date().getHours()
              return (
                <button key={h} disabled={past} onClick={() => toggleMine(h)}
                  className={`py-3 rounded-2xl text-sm font-bold border transition-colors ${past ? 'opacity-20 border-white/5 text-cream/40' : active ? 'bg-volt border-volt text-court' : 'border-white/12 text-cream/60 active:border-volt/50'}`}>
                  {h > 12 ? h - 12 : h}{h >= 12 ? 'pm' : 'am'}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
            <Chip active={onlyNear} onClick={() => setOnlyNear(!onlyNear)}>📍 Cerca de mí</Chip>
            <Chip active={onlyFavs} onClick={() => setOnlyFavs(!onlyFavs)}>★ Favoritos</Chip>
            {CATEGORY_ORDER.map(c => (
              <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(catFilter === c ? null : c)}>
                {CATEGORIES[c].short}
              </Chip>
            ))}
          </div>

          {slots === null ? <Spinner /> : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🦗</p>
              <p className="text-cream/60 text-sm font-semibold">Nadie disponible este día{catFilter || onlyFavs || onlyNear ? ' con esos filtros' : ''}</p>
              <p className="text-cream/35 text-xs mt-1.5">Publica tu disponibilidad y deja que te encuentren.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setMode('mine')}>Publicar mi disponibilidad</Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map(s => {
                const p = s.profiles
                const near = p.zone === profile.zone || (p.courts || []).some(c => profile.courts.includes(c))
                return (
                  <button key={s.id} onClick={() => setSelSlot(s)}
                    className="w-full bg-court-light rounded-3xl border border-white/8 p-3.5 flex items-center gap-3 text-left active:border-volt/40">
                    <div className="text-center shrink-0 w-14">
                      <p className="text-volt font-extrabold">{fmtTime(s.starts_at)}</p>
                    </div>
                    <Avatar name={p.name} size={42} />
                    <div className="flex-1 min-w-0">
                      <p className="text-cream font-semibold text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CategoryBadge profile={p} />
                        {favorites.has(p.id) && <span className="text-volt text-xs">★</span>}
                      </div>
                      <p className="text-cream/40 text-[11px] mt-0.5 truncate">
                        {near ? '📍 Cerca de ti · ' : ''}{p.zone}
                      </p>
                    </div>
                    <span className="text-cream/30">›</span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Sheet: proponer partido */}
      <PlayerSheet player={selSlot?.profiles} open={!!selSlot} onClose={() => setSelSlot(null)}
        footer={selSlot && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-cream/60 text-xs font-semibold uppercase tracking-wide mb-2">
              Partido el {DAYS_ES[new Date(selSlot.starts_at).getDay()]} a las {fmtTime(selSlot.starts_at)}
            </p>
            <Field label={commonCourts.length ? '¿Dónde? (tienen canchas en común 🤝)' : '¿Dónde? (opcional)'}>
              <div className="flex flex-wrap gap-1.5">
                {(commonCourts.length ? commonCourts : (selSlot.profiles.courts || [])).map(c => (
                  <button key={c} onClick={() => setCourt(court === c ? '' : c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${court === c ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Button className="w-full" disabled={sending} onClick={propose}>
              {sending ? 'Enviando…' : 'Proponer partido 🎾'}
            </Button>
          </div>
        )} />

      {toast && (
        <div className="fixed bottom-24 inset-x-4 max-w-md mx-auto bg-volt text-court text-sm font-bold rounded-2xl p-3.5 text-center z-50 slide-up">
          {toast}
        </div>
      )}
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
