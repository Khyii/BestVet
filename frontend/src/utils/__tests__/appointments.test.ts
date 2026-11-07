import { describe, expect, it } from 'vitest'
import { availableActions, isActive } from '../appointments'

describe('availableActions (tabla de transiciones de RF9)', () => {
  it('la secretaria confirma, reprograma, cancela o marca inasistencia en una cita programada', () => {
    expect(availableActions('SCHEDULED', 'SECRETARY')).toEqual(['confirm', 'reschedule', 'cancel', 'didntShow'])
  })

  it('una cita confirmada ya no se puede confirmar', () => {
    expect(availableActions('CONFIRMED', 'SECRETARY')).toEqual(['reschedule', 'cancel', 'didntShow'])
  })

  it('el veterinario solo completa citas confirmadas (CU16)', () => {
    expect(availableActions('CONFIRMED', 'VETERINARIAN')).toEqual(['complete'])
    expect(availableActions('SCHEDULED', 'VETERINARIAN')).toEqual([])
  })

  it('cancelada, completada y no asistió son estados finales', () => {
    for (const status of ['CANCELLED', 'COMPLETED', 'DIDNT_SHOW'] as const) {
      expect(availableActions(status, 'SECRETARY')).toEqual([])
      expect(availableActions(status, 'VETERINARIAN')).toEqual([])
    }
  })

  it('el administrador no gestiona citas', () => {
    expect(availableActions('SCHEDULED', 'ADMIN')).toEqual([])
  })
})

describe('isActive', () => {
  it('solo las citas programadas y confirmadas están activas', () => {
    expect(isActive('SCHEDULED')).toBe(true)
    expect(isActive('CONFIRMED')).toBe(true)
    expect(isActive('CANCELLED')).toBe(false)
    expect(isActive('COMPLETED')).toBe(false)
    expect(isActive('DIDNT_SHOW')).toBe(false)
  })
})
