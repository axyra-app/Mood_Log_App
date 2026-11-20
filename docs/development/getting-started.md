# Inicio de desarrollo local

## Requisitos

- Git y acceso autorizado al repositorio.
- Node.js 22.x para coincidir con los workflows de GitHub Actions y los requisitos actuales de Firebase CLI. `package.json` no fija un rango `engines`; prueba otra versión antes de cambiar la versión de CI.
- JDK 21 o posterior disponible en `JAVA_HOME` y al inicio de `PATH` para iniciar Firebase Emulator Suite con Firebase CLI 15. Comprueba `java -version` antes de iniciar los emuladores; otro Java anterior que aparezca primero en `PATH` puede causar un error aunque `JAVA_HOME` apunte a JDK 21.
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

`frontend/src/services/firebase.ts` toma la configuración del entorno con `VITE_FIREBASE_*` y falla con una lista clara si falta un campo requerido. La analítica (`VITE_FIREBASE_MEASUREMENT_ID`) es opcional. Copia `frontend/.env.example` a `frontend/.env.local` y completa los datos del proyecto **local/de desarrollo** antes de ejecutar la app. Comprueba `VITE_FIREBASE_PROJECT_ID` antes de escribir. El build de CI usa valores ficticios y su artefacto es solo para validar compilación; no se debe desplegar.

Antes de ejecutar la aplicación que escribe datos:

1. Confirma el proyecto que utiliza el código y quién administra ese proyecto.
2. Usa un proyecto Firebase de desarrollo o configura explícitamente Firebase Emulator Suite.
3. Comprueba que las cuentas de prueba y reglas sean de desarrollo.
4. No escribas diarios, chats ni registros de personas reales en pruebas.

La Firebase Emulator Suite local incluye Authentication, Firestore y Storage. `npm run test:rules` sigue iniciando un proyecto demo aislado para reglas; para probar una sesión web completa con API local usa el flujo siguiente. Los emuladores no se despliegan a Firebase.

### Aplicación local con emuladores

1. Desde `frontend/`, copia `.env.emulator.example` como `.env.local`. Solo contiene identificadores ficticios del proyecto `demo-mood-log-local`.
2. Abre tres terminales en `frontend/` y ejecuta, respectivamente:

   ```sh
   npm run emulators:local
   npm run dev:api:emulator
   npm run dev
   ```

   En PowerShell, si hay varias versiones de Java instaladas, antepone el JDK 21 al `PATH` de la terminal antes del primer comando. Por ejemplo, ajusta la ruta a la instalación local:

   ```powershell
   $env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21'
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   java -version
   ```

3. Abre `http://localhost:3000`. La app web apunta a Auth (9099), Firestore (8080) y Storage (9199); Vite enruta `/api/*` al puente local en 3001. El puente cubre `/api/ai`, `/api/delete-account`, `/api/legal-acceptance` y `/api/sensitive-data-consent`; IA responde como no configurada sin `GROQ_API_KEY` y borrado de cuenta permanece apagado salvo que se habilite explícitamente. El Admin SDK solo arranca sin credenciales de servicio si encuentra el modo explícito de desarrollo, el ID demo exacto y los tres hosts loopback esperados.
4. Usa únicamente cuentas y datos ficticios. Los datos del emulador se pueden reiniciar; no importes diarios, métricas de salud ni credenciales reales. Para probar la IA se necesita además configurar Groq; no uses datos reales en esa prueba.

El modo de emulador cliente solo funciona con `import.meta.env.DEV` y `demo-mood-log-local`. Si la bandera se activa en otro modo/proyecto, el frontend falla explícitamente. El entorno de hosting y los builds de producción no apuntan a emuladores.

## Variables de entorno y secretos

Vite publica en el bundle del navegador todas las variables con prefijo `VITE_`. Por lo tanto, no pongas en ellas claves privadas, tokens de administración ni credenciales de servidor, aunque el archivo `.env.local` esté ignorado por Git.

Las llamadas activas de IA usan `/api/ai` en Vercel y requieren secretos de servidor configurados en el panel: `GROQ_API_KEY`, `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT_JSON`. No agregues `VITE_GROQ_API_KEY`: cualquier variable `VITE_*` puede quedar expuesta en el bundle. En desarrollo, Vite puede reenviar las rutas enumeradas arriba al puente local; el puente no tiene una clave Groq por defecto y no es un servidor de producción.

La configuración Firebase de cliente se incorpora al bundle y no es una credencial administrativa. Aun así, las reglas deben limitar el acceso y cada build debe conectarse únicamente al proyecto asignado a su entorno. Los secretos de administración y proveedor pertenecen solo al backend.

## Validación y CI

El workflow `.github/workflows/ci.yml` instala dependencias con `npm ci`, prueba reglas Firestore/Storage, API, índices/configuración y métricas, ejecuta typecheck, auditoría completa de dependencias y build. También comprueba que la imagen Ubuntu 24.04 tenga Android SDK Platform 36, Build Tools 36.0.0 y Platform-Tools antes del build Wear OS. No ejecuta todavía pruebas de componentes o recorridos de UI ni una evaluación de accesibilidad automatizada. Ejecuta localmente:

```sh
npm run test:rules
npm run test:api
npm run test:config
npm run test:unit
npm run typecheck
npm audit
npm run build
```

No interpretes un build Vite exitoso como validación de tipos. El workflow `.github/workflows/deploy.yml` se llama `Production build validation (no deploy)`, corre para pushes a `main` y valida el build sin publicar. El workflow `.github/workflows/ci.yml` corre las suites y el build para pushes a las ramas configuradas y pull requests a `main`. Los cambios locales no están cubiertos por un resultado de GitHub Actions hasta que se ejecuten en CI.

## Trabajo seguro

1. Trabaja en una rama y solicita revisión de los cambios antes de integrarlos.
2. Revisa `git status` para evitar subir archivos `.env`, datos exportados, credenciales o datos personales.
3. No despliegues reglas ni publiques un build sin confirmar el proyecto/entorno destino.
4. No asumas que un repositorio privado hace privado el sitio, sus previews o los recursos Firebase.
