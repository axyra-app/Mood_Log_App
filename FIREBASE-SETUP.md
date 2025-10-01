# 🔧 CONFIGURACIÓN FIREBASE - MOOD LOG APP

## 📋 **CREDENCIALES FIREBASE**

```javascript
// Configuración Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyA-C1BT_zMxuYc9KijrjwJvQ7q6HambXhc',
  authDomain: 'mood-log-app-01.firebaseapp.com',
  projectId: 'mood-log-app-01',
  storageBucket: 'mood-log-app-01.firebasestorage.app',
  messagingSenderId: '49395788789',
  appId: '1:49395788789:web:0d09416d660b75d1820ebc',
  measurementId: 'G-2T3QQ2ESWM',
};
```

## 🚀 **COMANDOS DE DESPLIEGUE**

### **1. Desplegar Reglas de Firestore:**

```bash
firebase deploy --only firestore:rules
```

### **2. Desplegar Índices de Firestore:**

```bash
firebase deploy --only firestore:indexes
```

### **3. Desplegar Todo:**

```bash
firebase deploy
```

## 📊 **COLECCIONES DE FIRESTORE COMPLETAS**

### **Estructura de Datos Completa:**

```
users/                    # Usuarios del sistema
├── {userId}/
    ├── email: string
    ├── role: 'user' | 'psychologist'
    ├── profile: object
    ├── isActive: boolean
    ├── createdAt: timestamp
    └── ...

psychologists/            # Perfiles de psicólogos
├── {psychologistId}/
    ├── licenseNumber: string
    ├── specialization: string[]
    ├── isAvailable: boolean
    ├── rating: number
    ├── yearsOfExperience: number
    ├── bio: string
    ├── location: string
    └── ...

moodLogs/                 # Registros de estado de ánimo
├── {moodLogId}/
    ├── userId: string
    ├── mood: number (1-5)
    ├── energy: number (1-10)
    ├── stress: number (1-10)
    ├── sleep: number (1-10)
    ├── notes: string
    ├── activities: string[]
    ├── emotions: string[]
    ├── weather: string
    ├── socialInteraction: number (1-10)
    ├── physicalActivity: number (1-10)
    ├── createdAt: timestamp
    └── ...

patients/                 # Asignaciones de pacientes
├── {patientId}/
    ├── userId: string
    ├── psychologistId: string
    ├── status: 'active' | 'inactive' | 'discharged'
    ├── riskLevel: 'low' | 'medium' | 'high'
    ├── assignedAt: timestamp
    ├── lastSession: timestamp
    ├── nextSession: timestamp
    ├── notes: string
    └── ...

appointments/             # Citas programadas
├── {appointmentId}/
    ├── patientId: string
    ├── psychologistId: string
    ├── startTime: timestamp
    ├── endTime: timestamp
    ├── status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
    ├── type: 'individual' | 'group' | 'emergency'
    ├── location: string
    ├── notes: string
    ├── reminderSent: boolean
    └── ...

messages/                 # Mensajes de chat
├── {messageId}/
    ├── participants: string[]
    ├── content: string
    ├── timestamp: timestamp
    ├── isRead: boolean
    ├── messageType: 'text' | 'image' | 'file'
    ├── senderId: string
    └── ...

notifications/            # Notificaciones del sistema
├── {notificationId}/
    ├── userId: string
    ├── title: string
    ├── message: string
    ├── type: 'appointment' | 'reminder' | 'alert' | 'general'
    ├── priority: 'low' | 'medium' | 'high' | 'urgent'
    ├── read: boolean
    ├── createdAt: timestamp
    ├── actionUrl: string
    └── ...

aiAnalysis/               # Análisis de IA
├── {analysisId}/
    ├── userId: string
    ├── moodLogId: string
    ├── analysis: object
    ├── confidence: number
    ├── personality: string
    ├── insights: string[]
    ├── recommendations: string[]
    ├── createdAt: timestamp
    └── ...

statistics/               # Estadísticas de usuario
├── {statId}/
    ├── userId: string
    ├── period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    ├── moodAverage: number
    ├── energyAverage: number
    ├── stressAverage: number
    ├── sleepAverage: number
    ├── trends: object
    ├── createdAt: timestamp
    └── ...

sessionNotes/             # Notas de sesión
├── {noteId}/
    ├── psychologistId: string
    ├── patientId: string
    ├── sessionDate: timestamp
    ├── notes: string
    ├── goals: string[]
    ├── homework: string[]
    ├── moodBefore: number
    ├── moodAfter: number
    ├── nextSession: timestamp
    └── ...

treatmentPlans/           # Planes de tratamiento
├── {planId}/
    ├── psychologistId: string
    ├── patientId: string
    ├── title: string
    ├── description: string
    ├── goals: string[]
    ├── interventions: string[]
    ├── status: 'active' | 'completed' | 'paused'
    ├── startDate: timestamp
    ├── endDate: timestamp
    ├── progress: number
    └── ...

crisisAlerts/            # Alertas de crisis
├── {alertId}/
    ├── psychologistId: string
    ├── patientId: string
    ├── urgency: 'low' | 'medium' | 'high' | 'critical'
    ├── type: 'suicidal' | 'self-harm' | 'panic' | 'depression'
    ├── description: string
    ├── resolved: boolean
    ├── resolvedAt: timestamp
    ├── createdAt: timestamp
    └── ...

recommendations/          # Recomendaciones personalizadas
├── {recommendationId}/
    ├── userId: string
    ├── type: 'activity' | 'exercise' | 'meditation' | 'social'
    ├── title: string
    ├── description: string
    ├── priority: 'low' | 'medium' | 'high'
    ├── isRead: boolean
    ├── completed: boolean
    ├── createdAt: timestamp
    └── ...

wellnessGoals/           # Objetivos de bienestar
├── {goalId}/
    ├── userId: string
    ├── title: string
    ├── description: string
    ├── category: 'mental' | 'physical' | 'social' | 'emotional'
    ├── status: 'active' | 'completed' | 'paused' | 'cancelled'
    ├── deadline: timestamp
    ├── progress: number
    ├── milestones: string[]
    ├── createdAt: timestamp
    └── ...

reminders/                # Recordatorios
├── {reminderId}/
    ├── userId: string
    ├── title: string
    ├── description: string
    ├── type: 'mood_log' | 'appointment' | 'medication' | 'exercise'
    ├── scheduledTime: timestamp
    ├── frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    ├── active: boolean
    ├── lastTriggered: timestamp
    └── ...

auditLogs/               # Logs de auditoría
├── {logId}/
    ├── userId: string
    ├── action: string
    ├── resource: string
    ├── resourceId: string
    ├── details: object
    ├── ipAddress: string
    ├── userAgent: string
    ├── createdAt: timestamp
    └── ...

reports/                  # Reportes generados
├── {reportId}/
    ├── userId: string
    ├── type: 'mood_summary' | 'progress' | 'session' | 'crisis'
    ├── period: string
    ├── data: object
    ├── generatedAt: timestamp
    ├── psychologistId: string (opcional)
    └── ...

userSettings/             # Configuraciones de usuario
├── {settingsId}/
    ├── userId: string
    ├── notifications: object
    ├── privacy: object
    ├── preferences: object
    ├── theme: string
    ├── language: string
    ├── updatedAt: timestamp
    └── ...
```

## 🔒 **REGLAS DE SEGURIDAD**

### **Principios de Seguridad:**

- ✅ Solo usuarios autenticados pueden acceder
- ✅ Usuarios solo pueden leer/escribir sus propios datos
- ✅ Psicólogos pueden acceder a datos de sus pacientes
- ✅ Validación de roles en todas las operaciones
- ✅ Protección contra acceso no autorizado

## 📈 **ÍNDICES OPTIMIZADOS COMPLETOS**

### **Índices Creados (Total: 50+ índices):**

#### **📊 Mood Logs (7 índices):**

1. `userId + createdAt` (descendente)
2. `userId + mood + createdAt` (para filtros de estado de ánimo)
3. `userId + energy + createdAt` (para análisis de energía)
4. `userId + stress + createdAt` (para análisis de estrés)
5. `userId + sleep + createdAt` (para análisis de sueño)
6. `userId + emotions[] + createdAt` (para filtros de emociones)
7. `userId + activities[] + createdAt` (para filtros de actividades)

#### **👥 Pacientes (3 índices):**

8. `psychologistId + status + updatedAt`
9. `psychologistId + riskLevel + updatedAt`
10. `userId + status`

#### **📅 Citas (4 índices):**

11. `psychologistId + startTime`
12. `patientId + startTime`
13. `psychologistId + status + startTime`
14. `psychologistId + type + startTime`

#### **💬 Mensajes (2 índices):**

15. `participants[] + timestamp` (descendente)
16. `participants[] + isRead + timestamp`

#### **🔔 Notificaciones (3 índices):**

17. `userId + read + createdAt`
18. `userId + type + createdAt`
19. `userId + priority + createdAt`

#### **🤖 Análisis de IA (3 índices):**

20. `userId + createdAt`
21. `userId + moodLogId + createdAt`
22. `userId + confidence + createdAt`

#### **📈 Estadísticas (1 índice):**

23. `userId + period + createdAt`

#### **📝 Notas de Sesión (3 índices):**

24. `psychologistId + sessionDate`
25. `patientId + sessionDate`
26. `psychologistId + patientId + sessionDate`

#### **🏥 Planes de Tratamiento (2 índices):**

27. `psychologistId + status + createdAt`
28. `patientId + status + createdAt`

#### **🚨 Alertas de Crisis (3 índices):**

29. `psychologistId + urgency + createdAt`
30. `patientId + urgency + createdAt`
31. `psychologistId + resolved + createdAt`

#### **💡 Recomendaciones (3 índices):**

32. `userId + isRead + createdAt`
33. `userId + priority + createdAt`
34. `userId + type + createdAt`

#### **🎯 Objetivos de Bienestar (3 índices):**

35. `userId + status + createdAt`
36. `userId + category + createdAt`
37. `userId + deadline`

#### **⏰ Recordatorios (3 índices):**

38. `userId + scheduledTime`
39. `userId + type + scheduledTime`
40. `userId + active + scheduledTime`

#### **📋 Logs de Auditoría (2 índices):**

41. `userId + action + createdAt`
42. `userId + resource + createdAt`

#### **📊 Reportes (2 índices):**

43. `userId + type + createdAt`
44. `userId + period + createdAt`

#### **👤 Usuarios (2 índices):**

45. `role + createdAt`
46. `role + isActive + createdAt`

#### **👨‍⚕️ Psicólogos (3 índices):**

47. `isAvailable + rating`
48. `specialization[] + isAvailable + rating`
49. `yearsOfExperience + rating`

## 🎯 **PRÓXIMOS PASOS**

1. **Desplegar configuración**: `firebase deploy`
2. **Verificar reglas**: Probar en Firebase Console
3. **Crear usuarios de prueba**: Registrar usuarios y psicólogos
4. **Probar funcionalidades**: Mood logs, chat, citas
5. **Monitorear performance**: Revisar métricas de Firestore

---

**✅ Configuración completada y lista para producción**
