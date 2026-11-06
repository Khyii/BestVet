import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import PatientFormView, { validateOwner, validatePet } from '../PatientFormView'
import { createOwner, listOwners } from '../../api/owners'
import { createPet } from '../../api/pets'
import { ApiError } from '../../api/client'
import type { Owner } from '../../api/types'

vi.mock('../../api/owners', () => ({ listOwners: vi.fn(), createOwner: vi.fn() }))
vi.mock('../../api/pets', () => ({ createPet: vi.fn() }))

const OWNER: Owner = {
  id: 10, documentType: 'CC', documentNumber: '1098765432', firstName: 'Ana', lastName: 'Torres',
  phone: '3001234567', email: null, address: null,
}

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } })

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
      { name: '', species: '', breed: '', sex: '', birthDate: '2030-01-01', weight: '0' },
      '2026-11-06',
    )
    expect(Object.keys(errors).sort()).toEqual(['birthDate', 'name', 'sex', 'species', 'weight'])
  })
})

describe('PatientFormView', () => {
  beforeEach(() => {
    vi.mocked(listOwners).mockReset().mockResolvedValue([OWNER])
    vi.mocked(createOwner).mockReset()
    vi.mocked(createPet).mockReset()
  })

  it('RF4: no guarda el paciente si no se ha elegido propietario', async () => {
    render(<PatientFormView onNavigate={vi.fn()} />)

    type('Nombre', 'Canela')
    type('Especie', 'Perro')
    fireEvent.change(screen.getByLabelText(/^Sexo/), { target: { value: 'FEMALE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar paciente' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('debe registrarse primero')
    expect(createPet).not.toHaveBeenCalled()
  })

  it('CU05: busca un propietario existente y registra el paciente asociado', async () => {
    vi.mocked(createPet).mockResolvedValue({} as never)
    render(<PatientFormView onNavigate={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Buscar propietario'), { target: { value: 'torres' } })
    fireEvent.click(await screen.findByRole('button', { name: /Ana Torres/ }))
    type('Nombre', 'Canela')
    type('Especie', 'Perro')
    fireEvent.change(screen.getByLabelText(/^Sexo/), { target: { value: 'FEMALE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar paciente' }))

    await waitFor(() =>
      expect(createPet).toHaveBeenCalledWith({
        ownerId: 10, name: 'Canela', species: 'Perro', breed: null, sex: 'FEMALE', birthDate: null, weight: null,
      }),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Paciente registrado correctamente')
  })

  it('CU04: registra un propietario nuevo y lo deja seleccionado', async () => {
    vi.mocked(listOwners).mockResolvedValue([])
    vi.mocked(createOwner).mockResolvedValue({ ...OWNER, id: 11, firstName: 'Luis', lastName: 'Gómez' })
    render(<PatientFormView onNavigate={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Registrar nuevo propietario/ }))
    type('Número de documento', '123')
    type('Nombres', 'Luis')
    type('Apellidos', 'Gómez')
    type('Celular', '3009998888')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar propietario' }))

    expect(await screen.findByText('Luis Gómez')).toBeInTheDocument()
    expect(createOwner).toHaveBeenCalledWith(expect.objectContaining({ documentNumber: '123', email: null, address: null }))
  })

  it('RF3: informa el documento repetido con el mensaje del backend', async () => {
    vi.mocked(createOwner).mockRejectedValue(new ApiError(409, 'Ya existe un dueño con este documento'))
    render(<PatientFormView onNavigate={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Registrar nuevo propietario/ }))
    type('Número de documento', '1098765432')
    type('Nombres', 'Ana')
    type('Apellidos', 'Torres')
    type('Celular', '3001234567')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar propietario' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un dueño con este documento')
  })
})
