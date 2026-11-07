import { describe, expect, it } from 'vitest'
import { missingClinicalFields, validateConsultation, validateVaccination, type ConsultationForm } from '../clinicalForms'

/*
 * Ejercicio: pruebas de las validaciones de la historia clínica (RF11, RF12).
 *
 * Cada `it.todo(...)` es una prueba pendiente: Vitest la muestra como "todo".
 * Para completarla, cambia `it.todo('nombre')` por `it('nombre', () => { ... })`
 * y escribe dentro las comprobaciones con `expect`.
 *
 * Ejecuta `npm test` (modo vigilancia) para ver el resultado cada vez que guardas.
 */

// Formulario de consulta válido y completo. Cada prueba parte de él y cambia solo
// lo que quiere probar, con la sintaxis { ...CONSULTA, campo: 'nuevo valor' }.
const CONSULTA: ConsultationForm = {
  consultationDate: '2026-11-06T10:30',
  reason: 'Control anual',
  symptoms: '',
  physicalExamination: '',
  diagnosis: 'Sano',
  treatment: 'Ninguno',
  observations: '',
}

describe('validateConsultation (RF11: campos obligatorios)', () => {
  // Ejemplo resuelto: úsalo como modelo para las demás.
  it('no devuelve errores si la fecha y el motivo están completos', () => {
    const errores = validateConsultation(CONSULTA)

    expect(errores).toEqual({})
  })

  it('marca error en "reason" si el motivo está vacío', () => {
    const errores = validateConsultation({...CONSULTA, reason: ''})

    expect(errores.reason).toBeDefined()
  })
  // Pista: validateConsultation({ ...CONSULTA, reason: '' }) y revisa errores.reason
  // con toBeDefined().

  it('marca error en "reason" si el motivo solo tiene espacios', () => {
    const errores = validateConsultation({...CONSULTA, reason: ' '})

    expect(errores.reason).toBeDefined()
  })

  it('marca error en "consultationDate" si falta la fecha', () => {
    const errores = validateConsultation({...CONSULTA, consultationDate: ''})

    expect(errores.consultationDate).toBeDefined()
  })
})

describe('missingClinicalFields (RF11: alerta si faltan diagnóstico o tratamiento)', () => {
  it('devuelve una lista vacía si hay diagnóstico y tratamiento', () => {
    const errores = missingClinicalFields({...CONSULTA, diagnosis: 'Sano', treatment: 'Ninguno'})

    expect(errores).toEqual([])
  })

  it('devuelve ["diagnosis"] si solo falta el diagnóstico', () => {
    const faltantes = missingClinicalFields({...CONSULTA, diagnosis: ''})

    expect(faltantes).toEqual(['diagnosis'])
  })

  it('devuelve ["treatment"] si solo falta el tratamiento', () => {
    const faltantes = missingClinicalFields({...CONSULTA, treatment: ''})

    expect(faltantes).toEqual(['treatment'])
  })

  it('devuelve ["diagnosis", "treatment"] si faltan ambos', () => {
    const faltantes = missingClinicalFields({...CONSULTA, diagnosis: '', treatment: ''})

    expect(faltantes).toEqual(['diagnosis', 'treatment'])
  })
  // Pista: para comparar listas usa toEqual(['diagnosis', 'treatment']), no toBe.

  it('trata un diagnóstico con solo espacios como ausente', () => {
    const error = missingClinicalFields({...CONSULTA, diagnosis: '   '})

    expect(error).toEqual(['diagnosis'])
  })
})

describe('validateVaccination (RF12: vacuna obligatoria y fecha no futura)', () => {
  // validateVaccination recibe un segundo parámetro opcional: la fecha de "hoy".
  // Pasarla fija, por ejemplo '2026-11-06', hace que la prueba dé el mismo
  // resultado sin importar el día en que se ejecute.

  it('no devuelve errores con una vacuna elegida y la fecha de hoy', () => {
    const errores = validateVaccination(
        {vaccineId: '1', applicationDate: '2026-11-07', observations: ''}, '2026-11-07'
    )

    expect(errores).toEqual({})
  })

  it('marca error en "vaccineId" si no se eligió vacuna', () => {
    const errores = validateVaccination(
        {vaccineId: '', applicationDate: '2026-11-08', observations: ''}
    )

    expect(errores.vaccineId).toBeDefined()
  })

  it('marca error en "applicationDate" si la fecha es futura', () => {
    const errores = validateVaccination(
        {vaccineId: '1', applicationDate: '2026-11-08', observations: ''},
        '2026-11-07'
    )

    expect(errores.applicationDate).toContain('futura')
  })
  // Pista: además de comprobar que el error existe, puedes revisar el texto con
  // toContain('futura').

  it('marca error en "applicationDate" si falta la fecha', () => {
    const errores = validateVaccination(
        {vaccineId: '1', applicationDate: '', observations: ''}
    )

    expect(errores.applicationDate).toBeDefined()
  })
})
