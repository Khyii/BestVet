import { describe, expect, it } from 'vitest'
import { EMPTY_STAFF, staffFormToRequest, validateStaff, type StaffForm } from '../staffForms'

const VETERINARIO: StaffForm = {
  ...EMPTY_STAFF,
  documentNumber: '1098', firstName: 'Laura', lastName: 'Gómez', email: 'laura@bestvet.co', phone: '3001234567',
  licenceNumber: 'TP-123', username: 'lgomez', password: 'clave1234', passwordConfirmation: 'clave1234',
}

describe('validateStaff (RF2, CU02)', () => {
  it('acepta un veterinario completo', () => {
    expect(validateStaff(VETERINARIO)).toEqual({})
  })

  it('exige la tarjeta profesional solo al veterinario', () => {
    expect(validateStaff({ ...VETERINARIO, licenceNumber: '' }).licenceNumber).toBeDefined()
    expect(validateStaff({ ...VETERINARIO, kind: 'SECRETARY', licenceNumber: '' })).toEqual({})
  })

  it('exige una contraseña de al menos 8 caracteres, como el backend', () => {
    expect(validateStaff({ ...VETERINARIO, password: 'corta12', passwordConfirmation: 'corta12' }).password)
      .toContain('al menos 8')
    expect(validateStaff({ ...VETERINARIO, password: '12345678', passwordConfirmation: '12345678' })).toEqual({})
  })

  it('rechaza una confirmación distinta de la contraseña', () => {
    expect(validateStaff({ ...VETERINARIO, passwordConfirmation: 'otra1234' }).passwordConfirmation)
      .toBe('Las contraseñas no coinciden.')
  })

  it('rechaza correos inválidos y usuarios con espacios', () => {
    const errores = validateStaff({ ...VETERINARIO, email: 'sin-arroba', username: 'laura gomez' })
    expect(Object.keys(errores).sort()).toEqual(['email', 'username'])
  })
})

describe('staffFormToRequest', () => {
  it('no envía la confirmación y solo incluye la tarjeta profesional del veterinario', () => {
    const vet = staffFormToRequest(VETERINARIO)
    expect(vet).toMatchObject({ username: 'lgomez', licenceNumber: 'TP-123' })
    expect(vet).not.toHaveProperty('passwordConfirmation')

    const secretaria = staffFormToRequest({ ...VETERINARIO, kind: 'SECRETARY' })
    expect(secretaria).not.toHaveProperty('licenceNumber')
  })
})
