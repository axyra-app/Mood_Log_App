# 🧠 Mood Log App - Dashboard para Psicólogos

Una aplicación completa de seguimiento emocional con dashboard profesional para psicólogos, construida con React, TypeScript, Firebase y Tailwind CSS.

## ✨ Características Principales

### 👨‍⚕️ Dashboard para Psicólogos

- **Gestión Completa de Pacientes**: CRUD completo con información detallada
- **Notas de Sesión**: Sistema avanzado para registrar y gestionar sesiones terapéuticas
- **Planes de Tratamiento**: Creación y seguimiento de planes personalizados
- **Calendario de Citas**: Gestión de citas con vistas diaria, semanal y mensual
- **Chat en Tiempo Real**: Comunicación directa con pacientes
- **Centro de Notificaciones**: Sistema de notificaciones push integrado
- **Analytics Avanzados**: Análisis detallado del progreso emocional

### 📊 Analytics y Reportes

- **Tendencias de Mood**: Análisis temporal del estado emocional
- **Patrones Emocionales**: Identificación de patrones y desencadenantes
- **Insights de Bienestar**: Recomendaciones personalizadas basadas en IA
- **Estadísticas Detalladas**: Métricas completas de progreso

### 🔒 Seguridad y Privacidad

- **Autenticación Firebase**: Sistema seguro de autenticación
- **Reglas de Firestore**: Protección de datos sensibles
- **Encriptación**: Datos protegidos en tránsito y en reposo
- **Cumplimiento GDPR**: Cumplimiento con regulaciones de privacidad

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Estado**: React Context API
- **UI/UX**: Lucide React, Componentes personalizados
- **Tiempo Real**: Firebase Firestore listeners
- **Notificaciones**: Web Push API
- **Analytics**: Algoritmos personalizados de análisis emocional

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── psychologist/          # Componentes específicos para psicólogos
│   │   ├── PatientManagement.tsx
│   │   ├── SessionNotes.tsx
│   │   ├── TreatmentPlans.tsx
│   │   ├── AppointmentsCalendar.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── NotificationsCenter.tsx
│   │   └── AnalyticsDashboard.tsx
│   └── ui/                    # Componentes reutilizables
├── services/                  # Servicios de Firebase
│   ├── patientService.ts
│   ├── chatService.ts
│   ├── notificationService.ts
│   └── analyticsService.ts
├── types/                     # Definiciones de TypeScript
│   └── index.ts
├── contexts/                  # Contextos de React
│   └── AuthContext.tsx
└── pages/                     # Páginas principales
    └── DashboardPsychologistAdvanced.tsx
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/mood-log-app.git
cd mood-log-app
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication y Firestore
3. Copiar las credenciales a `src/services/firebase.ts`

### 4. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 5. Ejecutar la Aplicación

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 Configuración de Firestore

### Reglas de Seguridad

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para pacientes
    match /patients/{patientId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.psychologistId;
    }

    // Reglas para notas de sesión
    match /sessionNotes/{noteId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.psychologistId;
    }

    // Reglas para planes de tratamiento
    match /treatmentPlans/{planId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.psychologistId;
    }

    // Reglas para citas
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.psychologistId;
    }

    // Reglas para chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    // Reglas para mensajes
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }
  }
}
```

### Índices Requeridos

```json
{
  "indexes": [
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "psychologistId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sessionNotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patientId", "order": "ASCENDING" },
        { "fieldPath": "sessionDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "psychologistId", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## 📱 Funcionalidades del Dashboard

### 👥 Gestión de Pacientes

- **Lista de Pacientes**: Vista completa con filtros y búsqueda
- **Perfil Detallado**: Información personal, clínica y de contacto
- **Estadísticas del Paciente**: Métricas de progreso y sesiones
- **Gestión de Estados**: Activo, inactivo, dado de alta

### 📝 Notas de Sesión

- **Registro Completo**: Fecha, duración, tipo de sesión
- **Escalas de Evaluación**: Mood antes/después, progreso
- **Intervenciones**: Registro de técnicas utilizadas
- **Tareas para Casa**: Seguimiento de actividades asignadas
- **Objetivos**: Metas para próximas sesiones

### 🎯 Planes de Tratamiento

- **Creación de Planes**: Objetivos y fases personalizadas
- **Seguimiento de Progreso**: Porcentaje de completado
- **Gestión de Estados**: Activo, pausado, completado
- **Objetivos Medibles**: Con fechas límite y progreso

### 📅 Calendario de Citas

- **Vistas Múltiples**: Día, semana, mes
- **Tipos de Cita**: Consulta, seguimiento, emergencia
- **Ubicaciones**: Presencial, online, teléfono
- **Gestión de Estados**: Programada, confirmada, completada

### 💬 Chat en Tiempo Real

- **Mensajería Instantánea**: Comunicación directa con pacientes
- **Indicadores de Estado**: En línea, escribiendo, leído
- **Historial de Conversaciones**: Búsqueda y filtrado
- **Notificaciones**: Alertas de mensajes nuevos

### 🔔 Centro de Notificaciones

- **Tipos de Notificación**: Citas, mensajes, emergencias
- **Gestión de Estados**: Leído, no leído, archivado
- **Configuración Personalizada**: Preferencias de notificación
- **Notificaciones Push**: Integración con navegador

### 📊 Analytics Avanzados

- **Tendencias de Mood**: Análisis temporal y patrones
- **Patrones Emocionales**: Identificación de desencadenantes
- **Insights de Bienestar**: Recomendaciones personalizadas
- **Reportes Detallados**: Métricas y estadísticas completas

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Netlify

1. Conectar repositorio con Netlify
2. Configurar build settings
3. Desplegar

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - _Desarrollo inicial_ - [tu-github](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Firebase por la infraestructura backend
- React Team por el framework frontend
- Tailwind CSS por el sistema de diseño
- Lucide por los iconos

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, por favor:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles específicos

---

**¡Gracias por usar Mood Log App! 🧠✨**
