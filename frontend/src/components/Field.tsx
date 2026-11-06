import type { ReactNode } from 'react'

export const INPUT_CLASS = 'bv-input w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150'

/** Atributos de accesibilidad de un campo: id, estado inválido y referencia a su mensaje de error. */
export function fieldAria(id: string, error?: string) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

interface FieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

/** Etiqueta asociada al campo y mensaje de error debajo (WCAG 2.1: 1.3.1, 3.3.1, 3.3.2). */
export default function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
        {label} {required && <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>}
        {required && <span className="sr-only">(obligatorio)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs mt-1" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}
    </div>
  )
}
