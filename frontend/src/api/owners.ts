import { apiFetch } from './client'
import type { Owner, OwnerRequest } from './types'

/** GET /api/owners: lista de propietarios para seleccionar al registrar un paciente (CU05). */
export function listOwners(): Promise<Owner[]> {
  return apiFetch<Owner[]>('/api/owners')
}

/** RF3 y CU04: POST /api/owners. */
export function createOwner(request: OwnerRequest): Promise<Owner> {
  return apiFetch<Owner>('/api/owners', { method: 'POST', body: JSON.stringify(request) })
}

export function getOwner(id: number): Promise<Owner> {
  return apiFetch<Owner>(`/api/owners/${id}`)
}

/** RF5 y CU06: PUT /api/owners/{id}. Responde 400 si no hay cambios y 409 si el documento ya existe. */
export function updateOwner(id: number, request: OwnerRequest): Promise<Owner> {
  return apiFetch<Owner>(`/api/owners/${id}`, { method: 'PUT', body: JSON.stringify(request) })
}
