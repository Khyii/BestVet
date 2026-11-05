# Best Vet — Frontend

Frontend de Best Vet construido con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js 22 o compatible con Vite 8.
- npm.

## Ejecutar en desarrollo

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local en la terminal (normalmente `http://localhost:5173`).

## Crear una compilación de producción

```bash
npm run build
npm run preview
```

Los archivos de producción se generan en `dist/`.

## Estado actual

Esta versión es únicamente el frontend. No contiene conexión a un backend ni a una base de datos. La interfaz utiliza datos de demostración definidos en el código; los cambios de formularios y citas se mantienen en memoria y no son persistentes.

El inicio de sesión también es simulado para permitir probar la interfaz:
- Usuario: `veterinario`
- Contraseña: `prueba1234`

Estas credenciales son solo para demostración, no son autenticación segura ni deben utilizarse en producción. La autenticación real, la persistencia de pacientes/citas y la autorización deben implementarse al integrar el backend Java.

## Estructura principal

- `src/App.tsx`: navegación principal y estado de sesión de demostración.
- `src/components/Sidebar.tsx`: menú lateral.
- `src/views/`: pantallas de login, pacientes, formulario, perfil e historial, y calendario.
- `src/index.css`: estilos globales y tema.
- `index.html`: documento HTML de entrada.
- `vite.config.ts`: configuración estándar de Vite, React y Tailwind CSS.

## Integración futura con Java

La interfaz está desacoplada de un backend específico. Cuando se defina la API, se pueden sustituir los datos de demostración por llamadas HTTP a los endpoints del backend y manejar sesión, errores y estados de carga.
