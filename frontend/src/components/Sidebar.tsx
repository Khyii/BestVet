import { View } from '../App'

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Pacientes', icon: '🐾' },
  { id: 'patient-profile', label: 'Historial', icon: '📁' },
  { id: 'calendar', label: 'Citas', icon: '📅' },
]

interface SidebarProps {
  activeView: View
  onNavigate: (v: View) => void
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside
      className="w-60 flex flex-col shrink-0 h-full border-r"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          >
            BV
          </div>
          <span className="font-semibold text-base tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Best Vet
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 py-2 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
          Menú
        </p>
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left cursor-pointer"
              style={{
                background: active ? 'var(--brand-light, #e8f3ff)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--secondary-foreground)',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'var(--primary)' }}
          >
            BV
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>Clínica Best Vet</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Personal autorizado</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
