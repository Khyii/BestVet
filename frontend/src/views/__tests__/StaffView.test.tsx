import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import StaffView from '../StaffView'
import { createSecretary, createVeterinarian, listSecretaries, listVeterinarians } from '../../api/staff'
import { ApiError } from '../../api/client'

vi.mock('../../api/staff', () => ({
  listVeterinarians: vi.fn(),
  listSecretaries: vi.fn(),
  createVeterinarian: vi.fn(),
  createSecretary: vi.fn(),
}))

const VET = {
  id: 2, documentType: 'CC' as const, documentNumber: '1098', firstName: 'Laura', lastName: 'Gómez',
  email: 'laura@bestvet.co', phone: '300', licenseNumber: 'TP-123',
}

const fill = (fields: Record<string, string>) => {
  for (const [label, value] of Object.entries(fields)) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } })
  }
}

const DATOS = {
  'Número de documento': '2045', Nombres: 'Marta', Apellidos: 'Ruiz', 'Correo electrónico': 'marta@bestvet.co',
  Celular: '3110000000', 'Nombre de usuario': 'mruiz', 'Contraseña inicial': 'clave1234', 'Confirmar contraseña': 'clave1234',
}

describe('StaffView', () => {
  beforeEach(() => {
    vi.mocked(listVeterinarians).mockReset().mockResolvedValue([VET])
    vi.mocked(listSecretaries).mockReset().mockResolvedValue([])
    vi.mocked(createVeterinarian).mockReset().mockResolvedValue(VET)
    vi.mocked(createSecretary).mockReset().mockResolvedValue({ ...VET, id: 5 })
  })

  it('CU03: lista el personal registrado', async () => {
    render(<StaffView />)

    expect(await screen.findByText('Laura Gómez')).toBeInTheDocument()
    expect(screen.getByText('TP-123')).toBeInTheDocument()
    expect(screen.getByText('No hay secretarias registradas')).toBeInTheDocument()
  })

  it('CU03: muestra el mensaje cuando no hay veterinarios', async () => {
    vi.mocked(listVeterinarians).mockResolvedValue([])
    render(<StaffView />)

    expect(await screen.findByText('No hay veterinarios registrados')).toBeInTheDocument()
  })

  it('CU02: registra una secretaria sin pedir tarjeta profesional', async () => {
    render(<StaffView />)
    await screen.findByText('Laura Gómez')

    fireEvent.click(screen.getByLabelText('Secretaria'))
    expect(screen.queryByLabelText(/^Tarjeta profesional/)).not.toBeInTheDocument()
    fill(DATOS)
    fireEvent.click(screen.getByRole('button', { name: 'Registrar secretaria' }))

    await waitFor(() => expect(createSecretary).toHaveBeenCalledWith(expect.objectContaining({ username: 'mruiz' })))
    expect(createVeterinarian).not.toHaveBeenCalled()
    expect(await screen.findByRole('status')).toHaveTextContent('Ya puede iniciar sesión con el usuario "mruiz"')
  })

  it('CU02: el veterinario exige la tarjeta profesional', async () => {
    render(<StaffView />)
    await screen.findByText('Laura Gómez')

    fill(DATOS)
    fireEvent.click(screen.getByRole('button', { name: 'Registrar veterinario' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Revise los campos marcados.')
    expect(createVeterinarian).not.toHaveBeenCalled()
  })

  it('CU02: informa el documento o usuario repetido con el mensaje del backend', async () => {
    vi.mocked(createVeterinarian).mockRejectedValue(new ApiError(409, 'El nombre de usuario ya está en uso.'))
    render(<StaffView />)
    await screen.findByText('Laura Gómez')

    fill({ ...DATOS, 'Tarjeta profesional': 'TP-999' })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar veterinario' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El nombre de usuario ya está en uso.')
  })
})
