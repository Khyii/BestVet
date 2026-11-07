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

// ---- Historia clínica (paquete com.bestvet.bestvet.medicalrecord) ----

/** Consulta registrada (record ConsultationResponse). Fechas con hora en formato ISO local. */
export interface Consultation {
  id: number
  consultationDate: string
  reason: string
  symptoms: string | null
  physicalExamination: string | null
  diagnosis: string | null
  treatment: string | null
  observations: string | null
  veterinarianId: number
  veterinarianName: string
  appointmentId: number | null
}

/** Vacuna aplicada (record VaccineApplicationResponse). */
export interface VaccineApplication {
  id: number
  vaccineId: number
  vaccineName: string
  targetDisease: string | null
  applicationDate: string
  observations: string | null
  veterinarianId: number
  veterinarianName: string
}

/** GET /api/pets/{id}/medical-record: ambas listas de la más reciente a la más antigua (RF11). */
export interface MedicalRecord {
  id: number
  petId: number
  petName: string
  createdAt: string
  consultations: Consultation[]
  vaccinations: VaccineApplication[]
}

/** Vacuna del catálogo fijo (RF12). */
export interface Vaccine {
  id: number
  name: string
  targetDisease: string | null
  description: string | null
}

export interface ConsultationRequest {
  consultationDate: string
  reason: string
  symptoms: string | null
  physicalExamination: string | null
  diagnosis: string | null
  treatment: string | null
  observations: string | null
  appointmentId: number | null
}

export interface VaccineApplicationRequest {
  vaccineId: number
  applicationDate: string
  observations: string | null
}
