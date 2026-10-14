# Análisis técnico de Mood Log App

**Revisión:** 14 de octubre de 2026
**Alcance:** lectura del código y configuración versionados del frontend, Firebase, documentación y workflows. No se accedió a Firebase Console, Vercel ni a datos de producción. Este análisis no acredita el estado remoto.

## Resumen ejecutivo

Mood Log App es una SPA con React, TypeScript y Vite que se conecta directamente desde el navegador a Firebase Authentication, Firestore y Storage. La propuesta actual es un producto B2C para seguimiento personal del ánimo, diario y apoyo conversacional.

La base visual y varios flujos están presentes, pero el repositorio conserva implementaciones y tipos de la plataforma profesional anterior. Los contratos de Firestore y chat están fragmentados, y las reglas locales no autorizan todas las colecciones que aparecen en el código. No se recomienda almacenar datos emocionales reales hasta probar y corregir el modelo de permisos en un entorno aislado.

| Área | Estado observado |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router y Tailwind; aplicación cliente. |
| Backend propio | No se encontró un backend/función server-side en el repositorio inspeccionado. |
| Firebase | Cliente inicializado en `frontend/src/services/firebase.ts`; reglas e índices versionados localmente. Estado remoto no verificado. |
| Producto | B2C en transición; hay código heredado profesional en hooks, tipos y servicios. |
| PWA | Plugin `vite-plugin-pwa` configurado. No equivale a sincronización offline de datos. |
| IA | Servicios inicializados desde el frontend; algunas rutas consumen `VITE_GROQ_API_KEY`. El análisis de `aiService` usa fallback y la llamada real mostrada está comentada. |
| Typecheck/build | Scripts definidos. En esta sesión no pudieron ejecutarse porque faltaban `tsc` y `vite` en `frontend/node_modules`; no se concluye si el código pasa o falla. |
| Pruebas | No se encontraron archivos de pruebas en el árbol inspeccionado ni scripts de test/lint en `frontend/package.json`. |

## Hallazgos prioritarios

### 1. Colecciones y permisos Firebase no están alineados

Las reglas locales permiten un conjunto definido de colecciones, pero servicios como `chatService` usan `chats`, `messages` y `typing`, denegadas por la regla catch-all. Otros flujos usan `chatSessions` y `chatMessages`, cuyo modelo de mensajes debe incluir `userId` para satisfacer las reglas. Las reglas actuales también permiten leer plantillas/prompts pero no escribirlas, mientras el cliente intenta inicializarlas.

Además, ciertas reglas de actualización no impiden cambiar `userId`, el perfil permite modificar todos sus campos y `statistics` no tiene una condición explícita de creación. La documentación técnica actual describe colección por colección en [database-schema.md](docs/architecture/database-schema.md) y las limitaciones en [security-and-privacy.md](docs/architecture/security-and-privacy.md).

**Acción:** escoger contratos de datos únicos, endurecer validaciones y probar lecturas/escrituras como propietario, otro usuario y usuario no autenticado con Firebase Emulator Suite o un proyecto de desarrollo separado.

### 2. IA cliente y datos sensibles

`specializedAgents.ts` y `journalService.ts` inicializan Groq desde el navegador usando una variable `VITE_*`. Los valores `VITE_*` se publican con el cliente; no son secretos. El contenido emocional también puede enviarse al proveedor externo según el flujo habilitado.

**Acción:** no configurar claves privadas en frontend; trasladar las llamadas a un backend/función con secretos de servidor, limitar datos enviados y documentar proveedor, consentimiento y retención. Si una clave real ya fue incluida en un bundle, revocarla y revisar su uso.

### 3. Modelo de producto aún no consolidado

El tipo `MoodLog` describe `mood` en escala 1–5, mientras algunas pantallas y documentos usan una escala 1–10. El hook de chat mantiene campos profesionales y el servicio `chatService` modela participantes. La interfaz de usuario y `AuthContext` difieren en la representación del rol.

**Acción:** elegir escala/modelo canónico, decidir qué capacidades forman parte del MVP y migrar datos/servicios con compatibilidad explícita.

### 4. Privacidad, crisis y afirmaciones de producto

El servicio del diario persiste `content` en texto legible. El cifrado local es una propuesta futura, no una función existente. La PWA cachea recursos, pero no se encontró una estrategia completa de funcionamiento offline para datos. Los mecanismos heurísticos de crisis no se deben describir como evaluación clínica o mecanismo de emergencia confiable.

**Acción:** alinear textos legales y de producto con el comportamiento real y revisar recursos/consentimiento antes de habilitar funciones que procesen información sensible.

### 5. Validación y despliegue

`.github/workflows/ci.yml` ejecuta `npm ci` y `npm run build`, pero no typecheck ni pruebas. El workflow `deploy.yml` también compila; no contiene un paso de despliegue a Vercel. La integración real y el acceso a deployments deben comprobarse en los paneles.

En esta sesión los comandos ejecutados desde `frontend/` no encontraron `tsc` ni `vite`, porque no estaban instaladas las dependencias. No se obtuvo un resultado de build ni typecheck del código.

**Acción:** instalar desde `frontend/` con `npm ci`, ejecutar `npm run typecheck` y `npm run build`, añadir pruebas de reglas y hacer obligatorios los chequeos relevantes en CI.

## Secuencia recomendada

1. **Aislar desarrollo:** configurar Firebase Emulator Suite o un proyecto Firebase de pruebas y confirmar que el cliente no escribe en producción.
2. **Cerrar seguridad y contratos:** seleccionar un esquema canónico para ánimo, diarios y chat; alinear servicios, tipos, reglas e índices; probar acceso cruzado entre cuentas.
3. **Validar el MVP:** ejecutar typecheck/build y completar pruebas para cuenta, perfil, registro/consulta/edición/eliminación de ánimo y diario.
4. **Resolver IA y privacidad:** eliminar secretos del cliente, formalizar consentimiento y revisar términos/privacidad.
5. **Publicar con controles:** verificar reglas activas, IAM, dominios autorizados, hosting/previews, eliminación de datos y procedimiento de incidentes.
6. **Ampliar producto:** después de cerrar el recorrido y los controles anteriores, priorizar móvil, cifrado local, wearables u otras capacidades.

## Documentación técnica

Las guías mantenidas para arquitectura, modelo de datos, seguridad, desarrollo y despliegue están en [`docs/`](docs/README.md). Antes de cambiar un flujo, actualiza en conjunto su servicio, tipo, regla, índice, prueba y documentación asociada.
