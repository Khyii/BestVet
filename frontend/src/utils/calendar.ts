const pad = (n: number) => String(n).padStart(2, '0')

/** Fecha ISO (AAAA-MM-DD) de un día; month empieza en 0, como en Date. */
export function isoDay(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

/** Primer y último día del mes, para pedir sus citas al backend (RF10). */
export function monthRange(year: number, month: number): { from: string; to: string } {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return { from: isoDay(year, month, 1), to: isoDay(year, month, lastDay) }
}

/**
 * Celdas del calendario mensual, con la semana empezando en domingo.
 * Las posiciones antes del día 1 son null; el total se completa a semanas enteras.
 */
export function monthGrid(year: number, month: number): (number | null)[] {
  const offset = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/** Mes anterior o siguiente, manejando el cambio de año. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

/** Agrupa elementos por el día (AAAA-MM-DD) de una fecha y hora ISO. */
export function groupByDay<T>(items: T[], dateOf: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {}
  for (const item of items) {
    const key = dateOf(item).slice(0, 10)
    ;(groups[key] ??= []).push(item)
  }
  return groups
}
