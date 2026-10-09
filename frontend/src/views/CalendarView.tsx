import { useState } from 'react'

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface Appointment {
  id: number
  day: number
  patient: string
  time: string
  reason: string
  color: string
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, day: 5, patient: 'Canela (Ana Torres)', time: '09:00', reason: 'Revisión general', color: '#dbeafe' },
  { id: 2, day: 5, patient: 'Mochi (Carlos Ruiz)', time: '10:30', reason: 'Vacunación', color: '#dcfce7' },
  { id: 3, day: 8, patient: 'Rocky (Fernanda López)', time: '11:00', reason: 'Control post-cirugía', color: '#fef9c3' },
  { id: 4, day: 12, patient: 'Luna (Miguel Salas)', time: '09:30', reason: 'Revisión de piel', color: '#fce7f3' },
  { id: 5, day: 15, patient: 'Thor (Valeria Méndez)', time: '14:00', reason: 'Desparasitación', color: '#ede9fe' },
  { id: 6, day: 20, patient: 'Bella (Diana Castillo)', time: '10:00', reason: 'Consulta urgente', color: '#ffedd5' },
  { id: 7, day: 22, patient: 'Nala (Roberto Vega)', time: '16:00', reason: 'Revisión general', color: '#dbeafe' },
]

const PATIENTS = ['Canela (Ana Torres)', 'Mochi (Carlos Ruiz)', 'Rocky (Fernanda López)', 'Luna (Miguel Salas)', 'Thor (Valeria Méndez)', 'Bella (Diana Castillo)', 'Nala (Roberto Vega)']
const TIMES = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarView() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ patient: '', date: '', time: '', reason: '' })
  const [saved, setSaved] = useState(false)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const dayAppointments = (day: number) => appointments.filter((a) => a.day === day)
  const selectedAppointments = selectedDay ? dayAppointments(selectedDay) : []

  const ACCENT_COLORS = ['#dbeafe', '#dcfce7', '#fce7f3', '#ede9fe', '#ffedd5', '#fef9c3']

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const day = form.date ? new Date(form.date).getDate() : 0
    setAppointments((prev) => [
      ...prev,
      {
        id: Date.now(),
        day,
        patient: form.patient,
        time: form.time,
        reason: form.reason,
        color: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)],
      },
    ])
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false); setForm({ patient: '', date: '', time: '', reason: '' }) }, 1000)
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
  const inputStyle = { border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }
  const focusStyle = (e: React.FocusEvent<any>) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff' }
  const blurStyle = (e: React.FocusEvent<any>) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--muted)' }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Calendario de citas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {appointments.length} citas programadas este mes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150"
          style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#0070e0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
        >
          <span>+</span> Nueva cita
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              ‹
            </button>
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 p-2" style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day === selectedDay
              const appts = dayAppointments(day)
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="h-24 p-2 cursor-pointer transition-colors duration-100 overflow-hidden"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    background: isSelected ? '#f0f7ff' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8faff' }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1"
                    style={{
                      background: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday ? '#fff' : 'var(--foreground)',
                      fontFamily: isToday ? 'var(--font-display)' : undefined,
                    }}
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {appts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="text-xs px-1.5 py-0.5 rounded truncate font-medium"
                        style={{ background: a.color, color: '#374151' }}
                      >
                        {a.time} {a.patient.split(' ')[0]}
                      </div>
                    ))}
                    {appts.length > 2 && (
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        +{appts.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            {selectedDay
              ? `${selectedDay} de ${MONTHS[month]}`
              : 'Selecciona un día'}
          </h3>

          {selectedDay && selectedAppointments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Sin citas para este día
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs mt-3 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                style={{ background: 'var(--brand-light, #e8f3ff)', color: 'var(--primary)' }}
              >
                + Agendar cita
              </button>
            </div>
          )}

          <div className="space-y-3">
            {selectedAppointments.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl"
                style={{ background: a.color, border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: '#374151' }}>{a.time}</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{a.patient.split('(')[0].trim()}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{a.reason}</p>
                {a.patient.includes('(') && (
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                    Dueño: {a.patient.match(/\((.+)\)/)?.[1]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-xl p-6"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
              >
                Nueva cita
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                ✕
              </button>
            </div>

            {saved ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm font-medium" style={{ color: '#059669' }}>Cita registrada correctamente</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Paciente <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={form.patient}
                    onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}
                    className={inputClass + ' cursor-pointer'}
                    style={inputStyle}
                  >
                    <option value="">Seleccionar paciente...</option>
                    {PATIENTS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                      Fecha <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className={inputClass}
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                      Hora <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      required
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className={inputClass + ' cursor-pointer'}
                      style={inputStyle}
                    >
                      <option value="">Seleccionar...</option>
                      {TIMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Motivo <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder="ej. Revisión general, vacunación..."
                    className={inputClass}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150"
                    style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#0070e0')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
                  >
                    Guardar cita
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                    style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
