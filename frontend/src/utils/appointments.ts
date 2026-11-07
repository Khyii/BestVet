import type { AppointmentStatus, Role } from '../api/types'

export type AppointmentAction = 'confirm' | 'cancel' | 'didntShow' | 'reschedule' | 'complete'

export const ACTION_LABELS: Record<AppointmentAction, string> = {
  confirm: 'Confirmar',
  cancel: 'Cancelar cita',
  didntShow: 'No asistió',
  reschedule: 'Reprogramar',
  complete: 'Registrar consulta',
}

/**
 * Acciones disponibles según la tabla de transiciones de RF9 y el actor de cada una:
 * la secretaria confirma, cancela, reprograma y marca inasistencia; el veterinario
 * completa la cita al registrar su consulta (CU16). Cancelada, completada y no asistió
 * son estados finales.
 */
export function availableActions(status: AppointmentStatus, role: Role): AppointmentAction[] {
  if (role === 'SECRETARY') {
    if (status === 'SCHEDULED') return ['confirm', 'reschedule', 'cancel', 'didntShow']
    if (status === 'CONFIRMED') return ['reschedule', 'cancel', 'didntShow']
  }
  if (role === 'VETERINARIAN' && status === 'CONFIRMED') return ['complete']
  return []
}

/** RF10: las citas canceladas se distinguen de las activas. */
export function isActive(status: AppointmentStatus): boolean {
  return status === 'SCHEDULED' || status === 'CONFIRMED'
}
