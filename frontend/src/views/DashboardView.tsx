import { useEffect, useState } from 'react'
import type { View } from '../App'
import { ApiError } from '../api/client'
import { searchPets, type PetSearch } from '../api/pets'
import { PET_STATUS_LABELS, type Pet, type PetStatus } from '../api/types'
import { INPUT_CLASS } from '../components/Field'
import { formatAge } from '../utils/age'

/** Retardo antes de consultar al backend mientras el usuario escribe. */
export const SEARCH_DEBOUNCE_MS = 300

interface Filters {
  q: string
  breed: string
  owner: string
  minAge: string
  maxAge: string
}

const EMPTY_FILTERS: Filters = { q: '', breed: '', owner: '', minAge: '', maxAge: '' }

const STATUS_COLORS: Record<PetStatus, { background: string; color: string }> = {
  ACTIVE: { background: '#ecfdf5', color: '#047857' },
  INACTIVE: { background: '#f3f4f6', color: '#4b5563' },
  DECEASED: { background: '#fef2f2', color: '#b91c1c' },
}

function toSearch(f: Filters): PetSearch {
  const age = (v: string) => (v.trim() === '' ? undefined : Number(v))
  return { q: f.q, breed: f.breed, owner: f.owner, minAge: age(f.minAge), maxAge: age(f.maxAge) }
}

function formatToday(): string {
  const text = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface DashboardViewProps {
  /** Solo la secretaria registra pacientes (RF4). */
  canRegister: boolean
  onNavigate: (v: View) => void
  onSelectPatient: (patientId: number) => void
}

export default function DashboardView({ canRegister, onNavigate, onSelectPatient }: DashboardViewProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // RF6: cada cambio en el texto o los filtros consulta al backend, que combina todos los criterios.
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const result = await searchPets(toSearch(filters), controller.signal)
        setPets(result)
        setError('')
      } catch (err) {
        if (controller.signal.aborted) return
        setPets([])
        setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado al buscar pacientes.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [filters])

  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }))

  const hasFilters = Object.values(filters).some((v) => v.trim() !== '')

  return (
    <div className="p-8 space-y-8">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Panel de pacientes
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{formatToday()}</p>
        </div>
        {canRegister && (
          <button
            type="button"
            onClick={() => onNavigate('patient-form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:opacity-90"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          >
            <span aria-hidden="true" className="text-base">+</span> Nuevo paciente
          </button>
        )}
      </div>

      {/* Búsqueda (CU08) y filtros (CU09) */}
      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-60">
            <label htmlFor="filtro-nombre" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Nombre del paciente
            </label>
            <input
              id="filtro-nombre"
              type="search"
              value={filters.q}
              onChange={set('q')}
              placeholder="Nombre completo o parcial"
              className={INPUT_CLASS}
            />
          </div>
          <div className="w-44">
            <label htmlFor="filtro-raza" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Raza
            </label>
            <input id="filtro-raza" type="text" value={filters.breed} onChange={set('breed')} className={INPUT_CLASS} />
          </div>
          <div className="w-52">
            <label htmlFor="filtro-propietario" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Propietario
            </label>
            <input
              id="filtro-propietario"
              type="text"
              value={filters.owner}
              onChange={set('owner')}
              placeholder="Nombre o documento"
              className={INPUT_CLASS}
            />
          </div>
          <div className="w-24">
            <label htmlFor="filtro-edad-min" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Edad mín.
            </label>
            <input id="filtro-edad-min" type="number" min={0} value={filters.minAge} onChange={set('minAge')} className={INPUT_CLASS} />
          </div>
          <div className="w-24">
            <label htmlFor="filtro-edad-max" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Edad máx.
            </label>
            <input id="filtro-edad-max" type="number" min={0} value={filters.maxAge} onChange={set('maxAge')} className={INPUT_CLASS} />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs px-3 py-2.5 rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: '#fee2e2', color: '#b91c1c' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }} aria-live="polite">
          {loading
            ? 'Buscando...'
            : `${pets.length} ${pets.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}`}
          <span className="ml-1">· Edad en años cumplidos</span>
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {/* Resultados */}
      <div className="rounded-xl overflow-x-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Paciente', 'Especie', 'Raza', 'Edad', 'Propietario', 'Estado', 'Acciones'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pets.map((p, i) => (
              <tr
                key={p.id}
                className="transition-colors duration-100 cursor-pointer hover:bg-[#f8faff]"
                style={{ borderBottom: i < pets.length - 1 ? '1px solid var(--border)' : 'none' }}
                onClick={() => onSelectPatient(p.id)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--foreground)' }}>{p.species}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.breed ?? '—'}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>{formatAge(p.birthDate)}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--foreground)' }}>{p.ownerName}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={STATUS_COLORS[p.status]}>
                    {PET_STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                    style={{ background: 'var(--brand-light)', color: 'var(--primary)' }}
                    onClick={(e) => { e.stopPropagation(); onSelectPatient(p.id) }}
                    aria-label={`Ver perfil de ${p.name}`}
                  >
                    Ver perfil
                  </button>
                </td>
              </tr>
            ))}

            {!loading && !error && pets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Ningún paciente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
