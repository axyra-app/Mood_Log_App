# 🗄️ Esquema de Base de Datos (Cloud Firestore)

## 1. Principios del Modelo de Datos

1. **Aislamiento por Usuario (Tenant Isolation):** Todo documento almacena un campo `userId` que coincide exactamente con el `UID` de Firebase Auth.
2. **Consultas Indexadas Eficientes:** Cada consulta compuesta (ej. filtrar por usuario y ordenar por fecha) cuenta con índices precalculados en Firestore para garantizar respuestas sub-segundo.
3. **Desnormalización Controlada:** Los datos de agregación (rachas, último registro) se guardan en el perfil del usuario para evitar lecturas masivas innecesarias.

---

## 2. Colecciones Activas

### 2.1 `users/{userId}`
Contiene el perfil y estado de gamificación/rachas del usuario.

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `uid` | `string` | ✅ | UID de Firebase Authentication (coincide con el Document ID) |
| `email` | `string` | ✅ | Correo electrónico principal |
| `displayName` | `string` | ❌ | Nombre o apodo visible |
| `photoURL` | `string` | ❌ | URL del avatar en Cloud Storage o Google |
| `role` | `'user'` | ✅ | Rol único del usuario final |
| `streakDays` | `number` | ❌ | Contador de días consecutivos con registro activo |
| `lastLogDate` | `Timestamp` | ❌ | Fecha y hora del último registro completado |
| `createdAt` | `Timestamp` | ✅ | Fecha de registro en la plataforma |
| `updatedAt` | `Timestamp` | ✅ | Última actualización del perfil |

---

### 2.2 `moodLogs/{logId}`
Cada registro instantáneo del estado de ánimo del usuario (Core de Strava Emocional).

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `id` | `string` | ✅ | ID único del documento |
| `userId` | `string` | ✅ | UID del propietario |
| `score` | `number` | ✅ | Valor numérico del ánimo (escala unificada 1 a 10) |
| `mood` | `string` | ✅ | Emoción principal (ej. `'feliz'`, `'ansioso'`, `'calmado'`, `'triste'`) |
| `note` | `string` | ❌ | Breve nota o contexto opcional (máx. 500 caracteres) |
| `tags` | `string[]` | ❌ | Detonantes o categorías (ej. `['trabajo', 'sueño', 'ejercicio']`) |
| `heartRate` | `number` | ❌ | Pulso en reposo al momento del registro (BPM, integración futura) |
| `hrv` | `number` | ❌ | Variabilidad de frecuencia cardíaca (ms, integración futura) |
| `createdAt` | `Timestamp` | ✅ | Momento exacto del registro |

---

### 2.3 `journalEntries/{entryId}`
Reflexiones libres y pensamientos íntimos del usuario.

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `id` | `string` | ✅ | ID único del documento |
| `userId` | `string` | ✅ | UID del propietario |
| `title` | `string` | ❌ | Título de la entrada o prompt seleccionado |
| `content` | `string` | ✅ | Texto de la reflexión (o payload encriptado en Fase 3) |
| `isEncrypted` | `boolean` | ❌ | Bandera que indica si el contenido está cifrado con llave local |
| `moodScore` | `number` | ❌ | Puntuación asociada a este momento |
| `tags` | `string[]` | ❌ | Etiquetas temáticas personales |
| `aiFeedback` | `string` | ❌ | Reflexión o pregunta de cierre generada por el Confidente IA |
| `createdAt` | `Timestamp` | ✅ | Fecha de creación |
| `updatedAt` | `Timestamp` | ✅ | Última modificación |

---

### 2.4 `chatSessions/{sessionId}` y Mensajes
Conversaciones privadas entre el usuario y su Confidente IA.

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `id` | `string` | ✅ | ID único de la sesión |
| `userId` | `string` | ✅ | UID del usuario |
| `messages` | `Array<Message>` | ✅ | Array de mensajes intercambiados |
| ↳ `role` | `'user' \| 'assistant'` | ✅ | Emisor del mensaje |
| ↳ `content` | `string` | ✅ | Texto del mensaje |
| ↳ `timestamp` | `Timestamp` | ✅ | Hora del mensaje |
| `createdAt` | `Timestamp` | ✅ | Fecha de inicio de sesión |
| `lastMessageAt` | `Timestamp` | ✅ | Última interacción |

---

### 2.5 `notifications/{notificationId}`
Recordatorios suaves, alertas de racha o notificaciones del sistema.

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `userId` | `string` | ✅ | UID destinatario |
| `title` | `string` | ✅ | Título de la alerta |
| `message` | `string` | ✅ | Cuerpo del mensaje |
| `type` | `'reminder' \| 'streak' \| 'system' \| 'crisis'` | ✅ | Clasificación |
| `read` | `boolean` | ✅ | Estado de lectura |
| `createdAt` | `Timestamp` | ✅ | Momento de emisión |

---

## 3. Índices Compuestos Necesarios (`firestore.indexes.json`)

Para que las consultas con filtros y ordenamientos funcionen sin error en Firebase, se requieren los siguientes índices:

```json
{
  "indexes": [
    {
      "collectionGroup": "moodLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "journalEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 4. Colecciones Eliminadas del Sistema Universitario

Las siguientes colecciones fueron dadas de baja en el esquema como parte del pivot comercial a B2C:
- ❌ `psychologists`
- ❌ `appointments`
- ❌ `medicalReports`
- ❌ `patientHistory`
- ❌ `patients`
- ❌ `psychologistRatings`
- ❌ `psychologist-cvs`
