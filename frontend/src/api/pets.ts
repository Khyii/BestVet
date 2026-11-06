import { apiFetch } from './client'
import type { Pet, PetRequest } from './types'

/** Criterios de RF6. Todos son opcionales y el backend los combina entre sí. */
export interface PetSearch {
  q?: string
  breed?: string
  owner?: string
  minAge?: number
  maxAge?: number
}

/** Construye la cadena de consulta omitiendo los criterios vacíos. */
export function buildPetQuery(search: PetSearch): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (text !== '') params.set(key, text)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** RF6, CU08 y CU09: GET /api/pets con búsqueda por nombre y filtros. */
export function searchPets(search: PetSearch, signal?: AbortSignal): Promise<Pet[]> {
  return apiFetch<Pet[]>(`/api/pets${buildPetQuery(search)}`, { signal })
}

export function getPet(id: number): Promise<Pet> {
  return apiFetch<Pet>(`/api/pets/${id}`)
}

/** RF4 y CU05: POST /api/pets. El backend crea también la historia clínica vacía. */
export function createPet(request: PetRequest): Promise<Pet> {
  return apiFetch<Pet>('/api/pets', { method: 'POST', body: JSON.stringify(request) })
}
