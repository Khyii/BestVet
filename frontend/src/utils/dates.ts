const pad = (n: number) => String(n).padStart(2, '0')

/** Fecha y hora local actual en el formato de un campo datetime-local (AAAA-MM-DDTHH:mm). */
export function nowLocalDateTime(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/**
 * Suma meses a una fecha "AAAA-MM-DDTHH:mm". Si el día no existe en el mes de
 * destino se usa el último día de ese mes (31 dic + 2 meses → 28 o 29 feb),
 * igual que LocalDateTime.plusMonths en el backend.
 */
export function addMonthsLocal(dateTime: string, months: number): string {
  const [datePart, time] = dateTime.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const total = y * 12 + (m - 1) + months
  const year = Math.floor(total / 12)
  const month = (total % 12) + 1
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${pad(month)}-${pad(Math.min(d, lastDay))}T${time}`
}

/** "2026-11-06" → "6 nov 2026". Se interpreta por partes para evitar desfases de zona horaria. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(y, m - 1, d))
}

/** "2026-11-06T10:30:00" → "6 nov 2026, 10:30". */
export function formatDateTime(isoDateTime: string): string {
  const time = isoDateTime.slice(11, 16)
  return time ? `${formatDate(isoDateTime)}, ${time}` : formatDate(isoDateTime)
}
