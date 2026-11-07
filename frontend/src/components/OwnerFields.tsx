import { DOCUMENT_TYPE_LABELS, type DocumentType } from '../api/types'
import type { Errors, OwnerForm } from '../forms/patientForms'
import Field, { INPUT_CLASS, fieldAria } from './Field'

interface OwnerFieldsProps {
  idPrefix: string
  form: OwnerForm
  errors: Errors
  onChange: (key: keyof OwnerForm, value: string) => void
}

/** Campos del propietario (RF3), usados en el registro (CU04) y la edición (CU06). */
export default function OwnerFields({ idPrefix, form, errors, onChange }: OwnerFieldsProps) {
  const id = (k: keyof OwnerForm) => `${idPrefix}-${k}`
  const bind = (k: keyof OwnerForm) => ({
    ...fieldAria(id(k), errors[k]),
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(k, e.target.value),
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field id={id('documentType')} label="Tipo de documento" required error={errors.documentType}>
          <select {...bind('documentType')} className={INPUT_CLASS + ' cursor-pointer'}>
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
              <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </Field>
        <Field id={id('documentNumber')} label="Número de documento" required error={errors.documentNumber}>
          <input {...bind('documentNumber')} type="text" className={INPUT_CLASS} />
        </Field>
        <Field id={id('firstName')} label="Nombres" required error={errors.firstName}>
          <input {...bind('firstName')} type="text" autoComplete="given-name" className={INPUT_CLASS} />
        </Field>
        <Field id={id('lastName')} label="Apellidos" required error={errors.lastName}>
          <input {...bind('lastName')} type="text" autoComplete="family-name" className={INPUT_CLASS} />
        </Field>
        <Field id={id('phone')} label="Celular" required error={errors.phone}>
          <input {...bind('phone')} type="tel" autoComplete="tel" className={INPUT_CLASS} />
        </Field>
        <Field id={id('email')} label="Correo electrónico" error={errors.email}>
          <input {...bind('email')} type="email" autoComplete="email" className={INPUT_CLASS} />
        </Field>
      </div>
      <Field id={id('address')} label="Dirección" error={errors.address}>
        <input {...bind('address')} type="text" autoComplete="street-address" className={INPUT_CLASS} />
      </Field>
    </div>
  )
}
