import type { ConsultationRequest, VaccineApplicationRequest } from '../api/types'
import { todayIso } from '../utils/age'
import { blankToNull, type Errors } from './patientForms'

/**
 * Estado y validaciones de los formularios de la historia clínica:
 * consulta (RF11, CU18) y vacuna aplicada (RF12, CU20).
 */

export interface ConsultationForm {
  consultationDate: string // AAAA-MM-DDTHH:mm (campo datetime-local)
  reason: string
  symptoms: string
  physicalExamination: string
  diagnosis: string
  treatment: string
  observations: string
}

export interface VaccinationForm {
  vaccineId: string // valor del <select>; vacío si no se ha elegido
  applicationDate: string // AAAA-MM-DD
  observations: string
}

/** Campos cuya ausencia genera la alerta de RF11 antes de guardar. */
export type ClinicalField = 'diagnosis' | 'treatment'

export const CLINICAL_FIELD_LABELS: Record<ClinicalField, string> = {
  diagnosis: 'el diagnóstico',
  treatment: 'el tratamiento',
}

const REQUIRED = 'Este campo es obligatorio.'

/** Campos obligatorios de la consulta: fecha y motivo. */
export function validateConsultation(f: ConsultationForm): Errors {
  const e: Errors = {}
  if (!f.consultationDate) e.consultationDate = REQUIRED
  if (!f.reason.trim()) e.reason = REQUIRED
  return e
}

/**
 * RF11: si faltan el diagnóstico o el tratamiento, el sistema alerta antes de guardar.
 * Devuelve los campos que faltan, en orden fijo; una lista vacía significa que no hay alerta.
 * No impide guardar: el veterinario decide si guarda así.
 */
export function missingClinicalFields(f: ConsultationForm): ClinicalField[] {
  const missing: ClinicalField[] = []
  if (!f.diagnosis.trim()) missing.push('diagnosis')
  if (!f.treatment.trim()) missing.push('treatment')
  return missing
}

/** RF12: la vacuna es obligatoria y la fecha de aplicación no puede ser futura. */
export function validateVaccination(f: VaccinationForm, today: string = todayIso()): Errors {
  const e: Errors = {}
  if (!f.vaccineId) e.vaccineId = REQUIRED
  if (!f.applicationDate) e.applicationDate = REQUIRED
  else if (f.applicationDate > today) e.applicationDate = 'La fecha de aplicación no puede ser futura.'
  return e
}

export function consultationFormToRequest(f: ConsultationForm, appointmentId: number | null = null): ConsultationRequest {
  return {
    consultationDate: f.consultationDate,
    reason: f.reason.trim(),
    symptoms: blankToNull(f.symptoms),
    physicalExamination: blankToNull(f.physicalExamination),
    diagnosis: blankToNull(f.diagnosis),
    treatment: blankToNull(f.treatment),
    observations: blankToNull(f.observations),
    appointmentId,
  }
}

export function vaccinationFormToRequest(f: VaccinationForm): VaccineApplicationRequest {
  return {
    vaccineId: Number(f.vaccineId),
    applicationDate: f.applicationDate,
    observations: blankToNull(f.observations),
  }
}
