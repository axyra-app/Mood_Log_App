# Análisis técnico de Mood Log App

**Revisión:** 16 de octubre de 2026
**Alcance:** lectura del código y configuración versionados del frontend, Firebase, documentación y workflows. No se accedió a Firebase Console, Vercel ni a datos de producción. Este análisis no acredita el estado remoto.

## Resumen ejecutivo

Mood Log App es una SPA con React, TypeScript y Vite que se conecta directamente desde el navegador a Firebase Authentication, Firestore y Storage. La propuesta actual es un producto B2C para seguimiento personal del ánimo, diario y apoyo conversacional.

La base visual y varios flujos están presentes, pero el repositorio conserva implementaciones y tipos de la plataforma profesional anterior. Los contratos de Firestore y chat están fragmentados, y las reglas locales no autorizan todas las colecciones que aparecen en el código. No se recomienda almacenar datos emocionales reales hasta probar y corregir el modelo de permisos en un entorno aislado.

| Área | Estado observado |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router y Tailwind; aplicación cliente. |
| Backend propio | Función serverless de Vercel en `frontend/api/ai.ts`, usada para solicitudes de IA autenticadas. |
| Firebase | Cliente inicializado en `frontend/src/services/firebase.ts`; reglas e índices versionados localmente. Estado remoto no verificado. |
| Producto | B2C en transición; hay código heredado profesional en hooks, tipos y servicios. |
| PWA | Plugin `vite-plugin-pwa` configurado. No equivale a sincronización offline de datos. |
| IA | Las solicitudes activas pasan por `frontend/api/ai.ts`; `GROQ_API_KEY` se utiliza en el servidor. El cliente prepara y limita los datos de análisis antes de enviarlos. |
| Typecheck/build | `npm run typecheck` y `npm run build` pasan con las dependencias instaladas. El build conserva avisos de tamaño de chunks y de importación compartida de jsPDF. |
| Pruebas | Hay pruebas de reglas Firestore y Storage en el emulador (`npm run test:rules`); lint y pruebas de componentes/servicios aún no están configurados. |

## Hallazgos prioritarios

### 1. Colecciones y permisos Firebase no están alineados

Las reglas locales permiten un conjunto definido de colecciones, pero servicios como `chatService` usan `chats`, `messages` y `typing`, denegadas por la regla catch-all. Otros flujos usan `chatSessions` y `chatMessages`, cuyo modelo de mensajes debe incluir `userId` para satisfacer las reglas. Las reglas permiten leer plantillas/prompts, no inicializarlas desde el cliente.

En esta revisión se endurecieron localmente la propiedad de registros, la inmutabilidad del rol, la creación de `statistics` y el acceso a Storage. Se añadieron pruebas del emulador para propietario, otra cuenta y usuario anónimo; siguen faltando pruebas y decisiones para todos los flujos heredados. Las reglas versionadas aún no se han desplegado y su estado remoto no se verificó. La documentación técnica describe las limitaciones en [database-schema.md](../firebase/database-schema.md) y [security-and-privacy.md](../firebase/security-and-privacy.md).

**Acción:** unificar contratos de datos, completar validaciones de campos y probar todas las operaciones activas con Firebase Emulator Suite antes de desplegar reglas.

### 2. IA y datos sensibles

Las tareas de IA disponibles pasan por `frontend/api/ai.ts`, una función de servidor autenticada que usa el secreto `GROQ_API_KEY`; la clave no debe configurarse como `VITE_*`. El texto emocional se envía a Groq cuando la persona solicita explícitamente un análisis. La interfaz debe informar qué datos se envían y mostrar los errores del proveedor sin sustituirlos por una respuesta ficticia.

**Pendiente:** documentar con precisión la retención aplicable en Groq y revisar periódicamente límites, autenticación y datos enviados. Si una clave real llegó a incluirse en un bundle, revocarla y revisar su uso.

### 3. Modelo de producto aún no consolidado

El tipo y el flujo de registro de `MoodLog` usan la escala canónica 1–10; no se convierten automáticamente valores históricos. El hook de chat mantiene campos profesionales y el servicio `chatService` modela participantes. La interfaz de usuario y `AuthContext` difieren en la representación del rol.

**Acción:** mantener coordinados tipos, métricas, vistas y documentación con la escala 1–10, y definir explícitamente cualquier futura migración de datos.

### 4. Privacidad, crisis y afirmaciones de producto

El servicio del diario persiste `content` en texto legible. El cifrado local es una propuesta futura, no una función existente. La PWA cachea recursos, pero no se encontró una estrategia completa de funcionamiento offline para datos. Los mecanismos heurísticos de crisis no se deben describir como evaluación clínica o mecanismo de emergencia confiable.

**Acción:** alinear textos legales y de producto con el comportamiento real y revisar recursos/consentimiento antes de habilitar funciones que procesen información sensible.

### 5. Validación y despliegue

`.github/workflows/ci.yml` instala dependencias, configura Java 21 y Node 22, ejecuta pruebas de reglas Firestore/Storage en emulador, typecheck, auditoría de dependencias de producción y `npm run build`; todavía no ejecuta pruebas de componentes/servicios. El workflow `deploy.yml` también compila; no contiene un paso de despliegue a Vercel. La integración real y el acceso a deployments deben comprobarse en los paneles.

En la revisión anterior del 14 de octubre de 2026, `npm run test:rules` (7 pruebas), `npm run typecheck`, `npm run build` y `npm audit --omit=dev` pasaron. El 16 de octubre, tras estos cambios, `npm run typecheck` y `npm run build` volvieron a pasar; `npm run test:rules` no pudo ejecutarse porque el entorno disponible usa Java 8 y Firebase CLI requiere Java 21 o superior. El build reporta avisos de chunks grandes e importación compartida de jsPDF; no impidieron compilar. `npm audit` completo sigue reportando 15 avisos de desarrollo (7 moderados y 8 altos), por dependencias asociadas principalmente a Vite/Tailwind y Firebase CLI. Las remediaciones sugeridas por npm requieren cambios mayores de toolchain; no se aplicó una actualización forzada.

**Acción pendiente:** incorporar pruebas de componentes/servicios a CI conforme se estabilicen los flujos y planear la actualización del toolchain con pruebas de compatibilidad. La auditoría de producción permanece sin vulnerabilidades conocidas según `npm audit --omit=dev`.

## Secuencia recomendada

1. **Aislar desarrollo:** las pruebas de reglas Firestore ya usan el emulador con un ID demo; aún se debe confirmar que la app cliente no escribe en producción y decidir si se configura Auth/Storage Emulator para otros flujos.
2. **Cerrar seguridad y contratos:** seleccionar un esquema canónico para ánimo, diarios y chat; alinear servicios, tipos, reglas e índices; probar acceso cruzado entre cuentas.
3. **Validar el MVP:** ejecutar typecheck/build y completar pruebas para cuenta, perfil, registro/consulta/edición/eliminación de ánimo y diario.
4. **Resolver IA y privacidad:** eliminar secretos del cliente, formalizar consentimiento y revisar términos/privacidad.
5. **Publicar con controles:** verificar reglas activas, IAM, dominios autorizados, hosting/previews, eliminación de datos y procedimiento de incidentes.
6. **Ampliar producto:** después de cerrar el recorrido y los controles anteriores, priorizar móvil, cifrado local, wearables u otras capacidades.

## Documentación técnica

Las guías mantenidas para arquitectura, modelo de datos, seguridad, desarrollo y despliegue están en [`docs/`](../README.md). Antes de cambiar un flujo, actualiza en conjunto su servicio, tipo, regla, índice, prueba y documentación asociada.
