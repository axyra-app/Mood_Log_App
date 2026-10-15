# Inicio de desarrollo local

## Requisitos

- Git y acceso autorizado al repositorio.
- Node.js 22.x para coincidir con los workflows de GitHub Actions y los requisitos actuales de Firebase CLI. `package.json` no fija un rango `engines`; prueba otra versión antes de cambiar la versión de CI.
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

La configuración de emuladores Firestore y Storage está en `firebase.json`; `npm run test:rules` inicia ambos con un ID de proyecto demo y prueba sus reglas sin desplegar. Esto no configura la app cliente para apuntar a emuladores. No hay emulador de Auth configurado. Si se agrega configuración por ambiente, debe actualizarse también `firebase.ts`, CI, Vercel y esta guía.

## Variables de entorno y secretos

Vite publica en el bundle del navegador todas las variables con prefijo `VITE_`. Por lo tanto, no pongas en ellas claves privadas, tokens de administración ni credenciales de servidor, aunque el archivo `.env.local` esté ignorado por Git.

Las llamadas activas de IA usan `/api/ai` en Vercel y requieren secretos de servidor configurados en el panel: `GROQ_API_KEY`, `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT_JSON`. No agregues `VITE_GROQ_API_KEY`: cualquier variable `VITE_*` puede quedar expuesta en el bundle. El servidor local de Vite no ejecuta esta función; prueba la IA desde un Preview de Vercel.

La configuración Firebase de cliente no es una clave administrativa. No obstante, las reglas deben limitar el acceso y el cliente actual debe conectarse solo al proyecto autorizado para la tarea.

## Validación y CI

El workflow `.github/workflows/ci.yml` instala dependencias, prueba reglas Firestore/Storage, ejecuta typecheck, auditoría de dependencias de producción y build; aún no ejecuta pruebas de componentes/servicios. `frontend/package.json` define el comando de reglas, pero no comandos generales de test o lint. Ejecuta localmente:

```sh
npm run test:rules
npm run typecheck
npm audit --omit=dev
npm run build
```

No interpretes un build Vite exitoso como validación de tipos. La última verificación local registrada pasó estas cuatro comprobaciones; tras cambiar código o dependencias, vuelve a ejecutarlas y registra cualquier fallo.

## Trabajo seguro

1. Trabaja en una rama y solicita revisión de los cambios antes de integrarlos.
2. Revisa `git status` para evitar subir archivos `.env`, datos exportados, credenciales o datos personales.
3. No despliegues reglas ni publiques un build sin confirmar el proyecto/entorno destino.
4. No asumas que un repositorio privado hace privado el sitio, sus previews o los recursos Firebase.
