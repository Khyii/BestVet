import type { ApiErrorBody, Me } from './types'

/**
 * Cliente HTTP del frontend.
 *
 * El backend usa HTTP Basic sin estado (RNF6): cada petición debe llevar la
 * cabecera Authorization. Las credenciales se guardan solo en memoria, de modo
 * que no persisten en el navegador; al recargar la página se cierra la sesión.
 * Las rutas son relativas (/api/...) y el servidor de Vite las reenvía al
 * backend mediante el proxy definido en vite.config.ts.
 */

let authHeader: string | null = null

/** Error de la API con el código HTTP y el mensaje en español del backend. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.'

/** Codifica usuario:contraseña en Base64 sobre UTF-8 (admite tildes y ñ). */
export function encodeBasic(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return `Basic ${btoa(binary)}`
}

async function parseError(response: Response): Promise<ApiError> {
  const isJson = response.headers.get('content-type')?.includes('application/json')
  if (isJson) {
    try {
      const body = (await response.json()) as ApiErrorBody
      return new ApiError(response.status, body.message ?? `Error ${response.status}`, body.fieldErrors)
    } catch {
      // Cuerpo JSON ilegible: se usa el mensaje genérico de abajo.
    }
  }
  // Sin cuerpo JSON: típicamente el proxy de Vite responde 5xx cuando el backend no está activo.
  if (response.status >= 500) {
    return new ApiError(response.status, NETWORK_ERROR_MESSAGE)
  }
  return new ApiError(response.status, `Error ${response.status}`)
}

async function request<T>(path: string, init: RequestInit, header: string | null): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')
  if (header) headers.set('Authorization', header)

  let response: Response
  try {
    response = await fetch(path, { ...init, headers })
  } catch (err) {
    // Una petición cancelada (por ejemplo, una búsqueda reemplazada por otra) no es un error de red.
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, NETWORK_ERROR_MESSAGE)
  }

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Petición autenticada con las credenciales de la sesión actual. */
export function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, authHeader)
}

/**
 * Inicio de sesión (RF1, CU01): valida las credenciales contra GET /api/me.
 * Solo si el backend responde 200 se conservan para las peticiones siguientes.
 */
export async function login(username: string, password: string): Promise<Me> {
  const header = encodeBasic(username, password)
  const me = await request<Me>('/api/me', { method: 'GET' }, header)
  authHeader = header
  return me
}

/** Cierre de sesión: descarta las credenciales guardadas en memoria. */
export function logout(): void {
  authHeader = null
}
