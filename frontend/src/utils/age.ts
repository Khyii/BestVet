/**
 * Edad a partir de una fecha ISO (AAAA-MM-DD), con el mismo criterio que el
 * backend (Period.between): solo cuentan los años o meses cumplidos.
 * La fecha se interpreta por partes para evitar desfases de zona horaria.
 */
export function ageInMonths(birthDate: string, today: Date = new Date()): number {
  const [y, m, d] = birthDate.split('-').map(Number)
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m)
  if (today.getDate() < d) months -= 1
  return Math.max(0, months)
}

export function formatAge(birthDate: string | null, today: Date = new Date()): string {
  if (!birthDate) return '—'
  const months = ageInMonths(birthDate, today)
  const years = Math.floor(months / 12)
  if (years >= 1) return years === 1 ? '1 año' : `${years} años`
  if (months >= 1) return months === 1 ? '1 mes' : `${months} meses`
  return 'Menos de 1 mes'
}

/** Fecha local de hoy en formato ISO, para el atributo max de los campos de fecha. */
export function todayIso(today: Date = new Date()): string {
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${mm}-${dd}`
}
