import { describe, expect, it } from 'vitest'
import { ownerFormToRequest, petFormToFields, petToForm, validateOwner, validatePet } from '../patientForms'
import type { Pet } from '../../api/types'

describe('validaciones del formulario', () => {
  it('RF3: exige documento, nombres, apellidos y celular', () => {
    const errors = validateOwner({
      documentType: 'CC', documentNumber: '', firstName: '', lastName: '', phone: '', email: '', address: '',
    })
    expect(Object.keys(errors).sort()).toEqual(['documentNumber', 'firstName', 'lastName', 'phone'])
  })

  it('RF3: el correo es opcional, pero si se escribe debe ser válido', () => {
    const base = { documentType: 'CC' as const, documentNumber: '1', firstName: 'A', lastName: 'B', phone: '3', address: '' }
    expect(validateOwner({ ...base, email: '' })).toEqual({})
    expect(validateOwner({ ...base, email: 'no-es-correo' }).email).toBeDefined()
  })

  it('RF4: exige nombre, especie y sexo, y rechaza fechas futuras y pesos no positivos', () => {
    const errors = validatePet(
      { name: '', species: '', breed: '', sex: '', birthDate: '2030-01-01', weight: '0', observations: '' },
      '2026-11-06',
    )
    expect(Object.keys(errors).sort()).toEqual(['birthDate', 'name', 'sex', 'species', 'weight'])
  })

  it('RF4: las observaciones son opcionales y tienen un máximo de 500 caracteres', () => {
    const base = { name: 'Canela', species: 'Perro', breed: '', sex: 'FEMALE' as const, birthDate: '', weight: '' }
    expect(validatePet({ ...base, observations: '' })).toEqual({})
    expect(validatePet({ ...base, observations: 'a'.repeat(500) })).toEqual({})
    expect(validatePet({ ...base, observations: 'a'.repeat(501) }).observations).toBeDefined()
  })
})

describe('conversiones entre formulario y API', () => {
  it('convierte los textos vacíos en null al enviar', () => {
    const req = ownerFormToRequest({
      documentType: 'CC', documentNumber: ' 123 ', firstName: 'Ana', lastName: 'Torres', phone: '300', email: ' ', address: '',
    })
    expect(req).toMatchObject({ documentNumber: '123', email: null, address: null })
  })

  it('un paciente cargado y enviado sin cambios conserva sus datos', () => {
    const pet: Pet = {
      id: 1, ownerId: 10, ownerName: 'Ana Torres', ownerPhone: '300', ownerEmail: null,
      name: 'Canela', species: 'Perro', breed: null, sex: 'FEMALE', birthDate: '2022-01-15',
      weight: 28.5, observations: null, status: 'ACTIVE',
    }
    expect(petFormToFields(petToForm(pet))).toEqual({
      name: 'Canela', species: 'Perro', breed: null, sex: 'FEMALE', birthDate: '2022-01-15',
      weight: 28.5, observations: null,
    })
  })
})
