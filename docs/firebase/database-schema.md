# Datos y Firestore

## Estado del modelo

Firestore es schemaless. Los modelos TypeScript, servicios, reglas e índices del repositorio **no forman todavía un contrato único**: hay esquemas B2C y heredados, así como servicios que escriben campos distintos. Esta página cataloga lo observado para orientar la consolidación; no garantiza qué documentos existen en Firebase ni que todas las operaciones funcionen.

No agregues colecciones o campos a partir de esta lista sin revisar los llamadores, reglas, consultas e índices relacionados. Las reglas remotas deben confirmarse en Firebase Console o en un proyecto/emulador de desarrollo.

## Colecciones declaradas por las reglas locales

| Colección | Campos de propiedad que usan las reglas | Acceso local observado | Consideraciones |
|---|---|---|---|
| `users/{userId}` | El ID del documento debe coincidir con `request.auth.uid`; `role` debe ser `user` y no puede elevarse. | Lectura, creación, actualización y borrado del dueño. | Los campos raíz del perfil están limitados; biografía máx. 2.000 caracteres; los mapas `settings` y `emergencyContact` no tienen validación interna exhaustiva. |
| `moodLogs/{logId}` | `userId` | Crear si el nuevo documento tiene el UID propio; leer y borrar si el documento existente pertenece al usuario; actualizar si dueño existente y nuevo `userId` propio. | Las reglas validan claves raíz, puntuaciones 1–10 y límites de notas/listas. Los registros históricos no se convierten automáticamente. |
| `journalEntries/{entryId}` | `userId` | Propiedad comprobada al crear, leer, actualizar y borrar. | Las reglas limitan título a 200 caracteres, contenido a 20.000, puntuaciones opcionales a 1–10 y tamaños de listas. El texto se persiste legible; no existe cifrado cliente. |
| `notifications/{notificationId}` | `userId` | Crear con `userId` propio; leer/borrar del dueño; actualizar solo estado de lectura y fechas. | El esquema raíz está limitado a campos usados por el servicio activo. |
| `userSettings/{settingsId}` | El ID del documento debe coincidir con `request.auth.uid`; `userId`, si existe, debe coincidir con el UID. | Lectura, creación, actualización y borrado del dueño. | Campos raíz limitados; mapas de notificaciones, privacidad, aplicación y ánimo se validan como mapas. |
| `advancedReports/{reportId}` | `userId` | Crear con UID propio; acceso del dueño; actualizar sin cambiar propietario. | Verificar si el flujo activo persiste estos documentos. |
| `statistics/{statId}` | `userId` | Crear con UID propio; leer/borrar del dueño; actualizar sin cambiar propietario. | La creación y el aislamiento tienen cobertura en las pruebas de reglas del emulador. |
| `reminders/{reminderId}` | `userId` | Crear con UID propio; leer/borrar del dueño; actualizar sin cambiar propietario. | Confirmar el flujo con pruebas antes de considerarlo disponible. |
| `journalTemplates/{templateId}`, `journalPrompts/{promptId}` | Sin propiedad | Lectura para cualquier usuario autenticado; no se permite escritura. | Si las colecciones están vacías, el cliente usa plantillas y prompts locales; no debe inicializarlas en Firestore. |
| `accountDeletionRequests/{uid}` | ID de documento igual al UID, creado solo por Firebase Admin. | Denegada a clientes por la regla catch-all. La existencia del marcador bloquea nuevas escrituras de datos del cliente y el backend de IA mientras se procesa una eliminación; la lectura permanece disponible para permitir reintentos. | Registro operativo temporal, sin texto personal. El endpoint lo elimina al completar Auth; un fallo de limpieza queda registrado para intervención operativa. |
| Otras colecciones | — | Denegadas a clientes por la regla catch-all. | Incluye nombres heredados como `chats`, `messages`, `chatSessions`, `chatMessages`, `typing`, `crisisAssessments` y `crisisAlerts`. `aiUsage/{uid}` es un contador interno escrito por la API con Firebase Admin; no es accesible desde el cliente y el SDK Admin omite las reglas. |

La tabla resume las reglas locales de [firestore.rules](../../firebase/firestore.rules). `npm run test:rules` pasó 22 pruebas del emulador para rol, propiedad, transferencias, límites de ánimo/diario, notificaciones, ajustes, reportes/recordatorios, colecciones de solo lectura, colecciones heredadas y Storage. Firebase CLI requiere JDK 21 o superior para ejecutar los emuladores; la última ejecución usó un JRE 21 temporal. Estas pruebas no demuestran el estado de reglas desplegado en Firebase.

## Formas de datos observadas en el código

### Perfil (`users/{uid}`)

`AuthContext` crea el perfil con `role: 'user'`; el formulario de registro no presenta opciones de rol. La interfaz compartida `User` también declara el rol como el literal `user`. La autorización se aplica en las reglas de Firestore y no debe confiarse únicamente a los tipos o al cliente.

### Registro de ánimo (`moodLogs`)

`moodLogService` recibe un `MoodLog` y escribe el objeto recibido junto con `createdAt` y `updatedAt`. La interfaz actual `MoodLog` incluye `userId`, `mood`, `energy`, `stress`, `sleep`, `notes`, `activities`, `emotions` y `aiAnalysis`. La escala canónica de ánimo es 1–10, como utiliza el flujo de registro; esta definición no transforma registros históricos. Las métricas usan fechas de calendario local.

### Entrada de diario (`journalEntries`)

`journalService.createJournalEntry` guarda `userId`, `title`, `content`, `date`, `tags`, `mood`, `energy`, `stress`, `sleep`, `activities`, `emotions`, `aiSuggestions`, `aiAnalysis`, `isPrivate`, `createdAt` y `updatedAt`; elimina valores nulos antes de escribir. El contenido se guarda como texto legible.

Los reportes consultan por `userId` y limitan en Firestore el intervalo de `date`; el índice compuesto correspondiente se mantiene en `firebase/firestore.indexes.json`.

### Conversaciones de autorreflexión

El chat con IA mantiene su historial solo en memoria del navegador durante la vista actual; no utiliza colecciones de Firestore para mensajes o sesiones. El texto se envía al proveedor de IA para generar la respuesta. Las colecciones de chat persistente y las colecciones profesionales heredadas no están autorizadas por las reglas y no forman parte del modelo activo.

## Índices

`firebase/firestore.indexes.json` conserva los índices definidos para las consultas actuales que requieren composición. No es una garantía de que todas las consultas del cliente estén cubiertas. Firestore puede requerir índices adicionales según filtros/ordenamientos. Ante el enlace de error que devuelve Firebase:

1. Confirma que la consulta y los campos son los esperados.
2. Añade el índice mínimo necesario al archivo versionado.
3. Prueba en el proyecto de desarrollo y despliega solo después de revisar el destino.

## Reglas para evolucionar el modelo

- Mantener `userId` inmutable y derivarlo de la sesión autenticada, no de datos editables del formulario.
- Definir para cada colección campos obligatorios, tipos, límites, propietario y operaciones permitidas.
- Evitar guardar texto sensible redundante en informes, notificaciones, analytics o logs.
- Actualizar conjuntamente los tipos, servicios, consultas, reglas, índices y pruebas.
- No usar datos reales de salud emocional en desarrollo.
