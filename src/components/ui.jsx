import { CATEGORIES, validatedCategory } from '../lib/constants'

export function Avatar({ name, size = 44, className = '' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-court shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 65% 75%)` }}>
      {initials}
    </div>
  )
}

// Badge de categoría: muestra declarada y, si existe, la validada por resultados
export function CategoryBadge({ profile, detailed = false }) {
  const dec = CATEGORIES[profile.declared_category]
  const valCat = validatedCategory(profile)
  const val = valCat ? CATEGORIES[valCat] : null
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
        style={{ background: `${dec.color}22`, color: dec.color, border: `1px solid ${dec.color}55` }}>
        {detailed ? `Declarado ${dec.short}` : dec.short}
      </span>
      {val && (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1"
          style={{ background: `${val.color}33`, color: val.color, border: `1px solid ${val.color}` }}>
          ✓ {detailed ? `Validado ${val.short}` : val.short}
        </span>
      )}
    </span>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-volt text-court font-bold active:bg-volt-dark disabled:opacity-40',
    ghost: 'bg-white/10 text-cream active:bg-white/20',
    danger: 'bg-red-500/15 text-red-400 active:bg-red-500/25',
  }
  return (
    <button className={`rounded-2xl px-4 py-3 text-sm transition-colors ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-court-light rounded-3xl border border-white/8 p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Sheet({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-court-light rounded-t-3xl border-t border-white/10 p-5 pb-8 slide-up max-h-[88vh] overflow-y-auto safe-bottom">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
        {title && <h2 className="text-cream font-bold text-lg mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-cream/60 text-xs font-semibold uppercase tracking-wide mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputCls = 'w-full bg-court rounded-2xl border border-white/10 px-4 py-3 text-cream text-sm outline-none focus:border-volt/60 placeholder:text-cream/30'

export function Star({ filled, onClick }) {
  return (
    <button onClick={onClick} className="text-xl leading-none p-1" aria-label="favorito">
      <span className={filled ? 'text-volt' : 'text-white/25'}>{filled ? '★' : '☆'}</span>
    </button>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 rounded-full border-2 border-volt border-t-transparent animate-spin" />
    </div>
  )
}
