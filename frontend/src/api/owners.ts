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
