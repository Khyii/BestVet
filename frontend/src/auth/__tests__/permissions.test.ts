import { describe, expect, it } from 'vitest'
import { canOpen, homeView } from '../permissions'

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
})
