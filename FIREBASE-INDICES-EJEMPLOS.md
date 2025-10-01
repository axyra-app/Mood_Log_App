# 🔥 EJEMPLOS VISUALES PARA CONFIGURAR ÍNDICES EN FIREBASE

## 📋 Guía Visual Paso a Paso

### **Paso 1: Acceder a Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `mood-log-app-01`
3. Ve a **Firestore Database** → **Índices**
4. Haz clic en **"Crear índice"**

### **Paso 2: Configurar Índices**

#### **Ejemplo 1: Índice para Mood Logs (Usuario + Fecha)**

```
┌─────────────────────────────────────┐
│ Crear índice                        │
├─────────────────────────────────────┤
│ ID de la colección: moodLogs        │
│                                     │
│ Campos que se indexarán:            │
│ ┌─────────────────────────────────┐ │
│ │ 1. userId                      │ │
│ │    [Ascendente ▼]              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 2. createdAt                    │ │
│ │    [Descendente ▼]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Crear] [Cancelar]                  │
└─────────────────────────────────────┘
```

#### **Ejemplo 2: Índice para Mood Logs (Usuario + Actividades)**

```
┌─────────────────────────────────────┐
│ Crear índice                        │
├─────────────────────────────────────┤
│ ID de la colección: moodLogs        │
│                                     │
│ Campos que se indexarán:            │
│ ┌─────────────────────────────────┐ │
│ │ 1. userId                      │ │
│ │    [Ascendente ▼]              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 2. activities                   │ │
│ │    [Array ▼]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Crear] [Cancelar]                  │
└─────────────────────────────────────┘
```

#### **Ejemplo 3: Índice para Psicólogos (Estado + Especializaciones)**

```
┌─────────────────────────────────────┐
│ Crear índice                        │
├─────────────────────────────────────┤
│ ID de la colección: psychologists   │
│                                     │
│ Campos que se indexarán:            │
│ ┌─────────────────────────────────┐ │
│ │ 1. status                      │ │
│ │    [Ascendente ▼]              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 2. specializations              │ │
│ │    [Array ▼]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Crear] [Cancelar]                  │
└─────────────────────────────────────┘
```

### **Paso 3: Lista Completa de Índices**

#### **A. Mood Logs (6 índices)**

| #   | Colección | Campo 1 | Campo 2    | Tipo Campo 2 |
| --- | --------- | ------- | ---------- | ------------ |
| 1   | moodLogs  | userId  | createdAt  | Descendente  |
| 2   | moodLogs  | userId  | mood       | Ascendente   |
| 3   | moodLogs  | userId  | activities | **Array**    |
| 4   | moodLogs  | userId  | emotions   | **Array**    |
| 5   | moodLogs  | userId  | stress     | Ascendente   |
| 6   | moodLogs  | userId  | sleep      | Ascendente   |

#### **B. Psicólogos (2 índices)**

| #   | Colección     | Campo 1 | Campo 2         | Tipo Campo 2 |
| --- | ------------- | ------- | --------------- | ------------ |
| 7   | psychologists | status  | specializations | **Array**    |
| 8   | psychologists | status  | createdAt       | Descendente  |

#### **C. Pacientes (2 índices)**

| #   | Colección | Campo 1        | Campo 2 | Tipo Campo 2 |
| --- | --------- | -------------- | ------- | ------------ |
| 9   | patients  | psychologistId | status  | Ascendente   |
| 10  | patients  | userId         | status  | Ascendente   |

#### **D. Citas (3 índices)**

| #   | Colección    | Campo 1        | Campo 2   | Tipo Campo 2 |
| --- | ------------ | -------------- | --------- | ------------ |
| 11  | appointments | psychologistId | startTime | Ascendente   |
| 12  | appointments | patientId      | startTime | Ascendente   |
| 13  | appointments | status         | startTime | Ascendente   |

#### **E. Mensajes (2 índices)**

| #   | Colección | Campo 1        | Campo 2   | Tipo Campo 2 |
| --- | --------- | -------------- | --------- | ------------ |
| 14  | messages  | participants   | timestamp | Descendente  |
| 15  | messages  | conversationId | timestamp | Descendente  |

#### **F. Notificaciones (3 índices)**

| #   | Colección     | Campo 1 | Campo 2   | Tipo Campo 2 |
| --- | ------------- | ------- | --------- | ------------ |
| 16  | notifications | userId  | read      | Ascendente   |
| 17  | notifications | userId  | createdAt | Descendente  |
| 18  | notifications | userId  | priority  | Ascendente   |

#### **G. Análisis de IA (2 índices)**

| #   | Colección  | Campo 1   | Campo 2   | Tipo Campo 2 |
| --- | ---------- | --------- | --------- | ------------ |
| 19  | aiAnalysis | userId    | createdAt | Descendente  |
| 20  | aiAnalysis | moodLogId | createdAt | Descendente  |

#### **H. Estadísticas (2 índices)**

| #   | Colección  | Campo 1        | Campo 2 | Tipo Campo 2 |
| --- | ---------- | -------------- | ------- | ------------ |
| 21  | statistics | userId         | period  | Ascendente   |
| 22  | statistics | psychologistId | period  | Ascendente   |

#### **I. Notas de Sesión (2 índices)**

| #   | Colección    | Campo 1        | Campo 2   | Tipo Campo 2 |
| --- | ------------ | -------------- | --------- | ------------ |
| 23  | sessionNotes | psychologistId | patientId | Ascendente   |
| 24  | sessionNotes | appointmentId  | createdAt | Descendente  |

#### **J. Planes de Tratamiento (2 índices)**

| #   | Colección      | Campo 1        | Campo 2   | Tipo Campo 2 |
| --- | -------------- | -------------- | --------- | ------------ |
| 25  | treatmentPlans | patientId      | status    | Ascendente   |
| 26  | treatmentPlans | psychologistId | createdAt | Descendente  |

#### **K. Alertas de Crisis (3 índices)**

| #   | Colección    | Campo 1        | Campo 2   | Tipo Campo 2 |
| --- | ------------ | -------------- | --------- | ------------ |
| 27  | crisisAlerts | psychologistId | resolved  | Ascendente   |
| 28  | crisisAlerts | patientId      | createdAt | Descendente  |
| 29  | crisisAlerts | urgency        | createdAt | Descendente  |

#### **L. Recomendaciones (2 índices)**

| #   | Colección       | Campo 1 | Campo 2   | Tipo Campo 2 |
| --- | --------------- | ------- | --------- | ------------ |
| 30  | recommendations | userId  | type      | Ascendente   |
| 31  | recommendations | userId  | createdAt | Descendente  |

#### **M. Objetivos de Bienestar (2 índices)**

| #   | Colección     | Campo 1 | Campo 2  | Tipo Campo 2 |
| --- | ------------- | ------- | -------- | ------------ |
| 32  | wellnessGoals | userId  | status   | Ascendente   |
| 33  | wellnessGoals | userId  | deadline | Ascendente   |

#### **N. Recordatorios (2 índices)**

| #   | Colección | Campo 1 | Campo 2       | Tipo Campo 2 |
| --- | --------- | ------- | ------------- | ------------ |
| 34  | reminders | userId  | scheduledTime | Ascendente   |
| 35  | reminders | userId  | completed     | Ascendente   |

#### **O. Logs de Auditoría (2 índices)**

| #   | Colección | Campo 1 | Campo 2   | Tipo Campo 2 |
| --- | --------- | ------- | --------- | ------------ |
| 36  | auditLogs | userId  | action    | Ascendente   |
| 37  | auditLogs | userId  | timestamp | Descendente  |

#### **P. Reportes (2 índices)**

| #   | Colección | Campo 1        | Campo 2   | Tipo Campo 2 |
| --- | --------- | -------------- | --------- | ------------ |
| 38  | reports   | psychologistId | type      | Ascendente   |
| 39  | reports   | patientId      | createdAt | Descendente  |

#### **Q. Configuraciones de Usuario (1 índice)**

| #   | Colección    | Campo 1 | Campo 2   | Tipo Campo 2 |
| --- | ------------ | ------- | --------- | ------------ |
| 40  | userSettings | userId  | updatedAt | Descendente  |

### **Paso 4: Campos que Necesitan "Array"**

Los siguientes campos deben usar **"Array"** porque contienen arrays:

- `moodLogs.activities` → **Array**
- `moodLogs.emotions` → **Array**
- `psychologists.specializations` → **Array**
- `messages.participants` → **Array**

### **Paso 5: Verificación**

Una vez creados todos los índices, deberías ver **40 índices** en total en la lista de Firebase Console.

---

## 🚀 **¡Listo para usar!**

Con estos índices configurados, tu aplicación Mood Log tendrá un rendimiento óptimo en todas las consultas de Firestore.
