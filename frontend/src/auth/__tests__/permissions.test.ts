import { describe, expect, it } from 'vitest'
import { canManagePatients, canOpen, canUseMedicalRecord, homeView } from '../permissions'

describe('permisos por rol', () => {
  it('la secretaria registra pacientes pero el veterinario no', () => {
    expect(canOpen('SECRETARY', 'patient-form')).toBe(true)
    expect(canOpen('VETERINARIAN', 'patient-form')).toBe(false)
  })

  it('ambos roles clínicos acceden a pacientes y citas', () => {
    for (const role of ['SECRETARY', 'VETERINARIAN'] as const) {
      expect(canOpen(role, 'dashboard')).toBe(true)
      expect(canOpen(role, 'calendar')).toBe(true)
    }
  })

  it('el administrador no tiene vistas en esta versión', () => {
    expect(homeView('ADMIN')).toBeNull()
    expect(canOpen('ADMIN', 'dashboard')).toBe(false)
  })

  it('solo la secretaria registra y edita propietarios y pacientes (RF3, RF4, RF5)', () => {
    expect(canManagePatients('SECRETARY')).toBe(true)
    expect(canManagePatients('VETERINARIAN')).toBe(false)
    expect(canManagePatients('ADMIN')).toBe(false)
  })

  it('solo el veterinario usa la historia clínica (RF11, RF12)', () => {
    expect(canUseMedicalRecord('VETERINARIAN')).toBe(true)
    expect(canUseMedicalRecord('SECRETARY')).toBe(false)
    expect(canUseMedicalRecord('ADMIN')).toBe(false)
  })
})
