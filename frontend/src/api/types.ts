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
