import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import LoginView from '../LoginView'
import { ApiError, NETWORK_ERROR_MESSAGE, login } from '../../api/client'

// Se sustituye solo la función login; ApiError y los mensajes se conservan reales.
vi.mock('../../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client')>()
  return { ...actual, login: vi.fn() }
})

const loginMock = vi.mocked(login)

function fillAndSubmit(usuario: string, password: string) {
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: usuario } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))
}

describe('LoginView', () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it('muestra un error cuando se envía el formulario vacío', () => {
    render(<LoginView onLogin={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Por favor completa todos los campos.')
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('muestra un error con credenciales incorrectas', async () => {
    loginMock.mockRejectedValue(new ApiError(401, 'Credenciales inválidas o sesión no iniciada'))
    const onLogin = vi.fn()
    render(<LoginView onLogin={onLogin} />)

    fillAndSubmit('usuarioIncorrecto', 'claveIncorrecta')

    expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeInTheDocument()
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('muestra un aviso cuando el servidor no está disponible', async () => {
    loginMock.mockRejectedValue(new ApiError(0, NETWORK_ERROR_MESSAGE))
    render(<LoginView onLogin={vi.fn()} />)

    fillAndSubmit('mvet', 'clave')

    expect(await screen.findByText(NETWORK_ERROR_MESSAGE)).toBeInTheDocument()
  })

  it('entrega el usuario autenticado a onLogin', async () => {
    const me = { username: 'mvet', role: 'VETERINARIAN' as const, staffId: 3, firstName: 'María', lastName: 'Pérez' }
    loginMock.mockResolvedValue(me)
    const onLogin = vi.fn()
    render(<LoginView onLogin={onLogin} />)

    fillAndSubmit('  mvet ', 'clave')

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(me))
    expect(loginMock).toHaveBeenCalledWith('mvet', 'clave')
  })
})
