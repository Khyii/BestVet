import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import DashboardView from '../DashboardView'
import { searchPets } from '../../api/pets'
import { ApiError } from '../../api/client'
import type { Pet } from '../../api/types'

vi.mock('../../api/pets', () => ({ searchPets: vi.fn() }))
const searchMock = vi.mocked(searchPets)

const PET: Pet = {
  id: 1, ownerId: 10, ownerName: 'Ana Torres', ownerPhone: '3001234567', ownerEmail: null,
  name: 'Canela', species: 'Perro', breed: 'Labrador', sex: 'FEMALE',
  birthDate: null, weight: 28, status: 'ACTIVE',
}

const renderDashboard = (canRegister = true) =>
  render(<DashboardView canRegister={canRegister} onNavigate={vi.fn()} onSelectPatient={vi.fn()} />)

describe('DashboardView', () => {
  beforeEach(() => {
    searchMock.mockReset()
  })

  it('lista los pacientes que devuelve el backend', async () => {
    searchMock.mockResolvedValue([PET])
    renderDashboard()

    expect(await screen.findByText('Canela')).toBeInTheDocument()
    expect(screen.getByText('Ana Torres')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText(/1 paciente encontrado/)).toBeInTheDocument()
  })

  it('muestra "Ningún paciente encontrado" sin coincidencias', async () => {
    searchMock.mockResolvedValue([])
    renderDashboard()

    expect(await screen.findByText('Ningún paciente encontrado')).toBeInTheDocument()
  })

  it('envía el texto y los filtros combinados al backend', async () => {
    searchMock.mockResolvedValue([])
    renderDashboard()
    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByLabelText('Nombre del paciente'), { target: { value: 'can' } })
    fireEvent.change(screen.getByLabelText('Raza'), { target: { value: 'lab' } })
    fireEvent.change(screen.getByLabelText('Edad mín.'), { target: { value: '2' } })

    await waitFor(() =>
      expect(searchMock).toHaveBeenLastCalledWith(
        { q: 'can', breed: 'lab', owner: '', minAge: 2, maxAge: undefined },
        expect.any(AbortSignal),
      ),
    )
  })

  it('muestra el mensaje de error del backend', async () => {
    searchMock.mockRejectedValue(new ApiError(400, 'La edad mínima no puede ser mayor que la edad máxima'))
    renderDashboard()

    expect(await screen.findByRole('alert')).toHaveTextContent('La edad mínima no puede ser mayor que la edad máxima')
  })

  it('solo muestra "Nuevo paciente" a quien puede registrar', async () => {
    searchMock.mockResolvedValue([])
    const { unmount } = renderDashboard(true)
    expect(screen.getByRole('button', { name: /Nuevo paciente/ })).toBeInTheDocument()
    unmount()

    renderDashboard(false)
    expect(screen.queryByRole('button', { name: /Nuevo paciente/ })).not.toBeInTheDocument()
  })
})
