import { describe, expect, it } from 'vitest'
import { addMonthsLocal } from '../dates'

describe('addMonthsLocal (límite de 2 meses de RF8)', () => {
  it('suma meses conservando el día y la hora', () => {
    expect(addMonthsLocal('2026-11-07T10:30', 2)).toBe('2027-01-07T10:30')
  })

  it('usa el último día del mes cuando el día no existe, igual que el backend', () => {
    expect(addMonthsLocal('2026-12-31T09:00', 2)).toBe('2027-02-28T09:00')
    expect(addMonthsLocal('2027-12-31T09:00', 2)).toBe('2028-02-29T09:00')
  })
})
