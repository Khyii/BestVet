import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginView from '../LoginView'

describe('LoginView', () => {
  it('muestra un error cuando se envía el formulario vacío', () => {
    render(<LoginView onLogin={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(screen.getByText('Por favor completa todos los campos.')).toBeInTheDocument()
  })

  it('muestra un error con credenciales incorrectas', () => {
    render(<LoginView onLogin={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('veterinario'), {
      target: { value: 'usuarioIncorrecto' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'claveIncorrecta' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(screen.getByText('Usuario o contraseña incorrectos.')).toBeInTheDocument()
  })

  it('llama a onLogin con las credenciales correctas', async () => {
    const onLogin = vi.fn()
    render(<LoginView onLogin={onLogin} />)

    fireEvent.change(screen.getByPlaceholderText('veterinario'), {
      target: { value: 'veterinario' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'prueba1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1), { timeout: 1500 })
  })
})
