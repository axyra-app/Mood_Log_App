# Firebase: configuración y documentación

Esta carpeta agrupa la documentación de Firebase. Los archivos operativos que consume Firebase CLI se guardan en la carpeta [`../../firebase/`](../../firebase/); `firebase.json` permanece en la raíz porque Firebase CLI lo busca allí.

## Estructura

| Ruta | Propósito |
|---|---|
| [`../../firebase/firestore.rules`](../../firebase/firestore.rules) | Reglas de seguridad de Cloud Firestore. |
| [`../../firebase/firestore.indexes.json`](../../firebase/firestore.indexes.json) | Índices compuestos versionados de Firestore. |
| [`../../firebase/storage.rules`](../../firebase/storage.rules) | Reglas de seguridad de Cloud Storage. |
| [`../../firebase.json`](../../firebase.json) | Configura Firebase Hosting, reglas/índices y emuladores de Auth, Firestore y Storage. |
| [`database-schema.md`](database-schema.md) | Colecciones, esquemas observados, permisos e índices. |
| [`security-and-privacy.md`](security-and-privacy.md) | Límites de seguridad, privacidad, IA y validación. |

## Validar localmente

Desde `frontend/`, ejecuta `npm run test:rules` para iniciar Firestore/Storage bajo un proyecto demo y probar reglas; no despliega cambios. Para el recorrido local con inicio de sesión, copia `.env.emulator.example` a `.env.local` y sigue la [guía de desarrollo](../development/getting-started.md#aplicación-local-con-emuladores). El cliente y la API exigen el mismo proyecto demo y hosts loopback antes de conectar el Admin SDK a emuladores.

Antes de desplegar reglas o índices, confirma explícitamente el proyecto de destino, ejecuta las pruebas y revisa la [guía de despliegue](../development/deployment-guide.md). Los archivos locales no confirman el estado remoto de Firebase.
