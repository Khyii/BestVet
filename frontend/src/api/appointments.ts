import { apiFetch } from './client'
import type { Appointment, AppointmentRequest, Veterinarian } from './types'

/** RF10 y CU17: citas entre dos fechas (inclusive), opcionalmente de un veterinario. */
export function listAppointments(from: string, to: string, veterinarianId?: number | null): Promise<Appointment[]> {
  const params = new URLSearchParams({ from, to })
  if (veterinarianId) params.set('veterinarianId', String(veterinarianId))
  return apiFetch<Appointment[]>(`/api/appointments?${params.toString()}`)
}

/** RF8 y CU11. */
export function createAppointment(request: AppointmentRequest): Promise<Appointment> {
  return apiFetch<Appointment>('/api/appointments', { method: 'POST', body: JSON.stringify(request) })
}

const patch = (id: number, action: string, body?: unknown) =>
  apiFetch<Appointment>(`/api/appointments/${id}/${action}`, {
    method: 'PATCH',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

/** RF9: CU12, CU13, CU15 y CU14. Una transición no permitida responde 409. */
export const confirmAppointment = (id: number) => patch(id, 'confirm')
export const cancelAppointment = (id: number) => patch(id, 'cancel')
export const markDidntShow = (id: number) => patch(id, 'didnt-show')
export const rescheduleAppointment = (id: number, newDate: string) => patch(id, 'reschedule', { newDate })

/** CU03: veterinarios para agendar y filtrar el calendario. */
export function listVeterinarians(): Promise<Veterinarian[]> {
  return apiFetch<Veterinarian[]>('/api/veterinarians')
}
