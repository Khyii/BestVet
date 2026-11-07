import { useCallback, useEffect, useState } from 'react'
import { getMedicalRecord, listVaccines, registerConsultation, registerVaccination } from '../api/medicalRecord'
import type { Appointment, Consultation, MedicalRecord, Vaccine } from '../api/types'
import {
  CLINICAL_FIELD_LABELS,
  consultationFormToRequest,
  missingClinicalFields,
  vaccinationFormToRequest,
  validateConsultation,
  validateVaccination,
  type ClinicalField,
  type ConsultationForm,
  type VaccinationForm,
} from '../forms/clinicalForms'
import { apiErrorMessage, type Errors } from '../forms/patientForms'
import { todayIso } from '../utils/age'
import { formatDate, formatDateTime, nowLocalDateTime } from '../utils/dates'
import Field, { INPUT_CLASS, fieldAria } from './Field'

const CARD = { background: 'var(--card)', border: '1px solid var(--border)' }
const PRIMARY_BUTTON = 'px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
const SECONDARY_BUTTON = 'px-4 py-2 rounded-lg text-sm font-medium cursor-pointer'
const LABEL = 'block text-xs font-medium mb-1'

const emptyConsultation = (): ConsultationForm => ({
  consultationDate: nowLocalDateTime(), reason: '', symptoms: '', physicalExamination: '',
  diagnosis: '', treatment: '', observations: '',
})
const emptyVaccination = (): VaccinationForm => ({ vaccineId: '', applicationDate: todayIso(), observations: '' })

/** "el diagnóstico y el tratamiento" o "el diagnóstico". */
function describeMissing(fields: ClinicalField[]): string {
  return fields.map((f) => CLINICAL_FIELD_LABELS[f]).join(' y ')
}

function ConsultationCard({ c }: { c: Consultation }) {
  const rows: [string, string | null][] = [
    ['Síntomas', c.symptoms],
    ['Examen físico', c.physicalExamination],
    ['Diagnóstico', c.diagnosis],
    ['Tratamiento y medicación', c.treatment],
    ['Observaciones', c.observations],
  ]
  return (
    <li className="rounded-xl p-5" style={CARD}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatDateTime(c.consultationDate)}</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{c.reason}</p>
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{c.veterinarianName}</span>
      </div>
      <dl className="space-y-2">
        {rows.map(([label, value]) => {
          // El diagnóstico y el tratamiento se muestran aunque falten, para que la ausencia sea visible.
          if (!value && label !== 'Diagnóstico' && label !== 'Tratamiento y medicación') return null
          return (
            <div key={label}>
              <dt className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
              <dd className="text-sm whitespace-pre-line" style={{ color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {value ?? 'No registrado'}
              </dd>
            </div>
          )
        })}
      </dl>
    </li>
  )
}

interface MedicalRecordSectionProps {
  petId: number
  /** CU16: cita confirmada de la que proviene la consulta; al guardarla, la cita queda completada. */
  origin?: Appointment | null
  onOriginHandled?: () => void
}

/** Historia clínica del paciente (RF11, RF12; CU18, CU19, CU20). Solo para el veterinario. */
export default function MedicalRecordSection({ petId, origin = null, onOriginHandled }: MedicalRecordSectionProps) {
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [mode, setMode] = useState<'none' | 'consultation' | 'vaccination'>('none')

  // Consulta (CU18)
  const [consultation, setConsultation] = useState<ConsultationForm>(emptyConsultation)
  const [consultationErrors, setConsultationErrors] = useState<Errors>({})
  const [pendingMissing, setPendingMissing] = useState<ClinicalField[]>([])
  const [consultationMessage, setConsultationMessage] = useState('')

  // Vacuna (CU20)
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [vaccination, setVaccination] = useState<VaccinationForm>(emptyVaccination)
  const [vaccinationErrors, setVaccinationErrors] = useState<Errors>({})
  const [vaccinationMessage, setVaccinationMessage] = useState('')

  const [saving, setSaving] = useState(false)

  // RF11: la historia se puede acotar por rango de fechas; el backend valida que el rango sea coherente.
  const load = useCallback(async () => {
    try {
      const result = await getMedicalRecord(petId, { from, to })
      setRecord(result)
      setLoadError('')
    } catch (err) {
      setLoadError(apiErrorMessage(err).message)
    }
  }, [petId, from, to])

  useEffect(() => { void load() }, [load])

  // CU16: al llegar desde una cita, se abre el registro de consulta con el motivo de la cita.
  useEffect(() => {
    if (!origin) return
    setConsultation({ ...emptyConsultation(), reason: origin.reason })
    setConsultationErrors({})
    setPendingMissing([])
    setConsultationMessage('')
    setNotice('')
    setMode('consultation')
  }, [origin])

  const closeConsultation = () => {
    setMode('none')
    onOriginHandled?.()
  }

  const openConsultation = () => {
    setConsultation(emptyConsultation())
    setConsultationErrors({})
    setPendingMissing([])
    setConsultationMessage('')
    setNotice('')
    setMode('consultation')
  }

  const openVaccination = () => {
    setVaccination(emptyVaccination())
    setVaccinationErrors({})
    setVaccinationMessage('')
    setNotice('')
    setMode('vaccination')
    if (vaccines.length === 0) {
      listVaccines().then(setVaccines).catch((err) => setVaccinationMessage(apiErrorMessage(err).message))
    }
  }

  const saveConsultation = async (confirmed: boolean) => {
    const errors = validateConsultation(consultation)
    setConsultationErrors(errors)
    if (Object.keys(errors).length > 0) {
      setConsultationMessage('Revise los campos marcados.')
      return
    }
    // RF11: alerta antes de guardar si faltan el diagnóstico o el tratamiento.
    const missing = missingClinicalFields(consultation)
    if (missing.length > 0 && !confirmed) {
      setPendingMissing(missing)
      setConsultationMessage('')
      return
    }
    setSaving(true)
    setPendingMissing([])
    setConsultationMessage('')
    try {
      await registerConsultation(petId, consultationFormToRequest(consultation, origin?.id ?? null))
      closeConsultation()
      setNotice(origin ? 'Consulta guardada. La cita quedó completada.' : 'Consulta guardada.')
      await load()
    } catch (err) {
      const { message, fields } = apiErrorMessage(err)
      setConsultationMessage(message)
      setConsultationErrors(fields)
    } finally {
      setSaving(false)
    }
  }

  const saveVaccination = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateVaccination(vaccination)
    setVaccinationErrors(errors)
    if (Object.keys(errors).length > 0) {
      setVaccinationMessage('Revise los campos marcados.')
      return
    }
    setSaving(true)
    setVaccinationMessage('')
    try {
      await registerVaccination(petId, vaccinationFormToRequest(vaccination))
      setMode('none')
      setNotice('Vacuna registrada.')
      await load()
    } catch (err) {
      const { message, fields } = apiErrorMessage(err)
      setVaccinationMessage(message)
      setVaccinationErrors(fields)
    } finally {
      setSaving(false)
    }
  }

  const setC = (k: keyof ConsultationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConsultation((f) => ({ ...f, [k]: e.target.value }))
    setPendingMissing([])
  }
  const setV = (k: keyof VaccinationForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setVaccination((f) => ({ ...f, [k]: e.target.value }))

  const consultationTextarea = (k: keyof ConsultationForm, label: string) => (
    <Field id={`consulta-${k}`} label={label} error={consultationErrors[k]}>
      <textarea
        {...fieldAria(`consulta-${k}`, consultationErrors[k])}
        value={consultation[k]}
        onChange={setC(k)}
        rows={2}
        className={INPUT_CLASS + ' resize-none'}
      />
    </Field>
  )

  return (
    <section className="space-y-5" aria-labelledby="titulo-historia">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-historia" className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Historia clínica
        </h2>
        {mode === 'none' && (
          <div className="flex gap-2">
            <button type="button" onClick={openConsultation} className={PRIMARY_BUTTON} style={{ background: 'var(--primary)' }}>
              Registrar consulta
            </button>
            <button type="button" onClick={openVaccination} className={SECONDARY_BUTTON} style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}>
              Registrar vacuna
            </button>
          </div>
        )}
      </div>

      {notice && (
        <p role="status" className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#ecfdf5', color: '#047857' }}>
          {notice}
        </p>
      )}

      {/* Registro de consulta (CU18) */}
      {mode === 'consultation' && (
        <form
          onSubmit={(e) => { e.preventDefault(); void saveConsultation(false) }}
          noValidate
          className="rounded-xl p-6 space-y-4"
          style={CARD}
          aria-label="Registro de consulta"
        >
          {origin && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}>
              Consulta de la cita del {formatDateTime(origin.scheduledAt)}. Al guardarla, la cita quedará completada.
            </p>
          )}
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Una consulta guardada no se puede editar ni eliminar; una corrección se registra como una consulta nueva.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field id="consulta-consultationDate" label="Fecha y hora" required error={consultationErrors.consultationDate}>
              <input
                {...fieldAria('consulta-consultationDate', consultationErrors.consultationDate)}
                type="datetime-local"
                value={consultation.consultationDate}
                onChange={setC('consultationDate')}
                className={INPUT_CLASS}
              />
            </Field>
            <Field id="consulta-reason" label="Motivo" required error={consultationErrors.reason}>
              <input
                {...fieldAria('consulta-reason', consultationErrors.reason)}
                type="text"
                value={consultation.reason}
                onChange={setC('reason')}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
          {consultationTextarea('symptoms', 'Síntomas')}
          {consultationTextarea('physicalExamination', 'Examen físico')}
          {consultationTextarea('diagnosis', 'Diagnóstico')}
          {consultationTextarea('treatment', 'Tratamiento y medicación')}
          {consultationTextarea('observations', 'Observaciones')}

          {pendingMissing.length > 0 && (
            <div role="alert" className="rounded-lg px-4 py-3 space-y-3" style={{ background: '#fffbeb', color: '#92400e' }}>
              <p className="text-sm">
                Falta {describeMissing(pendingMissing)}. ¿Desea guardar la consulta de todos modos?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void saveConsultation(true)}
                  disabled={saving}
                  className={PRIMARY_BUTTON}
                  style={{ background: '#b45309' }}
                >
                  Guardar de todos modos
                </button>
                <button type="button" onClick={() => setPendingMissing([])} className={SECONDARY_BUTTON} style={{ background: '#fff' }}>
                  Completar datos
                </button>
              </div>
            </div>
          )}

          {consultationMessage && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{consultationMessage}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className={PRIMARY_BUTTON} style={{ background: 'var(--primary)' }}>
              {saving ? 'Guardando...' : 'Guardar consulta'}
            </button>
            <button type="button" onClick={closeConsultation} className={SECONDARY_BUTTON} style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Registro de vacuna (CU20) */}
      {mode === 'vaccination' && (
        <form onSubmit={saveVaccination} noValidate className="rounded-xl p-6 space-y-4" style={CARD} aria-label="Registro de vacuna">
          <div className="grid grid-cols-2 gap-4">
            <Field id="vacuna-vaccineId" label="Vacuna" required error={vaccinationErrors.vaccineId}>
              <select
                {...fieldAria('vacuna-vaccineId', vaccinationErrors.vaccineId)}
                value={vaccination.vaccineId}
                onChange={setV('vaccineId')}
                className={INPUT_CLASS + ' cursor-pointer'}
              >
                <option value="">Seleccionar...</option>
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}{v.targetDisease ? ` (${v.targetDisease})` : ''}</option>
                ))}
              </select>
            </Field>
            <Field id="vacuna-applicationDate" label="Fecha de aplicación" required error={vaccinationErrors.applicationDate}>
              <input
                {...fieldAria('vacuna-applicationDate', vaccinationErrors.applicationDate)}
                type="date"
                max={todayIso()}
                value={vaccination.applicationDate}
                onChange={setV('applicationDate')}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
          <Field id="vacuna-observations" label="Observaciones" error={vaccinationErrors.observations}>
            <textarea
              {...fieldAria('vacuna-observations', vaccinationErrors.observations)}
              value={vaccination.observations}
              onChange={setV('observations')}
              rows={2}
              className={INPUT_CLASS + ' resize-none'}
            />
          </Field>

          {vaccinationMessage && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{vaccinationMessage}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className={PRIMARY_BUTTON} style={{ background: 'var(--primary)' }}>
              {saving ? 'Guardando...' : 'Guardar vacuna'}
            </button>
            <button type="button" onClick={() => setMode('none')} className={SECONDARY_BUTTON} style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtro por rango de fechas (RF11, CU19) */}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label htmlFor="historia-desde" className={LABEL} style={{ color: 'var(--muted-foreground)' }}>Desde</label>
          <input id="historia-desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="historia-hasta" className={LABEL} style={{ color: 'var(--muted-foreground)' }}>Hasta</label>
          <input id="historia-hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} className={INPUT_CLASS} />
        </div>
        {(from || to) && (
          <button
            type="button"
            onClick={() => { setFrom(''); setTo('') }}
            className="text-xs px-3 py-2.5 rounded-full cursor-pointer"
            style={{ background: '#fee2e2', color: '#b91c1c' }}
          >
            Quitar rango
          </button>
        )}
      </div>

      {loadError && (
        <p role="alert" className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', color: '#b91c1c' }}>{loadError}</p>
      )}

      {record && !loadError && (
        <>
          {/* Consultas (RF11) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Consultas <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>({record.consultations.length})</span>
            </h3>
            {record.consultations.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay consultas registradas.</p>
            ) : (
              <ol className="space-y-3">
                {record.consultations.map((c) => <ConsultationCard key={c.id} c={c} />)}
              </ol>
            )}
          </div>

          {/* Esquema de vacunación (RF12) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Esquema de vacunación <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>({record.vaccinations.length})</span>
            </h3>
            {record.vaccinations.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay vacunas registradas.</p>
            ) : (
              <div className="rounded-xl overflow-x-auto" style={CARD}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                      {['Fecha', 'Vacuna', 'Enfermedad', 'Veterinario', 'Observaciones'].map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {record.vaccinations.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{formatDate(v.applicationDate)}</td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>{v.vaccineName}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{v.targetDisease ?? '—'}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{v.veterinarianName}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{v.observations ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
