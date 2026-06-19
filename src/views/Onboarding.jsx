import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CATEGORY_ORDER, COURTS } from '../lib/constants'
import { Button, Field, inputCls } from '../components/ui'

const CATEGORY_HELP = {
  5: 'Estoy empezando. Me concentro en pasar la bola y agarrarle el tiempo al juego.',
  4: 'Sostengo peloteos tranquilos y juego amistosos, aunque mi servicio no es consistente.',
  3: 'Tengo golpes de fondo consistentes, controlo la bola y tengo una estrategia de juego.',
  2: 'Juego con efecto y potencia, saco con intención y tengo un estilo de juego definido y competitivo.',
  1: 'Domino todos los golpes y juego al nivel competitivo más alto de la región.',
}

export default function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({ name: '', declared_category: null, courts: [] })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const toggleCourt = (name) =>
    set('courts', f.courts.includes(name) ? f.courts.filter(c => c !== name) : [...f.courts, name])

  const save = async () => {
    setSaving(true); setError('')
    // La zona se deduce de la primera cancha elegida (no la preguntamos aparte).
    const zone = COURTS.find(c => c.name === f.courts[0])?.zone || null
    const { error } = await supabase.from('profiles').insert({
      id: user.id, name: f.name.trim(),
      declared_category: f.declared_category, zone, courts: f.courts,
    })
    setSaving(false)
    if (error) setError(error.message)
    else onDone()
  }

  const steps = [
    // Paso 0 — nombre + nivel (lo esencial: quién eres y qué nivel juegas)
    <div key="0">
      <h1 className="text-cream text-2xl font-extrabold mb-1">¡Hola! 👋</h1>
      <p className="text-cream/50 text-sm mb-6">Dos cositas para empezar a jugar. El resto lo completas luego en tu perfil.</p>

      <Field label="Tu nombre">
        <input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Camila Restrepo" />
      </Field>

      <div className="mb-2">
        <span className="block text-cream/60 text-xs font-semibold uppercase tracking-wide mb-1.5">Tu categoría</span>
        <p className="text-cream/45 text-xs mb-1">Sistema colombiano: 5ª (iniciación) → 1ª (avanzado).</p>
        <p className="text-volt/80 text-xs mb-3">💡 Sé honesto: tu nivel se validará con los marcadores de tus partidos reales.</p>
        <div className="space-y-2.5">
          {CATEGORY_ORDER.map(c => {
            const cat = CATEGORIES[c]
            const active = f.declared_category === c
            return (
              <button key={c} onClick={() => set('declared_category', c)}
                className={`w-full text-left rounded-2xl border p-3.5 transition-colors ${active ? 'border-volt bg-volt/10' : 'border-white/10 bg-court-light'}`}>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-lg w-8 text-center" style={{ color: cat.color }}>{cat.short}</span>
                  <div>
                    <p className="text-cream font-semibold text-sm">{cat.label} categoría</p>
                    <p className="text-cream/45 text-xs">{CATEGORY_HELP[c]}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Button className="w-full mt-5" disabled={!f.name.trim() || !f.declared_category} onClick={() => setStep(1)}>Continuar</Button>
    </div>,

    // Paso 1 — dónde juega (canchas; la zona se deduce de ahí)
    <div key="1">
      <h1 className="text-cream text-2xl font-extrabold mb-1">¿Dónde juegas?</h1>
      <p className="text-cream/50 text-sm mb-5">Elige una o varias canchas para conectarte con tenistas cerca de ti.</p>
      <div className="space-y-2">
        {COURTS.map(c => (
          <button key={c.name} onClick={() => toggleCourt(c.name)}
            className={`w-full text-left rounded-2xl border px-3.5 py-2.5 text-sm flex justify-between items-center ${f.courts.includes(c.name) ? 'border-volt bg-volt/10 text-cream' : 'border-white/10 bg-court-light text-cream/60'}`}>
            <span className="flex items-center gap-1.5">
              {c.name}
              {c.lat && <span className="px-1.5 py-0.5 rounded bg-volt/20 text-volt text-[9px] font-bold tracking-wide">LAT</span>}
            </span>
            <span className="text-[10px] text-cream/35">{c.zone}</span>
          </button>
        ))}
      </div>
      <Button className="w-full mt-5" disabled={f.courts.length === 0 || saving} onClick={save}>
        {saving ? 'Creando perfil…' : '¡Listo, a jugar! 🎾'}
      </Button>
      {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
    </div>,
  ]

  return (
    <div className="min-h-dvh max-w-md mx-auto p-6 pt-10">
      <div className="flex gap-1.5 mb-8">
        {[0, 1].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-volt' : 'bg-white/10'}`} />
        ))}
      </div>
      {steps[step]}
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="text-cream/40 text-sm mt-4 w-full text-center">← Volver</button>
      )}
    </div>
  )
}
