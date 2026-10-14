# Inicio de desarrollo local

## Requisitos

- Git y acceso autorizado al repositorio.
- Node.js 18.x para coincidir con los workflows de GitHub Actions. `package.json` no fija un rango `engines`; acuerda y prueba otra versión antes de cambiar la versión de CI.
- npm, incluido con Node.js.

## Instalar y ejecutar

Desde la raíz del repositorio:

```sh
cd frontend
npm ci
npm run dev
```

Vite está configurado para el puerto 3000: abre `http://localhost:3000`. Si el puerto está ocupado, Vite puede indicar otro puerto.

| Comando | Función |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga rápida. |
| `npm run typecheck` | Ejecuta `tsc --noEmit`. |
| `npm run build` | Compila el frontend en `frontend/dist/`. |
| `npm run preview` | Sirve localmente el build ya generado. |

Usa `npm ci` para reproducir las dependencias fijadas en `package-lock.json`. Usa `npm install` si estás cambiando dependencias y actualizando intencionalmente el lockfile.

## Firebase y datos

`frontend/src/services/firebase.ts` contiene una configuración Firebase de cliente en el código. `utils/env.ts` declara helpers para variables `VITE_FIREBASE_*`, pero el servicio de inicialización inspeccionado no los usa. Crear un `.env.local` con esos nombres **no cambia por sí mismo** el proyecto al que se conecta la app.

Antes de ejecutar la aplicación que escribe datos:

1. Confirma el proyecto que utiliza el código y quién administra ese proyecto.
2. Usa un proyecto Firebase de desarrollo o configura explícitamente Firebase Emulator Suite.
3. Comprueba que las cuentas de prueba y reglas sean de desarrollo.
4. No escribas diarios, chats ni registros de personas reales en pruebas.

No se identificó un `.env.example` ni una configuración completa del emulador en el repositorio. Si se agrega configuración por ambiente, debe actualizarse también `firebase.ts`, CI, Vercel y esta guía.

## Variables de entorno y secretos

Vite publica en el bundle del navegador todas las variables con prefijo `VITE_`. Por lo tanto, no pongas en ellas claves privadas, tokens de administración ni credenciales de servidor, aunque el archivo `.env.local` esté ignorado por Git.

Hay código que consume `VITE_GROQ_API_KEY` desde el cliente. No uses una clave privada o de producción ahí. Si se requiere IA, migra la solicitud a una función/backend con secreto de servidor y limita los datos transmitidos; desactivar la variable no convierte las llamadas directas en arquitectura segura.

La configuración Firebase de cliente no es una clave administrativa. No obstante, las reglas deben limitar el acceso y el cliente actual debe conectarse solo al proyecto autorizado para la tarea.

## Validación y CI

El workflow `.github/workflows/ci.yml` instala dependencias y ejecuta `npm run build`; no ejecuta `npm run typecheck` ni pruebas automatizadas. `frontend/package.json` no define comandos de test o lint. Ejecuta localmente:

```sh
npm run typecheck
npm run build
```

No interpretes un build Vite exitoso como validación de tipos. No se pudo confirmar el resultado de estas verificaciones al redactar esta guía si faltan dependencias en el entorno: primero ejecuta `npm ci` desde `frontend/` y registra los resultados reales.

## Trabajo seguro

1. Trabaja en una rama y solicita revisión de los cambios antes de integrarlos.
2. Revisa `git status` para evitar subir archivos `.env`, datos exportados, credenciales o datos personales.
3. No despliegues reglas ni publiques un build sin confirmar el proyecto/entorno destino.
4. No asumas que un repositorio privado hace privado el sitio, sus previews o los recursos Firebase.
