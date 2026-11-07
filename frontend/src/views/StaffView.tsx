import { useCallback, useEffect, useState } from 'react'
import { createSecretary, createVeterinarian, listSecretaries, listVeterinarians } from '../api/staff'
import { DOCUMENT_TYPE_LABELS, type DocumentType, type Secretary, type StaffKind, type Veterinarian, type VeterinarianRequest } from '../api/types'
import Field, { INPUT_CLASS, fieldAria } from '../components/Field'
import { apiErrorMessage, type Errors } from '../forms/patientForms'
import { EMPTY_STAFF, MIN_PASSWORD_LENGTH, staffFormToRequest, validateStaff, type StaffForm } from '../forms/staffForms'

const CARD = { background: 'var(--card)', border: '1px solid var(--border)' }
const KIND_LABELS: Record<StaffKind, string> = { VETERINARIAN: 'Veterinario', SECRETARY: 'Secretaria' }

interface Person {
  id: number
  documentType: DocumentType
  documentNumber: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

function StaffTable({ title, people, empty, extra }: {
  title: string
  people: Person[]
  empty: string
  extra?: { header: string; value: (p: Person) => string }
}) {
  const headers = ['Nombre', 'Documento', 'Correo', 'Celular', ...(extra ? [extra.header] : [])]
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
        {title} <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>({people.length})</span>
      </h2>
      {people.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{empty}</p>
      ) : (
        <div className="rounded-xl overflow-x-auto" style={CARD}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                {headers.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>{p.firstName} {p.lastName}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.documentType} {p.documentNumber}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.email ?? '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.phone ?? '—'}</td>
                  {extra && <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{extra.value(p)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/** Módulo de personal del administrador (RF2): registro (CU02) y consulta (CU03). */
export default function StaffView() {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [secretaries, setSecretaries] = useState<Secretary[]>([])
  const [loadError, setLoadError] = useState('')

  const [form, setForm] = useState<StaffForm>(EMPTY_STAFF)
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const [vets, secs] = await Promise.all([listVeterinarians(), listSecretaries()])
      setVeterinarians(vets)
      setSecretaries(secs)
      setLoadError('')
    } catch (err) {
      setLoadError(apiErrorMessage(err).message)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const set = (k: keyof StaffForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateStaff(form)
    setErrors(found)
    setNotice('')
    if (Object.keys(found).length > 0) {
      setMessage('Revise los campos marcados.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const request = staffFormToRequest(form)
      if (form.kind === 'VETERINARIAN') await createVeterinarian(request as VeterinarianRequest)
      else await createSecretary(request)
      // RF2: el nuevo usuario puede iniciar sesión de inmediato con su rol.
      setNotice(`${KIND_LABELS[form.kind]} registrado. Ya puede iniciar sesión con el usuario "${request.username}".`)
      setForm({ ...EMPTY_STAFF, kind: form.kind })
      setErrors({})
      await load()
    } catch (err) {
      // Documento ya registrado en el personal o usuario en uso (409).
      const { message: text, fields } = apiErrorMessage(err)
      setMessage(text)
      setErrors(fields)
    } finally {
      setSaving(false)
    }
  }

  const input = (k: keyof StaffForm, label: string, type = 'text', autoComplete?: string) => (
    <Field id={`staff-${k}`} label={label} required error={errors[k]}>
      <input
        {...fieldAria(`staff-${k}`, errors[k])}
        type={type}
        autoComplete={autoComplete}
        value={form[k]}
        onChange={set(k)}
        className={INPUT_CLASS}
      />
    </Field>
  )

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Personal
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Registro de veterinarios y secretarias con su cuenta de acceso
        </p>
      </div>

      {notice && (
        <p role="status" className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#ecfdf5', color: '#047857' }}>
          {notice}
        </p>
      )}

      {/* Registro de personal (CU02) */}
      <form onSubmit={handleSubmit} noValidate className="rounded-xl p-6 space-y-5" style={CARD} aria-label="Registro de personal">
        <fieldset>
          <legend className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Tipo de personal</legend>
          <div className="flex gap-3">
            {(Object.keys(KIND_LABELS) as StaffKind[]).map((k) => (
              <label
                key={k}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer"
                style={{
                  border: `1.5px solid ${form.kind === k ? 'var(--primary)' : 'var(--border)'}`,
                  background: form.kind === k ? 'var(--brand-light)' : 'var(--muted)',
                  color: 'var(--foreground)',
                }}
              >
                <input
                  type="radio"
                  name="staff-kind"
                  value={k}
                  checked={form.kind === k}
                  onChange={() => { setForm((f) => ({ ...f, kind: k })); setErrors({}) }}
                />
                {KIND_LABELS[k]}
              </label>
            ))}
          </div>
        </fieldset>

        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Datos personales</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field id="staff-documentType" label="Tipo de documento" required error={errors.documentType}>
            <select {...fieldAria('staff-documentType', errors.documentType)} value={form.documentType} onChange={set('documentType')} className={INPUT_CLASS + ' cursor-pointer'}>
              {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>)}
            </select>
          </Field>
          {input('documentNumber', 'Número de documento')}
          {input('firstName', 'Nombres', 'text', 'given-name')}
          {input('lastName', 'Apellidos', 'text', 'family-name')}
          {input('email', 'Correo electrónico', 'email', 'email')}
          {input('phone', 'Celular', 'tel', 'tel')}
          {form.kind === 'VETERINARIAN' && input('licenceNumber', 'Tarjeta profesional')}
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Cuenta de acceso</h2>
        <div className="grid grid-cols-2 gap-4">
          {input('username', 'Nombre de usuario', 'text', 'off')}
          <div />
          {input('password', 'Contraseña inicial', 'password', 'new-password')}
          {input('passwordConfirmation', 'Confirmar contraseña', 'password', 'new-password')}
        </div>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          La contraseña debe tener al menos {MIN_PASSWORD_LENGTH} caracteres. El sistema la guarda cifrada.
        </p>

        {message && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
        >
          {saving ? 'Guardando...' : `Registrar ${KIND_LABELS[form.kind].toLowerCase()}`}
        </button>
      </form>

      {loadError && (
        <p role="alert" className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#b91c1c' }}>{loadError}</p>
      )}

      {/* Consulta del personal (CU03) */}
      <StaffTable
        title="Veterinarios"
        people={veterinarians}
        empty="No hay veterinarios registrados"
        extra={{ header: 'Tarjeta profesional', value: (p) => (p as Veterinarian).licenseNumber ?? '—' }}
      />
      <StaffTable title="Secretarias" people={secretaries} empty="No hay secretarias registradas" />
    </div>
  )
}
