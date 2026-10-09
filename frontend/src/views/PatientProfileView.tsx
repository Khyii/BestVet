import { View } from '../App'
import { PATIENTS } from './DashboardView'

const HISTORIAL = [
  {
    id: 1,
    fecha: '12 Mar 2024',
    motivo: 'Revisión general',
    diagnostico: 'Estado óptimo de salud. Peso adecuado para su edad y tamaño.',
    medicacion: 'Vitamina E 200mg · 1 vez al día por 30 días',
    veterinario: 'Dr. Ramírez',
    tipo: 'Revisión',
  },
  {
    id: 2,
    fecha: '18 Ene 2024',
    motivo: 'Vómito y letargo',
    diagnostico: 'Gastroenteritis leve por ingesta de alimento inadecuado.',
    medicacion: 'Metronidazol 250mg · 2 veces/día · 5 días. Dieta blanda.',
    veterinario: 'Dra. Fuentes',
    tipo: 'Urgencia',
  },
  {
    id: 3,
    fecha: '05 Nov 2023',
    motivo: 'Vacunación anual',
    diagnostico: 'Cuadro vacunal completo actualizado. Sin reacciones adversas.',
    medicacion: 'Vacuna polivalente + Antirrábica',
    veterinario: 'Dr. Ramírez',
    tipo: 'Vacuna',
  },
  {
    id: 4,
    fecha: '22 Jul 2023',
    motivo: 'Cojera en pata delantera',
    diagnostico: 'Esguince leve de ligamento carpiano derecho. Reposo recomendado.',
    medicacion: 'Meloxicam 1mg/kg · 1 vez/día · 7 días',
    veterinario: 'Dr. Ramírez',
    tipo: 'Traumatología',
  },
  {
    id: 5,
    fecha: '10 Mar 2023',
    motivo: 'Primera consulta',
    diagnostico: 'Cachorra sana. Se inicia seguimiento clínico.',
    medicacion: 'Desparasitación: Praziquantel + Pirantel. Repetir en 3 semanas.',
    veterinario: 'Dr. Ramírez',
    tipo: 'Primera visita',
  },
]

const CITAS_AGENDADAS = [
  {
    id: 1,
    fecha: '18 Mar 2024',
    hora: '10:30',
    motivo: 'Control de seguimiento',
    estado: 'Confirmada',
  },
  {
    id: 2,
    fecha: '12 Abr 2024',
    hora: '16:00',
    motivo: 'Vacunación anual',
    estado: 'Programada',
  },
]

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  'Revisión': { bg: '#eff6ff', color: '#2563eb' },
  'Urgencia': { bg: '#fff1f2', color: '#be123c' },
  'Vacuna': { bg: '#ecfdf5', color: '#059669' },
  'Traumatología': { bg: '#fffbeb', color: '#d97706' },
  'Primera visita': { bg: '#f5f3ff', color: '#7c3aed' },
}

interface PatientProfileViewProps {
  patientId: number
  onNavigate: (v: View) => void
}

export default function PatientProfileView({ patientId, onNavigate }: PatientProfileViewProps) {
  const patient = PATIENTS.find((item) => item.id === patientId) ?? PATIENTS[0]
  const historial = patient.id === 1
    ? HISTORIAL
    : [{
        id: 1,
        fecha: new Date(`${patient.fecha}T12:00:00`).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        motivo: 'Revisión general',
        diagnostico: 'Consulta de seguimiento registrada. Evolución clínica estable.',
        medicacion: 'Sin medicación indicada.',
        veterinario: 'Equipo Best Vet',
        tipo: 'Revisión',
      }]

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
          style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        >
          ←
        </button>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Perfil del paciente
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Historial clínico completo
          </p>
        </div>
      </div>

      {/* Patient card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shrink-0"
            style={{ background: 'var(--primary)' }}
          >
            🐕
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  {patient.nombre}
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {patient.animal} · {patient.raza}
                </p>
              </div>
              <button
                onClick={() => onNavigate('patient-form')}
                className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
              >
                Editar
              </button>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Edad</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{patient.edad}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Peso</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{patient.peso}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Vacunas</p>
                <p className="text-sm font-semibold" style={{ color: '#059669' }}>Al día</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Owner info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
            Información del dueño
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm">👤</span>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{patient.dueño}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">✉️</span>
              <span className="text-sm" style={{ color: 'var(--primary)' }}>{patient.correo}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">📱</span>
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>{patient.celular}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              Citas agendadas
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Próximas atenciones de {patient.nombre}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('calendar')}
            className="text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer"
            style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}
          >
            Ver calendario
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CITAS_AGENDADAS.map((cita) => (
            <div
              key={cita.id}
              className="rounded-lg p-4"
              style={{ background: 'var(--muted)', borderLeft: '3px solid var(--primary)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {cita.motivo}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {cita.fecha} · {cita.hora}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
                  style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}
                >
                  {cita.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Historial clínico
          </h3>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {historial.length} {historial.length === 1 ? 'consulta registrada' : 'consultas registradas'}
          </span>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-px"
            style={{ background: 'var(--border)' }}
          />

          <div className="space-y-4">
            {historial.map((h) => (
              <div key={h.id} className="flex gap-5">
                {/* Timeline dot */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {h.id}
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-xl p-5 mb-1"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={TIPO_COLORS[h.tipo]}
                        >
                          {h.tipo}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{h.fecha}</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {h.motivo}
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                      {h.veterinario}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Diagnóstico</p>
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>{h.diagnostico}</p>
                    </div>
                    <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Medicación</p>
                      <p className="text-sm font-mono" style={{ color: 'var(--foreground)', fontSize: '0.8rem' }}>
                        {h.medicacion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
