import { useEffect, useMemo, useState } from 'react'
import type { View } from '../App'
import { createOwner, listOwners } from '../api/owners'
import { createPet } from '../api/pets'
import type { Owner } from '../api/types'
import Field, { INPUT_CLASS } from '../components/Field'
import OwnerFields from '../components/OwnerFields'
import PetFields from '../components/PetFields'
import {
  EMPTY_OWNER,
  EMPTY_PET,
  apiErrorMessage,
  ownerFormToRequest,
  petFormToFields,
  validateOwner,
  validatePet,
  type Errors,
  type OwnerForm,
  type PetForm,
} from '../forms/patientForms'

const MAX_OWNER_MATCHES = 6

/** Normaliza texto para buscar sin distinguir mayúsculas ni tildes, como el backend. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
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
      const owner = await createOwner(ownerFormToRequest(ownerForm))
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
      await createPet({ ownerId: selectedOwner.id, ...petFormToFields(petForm) })
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
            <OwnerFields
              idPrefix="owner"
              form={ownerForm}
              errors={ownerErrors}
              onChange={(k, v) => setOwnerForm((f) => ({ ...f, [k]: v }))}
            />

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
          <PetFields
            idPrefix="pet"
            form={petForm}
            errors={petErrors}
            onChange={(k, v) => setPetForm((f) => ({ ...f, [k]: v }))}
          />
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
