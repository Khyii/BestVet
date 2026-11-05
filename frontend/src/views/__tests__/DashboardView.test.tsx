import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardView from '../DashboardView'

const renderDashboard = () =>
  render(<DashboardView onNavigate={vi.fn()} onSelectPatient={vi.fn()} />)

describe('DashboardView', () => {
  it('muestra los pacientes de demostración al abrir el panel', () => {
    renderDashboard()

    expect(screen.getByRole('heading', { name: 'Panel de pacientes' })).toBeInTheDocument()
    expect(screen.getByText('Canela')).toBeInTheDocument()
    expect(screen.getByText('Mochi')).toBeInTheDocument()
    expect(screen.getByText('8 pacientes encontrados')).toBeInTheDocument()
  })

  it('filtra pacientes por nombre de mascota o nombre del dueño', () => {
    renderDashboard()

    const searchInput = screen.getByPlaceholderText(
      'Buscar por nombre de mascota o dueño...'
    )
    fireEvent.change(searchInput, { target: { value: 'Canela' } })

    expect(screen.getByText('Canela')).toBeInTheDocument()
    expect(screen.queryByText('Mochi')).not.toBeInTheDocument()
    expect(screen.getByText('1 paciente encontrado')).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Carlos Ruiz' } })
    expect(screen.getByText('Mochi')).toBeInTheDocument()
    expect(screen.queryByText('Canela')).not.toBeInTheDocument()
  })
})
