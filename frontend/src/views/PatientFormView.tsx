import { useEffect, useMemo, useState } from 'react'
import type { View } from '../App'
import { ApiError } from '../api/client'
import { createOwner, listOwners } from '../api/owners'
import { createPet } from '../api/pets'
import {
  DOCUMENT_TYPE_LABELS,
  SEX_LABELS,
  type DocumentType,
  type Owner,
  type Sex,
} from '../api/types'
import Field, { INPUT_CLASS, fieldAria } from '../components/Field'
import { todayIso } from '../utils/age'

// Sugerencias para escribir más rápido; la especie y la raza son texto libre en el backend.
const SPECIES_SUGGESTIONS = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil']
const BREED_SUGGESTIONS: Record<string, string[]> = {
  Perro: ['Criollo', 'Golden Retriever', 'Labrador', 'Bulldog', 'Poodle', 'Pastor Alemán', 'Chihuahua', 'Beagle'],
  Gato: ['Criollo', 'Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll'],
  Ave: ['Cotorra', 'Canario', 'Agaporni', 'Cacatúa'],
  Conejo: ['Holland Lop', 'Mini Rex', 'Angora'],
  Reptil: ['Iguana', 'Gecko', 'Tortuga'],
}

const REQUIRED = 'Este campo es obligatorio.'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_OWNER_MATCHES = 6

type Errors = Record<string, string>

interface OwnerForm {
  documentType: DocumentType
  documentNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
}

interface PetForm {
  name: string
  species: string
  breed: string
  sex: '' | Sex
  birthDate: string
  weight: string
}

const EMPTY_OWNER: OwnerForm = {
  documentType: 'CC', documentNumber: '', firstName: '', lastName: '', phone: '', email: '', address: '',
}
const EMPTY_PET: PetForm = { name: '', species: '', breed: '', sex: '', birthDate: '', weight: '' }

/** Normaliza texto para buscar sin distinguir mayúsculas ni tildes, como el backend. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function validateOwner(f: OwnerForm): Errors {
  const e: Errors = {}
  if (!f.documentNumber.trim()) e.documentNumber = REQUIRED
  if (!f.firstName.trim()) e.firstName = REQUIRED
  if (!f.lastName.trim()) e.lastName = REQUIRED
  if (!f.phone.trim()) e.phone = REQUIRED
  if (f.email.trim() && !EMAIL_PATTERN.test(f.email.trim())) e.email = 'El correo electrónico no es válido.'
  return e
}

export function validatePet(f: PetForm, today: string = todayIso()): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = REQUIRED
  if (!f.species.trim()) e.species = REQUIRED
  if (!f.sex) e.sex = REQUIRED
  if (f.birthDate && f.birthDate > today) e.birthDate = 'La fecha de nacimiento no puede ser futura.'
  if (f.weight.trim() && !(Number(f.weight) > 0)) e.weight = 'El peso debe ser mayor que cero.'
  return e
}

const blankToNull = (v: string) => (v.trim() === '' ? null : v.trim())

/** Traduce un error de la API en un mensaje general y, si existen, errores por campo. */
function apiErrorMessage(err: unknown): { message: string; fields: Errors } {
  if (err instanceof ApiError) return { message: err.message, fields: err.fieldErrors ?? {} }
  return { message: 'Ocurrió un error inesperado. Intente de nuevo.', fields: {} }
}

interface PatientFormViewProps {
  onNavigate: (v: View) => void
}

export default function PatientFormView({ onNavigate }: PatientFormViewProps) {
  // ---- Propietario: selección (CU05, paso b) o registro (CU04) ----
  const [owners, setOwners] = useState<Owner[]>([])
  const [ownersError, setOwnersError] = useState('')
  const [ownerQuery, setOwnerQuery] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [creatingOwner, setCreatingOwner] = useState(false)
  const [ownerForm, setOwnerForm] = useState<OwnerForm>(EMPTY_OWNER)
  const [ownerErrors, setOwnerErrors] = useState<Errors>({})
  const [ownerMessage, setOwnerMessage] = useState('')
  const [savingOwner, setSavingOwner] = useState(false)

  // ---- Paciente (RF4) ----
  const [petForm, setPetForm] = useState<PetForm>(EMPTY_PET)
  const [petErrors, setPetErrors] = useState<Errors>({})
  const [petMessage, setPetMessage] = useState('')
  const [savingPet, setSavingPet] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    listOwners()
      .then(setOwners)
      .catch((err) => setOwnersError(apiErrorMessage(err).message))
  }, [])

  const ownerMatches = useMemo(() => {
    const q = normalize(ownerQuery.trim())
    if (!q) return []
    return owners
      .filter((o) => normalize(`${o.firstName} ${o.lastName} ${o.documentNumber}`).includes(q))
      .slice(0, MAX_OWNER_MATCHES)
  }, [owners, ownerQuery])

  const setOwnerField = (k: keyof OwnerForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setOwnerForm((f) => ({ ...f, [k]: e.target.value }))

  const setPetField = (k: keyof PetForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setPetForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateOwner(ownerForm)
    setOwnerErrors(errors)
    if (Object.keys(errors).length > 0) {
      setOwnerMessage('Revise los campos marcados.')
      return
    }
    setSavingOwner(true)
    setOwnerMessage('')
    try {
      const owner = await createOwner({
        documentType: ownerForm.documentType,
        documentNumber: ownerForm.documentNumber.trim(),
        firstName: ownerForm.firstName.trim(),
        lastName: ownerForm.lastName.trim(),
        phone: ownerForm.phone.trim(),
        email: blankToNull(ownerForm.email),
        address: blankToNull(ownerForm.address),
      })
      // CU04, alterno: al venir desde CU05 se vuelve al registro del paciente con el propietario elegido.
      setOwners((list) => [...list, owner])
      setSelectedOwner(owner)
      setCreatingOwner(false)
      setOwnerForm(EMPTY_OWNER)
      setOwnerErrors({})
    } catch (err) {
      const { message, fields } = apiErrorMessage(err)
      setOwnerMessage(message)
      setOwnerErrors(fields)
    } finally {
      setSavingOwner(false)
    }
  }

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validatePet(petForm)
    setPetErrors(errors)
    if (!selectedOwner) {
      setPetMessage('Seleccione el propietario. Si no está registrado, debe registrarse primero.')
      return
    }
    if (Object.keys(errors).length > 0) {
      setPetMessage('Revise los campos marcados.')
      return
    }
    setSavingPet(true)
    setPetMessage('')
    try {
      await createPet({
        ownerId: selectedOwner.id,
        name: petForm.name.trim(),
        species: petForm.species.trim(),
        breed: blankToNull(petForm.breed),
        sex: petForm.sex as Sex,
        birthDate: petForm.birthDate || null,
        weight: petForm.weight.trim() ? Number(petForm.weight) : null,
      })
      setSaved(true)
      setTimeout(() => onNavigate('dashboard'), 1200)
    } catch (err) {
      const { message, fields } = apiErrorMessage(err)
      setPetMessage(message)
      setPetErrors(fields)
      setSavingPet(false)
    }
  }

  const sectionStyle = { background: 'var(--card)', border: '1px solid var(--border)' }
  const sectionTitle = 'text-sm font-semibold uppercase tracking-wider'
  const primaryButton = 'px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
  const secondaryButton = 'px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150'

  return (
    <div className="p-8 max-w-3xl space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          aria-label="Volver al panel de pacientes"
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-70 text-sm"
          style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Registro de paciente
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Seleccione el propietario y complete los datos del paciente
          </p>
        </div>
      </div>

      {saved && (
        <p role="status" className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#ecfdf5', color: '#047857' }}>
          Paciente registrado correctamente. Redirigiendo al panel...
        </p>
      )}

      {/* Sección: Propietario */}
      <section className="rounded-xl p-6 space-y-4" style={sectionStyle} aria-labelledby="titulo-propietario">
        <h2 id="titulo-propietario" className={sectionTitle} style={{ color: 'var(--muted-foreground)' }}>
          Propietario
        </h2>

        {ownersError && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{ownersError}</p>}

        {selectedOwner && !creatingOwner && (
          <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'var(--brand-light)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selectedOwner.firstName} {selectedOwner.lastName}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {selectedOwner.documentType} {selectedOwner.documentNumber} · {selectedOwner.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedOwner(null); setOwnerQuery('') }}
              className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
              style={{ background: 'var(--card)', color: 'var(--primary)' }}
            >
              Cambiar
            </button>
          </div>
        )}

        {!selectedOwner && !creatingOwner && (
          <div className="space-y-3">
            <Field id="buscar-propietario" label="Buscar propietario">
              <input
                id="buscar-propietario"
                type="search"
                value={ownerQuery}
                onChange={(e) => setOwnerQuery(e.target.value)}
                placeholder="Nombre o número de documento"
                className={INPUT_CLASS}
              />
            </Field>

            {ownerMatches.length > 0 && (
              <ul className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {ownerMatches.map((o) => (
                  <li key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => { setSelectedOwner(o); setPetMessage('') }}
                      className="w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f8faff]"
                    >
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>{o.firstName} {o.lastName}</span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {o.documentType} {o.documentNumber}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {ownerQuery.trim() && ownerMatches.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No se encontró ningún propietario.</p>
            )}

            <button
              type="button"
              onClick={() => { setCreatingOwner(true); setOwnerMessage('') }}
              className="text-sm font-medium cursor-pointer"
              style={{ color: 'var(--primary)' }}
            >
              + Registrar nuevo propietario
            </button>
          </div>
        )}

        {creatingOwner && (
          <form onSubmit={handleCreateOwner} noValidate className="space-y-4" aria-label="Registro de propietario">
            <div className="grid grid-cols-2 gap-4">
              <Field id="owner-documentType" label="Tipo de documento" required>
                <select
                  {...fieldAria('owner-documentType', ownerErrors.documentType)}
                  value={ownerForm.documentType}
                  onChange={setOwnerField('documentType')}
                  className={INPUT_CLASS + ' cursor-pointer'}
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
                    <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </Field>
              <Field id="owner-documentNumber" label="Número de documento" required error={ownerErrors.documentNumber}>
                <input
                  {...fieldAria('owner-documentNumber', ownerErrors.documentNumber)}
                  type="text" value={ownerForm.documentNumber} onChange={setOwnerField('documentNumber')} className={INPUT_CLASS}
                />
              </Field>
              <Field id="owner-firstName" label="Nombres" required error={ownerErrors.firstName}>
                <input
                  {...fieldAria('owner-firstName', ownerErrors.firstName)}
                  type="text" autoComplete="given-name" value={ownerForm.firstName} onChange={setOwnerField('firstName')} className={INPUT_CLASS}
                />
              </Field>
              <Field id="owner-lastName" label="Apellidos" required error={ownerErrors.lastName}>
                <input
                  {...fieldAria('owner-lastName', ownerErrors.lastName)}
                  type="text" autoComplete="family-name" value={ownerForm.lastName} onChange={setOwnerField('lastName')} className={INPUT_CLASS}
                />
              </Field>
              <Field id="owner-phone" label="Celular" required error={ownerErrors.phone}>
                <input
                  {...fieldAria('owner-phone', ownerErrors.phone)}
                  type="tel" autoComplete="tel" value={ownerForm.phone} onChange={setOwnerField('phone')} className={INPUT_CLASS}
                />
              </Field>
              <Field id="owner-email" label="Correo electrónico" error={ownerErrors.email}>
                <input
                  {...fieldAria('owner-email', ownerErrors.email)}
                  type="email" autoComplete="email" value={ownerForm.email} onChange={setOwnerField('email')} className={INPUT_CLASS}
                />
              </Field>
            </div>
            <Field id="owner-address" label="Dirección" error={ownerErrors.address}>
              <input
                {...fieldAria('owner-address', ownerErrors.address)}
                type="text" autoComplete="street-address" value={ownerForm.address} onChange={setOwnerField('address')} className={INPUT_CLASS}
              />
            </Field>

            {ownerMessage && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{ownerMessage}</p>}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={savingOwner} className={primaryButton} style={{ background: 'var(--primary)' }}>
                {savingOwner ? 'Guardando...' : 'Guardar propietario'}
              </button>
              <button
                type="button"
                onClick={() => { setCreatingOwner(false); setOwnerErrors({}); setOwnerMessage('') }}
                className={secondaryButton}
                style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Sección: Datos del paciente */}
      <form onSubmit={handleCreatePet} noValidate className="space-y-6" aria-label="Registro de paciente">
        <section className="rounded-xl p-6 space-y-5" style={sectionStyle} aria-labelledby="titulo-paciente">
          <h2 id="titulo-paciente" className={sectionTitle} style={{ color: 'var(--muted-foreground)' }}>
            Datos del paciente
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field id="pet-name" label="Nombre" required error={petErrors.name}>
              <input {...fieldAria('pet-name', petErrors.name)} type="text" value={petForm.name} onChange={setPetField('name')} className={INPUT_CLASS} />
            </Field>
            <Field id="pet-species" label="Especie" required error={petErrors.species}>
              <input
                {...fieldAria('pet-species', petErrors.species)}
                type="text" list="species-suggestions" value={petForm.species} onChange={setPetField('species')} className={INPUT_CLASS}
              />
              <datalist id="species-suggestions">
                {SPECIES_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field id="pet-breed" label="Raza" error={petErrors.breed}>
              <input
                {...fieldAria('pet-breed', petErrors.breed)}
                type="text" list="breed-suggestions" value={petForm.breed} onChange={setPetField('breed')} className={INPUT_CLASS}
              />
              <datalist id="breed-suggestions">
                {(BREED_SUGGESTIONS[petForm.species.trim()] ?? []).map((b) => <option key={b} value={b} />)}
              </datalist>
            </Field>
            <Field id="pet-sex" label="Sexo" required error={petErrors.sex}>
              <select {...fieldAria('pet-sex', petErrors.sex)} value={petForm.sex} onChange={setPetField('sex')} className={INPUT_CLASS + ' cursor-pointer'}>
                <option value="">Seleccionar...</option>
                {(Object.keys(SEX_LABELS) as Sex[]).map((s) => <option key={s} value={s}>{SEX_LABELS[s]}</option>)}
              </select>
            </Field>
            <Field id="pet-birthDate" label="Fecha de nacimiento" error={petErrors.birthDate}>
              <input
                {...fieldAria('pet-birthDate', petErrors.birthDate)}
                type="date" max={todayIso()} value={petForm.birthDate} onChange={setPetField('birthDate')} className={INPUT_CLASS}
              />
            </Field>
            <Field id="pet-weight" label="Peso (kg)" error={petErrors.weight}>
              <input
                {...fieldAria('pet-weight', petErrors.weight)}
                type="number" min="0.01" step="0.01" value={petForm.weight} onChange={setPetField('weight')} className={INPUT_CLASS}
              />
            </Field>
          </div>
        </section>

        {petMessage && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{petMessage}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingPet || saved} className={primaryButton} style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            {savingPet ? 'Guardando...' : 'Guardar paciente'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={secondaryButton}
            style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
