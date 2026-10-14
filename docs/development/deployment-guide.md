# Despliegue y operación

## Alcance

Esta guía describe la configuración versionada. No se verificó acceso a los paneles de Vercel/Firebase, los dominios, las ramas de producción ni el estado remoto; confirma cada valor en la cuenta del equipo antes de desplegar.

## Frontend

`frontend/vercel.json` declara:

- Build: `npm run build`
- Directorio de salida: `dist`
- Reescritura de rutas SPA hacia `/index.html`

El proyecto debe instalar dependencias desde `frontend/` y usar esa carpeta como raíz de aplicación si Vercel no está configurado ya para hacerlo. El archivo no prueba la configuración activa del panel ni que el sitio sea privado.

`.github/workflows/ci.yml` instala dependencias con Node.js 18 y ejecuta build. `.github/workflows/deploy.yml` se denomina Deploy to Production, pero su trabajo ejecuta build y termina indicando que Vercel realiza el despliegue; **no contiene un paso de despliegue a Vercel**. Confirma la integración GitHub–Vercel, rama de producción, previews y controles de acceso en el panel.

## Variables y claves

No guardes secretos de servidor en `VITE_*`: se incluyen en el código del navegador. El frontend actual consume `VITE_GROQ_API_KEY` desde servicios de cliente; no habilites claves privadas allí. Migra llamadas de IA a un backend/función con secreto de servidor antes de procesar datos sensibles.

La configuración Firebase del cliente está escrita en `frontend/src/services/firebase.ts`; las variables de Firebase declaradas en workflows no cambian esa configuración hasta que el código las consuma. La configuración de Firebase en cliente no sustituye las reglas de autorización.

## Firebase

El archivo `firebase.json` apunta a:

- Hosting estático en `frontend/dist`
- Reglas Firestore en `firestore.rules`
- Índices en `firestore.indexes.json`
- Reglas Storage en `storage.rules`

Antes de desplegar:

1. Confirma el proyecto activo y la cuenta autorizada. No dependas del contexto de una terminal compartida.
2. Revisa y prueba reglas en Firebase Emulator Suite o proyecto de desarrollo. El repositorio no confirma que los emuladores estén configurados.
3. Comprueba que los servicios y colecciones utilizadas por el frontend tengan reglas compatibles; hay discrepancias descritas en [database-schema.md](../architecture/database-schema.md).
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
