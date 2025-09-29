# 🧠 Mood Log App - Versión Robusta pero Simple

Una aplicación completa de seguimiento emocional con dashboard profesional para psicólogos, construida de manera robusta pero fácil de entender.

## ✨ Características Principales

### 👤 Para Usuarios
- **Autenticación Completa**: Login/Registro con email y Google
- **Dashboard Personal**: Vista principal con estadísticas
- **Registro de Estado de Ánimo**: Flujo completo para registrar emociones
- **Estadísticas**: Análisis de tendencias emocionales
- **Chat**: Comunicación directa con psicólogos
- **Configuración**: Perfil y preferencias del usuario

### 👨‍⚕️ Para Psicólogos
- **Dashboard Profesional**: Gestión completa de pacientes
- **Gestión de Pacientes**: CRUD completo con información detallada
- **Notas de Sesión**: Registro de sesiones terapéuticas
- **Planes de Tratamiento**: Creación y seguimiento de planes
- **Chat Profesional**: Comunicación con pacientes
- **Analytics**: Estadísticas de progreso de pacientes

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Estado**: React Context API
- **UI/UX**: Lucide React, Framer Motion
- **Notificaciones**: React Hot Toast
- **PWA**: Service Worker, Manifest
- **Analytics**: Sistema personalizado de tracking

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes organizados
│   ├── auth/            # Autenticación
│   ├── ui/              # Componentes base (Button, Card, Modal)
│   ├── psychologist/    # Componentes específicos para psicólogos
│   ├── NotificationCenter.tsx
│   ├── NotificationToast.tsx
│   ├── ReminderManager.tsx
│   ├── UserProfile.tsx
│   └── WeeklyProgress.tsx
├── pages/               # Páginas principales
│   ├── HomeSimple.tsx
│   ├── LoginSimple.tsx
│   ├── RegisterSimple.tsx
│   ├── CompleteProfile.tsx
│   ├── ForgotPassword.tsx
│   ├── DashboardSimple.tsx
│   ├── DashboardPsychologistSimple.tsx
│   ├── MoodFlowSimple.tsx
│   ├── Statistics.tsx
│   ├── Chat.tsx
│   ├── Settings.tsx
│   ├── PrivacySimple.tsx
│   └── TermsSimple.tsx
├── services/            # Servicios Firebase
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── analytics.ts
│   ├── moodLogService.ts
│   ├── patientService.ts
│   ├── chatService.ts
│   ├── notificationService.ts
│   └── reminderService.ts
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── hooks/              # Hooks personalizados
│   ├── useMood.ts
│   ├── useOnlineStatus.ts
│   ├── useNotifications.ts
│   ├── useReminders.ts
│   └── useValidation.ts
├── types/              # Tipos TypeScript
│   ├── index.ts
│   └── common.ts
└── utils/              # Utilidades
    ├── logger.ts
    └── errorMessages.ts
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el Repositorio
```bash
git clone https://github.com/axyra-app/Mood_Log_App.git
cd Mood_Log_App
git checkout DEV
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication y Firestore
3. Crear archivo `.env.local` con tus credenciales:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 4. Ejecutar la Aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Funcionalidades Completas

### 🔐 Autenticación Robusta
- Registro con email y contraseña
- Login con email y contraseña
- Login con Google
- Completar perfil
- Recuperar contraseña
- Protección de rutas

### 📊 Dashboard de Usuario
- Vista principal con estadísticas
- Acceso a todas las funcionalidades
- Navegación intuitiva
- Modo oscuro/claro

### 👨‍⚕️ Dashboard de Psicólogo
- Lista completa de pacientes
- Información detallada de cada paciente
- Gestión de sesiones
- Planes de tratamiento
- Chat profesional

### 📝 Registro de Estado de Ánimo
- Formulario completo para registrar emociones
- Escala de 1-5 para el estado de ánimo
- Notas detalladas
- Historial de registros

### 📈 Estadísticas y Analytics
- Tendencias emocionales
- Gráficos de progreso
- Análisis temporal
- Reportes detallados

### 💬 Chat en Tiempo Real
- Comunicación directa entre usuarios y psicólogos
- Historial de conversaciones
- Notificaciones en tiempo real

### 🔔 Sistema de Notificaciones
- Notificaciones push
- Recordatorios personalizados
- Alertas importantes

## 🎯 Filosofía: Robusto pero Simple

### ✅ **Robusto:**
- Funcionalidades completas
- Manejo de errores robusto
- Sistema de autenticación seguro
- Base de datos bien estructurada
- PWA funcional
- Analytics implementado

### ✅ **Simple:**
- Código bien organizado
- Estructura clara
- Documentación completa
- Fácil de entender
- Fácil de mantener
- Fácil de colaborar

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Netlify
1. Conectar repositorio con Netlify
2. Configurar build settings
3. Desplegar

## 📞 Soporte

Para preguntas o problemas:
1. Revisar este README
2. Verificar configuración de Firebase
3. Comprobar variables de entorno
4. Revisar logs de la aplicación

---

**Versión Robusta pero Simple - Lista para Producción** 🚀
