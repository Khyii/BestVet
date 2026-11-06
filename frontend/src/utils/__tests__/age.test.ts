import { describe, expect, it } from 'vitest'
import { formatAge, todayIso } from '../age'

const TODAY = new Date(2026, 10, 6) // 6 de noviembre de 2026 (los meses empiezan en 0)

describe('formatAge', () => {
  it('cuenta solo los años cumplidos, como Period.between en el backend', () => {
    expect(formatAge('2022-11-06', TODAY)).toBe('4 años')
    expect(formatAge('2022-11-07', TODAY)).toBe('3 años')
    expect(formatAge('2025-11-06', TODAY)).toBe('1 año')
  })

  it('usa meses para pacientes menores de un año', () => {
    expect(formatAge('2026-09-06', TODAY)).toBe('2 meses')
    expect(formatAge('2026-10-20', TODAY)).toBe('Menos de 1 mes')
  })

  it('muestra un guion si no hay fecha de nacimiento', () => {
    expect(formatAge(null, TODAY)).toBe('—')
  })
})

describe('todayIso', () => {
  it('devuelve la fecha local en formato AAAA-MM-DD', () => {
    expect(todayIso(TODAY)).toBe('2026-11-06')
  })
})
