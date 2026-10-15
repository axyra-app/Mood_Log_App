# Datos y Firestore

## Estado del modelo

Firestore es schemaless. Los modelos TypeScript, servicios, reglas e índices del repositorio **no forman todavía un contrato único**: hay esquemas B2C y heredados, así como servicios que escriben campos distintos. Esta página cataloga lo observado para orientar la consolidación; no garantiza qué documentos existen en Firebase ni que todas las operaciones funcionen.

No agregues colecciones o campos a partir de esta lista sin revisar los llamadores, reglas, consultas e índices relacionados. Las reglas remotas deben confirmarse en Firebase Console o en un proyecto/emulador de desarrollo.

## Colecciones declaradas por las reglas locales

| Colección | Campos de propiedad que usan las reglas | Acceso local observado | Consideraciones |
|---|---|---|---|
| `users/{userId}` | El ID del documento debe coincidir con `request.auth.uid`. | Lectura, creación, actualización y borrado del dueño; alta restringida a rol ausente o `user`, actualización conserva el rol previo. | No hay lista completa de campos permitidos ni validación de tipos y límites. |
| `moodLogs/{logId}` | `userId` | Crear si el nuevo documento tiene el UID propio; leer y borrar si el documento existente pertenece al usuario; actualizar si dueño existente y nuevo `userId` propio. | El servicio conserva campos de `MoodLog`; su tipo aún describe `mood` como 1–5, mientras la interfaz y algunos documentos hablan de 1–10. |
| `journalEntries/{entryId}` | `userId` | Propiedad comprobada al crear, leer, actualizar y borrar. | El servicio persiste texto en claro, fecha, etiquetas, estado de ánimo y datos opcionales de análisis. No existe cifrado cliente. |
| `chatSessions/{sessionId}` | `userId` | Crear con UID propio; leer/borrar del dueño; actualizar solo si dueño existente y nuevo coinciden con la sesión. | No concede acceso a un psicólogo/participante distinto. |
| `chatMessages/{messageId}` | `userId` | Igual que `chatSessions`. | El hook `useChat` crea mensajes con `sessionId`, `senderId`, `senderName`, `content`, `timestamp`, `isRead` y `messageType`; verificar si envía también `userId`, requerido por la regla de creación. |
| `notifications/{notificationId}` | `userId` | Crear con `userId` propio; leer/borrar del dueño; actualizar sin cambiar propietario. | Otros servicios pueden producir campos/esquemas diferentes; confirmar cada llamador. |
| `advancedReports/{reportId}` | `userId` | Crear con UID propio; acceso del dueño; actualizar sin cambiar propietario. | Verificar si el flujo activo persiste estos documentos. |
| `statistics/{statId}` | `userId` | Crear con UID propio; leer/borrar del dueño; actualizar sin cambiar propietario. | La creación y el aislamiento tienen cobertura en las pruebas de reglas del emulador. |
| `reminders/{reminderId}` | `userId` | Crear con UID propio; leer/borrar del dueño; actualizar sin cambiar propietario. | Confirmar el flujo con pruebas antes de considerarlo disponible. |
| `journalTemplates/{templateId}`, `journalPrompts/{promptId}` | Sin propiedad | Lectura para cualquier usuario autenticado; no se permite escritura. | `journalService` incluye inicialización de datos por defecto desde el cliente; las reglas actuales no autorizan esa escritura. |
| Otras colecciones | — | Denegadas por la regla catch-all. | Incluye nombres usados por otros servicios, por ejemplo `chats`, `messages`, `typing`, `crisisAssessments` y `crisisAlerts`, hasta que se definan reglas explícitas. |

La tabla resume las reglas locales de [firestore.rules](../../firestore.rules). Las pruebas automatizadas actuales cubren roles, propiedad, transferencias de propietario y creación de estadísticas, no todos los campos ni operaciones de todas las colecciones. Un bloque `allow` solo define autorización; no valida automáticamente tipos, rangos, campos permitidos ni consistencia entre documentos.

## Formas de datos observadas en el código

### Perfil (`users/{uid}`)

`AuthContext` lee y escribe propiedades como `email`, `displayName`, `username`, `role`, `createdAt`, `updatedAt`, nombre y teléfono. La interfaz de `User` en `frontend/src/types/index.ts` también declara campos heredados y `role: 'user' | 'psychologist'`, mientras el contexto de autenticación expone `role: 'user'`. No se debe tratar el rol del cliente como autorización confiable.

### Registro de ánimo (`moodLogs`)

`moodLogService` recibe un `MoodLog` y escribe el objeto recibido junto con `createdAt` y `updatedAt`. La interfaz actual `MoodLog` incluye `userId`, `mood`, `energy`, `stress`, `sleep`, `notes`, `activities`, `emotions` y `aiAnalysis`. El tipo comenta `mood` en escala 1–5; algunas pantallas/documentos describen otra escala. No asumir compatibilidad entre registros existentes: primero definir un modelo canónico y una estrategia de migración/visualización.

### Entrada de diario (`journalEntries`)

`journalService.createJournalEntry` guarda `userId`, `title`, `content`, `date`, `tags`, `mood`, `energy`, `stress`, `sleep`, `activities`, `emotions`, `aiSuggestions`, `aiAnalysis`, `isPrivate`, `createdAt` y `updatedAt`; elimina valores nulos antes de escribir. El contenido se guarda como texto legible.

### Conversaciones y mensajes

| Implementación | Colecciones | Modelo/campos principales |
|---|---|---|
| Hook `useChat` | `chatSessions`, `chatMessages` | Sesión con `userId`, `psychologistId`, participantes y metadatos; mensaje con `sessionId`, `senderId`, `content` y `timestamp`. Conserva un modelo profesional/legacy. |
| Servicio `chatService` | `chats`, `messages` y `typing` | Conversación con `participants`, `chatType` y actividad; mensaje con `chatId`, emisor/destinatario y contenido. |
| Reglas actuales | `chatSessions`, `chatMessages` | Cada documento exige `userId` para acceso. No hay reglas para `chats`, `messages` ni `typing`. |

Estos contratos no son intercambiables. El producto debe escoger un único modelo y alinear el servicio, las reglas, las consultas y los índices antes de considerar chat operativo.

## Índices

`firestore.indexes.json` conserva índices para `appointments`, `notifications`, `chatSessions` y `chatMessages`, incluidos campos de la experiencia profesional anterior. No es un inventario de consultas garantizadas ni coincide necesariamente con los módulos B2C actuales. Firestore puede requerir índices adicionales según filtros/ordenamientos. Ante el enlace de error que devuelve Firebase:

1. Confirma que la consulta y los campos son los esperados.
2. Añade el índice mínimo necesario al archivo versionado.
3. Prueba en el proyecto de desarrollo y despliega solo después de revisar el destino.

## Reglas para evolucionar el modelo

- Mantener `userId` inmutable y derivarlo de la sesión autenticada, no de datos editables del formulario.
- Definir para cada colección campos obligatorios, tipos, límites, propietario y operaciones permitidas.
- Evitar guardar texto sensible redundante en informes, notificaciones, analytics o logs.
- Actualizar conjuntamente los tipos, servicios, consultas, reglas, índices y pruebas.
- No usar datos reales de salud emocional en desarrollo.
