import { useState } from 'react'
import LoginView from './views/LoginView'
import DashboardView from './views/DashboardView'
import PatientFormView from './views/PatientFormView'
import PatientProfileView from './views/PatientProfileView'
import CalendarView from './views/CalendarView'
import Sidebar from './components/Sidebar'

export type View = 'login' | 'dashboard' | 'patient-form' | 'patient-profile' | 'calendar'

export default function App() {
  const [view, setView] = useState<View>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(1)

  const openPatientProfile = (patientId: number) => {
    setSelectedPatientId(patientId)
    setView('patient-profile')
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={() => { setIsLoggedIn(true); setView('dashboard') }} />
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar activeView={view} onNavigate={setView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex h-16 shrink-0 items-center justify-end gap-4 border-b px-8"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Clínica Best Vet</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Personal autorizado</p>
          </div>
          <div className="h-8" style={{ borderLeft: '1px solid var(--border)' }} />
          <button
            type="button"
            onClick={() => { setIsLoggedIn(false); setView('login') }}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer"
            style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}
          >
            Cerrar sesión
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          {view === 'dashboard' && (
            <DashboardView onNavigate={setView} onSelectPatient={openPatientProfile} />
          )}
          {view === 'patient-form' && <PatientFormView onNavigate={setView} />}
          {view === 'patient-profile' && (
            <PatientProfileView patientId={selectedPatientId} onNavigate={setView} />
          )}
          {view === 'calendar' && <CalendarView />}
        </main>
      </div>
    </div>
  )
}
