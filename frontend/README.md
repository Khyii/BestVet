# Best Vet — Frontend

Frontend de Best Vet construido con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js 20.19 o superior (requisito de Vite 8).
- npm (el proyecto usa `package-lock.json`; instalar con `npm ci`).

## Ejecutar en desarrollo

Desde la carpeta del proyecto:

```bash
npm ci
npm run dev
```

Vite mostrará la dirección local en la terminal (normalmente `http://localhost:5173`).

## Crear una compilación de producción

```bash
npm run build
npm run preview
```

Los archivos de producción se generan en `dist/`.

## Conexión con el backend

En desarrollo, el servidor de Vite reenvía las peticiones a `/api` hacia el backend Spring Boot
(proxy definido en `vite.config.ts`). Por defecto el destino es `http://localhost:8081`; para usar
otro puerto:

```bash
BESTVET_BACKEND_URL=http://localhost:8080 npm run dev
```

El inicio de sesión valida las credenciales contra `GET /api/me` mediante HTTP Basic. Las
credenciales se guardan solo en memoria: al recargar la página se debe iniciar sesión de nuevo.
Las opciones del menú dependen del rol devuelto por el backend (Secretaria o Veterinario).

Las vistas de pacientes, historia clínica y citas aún usan datos de demostración y se conectan
al backend de forma progresiva.

## Estructura principal

- `src/App.tsx`: navegación principal y sesión del usuario autenticado.
- `src/api/`: cliente HTTP (HTTP Basic, manejo de errores) y tipos compartidos con el backend.
- `src/auth/permissions.ts`: vistas permitidas por rol.
- `src/components/Sidebar.tsx`: menú lateral filtrado por rol.
- `src/views/`: pantallas de login, pacientes, formulario, perfil e historial, y calendario.
- `src/index.css`: estilos globales y tema.
- `index.html`: documento HTML de entrada.
- `vite.config.ts`: configuración estándar de Vite, React y Tailwind CSS.
