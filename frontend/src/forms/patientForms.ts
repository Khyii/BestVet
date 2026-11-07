import { ApiError } from '../api/client'
import {
  MAX_OBSERVATIONS,
  type DocumentType,
  type Owner,
  type OwnerRequest,
  type Pet,
  type PetRequest,
  type Sex,
} from '../api/types'
import { todayIso } from '../utils/age'

/**
 * Estado y validaciones de los formularios de propietario y paciente.
 * Los comparten el registro (RF3, RF4) y la edición (RF5), que según el
 * documento de requerimientos aplica las mismas validaciones que el registro.
 */

export type Errors = Record<string, string>

export interface OwnerForm {
  documentType: DocumentType
  documentNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
}

export interface PetForm {
  name: string
  species: string
  breed: string
  sex: '' | Sex
  birthDate: string
  weight: string
  observations: string
}

export const EMPTY_OWNER: OwnerForm = {
  documentType: 'CC', documentNumber: '', firstName: '', lastName: '', phone: '', email: '', address: '',
}

export const EMPTY_PET: PetForm = {
  name: '', species: '', breed: '', sex: '', birthDate: '', weight: '', observations: '',
}

const REQUIRED = 'Este campo es obligatorio.'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateOwner(f: OwnerForm): Errors {
  const e: Errors = {}
  if (!f.documentNumber.trim()) e.documentNumber = REQUIRED
  if (!f.firstName.trim()) e.firstName = REQUIRED
  if (!f.lastName.trim()) e.lastName = REQUIRED
  if (!f.phone.trim()) e.phone = REQUIRED
  if (f.email.trim() && !EMAIL_PATTERN.test(f.email.trim())) e.email = 'El correo electrónico no es válido.'
  return e
}

export function validatePet(f: PetForm, today: string = todayIso()): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = REQUIRED
  if (!f.species.trim()) e.species = REQUIRED
  if (!f.sex) e.sex = REQUIRED
  if (f.birthDate && f.birthDate > today) e.birthDate = 'La fecha de nacimiento no puede ser futura.'
  if (f.weight.trim() && !(Number(f.weight) > 0)) e.weight = 'El peso debe ser mayor que cero.'
  if (f.observations.length > MAX_OBSERVATIONS) {
    e.observations = `Las observaciones no pueden superar los ${MAX_OBSERVATIONS} caracteres.`
  }
  return e
}

export const blankToNull = (v: string) => (v.trim() === '' ? null : v.trim())

export function ownerToForm(o: Owner): OwnerForm {
  return {
    documentType: o.documentType,
    documentNumber: o.documentNumber,
    firstName: o.firstName,
    lastName: o.lastName,
    phone: o.phone,
    email: o.email ?? '',
    address: o.address ?? '',
  }
}

export function ownerFormToRequest(f: OwnerForm): OwnerRequest {
  return {
    documentType: f.documentType,
    documentNumber: f.documentNumber.trim(),
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    phone: f.phone.trim(),
    email: blankToNull(f.email),
    address: blankToNull(f.address),
  }
}

export function petToForm(p: Pet): PetForm {
  return {
    name: p.name,
    species: p.species,
    breed: p.breed ?? '',
    sex: p.sex,
    birthDate: p.birthDate ?? '',
    weight: p.weight === null ? '' : String(p.weight),
    observations: p.observations ?? '',
  }
}

/** Campos del paciente comunes al registro y a la edición (sin propietario ni estado). */
export function petFormToFields(f: PetForm): Omit<PetRequest, 'ownerId'> {
  return {
    name: f.name.trim(),
    species: f.species.trim(),
    breed: blankToNull(f.breed),
    sex: f.sex as Sex,
    birthDate: f.birthDate || null,
    weight: f.weight.trim() ? Number(f.weight) : null,
    observations: blankToNull(f.observations),
  }
}

/** Traduce un error de la API en un mensaje general y, si existen, errores por campo. */
export function apiErrorMessage(err: unknown): { message: string; fields: Errors } {
  if (err instanceof ApiError) return { message: err.message, fields: err.fieldErrors ?? {} }
  return { message: 'Ocurrió un error inesperado. Intente de nuevo.', fields: {} }
}
