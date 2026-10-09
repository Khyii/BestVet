import { useState } from 'react'
import { View } from '../App'

const ANIMALES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro']
const RAZAS_BY_ANIMAL: Record<string, string[]> = {
  Perro: ['Golden Retriever', 'Labrador', 'Bulldog', 'Poodle', 'Pastor Alemán', 'Chihuahua', 'Beagle', 'Otra'],
  Gato: ['Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll', 'Otra'],
  Ave: ['Cotorra', 'Canario', 'Agaporni', 'Cacatúa', 'Otra'],
  Conejo: ['Holland Lop', 'Mini Rex', 'Angora', 'Otra'],
  Reptil: ['Iguana', 'Gecko', 'Serpiente', 'Tortuga', 'Otra'],
  Otro: ['Otra'],
}

interface PatientFormViewProps {
  onNavigate: (v: View) => void
}

export default function PatientFormView({ onNavigate }: PatientFormViewProps) {
  const [form, setForm] = useState({
    nombre: '',
    animal: 'Perro',
    raza: '',
    dueño: '',
    correo: '',
    celular: '',
    fechaNacimiento: '',
    peso: '',
    vacunas: '',
    infoAdicional: '',
  })
  const [saved, setSaved] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => onNavigate('dashboard'), 1200)
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
  const inputStyle = { border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }
  const focusStyle = (e: React.FocusEvent<any>) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff' }
  const blurStyle = (e: React.FocusEvent<any>) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--muted)' }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-70 text-sm"
          style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        >
          ←
        </button>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Registro de paciente
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Completa los datos del nuevo paciente y su dueño
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#ecfdf5', color: '#059669' }}>
          ✓ Paciente guardado correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Datos de la mascota */}
        <section
          className="rounded-xl p-6 space-y-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            Datos de la mascota
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Nombre de mascota <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={set('nombre')}
                placeholder="ej. Canela"
                required
                className={inputClass}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Animal <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.animal}
                onChange={(e) => { set('animal')(e); setForm((f) => ({ ...f, raza: '' })) }}
                className={inputClass + ' cursor-pointer'}
                style={inputStyle}
              >
                {ANIMALES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Raza <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.raza}
                onChange={set('raza')}
                required
                className={inputClass + ' cursor-pointer'}
                style={inputStyle}
              >
                <option value="">Seleccionar raza...</option>
                {(RAZAS_BY_ANIMAL[form.animal] || []).map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={form.fechaNacimiento}
                onChange={set('fechaNacimiento')}
                className={inputClass}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Peso (kg)
              </label>
              <input
                type="number"
                value={form.peso}
                onChange={set('peso')}
                placeholder="ej. 12.5"
                step="0.1"
                className={inputClass}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Vacunas al día
              </label>
              <select value={form.vacunas} onChange={set('vacunas')} className={inputClass + ' cursor-pointer'} style={inputStyle}>
                <option value="">Sin especificar</option>
                <option>Sí</option>
                <option>No</option>
                <option>Parcialmente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Información adicional
            </label>
            <textarea
              value={form.infoAdicional}
              onChange={set('infoAdicional')}
              placeholder="Alergias, condiciones crónicas, notas relevantes..."
              rows={3}
              className={inputClass + ' resize-none'}
              style={{ ...inputStyle, lineHeight: '1.5' }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </section>

        {/* Sección: Datos del dueño */}
        <section
          className="rounded-xl p-6 space-y-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            Datos del dueño
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Nombre del dueño <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.dueño}
                onChange={set('dueño')}
                placeholder="ej. Ana Torres"
                required
                className={inputClass}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={set('correo')}
                placeholder="correo@ejemplo.com"
                className={inputClass}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                Celular
              </label>
              <input
                type="tel"
                value={form.celular}
                onChange={set('celular')}
                placeholder="+52 55 1234 5678"
                className={inputClass}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-150"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#0070e0')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
          >
            Guardar paciente
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150"
            style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
