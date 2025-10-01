# 🔥 GUÍA PARA CONFIGURAR ÍNDICES EN FIREBASE FIRESTORE

## 📋 Instrucciones Paso a Paso

### 1. **Acceder a Firebase Console**

- Ve a [Firebase Console](https://console.firebase.google.com/)
- Selecciona tu proyecto: `mood-log-app-01`
- Ve a **Firestore Database** → **Índices**

### 2. **Crear Índices Individualmente**

Para cada índice, sigue estos pasos:

#### **A. Índices para Mood Logs**

**Índice 1: Usuario + Fecha**

- **ID de la colección**: `moodLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

**Índice 2: Usuario + Estado de Ánimo**

- **ID de la colección**: `moodLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `mood` → **Ascendente**

**Índice 3: Usuario + Actividades**

- **ID de la colección**: `moodLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `activities` → **Array** (para consultas con `array-contains`)

**Índice 4: Usuario + Emociones**

- **ID de la colección**: `moodLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `emotions` → **Array** (para consultas con `array-contains`)

**Índice 5: Usuario + Estrés**

- **ID de la colección**: `moodLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `stress` → **Ascendente**

**Índice 6: Usuario + Sueño**

- **ID de la colección**: `moodLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `sleep` → \*\*Ascendente`

#### **B. Índices para Psicólogos**

**Índice 7: Estado + Especializaciones**

- **ID de la colección**: `psychologists`
- **Campo 1**: `status` → **Ascendente**
- **Campo 2**: `specializations` → **Array** (para consultas con `array-contains`)

**Índice 8: Estado + Fecha**

- **ID de la colección**: `psychologists`
- **Campo 1**: `status` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **C. Índices para Pacientes**

**Índice 9: Psicólogo + Estado**

- **ID de la colección**: `patients`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `status` → **Ascendente**

**Índice 10: Usuario + Estado**

- **ID de la colección**: `patients`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `status` → **Ascendente**

#### **D. Índices para Citas**

**Índice 11: Psicólogo + Hora de Inicio**

- **ID de la colección**: `appointments`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `startTime` → **Ascendente**

**Índice 12: Paciente + Hora de Inicio**

- **ID de la colección**: `appointments`
- **Campo 1**: `patientId` → **Ascendente**
- **Campo 2**: `startTime` → **Ascendente**

**Índice 13: Estado + Hora de Inicio**

- **ID de la colección**: `appointments`
- **Campo 1**: `status` → **Ascendente**
- **Campo 2**: `startTime` → **Ascendente**

#### **E. Índices para Mensajes**

**Índice 14: Participantes + Timestamp**

- **ID de la colección**: `messages`
- **Campo 1**: `participants` → **Array** (para consultas con `array-contains`)
- **Campo 2**: `timestamp` → **Descendente**

**Índice 15: Conversación + Timestamp**

- **ID de la colección**: `messages`
- **Campo 1**: `conversationId` → **Ascendente**
- **Campo 2**: `timestamp` → **Descendente**

#### **F. Índices para Notificaciones**

**Índice 16: Usuario + Leído**

- **ID de la colección**: `notifications`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `read` → **Ascendente**

**Índice 17: Usuario + Fecha**

- **ID de la colección**: `notifications`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

**Índice 18: Usuario + Prioridad**

- **ID de la colección**: `notifications`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `priority` → **Ascendente**

#### **G. Índices para Análisis de IA**

**Índice 19: Usuario + Fecha**

- **ID de la colección**: `aiAnalysis`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

**Índice 20: Mood Log + Fecha**

- **ID de la colección**: `aiAnalysis`
- **Campo 1**: `moodLogId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **H. Índices para Estadísticas**

**Índice 21: Usuario + Período**

- **ID de la colección**: `statistics`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `period` → **Ascendente**

**Índice 22: Psicólogo + Período**

- **ID de la colección**: `statistics`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `period` → **Ascendente**

#### **I. Índices para Notas de Sesión**

**Índice 23: Psicólogo + Paciente**

- **ID de la colección**: `sessionNotes`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `patientId` → **Ascendente**

**Índice 24: Cita + Fecha**

- **ID de la colección**: `sessionNotes`
- **Campo 1**: `appointmentId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **J. Índices para Planes de Tratamiento**

**Índice 25: Paciente + Estado**

- **ID de la colección**: `treatmentPlans`
- **Campo 1**: `patientId` → **Ascendente**
- **Campo 2**: `status` → **Ascendente**

**Índice 26: Psicólogo + Fecha**

- **ID de la colección**: `treatmentPlans`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **K. Índices para Alertas de Crisis**

**Índice 27: Psicólogo + Resuelto**

- **ID de la colección**: `crisisAlerts`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `resolved` → **Ascendente**

**Índice 28: Paciente + Fecha**

- **ID de la colección**: `crisisAlerts`
- **Campo 1**: `patientId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

**Índice 29: Urgencia + Fecha**

- **ID de la colección**: `crisisAlerts`
- **Campo 1**: `urgency` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **L. Índices para Recomendaciones**

**Índice 30: Usuario + Tipo**

- **ID de la colección**: `recommendations`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `type` → **Ascendente**

**Índice 31: Usuario + Fecha**

- **ID de la colección**: `recommendations`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **M. Índices para Objetivos de Bienestar**

**Índice 32: Usuario + Estado**

- **ID de la colección**: `wellnessGoals`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `status` → **Ascendente**

**Índice 33: Usuario + Fecha Límite**

- **ID de la colección**: `wellnessGoals`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `deadline` → **Ascendente**

#### **N. Índices para Recordatorios**

**Índice 34: Usuario + Hora Programada**

- **ID de la colección**: `reminders`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `scheduledTime` → **Ascendente**

**Índice 35: Usuario + Completado**

- **ID de la colección**: `reminders`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `completed` → **Ascendente**

#### **O. Índices para Logs de Auditoría**

**Índice 36: Usuario + Acción**

- **ID de la colección**: `auditLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `action` → **Ascendente**

**Índice 37: Usuario + Timestamp**

- **ID de la colección**: `auditLogs`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `timestamp` → **Descendente**

#### **P. Índices para Reportes**

**Índice 38: Psicólogo + Tipo**

- **ID de la colección**: `reports`
- **Campo 1**: `psychologistId` → **Ascendente**
- **Campo 2**: `type` → **Ascendente**

**Índice 39: Paciente + Fecha**

- **ID de la colección**: `reports`
- **Campo 1**: `patientId` → **Ascendente**
- **Campo 2**: `createdAt` → **Descendente**

#### **Q. Índices para Configuraciones de Usuario**

**Índice 40: Usuario + Fecha de Actualización**

- **ID de la colección**: `userSettings`
- **Campo 1**: `userId` → **Ascendente**
- **Campo 2**: `updatedAt` → **Descendente**

### 3. **Notas Importantes**

- **Array**: Para campos que contienen arrays (como `activities`, `emotions`, `participants`), selecciona **"Array"** en Firebase Console
- **Ascendente**: Para ordenar de menor a mayor (A-Z, 1-10)
- **Descendente**: Para ordenar de mayor a menor (Z-A, 10-1)
- **Tiempo de creación**: Los índices pueden tardar varios minutos en crearse
- **Verificación**: Después de crear cada índice, verifica que aparezca en la lista

### 4. **Campos que Necesitan "Array"**

Los siguientes campos deben usar **"Array"** porque contienen arrays:

- `moodLogs.activities`
- `moodLogs.emotions`
- `psychologists.specializations`
- `messages.participants`

### 5. **Verificación Final**

Una vez creados todos los índices, deberías ver 40 índices en total en la lista de Firebase Console.

### 6. **Archivo JSON Completo**

Si prefieres usar el archivo JSON completo, puedes usar `firestore.indexes-simplified.json` que contiene todos los índices en formato JSON válido para Firebase.

---

## 🚀 **¡Listo para usar!**

Con estos índices configurados, tu aplicación Mood Log tendrá un rendimiento óptimo en todas las consultas de Firestore.
