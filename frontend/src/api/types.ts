// Tipos compartidos con el backend (paquete com.bestvet.bestvet.user).

export type Role = 'ADMIN' | 'SECRETARY' | 'VETERINARIAN'

/** Respuesta de GET /api/me (record MeResponse). */
export interface Me {
  username: string
  role: Role
  staffId: number | null
  firstName: string | null
  lastName: string | null
}

/** Cuerpo de error JSON del backend (record ApiError y SecurityConfig). */
export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  SECRETARY: 'Secretaria',
  VETERINARIAN: 'Veterinario',
}

// ---- Propietarios (paquete com.bestvet.bestvet.owner) ----

export type DocumentType = 'CC' | 'CE' | 'TI' | 'PASSPORT'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  TI: 'Tarjeta de identidad',
  PASSPORT: 'Pasaporte',
}

/** Cuerpo de POST y PUT /api/owners (record OwnerRequest). */
export interface OwnerRequest {
  documentType: DocumentType
  documentNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  address: string | null
}

/** Respuesta de /api/owners (record OwnerResponse). */
export interface Owner extends OwnerRequest {
  id: number
}

// ---- Pacientes (paquete com.bestvet.bestvet.pet) ----

export type Sex = 'MALE' | 'FEMALE'
export type PetStatus = 'ACTIVE' | 'INACTIVE' | 'DECEASED'

export const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Macho',
  FEMALE: 'Hembra',
}

export const PET_STATUS_LABELS: Record<PetStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  DECEASED: 'Fallecido',
}

/** Cuerpo de POST /api/pets (record PetRequest). Fechas en formato ISO (AAAA-MM-DD). */
export interface PetRequest {
  ownerId: number
  name: string
  species: string
  breed: string | null
  sex: Sex
  birthDate: string | null
  weight: number | null
  observations: string | null
}

/** Cuerpo de PUT /api/pets/{id} (record PetUpdateRequest): incluye el estado (RF5, CU07). */
export interface PetUpdateRequest extends Omit<PetRequest, 'ownerId'> {
  status: PetStatus
}

/** Longitud máxima de las observaciones; coincide con Pet.MAX_OBSERVATIONS del backend. */
export const MAX_OBSERVATIONS = 500

/** Respuesta de /api/pets (record PetResponse); incluye el contacto del propietario (RF7). */
export interface Pet {
  id: number
  ownerId: number
  ownerName: string
  ownerPhone: string
  ownerEmail: string | null
  name: string
  species: string
  breed: string | null
  sex: Sex
  birthDate: string | null
  weight: number | null
  observations: string | null
  status: PetStatus
}
