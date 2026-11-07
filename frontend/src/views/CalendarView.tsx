import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  cancelAppointment,
  confirmAppointment,
  listAppointments,
  listVeterinarians,
  markDidntShow,
  rescheduleAppointment,
} from '../api/appointments'
import {
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
  type Role,
  type Veterinarian,
} from '../api/types'
import AppointmentForm from '../components/AppointmentForm'
import { INPUT_CLASS } from '../components/Field'
import { validateReschedule } from '../forms/appointmentForms'
import { apiErrorMessage } from '../forms/patientForms'
import { ACTION_LABELS, availableActions, isActive, type AppointmentAction } from '../utils/appointments'
import { groupByDay, isoDay, monthGrid, monthRange, shiftMonth } from '../utils/calendar'
import { formatDate, nowLocalDateTime } from '../utils/dates'

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MAX_BLOCKS_PER_DAY = 3

export const STATUS_COLORS: Record<AppointmentStatus, { background: string; color: string }> = {
  SCHEDULED: { background: '#dbeafe', color: '#1d4ed8' },
  CONFIRMED: { background: '#dcfce7', color: '#15803d' },
  COMPLETED: { background: '#ede9fe', color: '#6d28d9' },
  DIDNT_SHOW: { background: '#ffedd5', color: '#c2410c' },
  CANCELLED: { background: '#f3f4f6', color: '#6b7280' },
}

const NOTICES: Record<Exclude<AppointmentAction, 'complete'>, string> = {
  confirm: 'Cita confirmada.',
  cancel: 'Cita cancelada.',
  didntShow: 'Cita marcada como no asistió.',
  reschedule: 'Cita reprogramada.',
}

// Las acciones que llevan a un estado final piden confirmación (RF9: no se pueden deshacer).
const CONFIRMATIONS: Partial<Record<AppointmentAction, string>> = {
  cancel: '¿Cancelar esta cita? La acción no se puede deshacer.',
  didntShow: '¿Marcar esta cita como no asistió? La acción no se puede deshacer.',
}

const time = (iso: string) => iso.slice(11, 16)

interface CalendarViewProps {
  role: Role
  /** Identificador del veterinario autenticado, para mostrar su agenda por defecto. */
  staffId: number | null
  /** CU16: el veterinario registra la consulta de una cita confirmada. */
  onStartConsultation: (appointment: Appointment) => void
}

export default function CalendarView({ role, staffId, onStartConsultation }: CalendarViewProps) {
  const today = new Date()
  const todayKey = isoDay(today.getFullYear(), today.getMonth(), today.getDate())

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(todayKey)
  const [vetFilter, setVetFilter] = useState<string>(role === 'VETERINARIAN' && staffId ? String(staffId) : '')
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [creating, setCreating] = useState(false)

  // Acciones sobre una cita
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<{ id: number; message: string } | null>(null)
  const [rescheduling, setRescheduling] = useState<{ id: number; date: string } | null>(null)

  useEffect(() => {
    listVeterinarians().then(setVeterinarians).catch(() => setVeterinarians([]))
  }, [])

  // RF10: citas del mes visible, opcionalmente de un solo veterinario.
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { from, to } = monthRange(year, month)
      setAppointments(await listAppointments(from, to, vetFilter ? Number(vetFilter) : null))
      setLoadError('')
    } catch (err) {
      setLoadError(apiErrorMessage(err).message)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [year, month, vetFilter])

  useEffect(() => { void load() }, [load])

  const byDay = useMemo(() => groupByDay(appointments, (a) => a.scheduledAt), [appointments])
  const cells = monthGrid(year, month)
  const dayAppointments = byDay[selectedDay] ?? []

  const goToMonth = (delta: number) => {
    const next = shiftMonth(year, month, delta)
    setYear(next.year)
    setMonth(next.month)
    setSelectedDay(isoDay(next.year, next.month, 1))
    setCreating(false)
  }

  const goToToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(todayKey)
  }

  const runAction = async (appointment: Appointment, action: AppointmentAction) => {
    if (action === 'complete') {
      onStartConsultation(appointment)
      return
    }
    if (action === 'reschedule') {
      setRescheduling({ id: appointment.id, date: '' })
      setActionError(null)
      return
    }
    const question = CONFIRMATIONS[action]
    if (question && !window.confirm(question)) return

    setBusyId(appointment.id)
    setActionError(null)
    setNotice('')
    try {
      if (action === 'confirm') await confirmAppointment(appointment.id)
      if (action === 'cancel') await cancelAppointment(appointment.id)
      if (action === 'didntShow') await markDidntShow(appointment.id)
      setNotice(NOTICES[action])
      await load()
    } catch (err) {
      // Una transición no permitida responde 409 con el motivo (RF9).
      setActionError({ id: appointment.id, message: apiErrorMessage(err).message })
    } finally {
      setBusyId(null)
    }
  }

  const saveReschedule = async (appointment: Appointment) => {
    if (!rescheduling) return
    const problem = validateReschedule(rescheduling.date)
    if (problem) {
      setActionError({ id: appointment.id, message: problem })
      return
    }
    setBusyId(appointment.id)
    setActionError(null)
    setNotice('')
    try {
      const updated = await rescheduleAppointment(appointment.id, rescheduling.date)
      setRescheduling(null)
      setNotice(NOTICES.reschedule)
      // La cita puede pasar a otro día o a otro mes: se muestra donde quedó.
      const [y, m] = updated.scheduledAt.split('-').map(Number)
      if (y !== year || m - 1 !== month) {
        setYear(y)
        setMonth(m - 1)
      } else {
        await load()
      }
      setSelectedDay(updated.scheduledAt.slice(0, 10))
    } catch (err) {
      setActionError({ id: appointment.id, message: apiErrorMessage(err).message })
    } finally {
      setBusyId(null)
    }
  }

  const handleCreated = async (appointment: Appointment) => {
    setCreating(false)
    setNotice('Cita agendada.')
    const day = appointment.scheduledAt.slice(0, 10)
    const [y, m] = day.split('-').map(Number)
    setSelectedDay(day)
    if (y !== year || m - 1 !== month) {
      setYear(y)
      setMonth(m - 1)
    } else {
      await load()
    }
  }

  const activeCount = appointments.filter((a) => isActive(a.status)).length

  return (
    <div className="p-8 space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Calendario de citas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }} aria-live="polite">
            {loading ? 'Cargando...' : `${activeCount} ${activeCount === 1 ? 'cita activa' : 'citas activas'} en el mes`}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label htmlFor="filtro-veterinario" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Veterinario
            </label>
            <select
              id="filtro-veterinario"
              value={vetFilter}
              onChange={(e) => setVetFilter(e.target.value)}
              className={INPUT_CLASS + ' cursor-pointer'}
            >
              <option value="">Todos</option>
              {veterinarians.map((v) => <option key={v.id} value={v.id}>{v.firstName} {v.lastName}</option>)}
            </select>
          </div>
          {role === 'SECRETARY' && (
            <button
              type="button"
              onClick={() => { setCreating(true); setNotice('') }}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
            >
              <span aria-hidden="true">+</span> Nueva cita
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p role="status" className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#ecfdf5', color: '#047857' }}>
          {notice}
        </p>
      )}
      {loadError && (
        <p role="alert" className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#b91c1c' }}>
          {loadError}
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Calendario mensual (RF10, CU17) */}
        <div className="col-span-2 rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="Mes anterior"
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              ‹
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {MONTHS[month]} {year}
              </h2>
              <button
                type="button"
                onClick={goToToday}
                className="text-xs px-2.5 py-1 rounded-full cursor-pointer"
                style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}
              >
                Hoy
              </button>
            </div>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="Mes siguiente"
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7" role="grid" aria-label={`${MONTHS[month]} ${year}`}>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} role="columnheader" className="py-2 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`vacio-${i}`} className="min-h-24" style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', background: 'var(--muted)' }} />
              }
              const key = isoDay(year, month, day)
              const items = byDay[key] ?? []
              const selected = key === selectedDay
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  aria-selected={selected}
                  aria-label={`${day} de ${MONTHS[month].toLowerCase()}, ${items.length} ${items.length === 1 ? 'cita' : 'citas'}`}
                  onClick={() => { setSelectedDay(key); setCreating(false) }}
                  className="min-h-24 p-1.5 text-left align-top cursor-pointer transition-colors hover:bg-[#f8faff]"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    outline: selected ? '2px solid var(--primary)' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  <span
                    className="inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold"
                    style={key === todayKey ? { background: 'var(--primary)', color: '#fff' } : { color: 'var(--foreground)' }}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5" aria-hidden="true">
                    {items.slice(0, MAX_BLOCKS_PER_DAY).map((a) => (
                      <div
                        key={a.id}
                        className="truncate rounded px-1 text-[11px] leading-5"
                        style={{
                          ...STATUS_COLORS[a.status],
                          textDecoration: a.status === 'CANCELLED' ? 'line-through' : undefined,
                        }}
                      >
                        {time(a.scheduledAt)} {a.petName}
                      </div>
                    ))}
                    {items.length > MAX_BLOCKS_PER_DAY && (
                      <div className="text-[11px] px-1" style={{ color: 'var(--muted-foreground)' }}>
                        +{items.length - MAX_BLOCKS_PER_DAY} más
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Leyenda de estados */}
          <div className="flex flex-wrap gap-3 px-6 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            {(Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span aria-hidden="true" className="w-3 h-3 rounded" style={{ background: STATUS_COLORS[s].background, border: `1px solid ${STATUS_COLORS[s].color}` }} />
                {APPOINTMENT_STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Panel lateral: citas del día o formulario de agendamiento */}
        <aside className="rounded-xl p-5 space-y-4 self-start" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {creating ? (
            <AppointmentForm
              veterinarians={veterinarians}
              defaultDay={selectedDay}
              onCreated={handleCreated}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {formatDate(selectedDay)}
              </h2>
              {dayAppointments.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Sin citas este día.</p>
              )}
              <ul className="space-y-3">
                {dayAppointments.map((a) => {
                  const actions = availableActions(a.status, role)
                  const isRescheduling = rescheduling?.id === a.id
                  return (
                    <li key={a.id} className="rounded-lg p-3 space-y-2" style={{ border: '1px solid var(--border)', opacity: isActive(a.status) || a.status === 'COMPLETED' ? 1 : 0.75 }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', textDecoration: a.status === 'CANCELLED' ? 'line-through' : undefined }}>
                            {time(a.scheduledAt)} · {a.petName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.ownerName}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={STATUS_COLORS[a.status]}>
                          {APPOINTMENT_STATUS_LABELS[a.status]}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>{a.reason}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Veterinario: {a.veterinarianName} · Agendó: {a.secretaryName}
                      </p>
                      {a.observations && (
                        <p className="text-xs whitespace-pre-line" style={{ color: 'var(--muted-foreground)' }}>{a.observations}</p>
                      )}

                      {isRescheduling && (
                        <div className="space-y-2">
                          <label htmlFor={`reprogramar-${a.id}`} className="block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                            Nueva fecha y hora
                          </label>
                          <input
                            id={`reprogramar-${a.id}`}
                            type="datetime-local"
                            min={nowLocalDateTime()}
                            value={rescheduling.date}
                            onChange={(e) => setRescheduling({ id: a.id, date: e.target.value })}
                            className={INPUT_CLASS}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busyId === a.id}
                              onClick={() => void saveReschedule(a)}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white cursor-pointer disabled:opacity-60"
                              style={{ background: 'var(--primary)' }}
                            >
                              Guardar nueva fecha
                            </button>
                            <button
                              type="button"
                              onClick={() => { setRescheduling(null); setActionError(null) }}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                              style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
                            >
                              Volver
                            </button>
                          </div>
                        </div>
                      )}

                      {!isRescheduling && actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {actions.map((action) => (
                            <button
                              key={action}
                              type="button"
                              disabled={busyId === a.id}
                              onClick={() => void runAction(a, action)}
                              className="text-xs px-2.5 py-1.5 rounded-lg font-medium cursor-pointer disabled:opacity-60"
                              style={
                                action === 'cancel' || action === 'didntShow'
                                  ? { background: '#fef2f2', color: '#b91c1c' }
                                  : { background: 'var(--brand-light)', color: 'var(--primary)' }
                              }
                            >
                              {ACTION_LABELS[action]}
                            </button>
                          ))}
                        </div>
                      )}

                      {actionError?.id === a.id && (
                        <p role="alert" className="text-xs" style={{ color: '#b91c1c' }}>{actionError.message}</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
