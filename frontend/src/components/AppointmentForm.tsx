import { useEffect, useState } from 'react'
import { createAppointment } from '../api/appointments'
import { searchPets } from '../api/pets'
import { PET_STATUS_LABELS, type Appointment, type Pet, type Veterinarian } from '../api/types'
import {
  EMPTY_APPOINTMENT,
  appointmentFormToRequest,
  maxAppointmentDateTime,
  validateAppointment,
  type AppointmentForm as Form,
} from '../forms/appointmentForms'
import { apiErrorMessage, type Errors } from '../forms/patientForms'
import { nowLocalDateTime } from '../utils/dates'
import Field, { INPUT_CLASS, fieldAria } from './Field'

const PRIMARY_BUTTON = 'px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
const SECONDARY_BUTTON = 'px-4 py-2 rounded-lg text-sm font-medium cursor-pointer'
const MAX_MATCHES = 6

interface AppointmentFormProps {
  veterinarians: Veterinarian[]
  /** Día seleccionado en el calendario (AAAA-MM-DD), para proponer la fecha. */
  defaultDay: string
  onCreated: (appointment: Appointment) => void
  onCancel: () => void
}

/** CU11: agendar cita. Incluye la búsqueda de paciente (CU08) y la elección de veterinario (CU03). */
export default function AppointmentForm({ veterinarians, defaultDay, onCreated, onCancel }: AppointmentFormProps) {
  const proposed = `${defaultDay}T09:00`
  const [form, setForm] = useState<Form>({
    ...EMPTY_APPOINTMENT,
    scheduledAt: proposed > nowLocalDateTime() ? proposed : '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // CU08: búsqueda del paciente por nombre en el backend.
  useEffect(() => {
    if (!query.trim()) { setMatches([]); return }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchPets({ q: query }, controller.signal)
        .then((pets) => setMatches(pets.slice(0, MAX_MATCHES)))
        .catch(() => { if (!controller.signal.aborted) setMatches([]) })
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const choosePet = (pet: Pet) => {
    setSelectedPet(pet)
    setForm((f) => ({ ...f, petId: pet.id }))
    setErrors((e) => ({ ...e, petId: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateAppointment(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setMessage('Revise los campos marcados.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      onCreated(await createAppointment(appointmentFormToRequest(form)))
    } catch (err) {
      // Incluye el horario ocupado del veterinario y el paciente inactivo (409).
      const { message: text, fields } = apiErrorMessage(err)
      setMessage(text)
      setErrors(fields)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Agendar cita">
      <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
        Agendar cita
      </h3>

      {/* Paciente */}
      {selectedPet ? (
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: 'var(--brand-light)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPet.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selectedPet.species} · {selectedPet.ownerName}</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedPet(null); setForm((f) => ({ ...f, petId: null })) }}
            className="text-xs px-2.5 py-1 rounded-lg font-medium cursor-pointer"
            style={{ background: 'var(--card)', color: 'var(--primary)' }}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <Field id="cita-paciente" label="Paciente" required error={errors.petId}>
          <input
            {...fieldAria('cita-paciente', errors.petId)}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre"
            className={INPUT_CLASS}
          />
          {matches.length > 0 && (
            <ul className="mt-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {matches.map((p) => {
                // RF8: no se agendan citas a pacientes inactivos ni fallecidos.
                const active = p.status === 'ACTIVE'
                return (
                  <li key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      disabled={!active}
                      onClick={() => choosePet(p)}
                      className="w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>{p.name}</span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {p.ownerName}{active ? '' : ` · ${PET_STATUS_LABELS[p.status]}`}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {query.trim() && matches.length === 0 && (
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Ningún paciente encontrado. Si no está registrado, regístrelo primero desde el panel de pacientes.
            </p>
          )}
        </Field>
      )}

      <Field id="cita-veterinario" label="Veterinario" required error={errors.veterinarianId}>
        <select
          {...fieldAria('cita-veterinario', errors.veterinarianId)}
          value={form.veterinarianId}
          onChange={set('veterinarianId')}
          className={INPUT_CLASS + ' cursor-pointer'}
        >
          <option value="">Seleccionar...</option>
          {veterinarians.map((v) => <option key={v.id} value={v.id}>{v.firstName} {v.lastName}</option>)}
        </select>
      </Field>

      <Field id="cita-fecha" label="Fecha y hora" required error={errors.scheduledAt}>
        <input
          {...fieldAria('cita-fecha', errors.scheduledAt)}
          type="datetime-local"
          min={nowLocalDateTime()}
          max={maxAppointmentDateTime()}
          value={form.scheduledAt}
          onChange={set('scheduledAt')}
          className={INPUT_CLASS}
        />
      </Field>

      <Field id="cita-motivo" label="Motivo" required error={errors.reason}>
        <input {...fieldAria('cita-motivo', errors.reason)} type="text" value={form.reason} onChange={set('reason')} className={INPUT_CLASS} />
      </Field>

      <Field id="cita-observaciones" label="Observaciones" error={errors.observations}>
        <textarea
          {...fieldAria('cita-observaciones', errors.observations)}
          value={form.observations}
          onChange={set('observations')}
          rows={2}
          className={INPUT_CLASS + ' resize-none'}
        />
      </Field>

      {message && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{message}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={PRIMARY_BUTTON} style={{ background: 'var(--primary)' }}>
          {saving ? 'Guardando...' : 'Agendar'}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON} style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
