import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Asegura que cada prueba empiece con el DOM limpio y evita elementos duplicados.
afterEach(() => {
  cleanup()
})
