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

  it('el administrador solo accede al módulo de personal (RF2)', () => {
    expect(homeView('ADMIN')).toBe('staff')
    expect(canOpen('ADMIN', 'dashboard')).toBe(false)
    expect(canOpen('ADMIN', 'calendar')).toBe(false)
  })

  it('la secretaria y el veterinario no acceden al módulo de personal', () => {
    expect(canOpen('SECRETARY', 'staff')).toBe(false)
    expect(canOpen('VETERINARIAN', 'staff')).toBe(false)
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
