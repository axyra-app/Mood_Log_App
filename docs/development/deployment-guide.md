# Despliegue y operación

## Alcance

Esta guía describe la configuración versionada. No se verificó acceso a los paneles de Vercel/Firebase, los dominios, las ramas de producción ni el estado remoto; confirma cada valor en la cuenta del equipo antes de desplegar.

## Frontend

`frontend/vercel.json` declara:

- Build: `npm run build`
- Directorio de salida: `dist`
- La función `api/ai.ts` tiene duración máxima declarada de 45 segundos. El SDK de Groq espera hasta 20 segundos y no reintenta automáticamente; esto limita la ventana de ejecución y evita reintentos invisibles que puedan duplicar uso. Confirma que el plan y la configuración de Vercel activos permitan esta duración ([duración de funciones Vercel](https://vercel.com/docs/functions/configuring-functions/duration), [timeouts y reintentos del SDK Groq](https://github.com/groq/groq-typescript#timeouts)).
- Reescritura de rutas SPA hacia `/index.html`
- Cabeceras globales contra MIME sniffing, framing y filtración de referrer; deshabilita cámara, micrófono y geolocalización, y activa HSTS.
- Una CSP en modo `Content-Security-Policy-Report-Only`, que **no bloquea** recursos mientras se comprueba compatibilidad con Firebase, Google Sign-In, Analytics y la PWA.

El proyecto debe instalar dependencias desde `frontend/` y usar esa carpeta como raíz de aplicación si Vercel no está configurado ya para hacerlo. El archivo no prueba la configuración activa del panel ni que el sitio sea privado.

Antes de pasar CSP a modo de bloqueo, publicar primero en un Preview de Vercel y revisar violaciones en la consola del navegador con los recorridos de login/Google, Firestore, Storage, IA, Analytics y PWA. El modo actual no envía reportes a un colector remoto; no se debe cambiar a `Content-Security-Policy` hasta validar los orígenes requeridos y decidir cómo recopilar reportes sin guardar datos sensibles.

`.github/workflows/ci.yml` instala dependencias con Node.js 22 y Java 21, ejecuta pruebas de reglas Firestore/Storage, API, configuración, métricas, typecheck, auditoría de dependencias y build; también verifica Android SDK Platform 36, Build Tools 36.0.0 y Platform-Tools antes de compilar el prototipo Wear OS y guardar un APK temporal de validación. GitHub actualiza semanalmente el software preinstalado en sus imágenes; el preflight falla con un error explícito si desaparecen esos paquetes ([imágenes de GitHub-hosted runners](https://docs.github.com/en/actions/concepts/runners/github-hosted-runners), [inventario de Ubuntu 24.04](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)). Aún no ejecuta recorridos de navegador/componentes. `.github/workflows/deploy.yml` se llama `Production build validation (no deploy)`: su trabajo valida el build en pushes a `main`, y no contiene un paso de despliegue a Vercel. La condición del job omite los pull requests, que se validan con el workflow `ci.yml`. Confirma la integración GitHub–Vercel, rama de producción, previews y controles de acceso en el panel; un build verde no demuestra un deployment.

## Variables y claves

No guardes secretos de servidor en `VITE_*`: se incluyen en el código del navegador. Las llamadas activas de Groq se sirven desde `frontend/api/ai.ts`, que verifica el ID token de Firebase y solo entonces usa la clave del servidor. No agregues `VITE_GROQ_API_KEY`.

Configura las variables por separado para cada entorno de Vercel (Preview/Production) según su tipo. `VITE_FIREBASE_*` son valores de configuración cliente y quedan disponibles en el código del navegador; no son secretos ni sustituyen las reglas de autorización. Guarda las credenciales privadas server-only como secretos y nunca les agregues el prefijo `VITE_`:

| Variable | Valor |
|---|---|
| `GROQ_API_KEY` | **Secreto server-only.** Clave privada generada en Groq. |
| `GROQ_MODEL_ID` | Opcional, server-only. Valores permitidos: `openai/gpt-oss-20b` (predeterminado) o `openai/gpt-oss-120b`. Un valor distinto hace que la API falle de forma cerrada con `503`. |
| `VITE_FIREBASE_*` | Valores públicos de configuración cliente Firebase del entorno desplegado. Usar valores separados para previews/staging y producción; CI de validación compila con valores ficticios. No incluir secretos. |
| `FIREBASE_PROJECT_ID` | Identificador server-side del proyecto Firebase para Firebase Admin. Debe corresponder al entorno de Vercel y a la configuración cliente desplegada. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Secreto server-only.** JSON completo de una cuenta de servicio dedicada. |
| `FIREBASE_STORAGE_BUCKET` | Nombre exacto del bucket Firebase Storage del mismo entorno; debe coincidir con `VITE_FIREBASE_STORAGE_BUCKET`, disponible también al runtime de la función según la [documentación de variables Vercel](https://vercel.com/docs/environment-variables). Es obligatorio si se habilita `ACCOUNT_DELETION_ENABLED`; el endpoint falla de forma cerrada si falta o no coincide. No se infiere por sufijo ni se usa un bucket demo como fallback. |
| `ACCOUNT_DELETION_ENABLED` | Server-only. Déjalo sin configurar o en `false` hasta validar borrado completo en staging; solo el valor exacto `true` habilita `POST /api/delete-account`. Requiere el proyecto, la cuenta de servicio y los buckets del mismo entorno correctamente configurados. |

El endpoint de borrado de cuenta está deshabilitado por defecto. Habilítalo únicamente después de verificar en staging la reautenticación, la eliminación de documentos Firestore y objetos Storage, la eliminación de Firebase Authentication y el comportamiento de reintento ante fallos parciales. Al activarlo en Vercel, selecciona explícitamente el entorno correspondiente; Preview y Production tienen configuración independiente. La función no puede borrar copias o retenciones administradas fuera de Firebase por esta aplicación.

El checkout eleva ahora el aviso de privacidad a `co-privacy-draft-v4-groq-retention`; una aceptación basada en `co-privacy-draft-v3-ai-usage` o anterior ya no satisface las reglas locales. Despliega coordinadamente la UI, API y reglas compatibles: una actualización parcial puede dejar a las personas sin acceso a escrituras sensibles/IA hasta aceptar el aviso nuevo. El texto sigue siendo borrador y necesita aprobación jurídica antes de producción.

Usa una cuenta de servicio dedicada por entorno. No asumas que un rol de Firestore basta: la eliminación también verifica y elimina la cuenta de Firebase Authentication y lista/elimina objetos del bucket. Concede acceso de datos Firestore, permisos mínimos de Identity Toolkit necesarios para verificar/eliminar usuarios y permisos de objetos solo en el bucket indicado; evalúa roles personalizados/bucket-level y no asignes Owner o Editor como atajo. Firebase Admin omite las reglas Firestore, así que sus permisos IAM alcanzan los datos autorizados por el rol, no solo `aiUsage`. Verifica cada permiso en staging. Referencias: [IAM de Firestore](https://firebase.google.com/docs/firestore/security/iam), [roles Identity Toolkit](https://cloud.google.com/iam/docs/roles-permissions/identitytoolkit) y [roles de Cloud Storage](https://cloud.google.com/iam/docs/roles-permissions/storage). Protege la clave como credencial de proyecto; no la compartas por chat ni la guardes en Git. Mantén la raíz del proyecto Vercel en `frontend` para que `/api/ai` se detecte como función Node. El proyecto requiere Node.js 22 o posterior (`frontend/package.json`); la API usa Firebase Admin 13.10.0 para evitar incompatibilidades de carga ESM en el runtime de Vercel. Si aparece `ERR_REQUIRE_ESM`, confirma que el deployment activo incluya esta versión y use Node.js 22 o 24.

Un `GET /api/ai` debe responder `405` con JSON; eso confirma que la función está accesible. Un `POST` sin token debe responder `401` después de inicializar Firebase Admin. El endpoint ejecuta `verifyIdToken(token, true)`: valida el ID token y comprueba revocación/deshabilitación de la cuenta, por lo que cada llamada puede requerir una consulta adicional a Firebase Authentication. Tokens expirados, inválidos o revocados se rechazan; si Authentication no puede completar la comprobación, la API responde `503` en vez de aceptar la sesión sin verificar. Si una sesión válida responde `503`, comparte solo el código de error sanitizado para diagnosticar Firebase Authentication. Si la respuesta indica que no se pudo comprobar la cuota, revisa los permisos IAM de Firestore de la cuenta de servicio; las reglas Firestore no controlan las operaciones del SDK Admin. Nunca compartas valores de variables, claves ni tokens.

La API acepta chat, análisis de diario y análisis de ánimo; limita cada cuenta autenticada a 40 solicitudes por día y 8 dentro de cualquier ventana móvil de 60 segundos. Todos los deployments de Vercel, Preview y Production, exigen un limitador compartido: configura `GROQ_LIMIT_SCOPE`, `GROQ_PROJECT_RPM_LIMIT` y `GROQ_PROJECT_RPD_LIMIT` con límites iguales o inferiores a los verificados para el proyecto Groq. Usa valores numéricos y el mismo scope, límites y base Firestore entre todas las instancias que consuman la misma cuota de proyecto. El cupo diario local cuenta una ventana móvil de 24 horas. Si las variables faltan o no son válidas, el deployment falla de forma cerrada antes de enviar datos; si los valores de deployments con el mismo scope no coinciden mientras hay historial de cuota activa, la API también falla cerrada. Alinear la configuración en todos los entornos antes de habilitar llamadas; cambios de límite pueden requerir esperar a que venza el historial móvil existente. Si distintas bases o scopes utilizan el mismo proyecto Groq, el contador no agrega su tráfico. El chat admite hasta 4.000 caracteres, el análisis de diario 5.000 y el análisis de ánimo hasta 60 registros (18 KB de datos). Son límites iniciales, no una garantía de gasto máximo. El limitador coordina solicitudes de Mood Log en Firestore, pero no contabiliza el uso de otras aplicaciones/keys ni impone ITPM/OTPM, tokens o presupuesto de la organización; esos controles y límites deben verificarse/configurarse en Groq. El backend registra los tokens que devuelve Groq por UID/modelo/tarea/día dentro de `aiUsage`; no registra texto ni calcula dólares. Las acciones de IA seleccionadas por el usuario transmiten texto/datos a Groq; informa de ello en la interfaz y evita enviar datos sensibles innecesarios. `npm run dev` de Vite por sí solo no ejecuta funciones de Vercel; prueba la API desde un Preview de Vercel.

La protección detecta los deployments con `VERCEL` o `VERCEL_ENV`; Vercel documenta estas variables como disponibles en build y runtime, con entornos `production`, `preview` y `development` ([variables de sistema](https://vercel.com/docs/environment-variables/system-environment-variables)).

El contador compartido usa un único documento transaccional por scope: es un primer control para un piloto acotado, pero concentra escrituras y puede convertirse en cuello de botella bajo alta concurrencia. Antes de escalar tráfico, mide contención/latencia/costo en staging y reemplázalo por un limitador distribuido de mayor rendimiento con operaciones atómicas y almacén compartido, manteniendo límites por cuenta y por proyecto. No describas este contador Firestore como arquitectura de escala masiva.

Antes de abrir Preview o producción a más usuarios, configura el límite mensual de gasto de la organización Groq en Settings → Billing → Limits y alertas al 50%, 75% y 90%. Usa el presupuesto aprobado por el responsable, no un monto de ejemplo. La función solo puede reportar un límite alcanzado como `503`; el control de gasto real pertenece a Groq. La documentación actual de Groq indica que el spend limit requiere plan de pago y permisos de propietario, se aplica a toda la organización, se restablece con el ciclo mensual y puede tener 10–15 minutos de retraso en la medición; por ello puede haber un exceso pequeño. Revisa la condición de la cuenta y los límites exactos antes de depender de esta protección ([Spend Limits](https://console.groq.com/docs/spend-limits)).

La configuración Firebase del cliente se carga desde las variables `VITE_FIREBASE_*` a través de `frontend/src/utils/firebaseClientConfig.ts` y se inicializa en `frontend/src/services/firebase.ts`. `.github/workflows/ci.yml` usa identificadores ficticios; `.github/workflows/deploy.yml` requiere los secrets `VITE_FIREBASE_*` configurados en el repositorio para validar un push a `main`. La configuración de Firebase en cliente no sustituye las reglas de autorización.

## Firebase

El archivo `firebase.json` apunta a:

- Hosting estático en `frontend/dist`
- Reglas Firestore en `firebase/firestore.rules`
- Índices en `firebase/firestore.indexes.json`
- Reglas Storage en `firebase/storage.rules`

Antes de desplegar:

1. Confirma el proyecto activo y la cuenta autorizada. No dependas del contexto de una terminal compartida.
2. Revisa y prueba reglas en Firebase Emulator Suite o proyecto de desarrollo. `npm run test:rules` en `frontend/` prueba las reglas locales de Firestore y Storage con un ID demo; esto no confirma las reglas remotas ni configura el cliente de la app para usar emuladores.
3. Comprueba que los servicios y colecciones utilizadas por el frontend tengan reglas compatibles; hay discrepancias descritas en [database-schema.md](../firebase/database-schema.md).
4. Obtén revisión del cambio y confirma plan de reversión.

Comandos de Firebase CLI, solo después de verificar el destino:

```sh
firebase projects:list
firebase use <project-id-de-desarrollo>
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

No copies un ID de proyecto de un ejemplo. Despliega en producción únicamente después de validación y aprobación explícita del responsable. Verifica las reglas efectivas en Firebase Console tras el despliegue.

## Acceso privado

Repositorio privado no significa sitio privado. Configura por separado:

- Miembros y protección de ramas del repositorio.
- Acceso a proyectos y dominios de Vercel, incluidos deployments de preview.
- Firebase IAM, dominios autorizados de Authentication, reglas y restricciones de API.
- Autenticación y permisos en la propia aplicación.

Comprueba la visibilidad desde una sesión no autenticada y una cuenta sin autorización. Las rutas públicas de la SPA pueden seguir siendo visibles aunque las operaciones de datos estén protegidas.

## PWA

El build genera recursos PWA mediante `vite-plugin-pwa`. Valida la instalación y actualización del service worker después de publicar. La configuración actual no equivale a sincronización offline de datos ni define retención segura de información íntima en el dispositivo.
