import type { Role } from '../api/types'
import type { View } from '../App'

/**
 * Vistas que cada rol puede abrir. Refleja las reglas de autorización de
 * SecurityConfig en el backend; el backend sigue siendo quien impone el control
 * de acceso, esto solo evita mostrar opciones que responderían 403.
 *
 * - Secretaria: registra propietarios y pacientes (RF3, RF4) y gestiona citas (RF8–RF10).
 * - Veterinario: consulta pacientes y citas, y gestiona la historia clínica (RF11, RF12).
 * - Administrador: solo gestiona personal por API (RF2); no tiene vistas en esta versión.
 */
const ALLOWED_VIEWS: Record<Role, View[]> = {
  SECRETARY: ['dashboard', 'patient-form', 'patient-profile', 'calendar'],
  VETERINARIAN: ['dashboard', 'patient-profile', 'calendar'],
  ADMIN: [],
}

export function canOpen(role: Role, view: View): boolean {
  return ALLOWED_VIEWS[role].includes(view)
}

/** Vista inicial tras iniciar sesión, o null si el rol no tiene vistas. */
export function homeView(role: Role): View | null {
  return ALLOWED_VIEWS[role][0] ?? null
}
