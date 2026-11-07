import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import PatientProfileView from '../PatientProfileView'
import { getPet, updatePet } from '../../api/pets'
import { getOwner, updateOwner } from '../../api/owners'
import { ApiError } from '../../api/client'
import type { Owner, Pet } from '../../api/types'

vi.mock('../../api/pets', () => ({ getPet: vi.fn(), updatePet: vi.fn() }))
vi.mock('../../api/owners', () => ({ getOwner: vi.fn(), updateOwner: vi.fn() }))

const PET: Pet = {
  id: 1, ownerId: 10, ownerName: 'Ana Torres', ownerPhone: '3001234567', ownerEmail: 'ana@correo.com',
  name: 'Canela', species: 'Perro', breed: 'Labrador', sex: 'FEMALE', birthDate: null,
  weight: 28, observations: 'Alérgica al pollo', status: 'ACTIVE',
}
const OWNER: Owner = {
  id: 10, documentType: 'CC', documentNumber: '1098765432', firstName: 'Ana', lastName: 'Torres',
  phone: '3001234567', email: 'ana@correo.com', address: null,
}

const renderProfile = (canEdit = true) =>
  render(<PatientProfileView patientId={1} canEdit={canEdit} onNavigate={vi.fn()} />)

describe('PatientProfileView', () => {
  beforeEach(() => {
    vi.mocked(getPet).mockReset().mockResolvedValue(PET)
    vi.mocked(getOwner).mockReset().mockResolvedValue(OWNER)
    vi.mocked(updatePet).mockReset()
    vi.mocked(updateOwner).mockReset()
  })

  it('RF7: muestra el celular y el correo del propietario', async () => {
    renderProfile()

    expect(await screen.findByRole('heading', { name: 'Canela' })).toBeInTheDocument()
    expect(screen.getByText('3001234567')).toBeInTheDocument()
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument()
    expect(screen.getByText('Alérgica al pollo')).toBeInTheDocument()
  })

  it('RF7: si el propietario no tiene correo, muestra solo el celular', async () => {
    vi.mocked(getPet).mockResolvedValue({ ...PET, ownerEmail: null })
    renderProfile()

    expect(await screen.findByText('3001234567')).toBeInTheDocument()
    expect(screen.queryByText('Correo electrónico')).not.toBeInTheDocument()
  })

  it('RF5: el veterinario no ve las opciones de edición', async () => {
    renderProfile(false)

    await screen.findByRole('heading', { name: 'Canela' })
    expect(screen.queryByRole('button', { name: 'Editar paciente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar propietario' })).not.toBeInTheDocument()
  })

  it('CU07: cambia el estado del paciente y muestra "Cambios guardados"', async () => {
    vi.mocked(updatePet).mockResolvedValue({ ...PET, status: 'INACTIVE' })
    renderProfile()

    fireEvent.click(await screen.findByRole('button', { name: 'Editar paciente' }))
    fireEvent.change(screen.getByLabelText(/^Estado/), { target: { value: 'INACTIVE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updatePet).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Canela', status: 'INACTIVE' })),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Cambios guardados.')
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('RF5: sin cambios informa el mensaje del backend y no cierra la edición', async () => {
    vi.mocked(updatePet).mockRejectedValue(new ApiError(400, 'No hay cambios para guardar'))
    renderProfile()

    fireEvent.click(await screen.findByRole('button', { name: 'Editar paciente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No hay cambios para guardar')
    expect(screen.getByRole('form', { name: 'Edición del paciente' })).toBeInTheDocument()
  })

  it('CU06: al editar el propietario se actualiza el contacto del perfil', async () => {
    vi.mocked(updateOwner).mockResolvedValue({ ...OWNER, phone: '3119990000' })
    renderProfile()

    fireEvent.click(await screen.findByRole('button', { name: 'Editar propietario' }))
    fireEvent.change(screen.getByLabelText(/^Celular/), { target: { value: '3119990000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('3119990000')).toBeInTheDocument()
    expect(updateOwner).toHaveBeenCalledWith(10, expect.objectContaining({ phone: '3119990000' }))
  })

  it('muestra el error del backend si el paciente no existe', async () => {
    vi.mocked(getPet).mockRejectedValue(new ApiError(404, 'Mascota no encontrada'))
    renderProfile()

    expect(await screen.findByRole('alert')).toHaveTextContent('Mascota no encontrada')
  })
})
