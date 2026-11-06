import { describe, expect, it } from 'vitest'
import { buildPetQuery } from '../pets'

describe('buildPetQuery', () => {
  it('sin criterios no agrega cadena de consulta (RF6: lista todos)', () => {
    expect(buildPetQuery({})).toBe('')
    expect(buildPetQuery({ q: '  ', breed: '' })).toBe('')
  })

  it('incluye solo los criterios con valor y los codifica', () => {
    expect(buildPetQuery({ q: 'Canela', owner: 'Ana Torres', minAge: 0, maxAge: undefined }))
      .toBe('?q=Canela&owner=Ana+Torres&minAge=0')
  })
})
