import { useState } from 'react'

const DEFAULT_USER = {
  usuario: 'veterinario',
  password: 'prueba1234',
}

interface LoginViewProps {
  onLogin: () => void
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    if (usuario.trim() !== DEFAULT_USER.usuario || password !== DEFAULT_USER.password) {
      setError('Usuario o contraseña incorrectos.')
      return
    }

    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 700)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #f5f6fa 100%)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl shadow-lg p-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          >
            BV
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Best Vet
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Sistema de gestión veterinaria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="veterinario"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--muted)' }}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--muted)' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 mt-2 cursor-pointer"
            style={{
              background: loading ? '#93c5fd' : 'var(--primary)',
              fontFamily: 'var(--font-display)',
            }}
            onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = '#0070e0' }}
            onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = 'var(--primary)' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted-foreground)' }}>
          ¿Olvidaste tu contraseña?{' '}
          <span className="cursor-pointer font-medium" style={{ color: 'var(--primary)' }}>
            Recuperar acceso
          </span>
        </p>
      </div>

      <p className="text-xs mt-6" style={{ color: 'var(--muted-foreground)' }}>
        © 2024 Best Vet · Todos los derechos reservados
      </p>
    </div>
  )
}
