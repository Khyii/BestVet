import type { AppointmentRequest } from '../api/types'
import { nowLocalDateTime } from '../utils/dates'
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

/**
 * RF8: paciente, veterinario, fecha futura y motivo son obligatorios.
 * Ambas fechas usan el mismo formato, así que se comparan como texto.
 */
export function validateAppointment(f: AppointmentForm, now: string = nowLocalDateTime()): Errors {
  const e: Errors = {}
  if (f.petId === null) e.petId = 'Seleccione el paciente.'
  if (!f.veterinarianId) e.veterinarianId = REQUIRED
  if (!f.scheduledAt) e.scheduledAt = REQUIRED
  else if (f.scheduledAt <= now) e.scheduledAt = FUTURE_REQUIRED
  if (!f.reason.trim()) e.reason = REQUIRED
  return e
}

/** CU14: la nueva fecha también debe ser futura (reprogramar aplica de nuevo las reglas de RF8). */
export function validateReschedule(newDate: string, now: string = nowLocalDateTime()): string | null {
  if (!newDate) return REQUIRED
  if (newDate <= now) return FUTURE_REQUIRED
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
