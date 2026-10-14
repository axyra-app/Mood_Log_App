# Guía interna de instalación local y variables

> **Uso interno:** Mood Log App es un proyecto privado del equipo. El repositorio y las cuentas de GitHub, Firebase y Vercel deben dar acceso únicamente a personas autorizadas. Esta nota documenta el proceso; no aplica permisos por sí sola ni garantiza que el sitio desplegado sea privado.

## 1. Acceso al proyecto

Antes de clonar, confirma que tu cuenta está autorizada en el repositorio privado de GitHub. Usa la URL de clonación que aparece en la configuración del repositorio; no copies una URL de ejemplo. Para desplegar o cambiar reglas de Firebase, además se requiere acceso explícito a los proyectos correspondientes.

**Importante:** que el repositorio sea privado no vuelve privado automáticamente el sitio de Vercel, sus previews ni Firebase. El equipo responsable debe revisar la visibilidad del proyecto y sus deployments en Vercel, los permisos de Firebase IAM y los permisos del repositorio/branch protection. Las pantallas públicas del frontend y un dominio accesible pueden seguir siendo visibles aunque el código fuente esté restringido.

## 2. Requisitos

- Node.js 18.x, como utiliza actualmente CI; usar una versión LTS compatible acordada por el equipo.
- npm incluido con Node.js.
- Git y acceso autenticado al repositorio.
- Acceso a Vercel/Firebase solo para quien necesite administrar despliegues o infraestructura.

El manifiesto no fija un rango `engines` de Node; si se cambia la versión usada por el equipo, actualizar también CI y probar instalación/build.

## 3. Instalar y ejecutar

Desde una terminal, clona el repositorio privado usando la URL autorizada. Después:

```sh
cd Mood_Log_App/frontend
npm ci
npm run dev
```

`npm ci` instala las versiones fijadas por `package-lock.json`; es la opción recomendada para reproducir CI. Usa `npm install` solo cuando tengas intención de modificar dependencias y actualizar el lockfile.

Vite está configurado para el puerto **3000** (`http://localhost:3000`). Si ese puerto está ocupado, Vite puede ofrecer otro. Después de cambios, los comandos disponibles son:

| Comando | Propósito |
|---|---|
| `npm run dev` | Servidor local con recarga rápida. |
| `npm run typecheck` | Comprueba tipos TypeScript sin generar archivos. |
| `npm run build` | Genera el frontend de producción en `frontend/dist/`. |
| `npm run preview` | Sirve localmente el build generado. |

**Estado de referencia de esta guía (10-oct-2026):** en el workspace revisado, `npm run build` falla porque `EditProfile.tsx` importa el componente eliminado `CountrySelector`; `npm run typecheck` también reporta errores existentes. No asumas que estas validaciones pasan hasta que el equipo las ejecute y confirme una corrección. CI actualmente ejecuta build, pero no typecheck.

## 4. Variables de entorno

Vite expone al código del navegador las variables con prefijo `VITE_`. Por tanto, **ningún valor `VITE_*` es un secreto**, aunque esté guardado en `.env.local` o en el panel de Vercel. No coloques ahí credenciales privadas, claves de administración ni tokens que no deban conocer los visitantes del sitio.

### Variables observadas en el código

| Variable | Uso encontrado | Guía local |
|---|---|---|
| `VITE_GROQ_API_KEY` | La consumen servicios de IA frontend, incluido `specializedAgents.ts`; puede acabar dentro del bundle y ser visible desde el navegador. | No uses una clave personal o con permisos amplios. El camino seguro es mover la llamada a IA a un backend/función con secreto de servidor. Mientras no se haga, omítela si no necesitas esa función o utiliza solo una clave de desarrollo con límites de gasto/cuota y autorizada por el equipo, asumiendo que los usuarios de la app podrían extraerla. |
| `VITE_APP_URL` | Se lee en `utils/env.ts` como URL de respaldo, pero no se identificó un consumidor activo de ese helper en la app. | No parece necesaria para iniciar Vite localmente. El valor local sugerido, si el helper llega a usarse, es `http://localhost:3000`, no `5173`. |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | El helper `utils/env.ts` las lee, pero `services/firebase.ts` inicializa Firebase con una configuración escrita directamente en el código. | Actualmente no parecen controlar la conexión Firebase efectiva. No agregues valores con la expectativa de cambiar el proyecto conectado: primero hay que migrar `firebase.ts` a una configuración por entorno. La configuración Firebase de cliente tampoco sustituye reglas de seguridad. |
| `VITE_OPENAI_API_KEY` / `REACT_APP_OPENAI_API_KEY` | El helper menciona la primera; `aiService.ts` consulta la segunda, propia de Create React App, pero el análisis actual usa fallback y la llamada real está comentada. | No se consideran requisitos efectivos del arranque. No pongas una clave privada de OpenAI en una variable Vite: cualquier clave enviada al navegador puede extraerse. |
| `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_ENABLE_ANALYTICS`, `VITE_ANALYTICS_ENDPOINT`, `VITE_SENTRY_DSN`, `VITE_GA_MEASUREMENT_ID` | Aparecen en tipos/configuración de CI, pero no se confirmó que todas tengan consumidor activo en el cliente. | No asumir que son requeridas localmente. Verificar usos antes de configurarlas. |

### Firebase y datos compartidos

`frontend/src/services/firebase.ts` contiene actualmente la configuración de un proyecto Firebase compartido; las variables de entorno anteriores no cambian por sí solas esa configuración. **El workspace analizado no confirma un proyecto separado de desarrollo.** Si arrancas la aplicación, sus escrituras pueden llegar al Firebase configurado en el código y no a un sandbox local.

Antes de probar altas, diarios, registros de ánimo, chats o cambios de reglas, el equipo debe confirmar que se está usando Firebase Emulator Suite o un proyecto Firebase de desarrollo separado. No pruebes con información sensible o de usuarios reales. La configuración actual de clientes Firebase no es un secreto de servidor, pero el acceso a datos debe protegerse con reglas revisadas y permisos apropiados.

### Archivo `.env.local`

No se necesita crear `.env.local` para arrancar el frontend con la configuración actual. Si una tarea local aprobada necesita variables adicionales, crea `frontend/.env.local` manualmente y añade únicamente valores no sensibles para cliente o una clave de desarrollo que el responsable haya aprobado con las limitaciones anteriores. Los `.env*` se ignoran en Git, con excepción de `.env.example`; de todos modos, verifica `git status` antes de un commit y nunca subas valores reales.

No existe actualmente un `.env.example` en el workspace. Si el equipo decide adoptar configuración por entorno, añadir un ejemplo con nombres y placeholders, nunca credenciales válidas, y actualizar `firebase.ts`, CI y Vercel en el mismo cambio.

## 5. Trabajo seguro en equipo

1. Confirma acceso autorizado al repo y trabaja en una rama (`feat/...`, `fix/...`).
2. Revisa que `.env.local`, tokens, exportaciones y datos reales no aparezcan en `git status`.
3. Ejecuta `npm run typecheck` y `npm run build`; actualmente pueden fallar por los problemas indicados arriba. No presentes como validado un cambio si los comandos fallan.
4. Solicita revisión antes de fusionar a `main`; configura protección de rama y CI desde GitHub para hacerla obligatoria.
5. Limita quién administra producción, variables Vercel y reglas/IAM de Firebase. No despliegues reglas ni borres datos desde una cuenta compartida sin revisión y plan de reversión.

## 6. Privacidad del sitio y del repositorio

La política de acceso tiene que configurarse en cada proveedor: repositorio privado y miembros autorizados en GitHub; equipo/proyecto y Deployment Protection en Vercel cuando corresponda; IAM, Auth y reglas en Firebase. La autenticación de la app protege rutas/operaciones solo según su implementación y reglas; no convierte automáticamente todo el dominio o la página de inicio en un sitio privado. Verifica con una cuenta no autorizada que el sitio no revele lo que el equipo quiere mantener interno.

La licencia actual del repositorio también debe revisarse por el responsable legal: la presencia de una licencia abierta puede contradecir la intención de código cerrado expresada en esta guía y en el README.
