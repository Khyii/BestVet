import { useEffect, useState } from 'react'
import type { View } from '../App'
import { getOwner, updateOwner } from '../api/owners'
import { getPet, updatePet } from '../api/pets'
import { DOCUMENT_TYPE_LABELS, PET_STATUS_LABELS, SEX_LABELS, type Owner, type Pet, type PetStatus } from '../api/types'
import MedicalRecordSection from '../components/MedicalRecordSection'
import OwnerFields from '../components/OwnerFields'
import PetFields from '../components/PetFields'
import {
  apiErrorMessage,
  ownerFormToRequest,
  ownerToForm,
  petFormToFields,
  petToForm,
  validateOwner,
  validatePet,
  type Errors,
  type OwnerForm,
  type PetForm,
} from '../forms/patientForms'
import { formatAge } from '../utils/age'

const STATUS_COLORS: Record<PetStatus, { background: string; color: string }> = {
  ACTIVE: { background: '#ecfdf5', color: '#047857' },
  INACTIVE: { background: '#f3f4f6', color: '#4b5563' },
  DECEASED: { background: '#fef2f2', color: '#b91c1c' },
}

const CARD = { background: 'var(--card)', border: '1px solid var(--border)' }
const PRIMARY_BUTTON = 'px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
const SECONDARY_BUTTON = 'px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150'
const EDIT_BUTTON = 'text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer'

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
      <dd className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{value}</dd>
    </div>
  )
}

function SaveCancel({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="submit" disabled={saving} className={PRIMARY_BUTTON} style={{ background: 'var(--primary)' }}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={SECONDARY_BUTTON}
        style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
      >
        Cancelar
      </button>
    </div>
  )
}

interface PatientProfileViewProps {
  patientId: number
  /** Solo la secretaria edita propietarios y pacientes (RF5). */
  canEdit: boolean
  /** Solo el veterinario ve y registra la historia clínica (RF11, RF12). */
  showMedicalRecord: boolean
  onNavigate: (v: View) => void
}

export default function PatientProfileView({ patientId, canEdit, showMedicalRecord, onNavigate }: PatientProfileViewProps) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  // Edición del paciente (CU07)
  const [editingPet, setEditingPet] = useState(false)
  const [petForm, setPetForm] = useState<PetForm | null>(null)
  const [petStatus, setPetStatus] = useState<PetStatus>('ACTIVE')
  const [petErrors, setPetErrors] = useState<Errors>({})
  const [petMessage, setPetMessage] = useState('')
  const [savingPet, setSavingPet] = useState(false)

  // Edición del propietario (CU06)
  const [editingOwner, setEditingOwner] = useState(false)
  const [ownerForm, setOwnerForm] = useState<OwnerForm | null>(null)
  const [ownerErrors, setOwnerErrors] = useState<Errors>({})
  const [ownerMessage, setOwnerMessage] = useState('')
  const [savingOwner, setSavingOwner] = useState(false)

  useEffect(() => {
    let active = true
    setPet(null)
    setOwner(null)
    setLoadError('')
    getPet(patientId)
      .then(async (p) => {
        const o = await getOwner(p.ownerId)
        if (!active) return
        setPet(p)
        setOwner(o)
      })
      .catch((err) => { if (active) setLoadError(apiErrorMessage(err).message) })
    return () => { active = false }
  }, [patientId])

  const startPetEdit = () => {
    if (!pet) return
    setPetForm(petToForm(pet))
    setPetStatus(pet.status)
    setPetErrors({})
    setPetMessage('')
    setNotice('')
    setEditingPet(true)
  }

  const startOwnerEdit = () => {
    if (!owner) return
    setOwnerForm(ownerToForm(owner))
    setOwnerErrors({})
    setOwnerMessage('')
    setNotice('')
    setEditingOwner(true)
  }

  const savePet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pet || !petForm) return
    const errors = validatePet(petForm)
    setPetErrors(errors)
    if (Object.keys(errors).length > 0) {
      setPetMessage('Revise los campos marcados.')
      return
    }
    setSavingPet(true)
    setPetMessage('')
    try {
      const updated = await updatePet(pet.id, { ...petFormToFields(petForm), status: petStatus })
      setPet(updated)
      setEditingPet(false)
      setNotice('Cambios guardados.')
    } catch (err) {
      // Incluye la regla de RF5: si no hay cambios, el backend no guarda e informa.
      const { message, fields } = apiErrorMessage(err)
      setPetMessage(message)
      setPetErrors(fields)
    } finally {
      setSavingPet(false)
    }
  }

  const saveOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!owner || !ownerForm || !pet) return
    const errors = validateOwner(ownerForm)
    setOwnerErrors(errors)
    if (Object.keys(errors).length > 0) {
      setOwnerMessage('Revise los campos marcados.')
      return
    }
    setSavingOwner(true)
    setOwnerMessage('')
    try {
      const updated = await updateOwner(owner.id, ownerFormToRequest(ownerForm))
      setOwner(updated)
      // El contacto que muestra el perfil (RF7) se actualiza de inmediato (postcondición de RF5).
      setPet({
        ...pet,
        ownerName: `${updated.firstName} ${updated.lastName}`,
        ownerPhone: updated.phone,
        ownerEmail: updated.email,
      })
      setEditingOwner(false)
      setNotice('Cambios guardados.')
    } catch (err) {
      const { message, fields } = apiErrorMessage(err)
      setOwnerMessage(message)
      setOwnerErrors(fields)
    } finally {
      setSavingOwner(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          aria-label="Volver al panel de pacientes"
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-70 text-sm"
          style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        >
          ←
        </button>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Perfil del paciente
        </h1>
      </div>

      {loadError && (
        <p role="alert" className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', color: '#b91c1c' }}>
          {loadError}
        </p>
      )}
      {!pet && !loadError && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Cargando...</p>}

      {notice && (
        <p role="status" className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#ecfdf5', color: '#047857' }}>
          {notice}
        </p>
      )}

      {pet && owner && (
        <>
          {/* Datos del paciente */}
          <section className="rounded-xl p-6" style={CARD} aria-labelledby="titulo-paciente">
            {!editingPet && (
              <div className="flex items-start gap-5">
                <div
                  aria-hidden="true"
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                  style={{ background: 'var(--primary)' }}
                >
                  {pet.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 id="titulo-paciente" className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                          {pet.name}
                        </h2>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={STATUS_COLORS[pet.status]}>
                          {PET_STATUS_LABELS[pet.status]}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                      </p>
                    </div>
                    {canEdit && (
                      <button type="button" onClick={startPetEdit} className={EDIT_BUTTON} style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
                        Editar paciente
                      </button>
                    )}
                  </div>
                  <dl className="grid grid-cols-4 gap-4">
                    <Datum label="Sexo" value={SEX_LABELS[pet.sex]} />
                    <Datum label="Edad" value={formatAge(pet.birthDate)} />
                    <Datum label="Fecha de nacimiento" value={pet.birthDate ?? '—'} />
                    <Datum label="Peso" value={pet.weight === null ? '—' : `${pet.weight} kg`} />
                  </dl>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Observaciones</p>
                    <p className="text-sm whitespace-pre-line" style={{ color: 'var(--foreground)' }}>
                      {pet.observations ?? 'Sin observaciones.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {editingPet && petForm && (
              <form onSubmit={savePet} noValidate className="space-y-5" aria-label="Edición del paciente">
                <h2 id="titulo-paciente" className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                  Editar paciente
                </h2>
                <PetFields
                  idPrefix="edit-pet"
                  form={petForm}
                  errors={petErrors}
                  onChange={(k, v) => setPetForm((f) => (f ? { ...f, [k]: v } : f))}
                  status={petStatus}
                  onStatusChange={setPetStatus}
                />
                {petMessage && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{petMessage}</p>}
                <SaveCancel saving={savingPet} onCancel={() => setEditingPet(false)} />
              </form>
            )}
          </section>

          {/* Contacto del propietario (RF7, CU10) */}
          <section className="rounded-xl p-6" style={CARD} aria-labelledby="titulo-propietario">
            {!editingOwner && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 id="titulo-propietario" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Propietario y contacto
                  </h2>
                  {canEdit && (
                    <button type="button" onClick={startOwnerEdit} className={EDIT_BUTTON} style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
                      Editar propietario
                    </button>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-4">
                  <Datum label="Nombre" value={pet.ownerName} />
                  <Datum label="Documento" value={`${DOCUMENT_TYPE_LABELS[owner.documentType]} ${owner.documentNumber}`} />
                  <Datum label="Celular" value={pet.ownerPhone} />
                  {/* RF7: si el propietario no tiene correo, se muestra solo el celular. */}
                  {pet.ownerEmail && <Datum label="Correo electrónico" value={pet.ownerEmail} />}
                  {owner.address && <Datum label="Dirección" value={owner.address} />}
                </dl>
              </div>
            )}

            {editingOwner && ownerForm && (
              <form onSubmit={saveOwner} noValidate className="space-y-5" aria-label="Edición del propietario">
                <h2 id="titulo-propietario" className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                  Editar propietario
                </h2>
                <OwnerFields
                  idPrefix="edit-owner"
                  form={ownerForm}
                  errors={ownerErrors}
                  onChange={(k, v) => setOwnerForm((f) => (f ? { ...f, [k]: v } : f))}
                />
                {ownerMessage && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{ownerMessage}</p>}
                <SaveCancel saving={savingOwner} onCancel={() => setEditingOwner(false)} />
              </form>
            )}
          </section>

          {showMedicalRecord && <MedicalRecordSection petId={pet.id} />}
        </>
      )}
    </div>
  )
}
