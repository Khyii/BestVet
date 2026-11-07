import { useState } from 'react'
import LoginView from './views/LoginView'
import DashboardView from './views/DashboardView'
import PatientFormView from './views/PatientFormView'
import PatientProfileView from './views/PatientProfileView'
import CalendarView from './views/CalendarView'
import Sidebar from './components/Sidebar'
import { logout } from './api/client'
import { ROLE_LABELS, type Me } from './api/types'
import { canManagePatients, canOpen, canUseMedicalRecord, homeView } from './auth/permissions'

export type View = 'login' | 'dashboard' | 'patient-form' | 'patient-profile' | 'calendar'

function displayName(me: Me): string {
  const fullName = [me.firstName, me.lastName].filter(Boolean).join(' ')
  return fullName || me.username
}

export default function App() {
  const [me, setMe] = useState<Me | null>(null)
  const [view, setView] = useState<View>('login')
  // El perfil se abre siempre desde un paciente concreto del panel (CU08, paso d).
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)

  if (!me) {
    return (
      <LoginView
        onLogin={(user) => {
          setMe(user)
          setView(homeView(user.role) ?? 'login')
        }}
      />
    )
  }

  // Ignora la navegación hacia vistas que el rol no puede usar.
  const navigate = (next: View) => {
    if (canOpen(me.role, next)) setView(next)
  }

  const openPatientProfile = (patientId: number) => {
    setSelectedPatientId(patientId)
    navigate('patient-profile')
  }

  const handleLogout = () => {
    logout()
    setMe(null)
    setSelectedPatientId(null)
    setView('login')
  }

  const hasViews = homeView(me.role) !== null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar role={me.role} activeView={view} onNavigate={navigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex h-16 shrink-0 items-center justify-end gap-4 border-b px-8"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{displayName(me)}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ROLE_LABELS[me.role]}</p>
          </div>
          <div className="h-8" style={{ borderLeft: '1px solid var(--border)' }} />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer"
            style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}
          >
            Cerrar sesión
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          {!hasViews && (
            <div className="p-8">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                La gestión de personal no está disponible en la interfaz en esta versión.
              </p>
            </div>
          )}
          {view === 'dashboard' && canOpen(me.role, 'dashboard') && (
            <DashboardView
              canRegister={canManagePatients(me.role)}
              onNavigate={navigate}
              onSelectPatient={openPatientProfile}
            />
          )}
          {view === 'patient-form' && canOpen(me.role, 'patient-form') && (
            <PatientFormView onNavigate={navigate} />
          )}
          {view === 'patient-profile' && canOpen(me.role, 'patient-profile') && selectedPatientId !== null && (
            <PatientProfileView
              patientId={selectedPatientId}
              canEdit={canManagePatients(me.role)}
              showMedicalRecord={canUseMedicalRecord(me.role)}
              onNavigate={navigate}
            />
          )}
          {view === 'calendar' && canOpen(me.role, 'calendar') && <CalendarView />}
        </main>
      </div>
    </div>
  )
}
