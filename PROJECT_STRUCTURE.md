# 📁 Estructura del Proyecto Mood Log App

## 🎯 **Descripción General**
Aplicación web para registro de estados de ánimo con chat de IA y psicólogos reales.

## 📂 **Estructura de Carpetas**

```
Mood log app/
├── 📁 frontend/                     # Aplicación frontend (React + TypeScript)
│   ├── 📁 src/                      # Código fuente del frontend
│   │   ├── 📁 components/           # Componentes React reutilizables
│   │   │   ├── 📁 auth/             # Componentes de autenticación
│   │   │   │   └── ProtectedRoute.tsx # Rutas protegidas
│   │   │   ├── 📁 psychologist/     # Componentes específicos para psicólogos
│   │   │   │   ├── ChatInterface.tsx # Chat para psicólogos
│   │   │   │   ├── CrisisAlertsPanel.tsx # Panel de alertas de crisis
│   │   │   │   ├── PatientManagement.tsx # Gestión de pacientes
│   │   │   │   ├── PatientStatsPanel.tsx # Estadísticas de pacientes
│   │   │   │   ├── SessionNotes.tsx # Notas de sesión
│   │   │   │   └── TreatmentPlans.tsx # Planes de tratamiento
│   │   │   ├── 📁 ui/               # Componentes de interfaz básicos
│   │   │   │   ├── Alert.tsx        # Alertas
│   │   │   │   ├── Button.tsx       # Botones
│   │   │   │   ├── Card.tsx         # Tarjetas
│   │   │   │   ├── Modal.tsx        # Modales
│   │   │   │   └── StatsCard.tsx    # Tarjetas de estadísticas
│   │   │   ├── AppointmentSection.tsx # Sección de citas
│   │   │   ├── Calendar.tsx         # Calendario
│   │   │   ├── ChatInterface.tsx    # Interfaz de chat general
│   │   │   ├── CrisisAlert.tsx      # Alertas de crisis
│   │   │   ├── ErrorBoundary.tsx    # Manejo de errores
│   │   │   ├── ErrorDisplay.tsx     # Mostrar errores
│   │   │   ├── LoadingSpinner.tsx  # Spinner de carga
│   │   │   ├── LogoutModal.tsx      # Modal de logout
│   │   │   ├── Modal.tsx            # Modal base
│   │   │   ├── NotificationToast.tsx # Notificaciones toast
│   │   │   ├── ProtectedRoutePsychologist.tsx # Rutas protegidas para psicólogos
│   │   │   ├── PsychologistNotifications.tsx # Notificaciones de psicólogos
│   │   │   ├── ReminderManager.tsx  # Gestor de recordatorios
│   │   │   ├── UserProfile.tsx      # Perfil de usuario
│   │   │   └── WeeklyProgress.tsx   # Progreso semanal
│   │   │
│   │   ├── 📁 contexts/             # Contextos de React
│   │   │   └── AuthContext.tsx      # Contexto de autenticación
│   │   │
│   │   ├── 📁 hooks/                # Hooks personalizados
│   │   │   ├── useAppointments.ts   # Hook para citas
│   │   │   ├── useMood.ts          # Hook para estados de ánimo
│   │   │   ├── useNotifications.ts # Hook para notificaciones
│   │   │   ├── useOnlineStatus.ts  # Hook para estado online
│   │   │   ├── usePatients.ts      # Hook para pacientes
│   │   │   ├── usePsychologists.ts # Hook para psicólogos
│   │   │   ├── useReminders.ts     # Hook para recordatorios
│   │   │   └── useValidation.ts    # Hook para validaciones
│   │   │
│   │   ├── 📁 pages/                # Páginas de la aplicación
│   │   │   ├── AIChat.tsx          # Chat con IA
│   │   │   ├── Chat.tsx            # Chat general
│   │   │   ├── ChatSelection.tsx   # Selección de tipo de chat
│   │   │   ├── CompleteProfile.tsx # Completar perfil
│   │   │   ├── DashboardPsychologist.tsx # Dashboard de psicólogos
│   │   │   ├── DashboardSimple.tsx # Dashboard de usuarios
│   │   │   ├── ForgotPassword.tsx  # Recuperar contraseña
│   │   │   ├── LoginSimple.tsx     # Login
│   │   │   ├── MoodFlowSimple.tsx  # Flujo de registro de ánimo
│   │   │   ├── PrivacySimple.tsx  # Política de privacidad
│   │   │   ├── PsychologistSelection.tsx # Selección de psicólogo
│   │   │   ├── RegisterSimple.tsx  # Registro
│   │   │   ├── Settings.tsx        # Configuraciones
│   │   │   ├── Statistics.tsx       # Estadísticas
│   │   │   └── TermsSimple.tsx     # Términos y condiciones
│   │   │
│   │   ├── 📁 services/             # Servicios y lógica de negocio
│   │   │   ├── aiService.ts        # Servicio de IA
│   │   │   ├── analytics.ts        # Analytics
│   │   │   ├── analyticsService.ts # Servicio de analytics
│   │   │   ├── appointmentService.ts # Servicio de citas
│   │   │   ├── chatService.ts      # Servicio de chat
│   │   │   ├── crisisDetection.ts  # Detección de crisis
│   │   │   ├── firebase.ts         # Configuración de Firebase
│   │   │   ├── firestore.ts        # Servicio de Firestore
│   │   │   ├── moodLogService.ts   # Servicio de registros de ánimo
│   │   │   ├── notificationService.ts # Servicio de notificaciones
│   │   │   ├── patientService.ts   # Servicio de pacientes
│   │   │   ├── psychologistService.ts # Servicio de psicólogos
│   │   │   ├── queryOptimization.ts # Optimización de consultas
│   │   │   ├── reminderService.ts  # Servicio de recordatorios
│   │   │   └── userSettingsService.ts # Servicio de configuraciones
│   │   │
│   │   ├── 📁 types/                # Definiciones de tipos TypeScript
│   │   │   ├── common.ts           # Tipos comunes
│   │   │   └── index.ts            # Índice de tipos
│   │   │
│   │   ├── 📁 utils/                # Utilidades y helpers
│   │   │   ├── env.ts              # Variables de entorno
│   │   │   ├── errorHandler.ts     # Manejo de errores
│   │   │   ├── errorMessages.ts    # Mensajes de error
│   │   │   ├── logger.ts           # Logger
│   │   │   └── validation.ts       # Validaciones
│   │   │
│   │   ├── 📁 config/               # Configuraciones
│   │   │   ├── performance.ts      # Configuración de rendimiento
│   │   │   └── production.ts       # Configuración de producción
│   │   │
│   │   ├── App.tsx                 # Componente principal
│   │   ├── main.tsx                # Punto de entrada
│   │   ├── index.css               # Estilos globales
│   │   └── vite-env.d.ts          # Tipos de Vite
│   │
│   ├── 📁 public/                   # Archivos públicos estáticos
│   ├── 📁 node_modules/             # Dependencias del frontend
│   ├── package.json                 # Dependencias y scripts del frontend
│   ├── package-lock.json           # Lock de dependencias del frontend
│   ├── vite.config.ts              # Configuración de Vite
│   ├── tailwind.config.js          # Configuración de Tailwind CSS
│   ├── tsconfig.json               # Configuración de TypeScript
│   ├── postcss.config.js           # Configuración de PostCSS
│   └── index.html                  # HTML principal
│
├── 📁 backend/                      # Backend (Node.js + Prisma)
│   ├── 📁 src/
│   │   ├── 📁 controllers/          # Controladores
│   │   ├── 📁 middleware/          # Middleware
│   │   ├── 📁 routes/              # Rutas
│   │   └── index.ts               # Punto de entrada del backend
│   ├── 📁 prisma/                  # Base de datos
│   │   └── schema.prisma           # Esquema de la base de datos
│   └── 📁 node_modules/             # Dependencias del backend
│
├── 📁 docs/                         # Documentación
│   ├── PSYCHOLOGIST_TROUBLESHOOTING.md # Guía de solución de problemas
│   └── USER_GUIDE.md               # Guía de usuario
│
├── 📁 deployment/                   # Scripts de despliegue
│   ├── build-config.js             # Configuración de build
│   ├── deploy.ps1                  # Script de despliegue PowerShell
│   └── deploy.sh                   # Script de despliegue Bash
│
├── 📁 dist/                         # Archivos compilados (generados automáticamente)
│
├── 📄 Archivos de configuración raíz:
├── package.json                     # Configuración del proyecto completo
├── firebase.json                   # Configuración de Firebase
├── firestore.rules                 # Reglas de Firestore
├── firestore.indexes.json          # Índices de Firestore
├── README.md                       # Documentación principal
├── LICENSE                         # Licencia
└── PROJECT_STRUCTURE.md            # Este archivo
```

## 🎯 **Funcionalidades Principales**

### **Para Usuarios:**
- ✅ Registro e inicio de sesión
- ✅ Registro de estados de ánimo
- ✅ Dashboard con estadísticas
- ✅ Chat con IA (doctores simulados)
- ✅ Chat con psicólogos reales
- ✅ Agendar citas
- ✅ Ver estadísticas y progreso

### **Para Psicólogos:**
- ✅ Dashboard especializado
- ✅ Gestión de pacientes
- ✅ Chat con pacientes
- ✅ Alertas de crisis
- ✅ Notas de sesión
- ✅ Planes de tratamiento
- ✅ Estadísticas de pacientes

## 🔧 **Tecnologías Utilizadas**

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Node.js + Prisma
- **Base de datos:** Firebase Firestore
- **Autenticación:** Firebase Auth
- **Despliegue:** Vercel + Firebase Hosting
- **PWA:** Service Workers

## 📱 **Características PWA**

- ✅ Instalable en dispositivos móviles
- ✅ Funciona offline
- ✅ Notificaciones push
- ✅ Iconos personalizados
- ✅ Splash screen

## 🚀 **Comandos de Desarrollo**

### **Comandos del Proyecto Completo:**
```bash
# Instalar todas las dependencias
npm run install:all

# Desarrollo del frontend
npm run dev

# Build del frontend
npm run build

# Preview del build
npm run preview

# Desarrollo del backend
npm run backend:dev

# Desplegar a Firebase
npm run deploy
```

### **Comandos del Frontend:**
```bash
cd frontend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### **Comandos del Backend:**
```bash
cd backend

# Desarrollo
npm run dev

# Build
npm run build
```

## 📋 **Notas para la Presentación**

1. **Estructura modular:** Frontend y backend separados claramente
2. **Frontend organizado:** Carpeta `frontend/` con todo el código React
3. **Separación clara:** Components, pages, services, hooks bien organizados
4. **Documentación completa:** Cada carpeta tiene un propósito específico
5. **Escalabilidad:** Fácil agregar nuevas funcionalidades
6. **Mantenibilidad:** Código organizado y bien documentado
7. **Monorepo:** Un solo repositorio con múltiples aplicaciones