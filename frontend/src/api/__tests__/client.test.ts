import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, NETWORK_ERROR_MESSAGE, apiFetch, encodeBasic, login, logout } from '../client'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ME = { username: 'mvet', role: 'VETERINARIAN', staffId: 3, firstName: 'María', lastName: 'Pérez' }

afterEach(() => {
  logout()
  vi.unstubAllGlobals()
})

describe('encodeBasic', () => {
  it('codifica las credenciales en Base64', () => {
    expect(encodeBasic('admin', 'secreto')).toBe(`Basic ${btoa('admin:secreto')}`)
  })

  it('codifica caracteres no ASCII como UTF-8', () => {
    // "ñ" en UTF-8 son los bytes C3 B1.
    expect(encodeBasic('ñ', 'x')).toBe(`Basic ${btoa('\u00c3\u00b1:x')}`)
  })
})

describe('login', () => {
  it('envía la cabecera Authorization a /api/me y devuelve el usuario', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, ME))
    vi.stubGlobal('fetch', fetchMock)

    const me = await login('mvet', 'clave')

    expect(me).toEqual(ME)
    const [path, init] = fetchMock.mock.calls[0]
    expect(path).toBe('/api/me')
    expect(new Headers(init.headers).get('Authorization')).toBe(encodeBasic('mvet', 'clave'))
  })

  it('reutiliza las credenciales en las peticiones siguientes', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(200, ME))
      .mockResolvedValueOnce(jsonResponse(200, []))
    vi.stubGlobal('fetch', fetchMock)

    await login('mvet', 'clave')
    await apiFetch('/api/pets')

    const [, init] = fetchMock.mock.calls[1]
    expect(new Headers(init.headers).get('Authorization')).toBe(encodeBasic('mvet', 'clave'))
  })

  it('lanza ApiError 401 con el mensaje del backend y no guarda las credenciales', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { status: 401, message: 'Credenciales inválidas o sesión no iniciada' }))
      .mockResolvedValueOnce(jsonResponse(200, []))
    vi.stubGlobal('fetch', fetchMock)

    await expect(login('mvet', 'mala')).rejects.toMatchObject({
      status: 401,
      message: 'Credenciales inválidas o sesión no iniciada',
    })

    await apiFetch('/api/pets')
    const [, init] = fetchMock.mock.calls[1]
    expect(new Headers(init.headers).has('Authorization')).toBe(false)
  })

  it('informa un error de conexión cuando el backend no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(login('mvet', 'clave')).rejects.toMatchObject({ status: 0, message: NETWORK_ERROR_MESSAGE })
  })

  it('informa un error de conexión cuando el proxy responde 5xx sin JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })))

    await expect(login('mvet', 'clave')).rejects.toMatchObject({ status: 500, message: NETWORK_ERROR_MESSAGE })
  })
})

describe('apiFetch', () => {
  it('expone los errores de validación por campo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse(400, { status: 400, message: 'Datos inválidos', fieldErrors: { name: 'Obligatorio' } }),
    ))

    const error: unknown = await apiFetch('/api/pets', { method: 'POST', body: '{}' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).fieldErrors).toEqual({ name: 'Obligatorio' })
  })

  it('no envía Authorization después de cerrar sesión', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(200, ME))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Credenciales inválidas o sesión no iniciada' }))
    vi.stubGlobal('fetch', fetchMock)

    await login('mvet', 'clave')
    logout()
    await expect(apiFetch('/api/pets')).rejects.toMatchObject({ status: 401 })

    const [, init] = fetchMock.mock.calls[1]
    expect(new Headers(init.headers).has('Authorization')).toBe(false)
  })
})

describe('cancelación', () => {
  it('propaga AbortError sin convertirlo en error de conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('cancelada', 'AbortError')))

    await expect(apiFetch('/api/pets')).rejects.toMatchObject({ name: 'AbortError' })
  })
})
