import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { supabase, isConfigured } from './lib/supabase'
import Auth from './views/Auth'
import Landing from './views/Landing'
import Onboarding from './views/Onboarding'
import Calendar from './views/Calendar'
import Players from './views/Players'
import Ranking from './views/Ranking'
import Profile from './views/Profile'
import Matches from './views/Matches'
import { Spinner } from './components/ui'

export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const TABS = [
  { id: 'calendar', label: 'Jugar', icon: '🎾' },
  { id: 'players', label: 'Jugadores', icon: '👥' },
  { id: 'matches', label: 'Partidos', icon: '📋' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
]

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [profile, setProfile] = useState(undefined)
  const [tab, setTab] = useState('calendar')
  const [showAuth, setShowAuth] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isConfigured) { setSession(null); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadProfile = useCallback(async () => {
    if (!session?.user) { setProfile(undefined); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    setProfile(data ?? null) // null = necesita onboarding
  }, [session])

  const loadFavorites = useCallback(async () => {
    if (!session?.user) return
    const { data } = await supabase.from('favorites').select('favorite_id').eq('user_id', session.user.id)
    setFavorites(new Set((data || []).map(f => f.favorite_id)))
  }, [session])

  const loadPending = useCallback(async () => {
    if (!session?.user) return
    const { count } = await supabase.from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', session.user.id).eq('status', 'pending')
    setPendingCount(count || 0)
  }, [session])

  useEffect(() => { loadProfile(); loadFavorites(); loadPending() }, [loadProfile, loadFavorites, loadPending])

  const toggleFavorite = async (id) => {
    const next = new Set(favorites)
    if (next.has(id)) {
      next.delete(id)
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('favorite_id', id)
    } else {
      next.add(id)
      await supabase.from('favorites').insert({ user_id: session.user.id, favorite_id: id })
    }
    setFavorites(next)
  }

  if (!isConfigured) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center">
        <p className="text-cream/70 text-sm">⚙️ Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY</p>
      </div>
    )
  }
  if (session === undefined) return <div className="min-h-dvh"><Spinner /></div>
  if (!session) return showAuth ? <Auth /> : <Landing onLogin={() => setShowAuth(true)} />
  if (profile === undefined) return <div className="min-h-dvh"><Spinner /></div>
  if (profile === null) return <Onboarding user={session.user} onDone={loadProfile} />

  const ctx = { session, profile, refreshProfile: loadProfile, favorites, toggleFavorite, pendingCount, refreshPending: loadPending, setTab }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="min-h-dvh max-w-md mx-auto flex flex-col">
        <main className="flex-1 pb-24">
          {tab === 'calendar' && <Calendar />}
          {tab === 'players' && <Players />}
          {tab === 'matches' && <Matches />}
          {tab === 'ranking' && <Ranking />}
          {tab === 'profile' && <Profile />}
        </main>
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-court-light/95 backdrop-blur border-t border-white/10 safe-bottom">
          <div className="max-w-md mx-auto flex">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-semibold relative ${tab === t.id ? 'text-volt' : 'text-cream/40'}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                {t.label}
                {t.id === 'matches' && pendingCount > 0 && (
                  <span className="absolute top-1 right-1/2 translate-x-4 bg-volt text-court text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </AppCtx.Provider>
  )
}
