import { describe, expect, it } from 'vitest'
import { groupByDay, isoDay, monthGrid, monthRange, shiftMonth } from '../calendar'

describe('calendario mensual (RF10)', () => {
  it('calcula el primer y el último día del mes, incluido febrero bisiesto', () => {
    expect(monthRange(2026, 10)).toEqual({ from: '2026-11-01', to: '2026-11-30' })
    expect(monthRange(2028, 1)).toEqual({ from: '2028-02-01', to: '2028-02-29' })
  })

  it('arma semanas completas empezando en domingo', () => {
    // Noviembre de 2026 empieza en domingo y tiene 30 días: 5 semanas.
    const cells = monthGrid(2026, 10)
    expect(cells).toHaveLength(35)
    expect(cells[0]).toBe(1)
    expect(cells[29]).toBe(30)
    expect(cells[30]).toBeNull()
  })

  it('deja celdas vacías antes del día 1', () => {
    // Diciembre de 2026 empieza en martes: domingo y lunes quedan vacíos.
    expect(monthGrid(2026, 11).slice(0, 3)).toEqual([null, null, 1])
  })

  it('cambia de año al navegar entre meses', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 })
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 })
  })

  it('agrupa las citas por día', () => {
    const groups = groupByDay(
      [{ at: '2026-11-07T09:00:00' }, { at: '2026-11-07T15:30:00' }, { at: '2026-11-09T10:00:00' }],
      (x) => x.at,
    )
    expect(Object.keys(groups)).toEqual(['2026-11-07', '2026-11-09'])
    expect(groups['2026-11-07']).toHaveLength(2)
    expect(isoDay(2026, 0, 5)).toBe('2026-01-05')
  })
})
