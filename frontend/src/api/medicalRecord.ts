import { apiFetch } from './client'
import type {
  Consultation,
  ConsultationRequest,
  MedicalRecord,
  Vaccine,
  VaccineApplication,
  VaccineApplicationRequest,
} from './types'

/** RF11 y CU19: historia clínica, opcionalmente acotada por un rango de fechas (AAAA-MM-DD). */
export function getMedicalRecord(petId: number, range: { from?: string; to?: string } = {}): Promise<MedicalRecord> {
  const params = new URLSearchParams()
  if (range.from) params.set('from', range.from)
  if (range.to) params.set('to', range.to)
  const query = params.toString()
  return apiFetch<MedicalRecord>(`/api/pets/${petId}/medical-record${query ? `?${query}` : ''}`)
}

/** RF11 y CU18: registra una consulta; el veterinario se toma de la sesión. */
export function registerConsultation(petId: number, request: ConsultationRequest): Promise<Consultation> {
  return apiFetch<Consultation>(`/api/pets/${petId}/medical-record/consultations`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/** RF12 y CU20: registra una vacuna aplicada, tomada del catálogo. */
export function registerVaccination(petId: number, request: VaccineApplicationRequest): Promise<VaccineApplication> {
  return apiFetch<VaccineApplication>(`/api/pets/${petId}/medical-record/vaccinations`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/** RF12: catálogo fijo de vacunas. */
export function listVaccines(): Promise<Vaccine[]> {
  return apiFetch<Vaccine[]>('/api/vaccines')
}
