import { useState } from 'react'
import { View } from '../App'

export const PATIENTS = [
  { id: 1, nombre: 'Canela', animal: 'Perro', raza: 'Golden Retriever', dueño: 'Ana Torres', correo: 'ana.torres@gmail.com', celular: '+52 55 8847 3021', fecha: '2024-03-12', estado: 'Activo', edad: '4 años', peso: '28 kg' },
  { id: 2, nombre: 'Mochi', animal: 'Gato', raza: 'Siamés', dueño: 'Carlos Ruiz', correo: 'carlos.ruiz@gmail.com', celular: '+52 55 7124 8360', fecha: '2024-03-10', estado: 'Activo', edad: '2 años', peso: '4.8 kg' },
  { id: 3, nombre: 'Rocky', animal: 'Perro', raza: 'Bulldog', dueño: 'Fernanda López', correo: 'fernanda.lopez@gmail.com', celular: '+52 55 6309 1427', fecha: '2024-03-08', estado: 'Seguimiento', edad: '6 años', peso: '23 kg' },
  { id: 4, nombre: 'Luna', animal: 'Gato', raza: 'Persa', dueño: 'Miguel Salas', correo: 'miguel.salas@gmail.com', celular: '+52 55 9081 2764', fecha: '2024-03-05', estado: 'Activo', edad: '3 años', peso: '4.2 kg' },
  { id: 5, nombre: 'Thor', animal: 'Perro', raza: 'Labrador', dueño: 'Valeria Méndez', correo: 'valeria.mendez@gmail.com', celular: '+52 55 3548 9210', fecha: '2024-02-28', estado: 'Inactivo', edad: '8 años', peso: '31 kg' },
  { id: 6, nombre: 'Coco', animal: 'Ave', raza: 'Cotorra', dueño: 'Pablo Herrera', correo: 'pablo.herrera@gmail.com', celular: '+52 55 4820 6351', fecha: '2024-02-20', estado: 'Activo', edad: '2 años', peso: '320 g' },
  { id: 7, nombre: 'Bella', animal: 'Perro', raza: 'Poodle', dueño: 'Diana Castillo', correo: 'diana.castillo@gmail.com', celular: '+52 55 7613 0842', fecha: '2024-02-14', estado: 'Seguimiento', edad: '5 años', peso: '7.4 kg' },
  { id: 8, nombre: 'Nala', animal: 'Gato', raza: 'Maine Coon', dueño: 'Roberto Vega', correo: 'roberto.vega@gmail.com', celular: '+52 55 2197 5483', fecha: '2024-02-10', estado: 'Activo', edad: '4 años', peso: '6.1 kg' },
]

const TIPOS_ANIMAL = ['Todos los animales', 'Perro', 'Gato', 'Ave']
const RAZAS_POR_ANIMAL: Record<string, string[]> = {
  Perro: ['Golden Retriever', 'Bulldog', 'Labrador', 'Poodle'],
  Gato: ['Siamés', 'Persa', 'Maine Coon'],
  Ave: ['Cotorra'],
}
const ESTADOS = ['Todos los estados', 'Activo', 'Seguimiento', 'Inactivo']

const ESTADO_COLORS: Record<string, { bg: string; color: string }> = {
  'Activo': { bg: '#ecfdf5', color: '#059669' },
  'Seguimiento': { bg: '#fffbeb', color: '#d97706' },
  'Inactivo': { bg: '#f9fafb', color: '#6b7280' },
}

const STATS = [
  { label: 'Pacientes activos', value: '124', delta: '+8 este mes' },
  { label: 'Citas hoy', value: '9', delta: '3 pendientes' },
  { label: 'Consultas este mes', value: '67', delta: '+12% vs anterior' },
  { label: 'Nuevos registros', value: '18', delta: 'últimos 30 días' },
]

interface DashboardViewProps {
  onNavigate: (v: View) => void
  onSelectPatient: (patientId: number) => void
}

export default function DashboardView({ onNavigate, onSelectPatient }: DashboardViewProps) {
  const [search, setSearch] = useState('')
  const [animal, setAnimal] = useState('Todos los animales')
  const [raza, setRaza] = useState('Todas las razas')
  const [estado, setEstado] = useState('Todos los estados')
  const razasDisponibles = animal === 'Todos los animales' ? [] : RAZAS_POR_ANIMAL[animal]

  const filtered = PATIENTS.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.dueño.toLowerCase().includes(search.toLowerCase())
    const matchAnimal = animal === 'Todos los animales' || p.animal === animal
    const matchRaza = raza === 'Todas las razas' || p.raza === raza
    const matchEstado = estado === 'Todos los estados' || p.estado === estado
    return matchSearch && matchAnimal && matchRaza && matchEstado
  })

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Panel de pacientes
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Lunes, 12 de marzo de 2024
          </p>
        </div>
        <button
          onClick={() => onNavigate('patient-form')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150"
          style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#0070e0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
        >
          <span className="text-base">+</span> Nuevo paciente
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-60">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--muted-foreground)' }}>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre de mascota o dueño..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--muted)' }}
            />
          </div>

          {/* Tipo de animal: filtro principal */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Tipo de animal</span>
            <select
              value={animal}
              onChange={(e) => {
                setAnimal(e.target.value)
                setRaza('Todas las razas')
              }}
              className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              }}
            >
              {TIPOS_ANIMAL.map((tipo) => <option key={tipo}>{tipo}</option>)}
            </select>
          </div>

          {/* Raza: opciones dependientes del tipo seleccionado */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Raza</span>
            <select
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
              disabled={animal === 'Todos los animales'}
              className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              }}
            >
              <option>Todas las razas</option>
              {razasDisponibles.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Estado filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Estado</span>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              }}
            >
              {ESTADOS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Active filters pills */}
          {(animal !== 'Todos los animales' || raza !== 'Todas las razas' || estado !== 'Todos los estados' || search) && (
            <button
              onClick={() => {
                setSearch('')
                setAnimal('Todos los animales')
                setRaza('Todas las razas')
                setEstado('Todos los estados')
              }}
              className="text-xs px-3 py-2 rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >
              Limpiar filtros ×
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'} encontrados
        </p>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Mascota', 'Animal', 'Raza', 'Dueño', 'Última visita', 'Estado', 'Acciones'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                className="transition-colors duration-100 cursor-pointer"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f8faff')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                onClick={() => onSelectPatient(p.id)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      {p.nombre[0]}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{p.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--foreground)' }}>{p.animal}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.raza}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--foreground)' }}>{p.dueño}</td>
                <td className="px-5 py-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.fecha}</td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={ESTADO_COLORS[p.estado]}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                      style={{ background: 'var(--brand-light, #e8f3ff)', color: 'var(--primary)' }}
                      onClick={(e) => { e.stopPropagation(); onSelectPatient(p.id) }}
                    >
                      Ver perfil
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                      style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
                      onClick={(e) => { e.stopPropagation(); onNavigate('patient-form') }}
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  No se encontraron pacientes con esos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
