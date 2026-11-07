import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import CalendarView from '../CalendarView'
import {
  cancelAppointment,
  confirmAppointment,
  listAppointments,
  listVeterinarians,
  markDidntShow,
  rescheduleAppointment,
} from '../../api/appointments'
import { ApiError } from '../../api/client'
import type { Appointment } from '../../api/types'

vi.mock('../../api/appointments', () => ({
  listAppointments: vi.fn(),
  listVeterinarians: vi.fn(),
  createAppointment: vi.fn(),
  confirmAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
  markDidntShow: vi.fn(),
  rescheduleAppointment: vi.fn(),
}))

const BASE: Appointment = {
  id: 1, petId: 7, petName: 'Canela', ownerName: 'Ana Torres', veterinarianId: 2, veterinarianName: 'Laura Gómez',
  secretaryId: 5, secretaryName: 'Marta Ruiz', scheduledAt: '2026-11-07T15:00:00', reason: 'Vacunación',
  status: 'SCHEDULED', observations: null,
}

const renderCalendar = (role: 'SECRETARY' | 'VETERINARIAN' = 'SECRETARY', onStart = vi.fn()) =>
  render(<CalendarView role={role} staffId={role === 'VETERINARIAN' ? 2 : 5} onStartConsultation={onStart} />)

describe('CalendarView', () => {
  beforeEach(() => {
    // El calendario abre el mes actual: se fija "hoy" en el 7 de noviembre de 2026.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 7, 10, 0))
    vi.mocked(listAppointments).mockReset().mockResolvedValue([BASE])
    vi.mocked(listVeterinarians).mockReset().mockResolvedValue([])
    for (const fn of [confirmAppointment, cancelAppointment, markDidntShow, rescheduleAppointment]) {
      vi.mocked(fn).mockReset().mockResolvedValue(BASE)
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('RF10: pide las citas del mes actual y muestra un bloque por cita', async () => {
    renderCalendar()

    expect(await screen.findByText('15:00 · Canela')).toBeInTheDocument()
    expect(listAppointments).toHaveBeenCalledWith('2026-11-01', '2026-11-30', null)
    expect(screen.getByText(/Veterinario: Laura Gómez/)).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: '7 de noviembre, 1 cita' })).toBeInTheDocument()
  })

  it('RF10: navega al mes siguiente', async () => {
    renderCalendar()
    await screen.findByText('15:00 · Canela')

    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }))

    await waitFor(() => expect(listAppointments).toHaveBeenLastCalledWith('2026-12-01', '2026-12-31', null))
    expect(screen.getByRole('heading', { name: 'Diciembre 2026' })).toBeInTheDocument()
  })

  it('el veterinario ve su propia agenda por defecto', async () => {
    renderCalendar('VETERINARIAN')

    await waitFor(() => expect(listAppointments).toHaveBeenCalledWith('2026-11-01', '2026-11-30', 2))
  })

  it('CU12: la secretaria confirma una cita programada', async () => {
    renderCalendar()

    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(confirmAppointment).toHaveBeenCalledWith(1))
    expect(await screen.findByRole('status')).toHaveTextContent('Cita confirmada.')
  })

  it('CU13: cancelar pide confirmación y no actúa si se rechaza', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderCalendar()

    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar cita' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(cancelAppointment).not.toHaveBeenCalled()
  })

  it('RF9: muestra el mensaje de conflicto del backend', async () => {
    vi.mocked(confirmAppointment).mockRejectedValue(
      new ApiError(409, 'No se puede realizar esta acción sobre una cita en el estado CONFIRMED'),
    )
    renderCalendar()

    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede realizar esta acción')
  })

  it('CU14: reprogramar valida que la nueva fecha sea futura', async () => {
    renderCalendar()

    fireEvent.click(await screen.findByRole('button', { name: 'Reprogramar' }))
    fireEvent.change(screen.getByLabelText('Nueva fecha y hora'), { target: { value: '2026-11-06T09:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar nueva fecha' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('posteriores al momento actual')
    expect(rescheduleAppointment).not.toHaveBeenCalled()

    vi.mocked(rescheduleAppointment).mockResolvedValue({ ...BASE, scheduledAt: '2026-11-09T11:00:00' })
    fireEvent.change(screen.getByLabelText('Nueva fecha y hora'), { target: { value: '2026-11-09T11:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar nueva fecha' }))

    await waitFor(() => expect(rescheduleAppointment).toHaveBeenCalledWith(1, '2026-11-09T11:00'))
    expect(await screen.findByRole('status')).toHaveTextContent('Cita reprogramada.')
  })

  it('RF9: una cita cancelada no ofrece acciones', async () => {
    vi.mocked(listAppointments).mockResolvedValue([{ ...BASE, status: 'CANCELLED' }])
    renderCalendar()

    expect(await screen.findByText('15:00 · Canela')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar cita' })).not.toBeInTheDocument()
  })

  it('CU16: el veterinario inicia la consulta de una cita confirmada', async () => {
    const confirmed = { ...BASE, status: 'CONFIRMED' as const }
    vi.mocked(listAppointments).mockResolvedValue([confirmed])
    const onStart = vi.fn()
    renderCalendar('VETERINARIAN', onStart)

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar consulta' }))

    expect(onStart).toHaveBeenCalledWith(confirmed)
    expect(screen.queryByRole('button', { name: 'Cancelar cita' })).not.toBeInTheDocument()
  })

  it('solo la secretaria ve "Nueva cita"', async () => {
    const { unmount } = renderCalendar('SECRETARY')
    expect(await screen.findByRole('button', { name: /Nueva cita/ })).toBeInTheDocument()
    unmount()

    renderCalendar('VETERINARIAN')
    await screen.findByText('15:00 · Canela')
    expect(screen.queryByRole('button', { name: /Nueva cita/ })).not.toBeInTheDocument()
  })
})
