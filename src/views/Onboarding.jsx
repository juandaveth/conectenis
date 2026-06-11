import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CATEGORY_ORDER, ZONES, COURTS } from '../lib/constants'
import { Button, Field, inputCls } from '../components/ui'

const CATEGORY_HELP = {
  5: 'Estoy empezando o llevo poco tiempo jugando',
  4: 'Sostengo peloteos y juego partidos amistosos',
  3: 'Juego torneos, tengo golpes consistentes',
  2: 'Nivel competitivo alto, torneos federados',
  1: 'Nivel avanzado / élite regional',
}

export default function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({
    name: '', age: '', declared_category: null,
    zone: null, courts: [], willing_to_travel: true, bio: '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const toggleCourt = (name) =>
    set('courts', f.courts.includes(name) ? f.courts.filter(c => c !== name) : [...f.courts, name])

  const save = async () => {
    setSaving(true); setError('')
    const { error } = await supabase.from('profiles').insert({
      id: user.id, name: f.name.trim(), age: Number(f.age) || null, bio: f.bio.trim(),
      declared_category: f.declared_category, zone: f.zone,
      courts: f.courts, willing_to_travel: f.willing_to_travel,
    })
    setSaving(false)
    if (error) setError(error.message)
    else onDone()
  }

  const steps = [
    // Paso 0 — quién eres
    <div key="0">
      <h1 className="text-cream text-2xl font-extrabold mb-1">¡Hola! 👋</h1>
      <p className="text-cream/50 text-sm mb-6">Cuéntanos quién eres. Esto es lo que verán otros tenistas.</p>
      <Field label="Tu nombre">
        <input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Camila Restrepo" />
      </Field>
      <Field label="Edad">
        <input className={inputCls} type="number" min="10" max="99" value={f.age} onChange={e => set('age', e.target.value)} placeholder="Ej: 29" />
      </Field>
      <Field label="Algo sobre tu juego (opcional)">
        <input className={inputCls} value={f.bio} onChange={e => set('bio', e.target.value)} placeholder="Ej: Zurdo, me gusta jugar de fondo" />
      </Field>
      <Button className="w-full mt-2" disabled={!f.name.trim() || !f.age} onClick={() => setStep(1)}>Continuar</Button>
    </div>,

    // Paso 1 — categoría (con copy que invita a la honestidad)
    <div key="1">
      <h1 className="text-cream text-2xl font-extrabold mb-1">Tu categoría</h1>
      <p className="text-cream/50 text-sm mb-1">Sistema colombiano: 5ª (iniciación) → 1ª (avanzado).</p>
      <p className="text-volt/80 text-xs mb-5">💡 Sé honesto: tu nivel se validará con los marcadores de tus partidos reales.</p>
      <div className="space-y-2.5 mb-5">
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
      <Button className="w-full" disabled={!f.declared_category} onClick={() => setStep(2)}>Continuar</Button>
    </div>,

    // Paso 2 — ubicación y canchas
    <div key="2">
      <h1 className="text-cream text-2xl font-extrabold mb-1">¿Dónde juegas?</h1>
      <p className="text-cream/50 text-sm mb-5">Para hacer match con tenistas cerca de ti.</p>
      <Field label="Tu zona">
        <div className="flex flex-wrap gap-2">
          {ZONES.map(z => (
            <button key={z} onClick={() => set('zone', z)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${f.zone === z ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
              {z}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Canchas que te quedan cerca (elige varias)">
        <div className="space-y-2">
          {COURTS.map(c => (
            <button key={c.name} onClick={() => toggleCourt(c.name)}
              className={`w-full text-left rounded-2xl border px-3.5 py-2.5 text-sm flex justify-between items-center ${f.courts.includes(c.name) ? 'border-volt bg-volt/10 text-cream' : 'border-white/10 bg-court-light text-cream/60'}`}>
              <span>{c.name}</span>
              <span className="text-[10px] text-cream/35">{c.zone}</span>
            </button>
          ))}
        </div>
      </Field>
      <label className="flex items-center gap-3 mb-5 bg-court-light rounded-2xl border border-white/10 p-3.5">
        <input type="checkbox" checked={f.willing_to_travel} onChange={e => set('willing_to_travel', e.target.checked)}
          className="w-5 h-5 accent-[#d4f24b]" />
        <span className="text-cream/80 text-sm">Estoy dispuesto/a a moverme por la ciudad</span>
      </label>
      <Button className="w-full" disabled={!f.zone || f.courts.length === 0 || saving} onClick={save}>
        {saving ? 'Creando perfil…' : '¡Listo, a jugar! 🎾'}
      </Button>
      {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
    </div>,
  ]

  return (
    <div className="min-h-dvh max-w-md mx-auto p-6 pt-10">
      <div className="flex gap-1.5 mb-8">
        {[0, 1, 2].map(i => (
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
