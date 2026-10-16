# Despliegue y operación

## Alcance

Esta guía describe la configuración versionada. No se verificó acceso a los paneles de Vercel/Firebase, los dominios, las ramas de producción ni el estado remoto; confirma cada valor en la cuenta del equipo antes de desplegar.

## Frontend

`frontend/vercel.json` declara:

- Build: `npm run build`
- Directorio de salida: `dist`
- Reescritura de rutas SPA hacia `/index.html`

El proyecto debe instalar dependencias desde `frontend/` y usar esa carpeta como raíz de aplicación si Vercel no está configurado ya para hacerlo. El archivo no prueba la configuración activa del panel ni que el sitio sea privado.

`.github/workflows/ci.yml` instala dependencias con Node.js 22 y Java 21, ejecuta pruebas de reglas Firestore/Storage, typecheck, auditoría de dependencias de producción y build. Aún no ejecuta pruebas de componentes/servicios. `.github/workflows/deploy.yml` se denomina Deploy to Production, pero su trabajo ejecuta build y termina indicando que Vercel realiza el despliegue; **no contiene un paso de despliegue a Vercel**. Confirma la integración GitHub–Vercel, rama de producción, previews y controles de acceso en el panel.

## Variables y claves

No guardes secretos de servidor en `VITE_*`: se incluyen en el código del navegador. Las llamadas activas de Groq se sirven desde `frontend/api/ai.ts`, que verifica el ID token de Firebase y solo entonces usa la clave del servidor. No agregues `VITE_GROQ_API_KEY`.

Para habilitar la función en Vercel, configura estas variables como secretos del proyecto y selecciona los entornos de Preview y Production necesarios:

| Variable | Valor |
|---|---|
| `GROQ_API_KEY` | Clave privada generada en Groq. |
| `FIREBASE_PROJECT_ID` | ID del proyecto usado por la app, actualmente `mood-log-app-01`. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | JSON completo de una cuenta de servicio dedicada, guardado como secreto. |

Usa una cuenta de servicio dedicada y el rol mínimo disponible para Firestore. El SDK Admin omite las reglas: los permisos de datos de Firestore no se limitan a la colección `aiUsage`, así que protege esta clave como una credencial con acceso al proyecto. No la compartas por chat ni la guardes en Git. Mantén la raíz del proyecto Vercel en `frontend` para que `/api/ai` se detecte como función Node. Tras guardar las variables, crea un deployment nuevo.

Un `GET /api/ai` debe responder `405` con JSON; eso confirma que la función está accesible. Si un `POST` responde `503` indicando que no se pudo inicializar Firebase Admin, revisa los logs de la función y confirma que `FIREBASE_SERVICE_ACCOUNT_JSON` sea el JSON completo y válido de la cuenta de servicio y que su proyecto coincida con `FIREBASE_PROJECT_ID`. No compartas el contenido de estas variables.

La API acepta chat, análisis de diario y análisis de ánimo; valida el tamaño de entrada y limita cada cuenta autenticada a 40 solicitudes diarias. El chat admite hasta 4.000 caracteres, el análisis de diario 5.000 y el análisis de ánimo hasta 60 registros (18 KB de datos). Son límites iniciales, no una garantía de gasto máximo. Las acciones de IA seleccionadas por el usuario transmiten texto/datos a Groq; informa de ello en la interfaz y evita enviar datos sensibles innecesarios. `npm run dev` de Vite por sí solo no ejecuta funciones de Vercel; prueba la API desde un Preview de Vercel.

La configuración Firebase del cliente está escrita en `frontend/src/services/firebase.ts`; las variables de Firebase declaradas en workflows no cambian esa configuración hasta que el código las consuma. La configuración de Firebase en cliente no sustituye las reglas de autorización.

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
