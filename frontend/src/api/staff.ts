import { apiFetch } from './client'
import type { Secretary, SecretaryRequest, Veterinarian, VeterinarianRequest } from './types'

export { listVeterinarians } from './appointments'

/** RF2: lista de secretarias (solo administrador). */
export function listSecretaries(): Promise<Secretary[]> {
  return apiFetch<Secretary[]>('/api/secretaries')
}

/** RF2 y CU02: crea un veterinario con su cuenta de acceso. */
export function createVeterinarian(request: VeterinarianRequest): Promise<Veterinarian> {
  return apiFetch<Veterinarian>('/api/veterinarians', { method: 'POST', body: JSON.stringify(request) })
}

/** RF2 y CU02: crea una secretaria con su cuenta de acceso. */
export function createSecretary(request: SecretaryRequest): Promise<Secretary> {
  return apiFetch<Secretary>('/api/secretaries', { method: 'POST', body: JSON.stringify(request) })
}
