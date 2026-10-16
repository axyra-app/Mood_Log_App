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
| Pruebas | CI incluye pruebas de reglas Firestore/Storage, API, índices y métricas; no hay lint ni pruebas de componentes de interfaz. |

## Hallazgos prioritarios

### 1. Colecciones y permisos Firebase no están alineados

Las reglas locales permiten un conjunto definido de colecciones y deniegan por defecto las colecciones heredadas de chat (`chats`, `messages`, `typing`, `chatSessions` y `chatMessages`). La revisión actual no encontró llamadas de persistencia de chat en el código de la aplicación. Se retiró `journalDefaultData.ts`, un inicializador sin llamadores que intentaba escribir plantillas en colecciones de solo lectura; el servicio activo ya dispone de plantillas locales de respaldo. El servicio `crisisDetection.ts` sí contiene escritura y lectura de `crisisAssessments`, también denegadas por las reglas, pero no se encontraron llamadas a ese servicio desde otros módulos. No se deben abrir reglas para esos flujos hasta decidir si siguen siendo parte del producto y probarlos en el emulador.

Las reglas versionadas restringen la propiedad de registros, mantienen inmutable el rol de usuario, autorizan la creación propia de `statistics` y limitan Storage por UID, tipo y tamaño. Las pruebas existentes cubren propietario, otra cuenta y usuario anónimo para las operaciones incluidas, pero no todos los flujos heredados. Las reglas aún no se han desplegado desde esta revisión y su estado remoto no se verificó. La documentación técnica describe las limitaciones en [database-schema.md](../firebase/database-schema.md) y [security-and-privacy.md](../firebase/security-and-privacy.md).

**Acción:** unificar contratos de datos, completar validaciones de campos y probar todas las operaciones activas con Firebase Emulator Suite antes de desplegar reglas.

### 2. IA y datos sensibles

Las tareas de IA disponibles pasan por `frontend/api/ai.ts`, una función de servidor autenticada que usa el secreto `GROQ_API_KEY`; la clave no debe configurarse como `VITE_*`. Los análisis de diario y de registros requieren confirmación explícita antes de enviar datos a Groq; el chat informa que los mensajes se envían al proveedor. La interfaz debe seguir mostrando los errores del proveedor sin sustituirlos por una respuesta ficticia.

**Pendiente:** documentar con precisión la retención aplicable en Groq y revisar periódicamente límites, autenticación y datos enviados. Si una clave real llegó a incluirse en un bundle, revocarla y revisar su uso.

### 3. Modelo de producto aún no consolidado

El tipo y el flujo de registro de `MoodLog` usan la escala canónica 1–10; no se convierten automáticamente valores históricos. Aún quedan modelos y componentes heredados por revisar antes de retirar contratos antiguos. La representación del rol en la interfaz y `AuthContext` también requiere consolidación.

**Acción:** mantener coordinados tipos, métricas, vistas y documentación con la escala 1–10, y definir explícitamente cualquier futura migración de datos.

### 4. Privacidad, crisis y afirmaciones de producto

El servicio del diario persiste `content` en texto legible. El cifrado local es una propuesta futura, no una función existente. La PWA cachea recursos, pero no se encontró una estrategia completa de funcionamiento offline para datos. Los mecanismos heurísticos de crisis no se deben describir como evaluación clínica o mecanismo de emergencia confiable.

**Acción:** alinear textos legales y de producto con el comportamiento real y revisar recursos/consentimiento antes de habilitar funciones que procesen información sensible.

### 5. Validación y despliegue

`.github/workflows/ci.yml` instala dependencias, configura Java 21 y Node 22, y ejecuta pruebas de reglas Firestore/Storage en emulador, pruebas de API (`test:api`), configuración de índices (`test:config`), métricas (`test:unit`), typecheck, auditoría de dependencias de producción y build. Aún no hay pruebas de componentes de interfaz. El workflow `deploy.yml` también compila; no contiene un paso de despliegue a Vercel. La integración real y el acceso a deployments deben comprobarse en los paneles.

En la revisión del 16 de octubre de 2026, `npm run test:api` pasó (6 pruebas), `npm run test:config` pasó (2), `npm run test:unit` pasó (5), `npm run typecheck`, `npm run build` y `npm audit --omit=dev` pasaron (0 vulnerabilidades de producción). En una ejecución posterior, `npm run test:rules` pasó 22/22 pruebas con los emuladores Firestore y Storage usando un JRE 21 temporal, requisito de Firebase CLI. Esto valida las reglas locales, no el despliegue remoto. El build reporta avisos de chunks grandes e importación compartida de jsPDF; no impidieron compilar. El audit completo de dependencias de desarrollo no se volvió a ejecutar en esta revisión.

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
