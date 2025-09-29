# 🧠 Mood Log App - Versión Simplificada

Una aplicación simple de seguimiento emocional con dashboard para psicólogos.

## ✨ Características Principales

### 👤 Para Usuarios

- **Registro y Login**: Con email o Google
- **Dashboard Simple**: Vista principal del usuario
- **Registro de Estado de Ánimo**: Flujo simple para registrar emociones

### 👨‍⚕️ Para Psicólogos

- **Dashboard de Psicólogo**: Gestión básica de pacientes
- **Gestión de Pacientes**: Lista simple de pacientes asignados
- **Chat Básico**: Comunicación con pacientes

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Estado**: React Context API
- **UI**: Lucide React (iconos)

## 📁 Estructura Simplificada

```
src/
├── components/           # Componentes básicos
│   ├── ui/              # Button, Card, Modal
│   ├── auth/            # ProtectedRoute
│   └── psychologist/    # PatientManagement, ChatInterface
├── pages/               # Páginas principales
│   ├── HomeSimple.tsx
│   ├── LoginSimple.tsx
│   ├── RegisterSimple.tsx
│   ├── DashboardSimple.tsx
│   ├── DashboardPsychologistSimple.tsx
│   └── MoodFlowSimple.tsx
├── services/            # Servicios Firebase
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── moodLogService.ts
│   ├── patientService.ts
│   └── chatService.ts
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── hooks/              # Hooks personalizados
│   ├── useMood.ts
│   ├── useOnlineStatus.ts
└── types/              # Tipos TypeScript
    └── index.ts
```

## 🛠️ Instalación

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

## 📱 Funcionalidades

### 🔐 Autenticación

- Registro con email y contraseña
- Login con email y contraseña
- Login con Google
- Protección de rutas

### 📊 Dashboard de Usuario

- Vista principal del usuario
- Acceso a registro de estado de ánimo
- Información básica del usuario

### 👨‍⚕️ Dashboard de Psicólogo

- Lista de pacientes asignados
- Información básica de cada paciente
- Chat con pacientes

### 📝 Registro de Estado de Ánimo

- Formulario simple para registrar emociones
- Escala de 1-5 para el estado de ánimo
- Notas opcionales

## 🎯 Objetivos de Simplificación

### ✅ Eliminado

- Analytics complejos
- Notificaciones push
- PWA features
- AI/ML features
- Offline functionality
- Performance monitoring
- Testing framework
- Linting complejo

### ✅ Mantenido

- Autenticación básica
- CRUD de usuarios
- Dashboard simple
- Chat básico
- Registro de estado de ánimo

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

## 📞 Soporte

Para preguntas o problemas:

1. Revisar este README
2. Verificar configuración de Firebase
3. Comprobar variables de entorno

---

**Versión Simplificada - Fácil de Entender** 🚀
