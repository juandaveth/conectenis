import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Field, inputCls } from '../components/ui'

export default function Auth() {
  const [mode, setMode] = useState('magic') // magic | password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMagic = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const sendPassword = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error.message)
    // si funciona, onAuthStateChange en App.jsx hace el resto
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center max-w-md mx-auto p-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🎾</div>
        <h1 className="text-cream text-3xl font-extrabold tracking-tight">Conectenis</h1>
        <p className="text-cream/50 text-sm mt-2 leading-relaxed">
          Encuentra rival de tu nivel,<br />cerca de ti, en Medellín
        </p>
      </div>

      {sent ? (
        <div className="bg-court-light rounded-3xl border border-volt/30 p-6 text-center">
          <div className="text-3xl mb-2">📬</div>
          <p className="text-cream font-semibold">Revisa tu correo</p>
          <p className="text-cream/50 text-sm mt-1">Te enviamos un enlace mágico a <span className="text-volt">{email}</span>. Ábrelo desde este dispositivo.</p>
        </div>
      ) : mode === 'magic' ? (
        <form onSubmit={sendMagic}>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com" className={inputCls + ' mb-3 text-center'} />
          <Button type="submit" disabled={loading || !email} className="w-full">
            {loading ? 'Enviando…' : 'Entrar con mi correo'}
          </Button>
          {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
          <p className="text-cream/30 text-[11px] text-center mt-4">Sin contraseñas. Te llega un enlace de acceso al correo.</p>
        </form>
      ) : (
        <form onSubmit={sendPassword}>
          <Field label="Correo">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com" className={inputCls} />
          </Field>
          <Field label="Contraseña">
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className={inputCls} />
          </Field>
          <Button type="submit" disabled={loading || !email || !password} className="w-full">
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
          {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
        </form>
      )}

      {!sent && (
        <button onClick={() => { setMode(mode === 'magic' ? 'password' : 'magic'); setError('') }}
          className="text-cream/35 text-xs text-center mt-6 w-full">
          {mode === 'magic' ? '¿Tienes contraseña? Entrar con contraseña' : '← Volver al enlace mágico'}
        </button>
      )}
    </div>
  )
}
