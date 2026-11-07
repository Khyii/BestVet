import type { DocumentType, SecretaryRequest, StaffKind, VeterinarianRequest } from '../api/types'
import type { Errors } from './patientForms'

/** Formulario de registro de personal (RF2, CU02). */
export interface StaffForm {
  kind: StaffKind
  documentType: DocumentType
  documentNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenceNumber: string // solo veterinario
  username: string
  password: string
  passwordConfirmation: string // solo en la interfaz; evita crear una cuenta con una contraseña mal escrita
}

export const EMPTY_STAFF: StaffForm = {
  kind: 'VETERINARIAN', documentType: 'CC', documentNumber: '', firstName: '', lastName: '',
  email: '', phone: '', licenceNumber: '', username: '', password: '', passwordConfirmation: '',
}

/** Coincide con la validación @Size(min = 8) del backend. */
export const MIN_PASSWORD_LENGTH = 8

const REQUIRED = 'Este campo es obligatorio.'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateStaff(f: StaffForm): Errors {
  const e: Errors = {}
  const required: (keyof StaffForm)[] = ['documentNumber', 'firstName', 'lastName', 'email', 'phone', 'username']
  if (f.kind === 'VETERINARIAN') required.push('licenceNumber')
  for (const k of required) if (!String(f[k]).trim()) e[k] = REQUIRED

  if (f.email.trim() && !EMAIL_PATTERN.test(f.email.trim())) e.email = 'El correo electrónico no es válido.'
  if (/\s/.test(f.username.trim())) e.username = 'El nombre de usuario no puede tener espacios.'

  if (!f.password) e.password = REQUIRED
  else if (f.password.length < MIN_PASSWORD_LENGTH) {
    e.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (f.password && f.passwordConfirmation !== f.password) e.passwordConfirmation = 'Las contraseñas no coinciden.'
  return e
}

/** Cuerpo de la petición según el tipo de personal; la confirmación no se envía. */
export function staffFormToRequest(f: StaffForm): SecretaryRequest | VeterinarianRequest {
  const base: SecretaryRequest = {
    documentType: f.documentType,
    documentNumber: f.documentNumber.trim(),
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    email: f.email.trim(),
    phone: f.phone.trim(),
    username: f.username.trim(),
    password: f.password,
  }
  return f.kind === 'VETERINARIAN' ? { ...base, licenceNumber: f.licenceNumber.trim() } : base
}
