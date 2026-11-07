import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import MedicalRecordSection from '../MedicalRecordSection'
import { getMedicalRecord, listVaccines, registerConsultation, registerVaccination } from '../../api/medicalRecord'
import { ApiError } from '../../api/client'
import type { MedicalRecord } from '../../api/types'

vi.mock('../../api/medicalRecord', () => ({
  getMedicalRecord: vi.fn(),
  listVaccines: vi.fn(),
  registerConsultation: vi.fn(),
  registerVaccination: vi.fn(),
}))

const RECORD: MedicalRecord = {
  id: 1, petId: 7, petName: 'Canela', createdAt: '2026-01-10T09:00:00',
  consultations: [{
    id: 3, consultationDate: '2026-11-02T10:30:00', reason: 'Control anual', symptoms: null,
    physicalExamination: null, diagnosis: 'Sano', treatment: null, observations: null,
    veterinarianId: 2, veterinarianName: 'Laura Gómez', appointmentId: null,
  }],
  vaccinations: [{
    id: 4, vaccineId: 1, vaccineName: 'Antirrábica', targetDisease: 'Rabia', applicationDate: '2026-10-15',
    observations: null, veterinarianId: 2, veterinarianName: 'Laura Gómez',
  }],
}

const EMPTY_RECORD: MedicalRecord = { ...RECORD, consultations: [], vaccinations: [] }

describe('MedicalRecordSection', () => {
  beforeEach(() => {
    vi.mocked(getMedicalRecord).mockReset().mockResolvedValue(RECORD)
    vi.mocked(listVaccines).mockReset().mockResolvedValue([{ id: 1, name: 'Antirrábica', targetDisease: 'Rabia', description: null }])
    vi.mocked(registerConsultation).mockReset().mockResolvedValue({} as never)
    vi.mocked(registerVaccination).mockReset().mockResolvedValue({} as never)
  })

  it('RF11 y RF12: muestra las consultas y el esquema de vacunación', async () => {
    render(<MedicalRecordSection petId={7} />)

    expect(await screen.findByText('Control anual')).toBeInTheDocument()
    expect(screen.getByText('Sano')).toBeInTheDocument()
    expect(screen.getByText('No registrado')).toBeInTheDocument() // tratamiento ausente
    expect(screen.getByText('Antirrábica')).toBeInTheDocument()
  })

  it('muestra mensajes cuando la historia está vacía', async () => {
    vi.mocked(getMedicalRecord).mockResolvedValue(EMPTY_RECORD)
    render(<MedicalRecordSection petId={7} />)

    expect(await screen.findByText('No hay consultas registradas.')).toBeInTheDocument()
    expect(screen.getByText('No hay vacunas registradas.')).toBeInTheDocument()
  })

  it('RF11: acota la historia por rango de fechas', async () => {
    render(<MedicalRecordSection petId={7} />)
    await screen.findByText('Control anual')

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-01' } })

    await waitFor(() => expect(getMedicalRecord).toHaveBeenLastCalledWith(7, { from: '2026-11-01', to: '' }))
  })

  it('RF11: alerta si faltan diagnóstico y tratamiento, y guarda solo si se confirma', async () => {
    render(<MedicalRecordSection petId={7} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar consulta' }))

    fireEvent.change(screen.getByLabelText(/^Motivo/), { target: { value: 'Vómito' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar consulta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Falta el diagnóstico y el tratamiento')
    expect(registerConsultation).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar de todos modos' }))

    await waitFor(() =>
      expect(registerConsultation).toHaveBeenCalledWith(7, expect.objectContaining({
        reason: 'Vómito', diagnosis: null, treatment: null, appointmentId: null,
      })),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Consulta guardada.')
  })

  it('RF11: con diagnóstico y tratamiento guarda sin alerta', async () => {
    render(<MedicalRecordSection petId={7} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar consulta' }))

    fireEvent.change(screen.getByLabelText(/^Motivo/), { target: { value: 'Vómito' } })
    fireEvent.change(screen.getByLabelText('Diagnóstico'), { target: { value: 'Gastritis' } })
    fireEvent.change(screen.getByLabelText('Tratamiento y medicación'), { target: { value: 'Dieta blanda' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar consulta' }))

    await waitFor(() => expect(registerConsultation).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(/¿Desea guardar la consulta de todos modos\?/)).not.toBeInTheDocument()
  })

  it('RF12: registra una vacuna del catálogo', async () => {
    render(<MedicalRecordSection petId={7} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar vacuna' }))

    await screen.findByRole('option', { name: 'Antirrábica (Rabia)' })
    fireEvent.change(screen.getByLabelText(/^Vacuna/), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar vacuna' }))

    await waitFor(() => expect(registerVaccination).toHaveBeenCalledWith(7, expect.objectContaining({ vaccineId: 1 })))
    expect(await screen.findByRole('status')).toHaveTextContent('Vacuna registrada.')
  })

  it('muestra el error del backend si el rango es inválido', async () => {
    vi.mocked(getMedicalRecord).mockRejectedValue(
      new ApiError(400, 'La fecha inicial no puede ser posterior a la fecha final'),
    )
    render(<MedicalRecordSection petId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha inicial no puede ser posterior a la fecha final')
  })

  it('CU16: desde una cita abre la consulta con su motivo y la liga al guardar', async () => {
    const origin = {
      id: 9, petId: 7, petName: 'Canela', ownerName: 'Ana Torres', veterinarianId: 2, veterinarianName: 'Laura Gómez',
      secretaryId: 5, secretaryName: 'Marta Ruiz', scheduledAt: '2026-11-07T15:00:00', reason: 'Control de piel',
      status: 'CONFIRMED' as const, observations: null,
    }
    const onHandled = vi.fn()
    render(<MedicalRecordSection petId={7} origin={origin} onOriginHandled={onHandled} />)

    expect(await screen.findByLabelText(/^Motivo/)).toHaveValue('Control de piel')
    expect(screen.getByText(/la cita quedará completada/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Diagnóstico'), { target: { value: 'Dermatitis' } })
    fireEvent.change(screen.getByLabelText('Tratamiento y medicación'), { target: { value: 'Champú medicado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar consulta' }))

    await waitFor(() =>
      expect(registerConsultation).toHaveBeenCalledWith(7, expect.objectContaining({ appointmentId: 9 })),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('La cita quedó completada.')
    expect(onHandled).toHaveBeenCalled()
  })
})
