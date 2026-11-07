import { MAX_OBSERVATIONS, PET_STATUS_LABELS, SEX_LABELS, type PetStatus, type Sex } from '../api/types'
import type { Errors, PetForm } from '../forms/patientForms'
import { todayIso } from '../utils/age'
import Field, { INPUT_CLASS, fieldAria } from './Field'

// Sugerencias para escribir más rápido; la especie y la raza son texto libre en el backend.
const SPECIES_SUGGESTIONS = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil']
const BREED_SUGGESTIONS: Record<string, string[]> = {
  Perro: ['Criollo', 'Golden Retriever', 'Labrador', 'Bulldog', 'Poodle', 'Pastor Alemán', 'Chihuahua', 'Beagle'],
  Gato: ['Criollo', 'Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll'],
  Ave: ['Cotorra', 'Canario', 'Agaporni', 'Cacatúa'],
  Conejo: ['Holland Lop', 'Mini Rex', 'Angora'],
  Reptil: ['Iguana', 'Gecko', 'Tortuga'],
}

interface PetFieldsProps {
  idPrefix: string
  form: PetForm
  errors: Errors
  onChange: (key: keyof PetForm, value: string) => void
  /** Solo en la edición (CU07): estado del paciente. */
  status?: PetStatus
  onStatusChange?: (status: PetStatus) => void
}

/** Campos del paciente (RF4), usados en el registro (CU05) y la edición (CU07). */
export default function PetFields({ idPrefix, form, errors, onChange, status, onStatusChange }: PetFieldsProps) {
  const id = (k: string) => `${idPrefix}-${k}`
  const bind = (k: keyof PetForm) => ({
    ...fieldAria(id(k), errors[k]),
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange(k, e.target.value),
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field id={id('name')} label="Nombre" required error={errors.name}>
          <input {...bind('name')} type="text" className={INPUT_CLASS} />
        </Field>
        <Field id={id('species')} label="Especie" required error={errors.species}>
          <input {...bind('species')} type="text" list={id('species-list')} className={INPUT_CLASS} />
          <datalist id={id('species-list')}>
            {SPECIES_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>
        <Field id={id('breed')} label="Raza" error={errors.breed}>
          <input {...bind('breed')} type="text" list={id('breed-list')} className={INPUT_CLASS} />
          <datalist id={id('breed-list')}>
            {(BREED_SUGGESTIONS[form.species.trim()] ?? []).map((b) => <option key={b} value={b} />)}
          </datalist>
        </Field>
        <Field id={id('sex')} label="Sexo" required error={errors.sex}>
          <select {...bind('sex')} className={INPUT_CLASS + ' cursor-pointer'}>
            <option value="">Seleccionar...</option>
            {(Object.keys(SEX_LABELS) as Sex[]).map((s) => <option key={s} value={s}>{SEX_LABELS[s]}</option>)}
          </select>
        </Field>
        <Field id={id('birthDate')} label="Fecha de nacimiento" error={errors.birthDate}>
          <input {...bind('birthDate')} type="date" max={todayIso()} className={INPUT_CLASS} />
        </Field>
        <Field id={id('weight')} label="Peso (kg)" error={errors.weight}>
          <input {...bind('weight')} type="number" min="0.01" step="0.01" className={INPUT_CLASS} />
        </Field>
        {status !== undefined && onStatusChange && (
          <Field id={id('status')} label="Estado" required error={errors.status}>
            <select
              {...fieldAria(id('status'), errors.status)}
              value={status}
              onChange={(e) => onStatusChange(e.target.value as PetStatus)}
              className={INPUT_CLASS + ' cursor-pointer'}
            >
              {(Object.keys(PET_STATUS_LABELS) as PetStatus[]).map((s) => (
                <option key={s} value={s}>{PET_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <Field id={id('observations')} label="Observaciones" error={errors.observations}>
        <textarea
          {...bind('observations')}
          maxLength={MAX_OBSERVATIONS}
          rows={3}
          placeholder="Alergias, condiciones crónicas u otras notas relevantes"
          className={INPUT_CLASS + ' resize-none'}
          style={{ lineHeight: '1.5' }}
        />
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--muted-foreground)' }}>
          {form.observations.length}/{MAX_OBSERVATIONS}
        </p>
      </Field>
    </div>
  )
}
