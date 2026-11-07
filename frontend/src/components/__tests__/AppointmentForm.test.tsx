import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import AppointmentForm from '../AppointmentForm'
import { createAppointment } from '../../api/appointments'
import { searchPets } from '../../api/pets'
import { ApiError } from '../../api/client'
import type { Pet, Veterinarian } from '../../api/types'

vi.mock('../../api/appointments', () => ({ createAppointment: vi.fn() }))
vi.mock('../../api/pets', () => ({ searchPets: vi.fn() }))

const PET: Pet = {
  id: 7, ownerId: 10, ownerName: 'Ana Torres', ownerPhone: '300', ownerEmail: null, name: 'Canela',
  species: 'Perro', breed: null, sex: 'FEMALE', birthDate: null, weight: null, observations: null, status: 'ACTIVE',
}
const VETS: Veterinarian[] = [{
  id: 2, documentType: 'CC', documentNumber: '1', firstName: 'Laura', lastName: 'Gómez',
  email: null, phone: null, licenseNumber: null,
}]

const renderForm = (onCreated = vi.fn()) =>
  render(<AppointmentForm veterinarians={VETS} defaultDay="2026-11-10" onCreated={onCreated} onCancel={vi.fn()} />)

describe('AppointmentForm (CU11)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 7, 10, 0))
    vi.mocked(searchPets).mockReset().mockResolvedValue([PET, { ...PET, id: 8, name: 'Copito', status: 'DECEASED' }])
    vi.mocked(createAppointment).mockReset()
  })

  afterEach(() => vi.useRealTimers())

  // Llena el formulario; el envío se hace en cada prueba, justo antes de esperar el resultado,
  // para que la respuesta del backend simulado ocurra mientras la prueba la está esperando.
  const fill = async () => {
    fireEvent.change(screen.getByLabelText(/^Paciente/), { target: { value: 'ca' } })
    fireEvent.click(await screen.findByRole('button', { name: /Canela/ }))
    fireEvent.change(screen.getByLabelText(/^Veterinario/), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/^Motivo/), { target: { value: 'Vacunación' } })
  }
  const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Agendar' }))

  it('RF8: no permite elegir pacientes inactivos o fallecidos', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/^Paciente/), { target: { value: 'co' } })

    expect(await screen.findByRole('button', { name: /Copito/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Canela/ })).toBeEnabled()
  })

  it('agenda la cita en la fecha propuesta del día seleccionado', async () => {
    const created = { id: 1 } as never
    vi.mocked(createAppointment).mockResolvedValue(created)
    const onCreated = vi.fn()
    renderForm(onCreated)

    await fill()
    submit()

    await waitFor(() => expect(createAppointment).toHaveBeenCalledWith({
      petId: 7, veterinarianId: 2, scheduledAt: '2026-11-10T09:00', reason: 'Vacunación', observations: null,
    }))
    expect(onCreated).toHaveBeenCalledWith(created)
  })

  it('RF8: muestra el horario ocupado que informa el backend', async () => {
    vi.mocked(createAppointment).mockRejectedValue(new ApiError(409, 'El veterinario ya tiene una cita a esa hora'))
    renderForm()

    await fill()
    submit()

    expect(await screen.findByRole('alert')).toHaveTextContent('El veterinario ya tiene una cita a esa hora')
  })
})
