import type { AppointmentRequest } from '../api/types'
import { addMonthsLocal, nowLocalDateTime } from '../utils/dates'
import { blankToNull, type Errors } from './patientForms'

/** Formulario para agendar una cita (RF8, CU11). */
export interface AppointmentForm {
  petId: number | null
  veterinarianId: string // valor del <select>; vacío si no se ha elegido
  scheduledAt: string // AAAA-MM-DDTHH:mm (campo datetime-local)
  reason: string
  observations: string
}

export const EMPTY_APPOINTMENT: AppointmentForm = {
  petId: null, veterinarianId: '', scheduledAt: '', reason: '', observations: '',
}

const REQUIRED = 'Este campo es obligatorio.'
export const FUTURE_REQUIRED = 'La fecha y hora deben ser posteriores al momento actual.'

/** RF8: las citas se agendan como máximo a 2 meses de la fecha actual (mismo límite que el backend). */
export const MAX_MONTHS_AHEAD = 2
export const TOO_FAR_AHEAD = `No se pueden agendar citas a más de ${MAX_MONTHS_AHEAD} meses.`

/** Fecha y hora máximas para agendar o reprogramar, en el formato del campo datetime-local. */
export function maxAppointmentDateTime(now: string = nowLocalDateTime()): string {
  return addMonthsLocal(now, MAX_MONTHS_AHEAD)
}

/**
 * RF8: paciente, veterinario, fecha futura y motivo son obligatorios, y la fecha
 * no puede superar el límite de 2 meses. Todas las fechas usan el mismo formato,
 * así que se comparan como texto.
 */
export function validateAppointment(f: AppointmentForm, now: string = nowLocalDateTime()): Errors {
  const e: Errors = {}
  if (f.petId === null) e.petId = 'Seleccione el paciente.'
  if (!f.veterinarianId) e.veterinarianId = REQUIRED
  if (!f.scheduledAt) e.scheduledAt = REQUIRED
  else if (f.scheduledAt <= now) e.scheduledAt = FUTURE_REQUIRED
  else if (f.scheduledAt > maxAppointmentDateTime(now)) e.scheduledAt = TOO_FAR_AHEAD
  if (!f.reason.trim()) e.reason = REQUIRED
  return e
}

/** CU14: la nueva fecha debe cumplir el mismo rango que al agendar (reprogramar aplica de nuevo las reglas de RF8). */
export function validateReschedule(newDate: string, now: string = nowLocalDateTime()): string | null {
  if (!newDate) return REQUIRED
  if (newDate <= now) return FUTURE_REQUIRED
  if (newDate > maxAppointmentDateTime(now)) return TOO_FAR_AHEAD
  return null
}

export function appointmentFormToRequest(f: AppointmentForm): AppointmentRequest {
  return {
    petId: f.petId as number,
    veterinarianId: Number(f.veterinarianId),
    scheduledAt: f.scheduledAt,
    reason: f.reason.trim(),
    observations: blankToNull(f.observations),
  }
}
