import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CATEGORY_ORDER, ZONES, COURTS, validatedCategory, MIN_MATCHES_TO_VALIDATE } from '../lib/constants'
import { Avatar, CategoryBadge, Button, Field, inputCls, Card } from '../components/ui'
import { useApp } from '../App'

export default function Profile() {
  const { session, profile, refreshProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState(profile)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const val = validatedCategory(profile)
  const winRate = profile.matches_played ? Math.round((profile.wins / profile.matches_played) * 100) : null

  const save = async () => {
    setSaving(true)
    await supabase.from('profiles').update({
      name: f.name.trim(), age: Number(f.age) || null, bio: f.bio,
      declared_category: f.declared_category, zone: f.zone,
      courts: f.courts, willing_to_travel: f.willing_to_travel,
    }).eq('id', session.user.id)
    setSaving(false); setEditing(false); refreshProfile()
  }

  if (editing) return (
    <div className="p-4 pt-6">
      <h1 className="text-cream text-2xl font-extrabold mb-5">Editar perfil</h1>
      <Field label="Nombre"><input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Edad"><input className={inputCls} type="number" value={f.age || ''} onChange={e => set('age', e.target.value)} /></Field>
      <Field label="Sobre tu juego"><input className={inputCls} value={f.bio || ''} onChange={e => set('bio', e.target.value)} /></Field>
      <Field label="Categoría declarada">
        <div className="flex gap-2">
          {CATEGORY_ORDER.map(c => (
            <button key={c} onClick={() => set('declared_category', c)}
              className={`flex-1 py-2.5 rounded-2xl border font-bold text-sm ${f.declared_category === c ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>
              {CATEGORIES[c].short}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Zona">
        <div className="flex flex-wrap gap-2">
          {ZONES.map(z => (
            <button key={z} onClick={() => set('zone', z)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${f.zone === z ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>{z}</button>
          ))}
        </div>
      </Field>
      <Field label="Canchas cercanas">
        <div className="flex flex-wrap gap-2">
          {COURTS.map(c => (
            <button key={c.name} onClick={() => set('courts', f.courts.includes(c.name) ? f.courts.filter(x => x !== c.name) : [...f.courts, c.name])}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${f.courts.includes(c.name) ? 'bg-volt text-court border-volt' : 'text-cream/60 border-white/15'}`}>{c.name}</button>
          ))}
        </div>
      </Field>
      <label className="flex items-center gap-3 mb-5 bg-court-light rounded-2xl border border-white/10 p-3.5">
        <input type="checkbox" checked={f.willing_to_travel} onChange={e => set('willing_to_travel', e.target.checked)} className="w-5 h-5 accent-[#d4f24b]" />
        <span className="text-cream/80 text-sm">Dispuesto/a a moverme por la ciudad</span>
      </label>
      <Button className="w-full" disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
      <button onClick={() => { setF(profile); setEditing(false) }} className="text-cream/40 text-sm mt-3 w-full">Cancelar</button>
    </div>
  )

  return (
    <div className="p-4 pt-6">
      <div className="flex flex-col items-center text-center mb-5">
        <Avatar name={profile.name} size={84} className="mb-3" />
        <h1 className="text-cream text-2xl font-extrabold">{profile.name}</h1>
        <p className="text-cream/50 text-sm">{profile.age} años · {profile.zone}</p>
        <div className="mt-2"><CategoryBadge profile={profile} detailed /></div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="text-center !p-3"><p className="text-volt font-extrabold text-xl">{profile.elo}</p><p className="text-cream/40 text-[10px] uppercase">Puntos</p></Card>
        <Card className="text-center !p-3"><p className="text-volt font-extrabold text-xl">{profile.matches_played}</p><p className="text-cream/40 text-[10px] uppercase">Partidos</p></Card>
        <Card className="text-center !p-3"><p className="text-volt font-extrabold text-xl">{winRate !== null ? `${winRate}%` : '—'}</p><p className="text-cream/40 text-[10px] uppercase">Victorias</p></Card>
      </div>

      {!val && (
        <Card className="mb-4 !border-volt/25">
          <p className="text-cream text-sm font-semibold mb-1">⚖️ Valida tu nivel</p>
          <p className="text-cream/50 text-xs leading-relaxed">
            Juega y registra {MIN_MATCHES_TO_VALIDATE - profile.matches_played} partido{MIN_MATCHES_TO_VALIDATE - profile.matches_played !== 1 ? 's' : ''} más para obtener la insignia <span className="text-volt font-bold">✓ nivel validado</span>. Así otros confían en que tu categoría es real.
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <p className="text-cream/60 text-xs font-semibold uppercase tracking-wide mb-2">Mis canchas</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.courts.map(c => <span key={c} className="px-2.5 py-1 rounded-full bg-white/8 text-cream/70 text-[11px]">📍 {c}</span>)}
        </div>
        {profile.willing_to_travel && <p className="text-volt/70 text-[11px] mt-2">✓ Dispuesto/a a moverse por la ciudad</p>}
      </Card>

      {profile.bio && <Card className="mb-4"><p className="text-cream/70 text-sm">"{profile.bio}"</p></Card>}

      <Button variant="ghost" className="w-full mb-2" onClick={() => { setF(profile); setEditing(true) }}>Editar perfil</Button>
      <Button variant="danger" className="w-full" onClick={() => supabase.auth.signOut()}>Cerrar sesión</Button>
    </div>
  )
}
