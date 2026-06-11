import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CATEGORY_ORDER, ZONES } from '../lib/constants'
import { Button, Field, inputCls } from '../components/ui'

const SLOTS = [
  'L–V mañana (5–11am)', 'L–V mediodía (11–2pm)', 'L–V tarde (2–6pm)',
  'L–V noche (6–10pm)', 'Sábado', 'Domingo',
]

export default function Landing({ onLogin }) {
  const [f, setF] = useState({ name: '', whatsapp: '', declared_category: null, zone: null, availability: [] })
  const [sent, setSent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const toggleSlot = (s) => set('availability', f.availability.includes(s) ? f.availability.filter(x => x !== s) : [...f.availability, s])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    const { error } = await supabase.from('waitlist').insert({
      name: f.name.trim(), whatsapp: f.whatsapp.trim(),
      declared_category: f.declared_category, zone: f.zone, availability: f.availability,
    })
    setSaving(false)
    if (error) setError('Algo falló, intenta de nuevo.')
    else setSent(true)
  }

  return (
    <div className="min-h-dvh max-w-md mx-auto">
      {/* Hero */}
      <header className="px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-3">🎾</div>
        <p className="text-volt text-xs font-bold uppercase tracking-widest mb-2">Conectenis · Medellín</p>
        <h1 className="text-cream text-3xl font-extrabold leading-tight tracking-tight">
          Encuentra rival de tenis <span className="text-volt">de tu nivel</span>, cuando tú puedes jugar
        </h1>
        <p className="text-cream/55 text-sm mt-3 leading-relaxed">
          Jugar tenis en Medellín debería ser tan fácil como actualizar mi disponibilidad en Google Calendar.
        </p>
      </header>

      {/* Problema */}
      <section className="px-5 space-y-2.5 mb-8">
        {[
          ['🤷', 'No sabes quién juega a tu nivel', 'Te dicen "tercera" y resulta que era cuarta. Aquí el nivel se valida con marcadores reales.'],
          ['📅', 'Cuadrar horario es un caos', 'Publica las horas en que puedes jugar y haz match con quien coincida, estilo calendario.'],
          ['📍', 'Las canchas quedan lejos', 'Te conectamos con tenistas de tu zona o con canchas en común.'],
        ].map(([icon, title, desc]) => (
          <div key={title} className="bg-court-light rounded-3xl border border-white/8 p-4 flex gap-3.5">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-cream font-bold text-sm">{title}</p>
              <p className="text-cream/50 text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA / Formulario */}
      <section className="px-5 pb-10">
        <div className="bg-court-light rounded-3xl border border-volt/30 p-5">
          {sent ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-3">🙌</p>
              <h2 className="text-cream font-extrabold text-xl">¡Listo, {f.name.split(' ')[0]}!</h2>
              <p className="text-cream/55 text-sm mt-2 leading-relaxed">
                Te escribiremos por WhatsApp apenas haya tenistas de tu nivel con tu mismo horario. 🎾
              </p>
              <Button className="w-full mt-5" onClick={onLogin}>Crear mi cuenta ahora →</Button>
              <p className="text-cream/35 text-[11px] mt-2">Con tu cuenta publicas tu calendario y propones partidos ya mismo.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="text-cream font-extrabold text-xl mb-1">¿Cuándo puedes jugar?</h2>
              <p className="text-cream/50 text-xs mb-5">Déjanos tu disponibilidad y te conectamos con tenistas de tu nivel.</p>

              <Field label="Tu nombre">
                <input required className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Camila Restrepo" />
              </Field>
              <Field label="WhatsApp">
                <input required type="tel" className={inputCls} value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="Ej: 300 123 4567" />
              </Field>
              <Field label="Tu categoría (5ª iniciación → 1ª avanzado)">
                <div className="flex gap-2">
                  {CATEGORY_ORDER.map(c => (
                    <button type="button" key={c} onClick={() => set('declared_category', c)}
                      className={`flex-1 py-2.5 rounded-2xl border font-bold text-sm ${f.declared_category === c ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
                      {CATEGORIES[c].short}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Tu zona">
                <div className="flex flex-wrap gap-2">
                  {ZONES.map(z => (
                    <button type="button" key={z} onClick={() => set('zone', z)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${f.zone === z ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
                      {z}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="¿Cuándo puedes jugar? (elige varias)">
                <div className="flex flex-wrap gap-2">
                  {SLOTS.map(s => (
                    <button type="button" key={s} onClick={() => toggleSlot(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${f.availability.includes(s) ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Button type="submit" className="w-full mt-1"
                disabled={saving || !f.name.trim() || !f.whatsapp.trim() || !f.declared_category || !f.zone || f.availability.length === 0}>
                {saving ? 'Enviando…' : 'Quiero jugar 🎾'}
              </Button>
              {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
            </form>
          )}
        </div>

        <button onClick={onLogin} className="w-full text-center text-cream/40 text-sm mt-6">
          ¿Ya tienes cuenta? <span className="text-volt font-semibold">Entrar →</span>
        </button>
        <p className="text-cream/25 text-[11px] text-center mt-4">Conectenis · Prototipo en Medellín 🇨🇴</p>
      </section>
    </div>
  )
}
