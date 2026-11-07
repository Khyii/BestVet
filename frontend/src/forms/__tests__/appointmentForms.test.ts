import { describe, expect, it } from 'vitest'
import {
  FUTURE_REQUIRED,
  TOO_FAR_AHEAD,
  maxAppointmentDateTime,
  validateAppointment,
  validateReschedule,
  type AppointmentForm,
} from '../appointmentForms'

const NOW = '2026-11-07T10:00'
const CITA: AppointmentForm = {
  petId: 1, veterinarianId: '2', scheduledAt: '2026-11-10T09:00', reason: 'Vacunación', observations: '',
}

describe('validateAppointment (RF8)', () => {
  it('acepta una cita completa en el futuro', () => {
    expect(validateAppointment(CITA, NOW)).toEqual({})
  })

  it('exige paciente, veterinario, fecha y motivo', () => {
    const errores = validateAppointment({ petId: null, veterinarianId: '', scheduledAt: '', reason: ' ', observations: '' }, NOW)
    expect(Object.keys(errores).sort()).toEqual(['petId', 'reason', 'scheduledAt', 'veterinarianId'])
  })

  it('rechaza fechas pasadas y la hora actual', () => {
    expect(validateAppointment({ ...CITA, scheduledAt: '2026-11-06T09:00' }, NOW).scheduledAt).toBe(FUTURE_REQUIRED)
    expect(validateAppointment({ ...CITA, scheduledAt: NOW }, NOW).scheduledAt).toBe(FUTURE_REQUIRED)
  })

  it('acepta exactamente 2 meses y rechaza un minuto después', () => {
    expect(maxAppointmentDateTime(NOW)).toBe('2027-01-07T10:00')
    expect(validateAppointment({ ...CITA, scheduledAt: '2027-01-07T10:00' }, NOW)).toEqual({})
    expect(validateAppointment({ ...CITA, scheduledAt: '2027-01-07T10:01' }, NOW).scheduledAt).toBe(TOO_FAR_AHEAD)
  })
})

describe('validateReschedule (CU14)', () => {
  it('exige una fecha futura', () => {
    expect(validateReschedule('2026-11-08T09:00', NOW)).toBeNull()
    expect(validateReschedule('2026-11-07T09:00', NOW)).toBe(FUTURE_REQUIRED)
    expect(validateReschedule('', NOW)).not.toBeNull()
  })

  it('rechaza una nueva fecha a más de 2 meses', () => {
    expect(validateReschedule('2027-01-08T09:00', NOW)).toBe(TOO_FAR_AHEAD)
  })
})
