const pad = (n: number) => String(n).padStart(2, '0')

/** Fecha y hora local actual en el formato de un campo datetime-local (AAAA-MM-DDTHH:mm). */
export function nowLocalDateTime(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
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
