# Mood Log App

Una aplicación moderna de seguimiento del estado de ánimo construida con React, TypeScript y Firebase.

## 📁 Estructura del Proyecto

```
mood-log-app/
├── 📁 frontend/           # Código fuente de la aplicación
│   ├── src/              # Componentes, páginas, hooks, servicios
│   ├── public/           # Archivos estáticos
│   └── index.html        # Punto de entrada HTML
├── 📁 backend/           # Configuración de Firebase
│   ├── firebase.json     # Configuración de Firebase
│   ├── firestore.rules   # Reglas de seguridad de Firestore
│   └── firestore.indexes.json # Índices de Firestore
├── 📁 config/            # Archivos de configuración
│   ├── package.json      # Dependencias del proyecto
│   ├── vite.config.ts    # Configuración de Vite
│   ├── tsconfig.json     # Configuración de TypeScript
│   ├── tailwind.config.js # Configuración de Tailwind CSS
│   └── vitest.config.ts  # Configuración de testing
├── 📁 deployment/        # Scripts de deployment
│   ├── deploy.ps1        # Script de deployment para Windows
│   ├── deploy.sh         # Script de deployment para Linux/Mac
│   └── vercel.json       # Configuración de Vercel
├── 📁 docs/              # Documentación
│   ├── README.md         # Documentación principal
│   ├── DEPLOYMENT.md     # Guía de deployment
│   └── USER_GUIDE.md     # Guía de usuario
├── 📁 testing/           # Archivos de testing
│   ├── test-firebase.js  # Tests de Firebase
│   └── test-firestore.js # Tests de Firestore
└── 📁 scripts/           # Scripts utilitarios
```

## 🚀 Tecnologías Utilizadas

### Frontend

- **React 18.2.0** - Framework principal
- **TypeScript 5.2.2** - Tipado estático
- **Vite 4.5.0** - Herramienta de build
- **Tailwind CSS 3.3.5** - Framework de CSS
- **React Router DOM 6.20.1** - Enrutamiento
- **Zustand 4.4.7** - Gestión de estado

### Backend

- **Firebase 10.7.1** - Plataforma completa
  - Firebase Auth - Autenticación
  - Firestore - Base de datos NoSQL
  - Firebase Hosting - Hosting estático

### Testing

- **Vitest 3.2.4** - Framework de testing
- **Testing Library React** - Utilidades para testing

### Herramientas

- **ESLint** - Linter de código
- **Sentry** - Monitoreo de errores
- **PWA** - Aplicación web progresiva

## 🛠️ Comandos Disponibles

```bash
# Instalar dependencias
npm run install-deps

# Desarrollo
npm run dev

# Build para producción
npm run build

# Testing
npm run test
npm run test:ui
npm run test:coverage

# Deployment
npm run firebase:deploy
npm run firebase:serve

# Vercel Deployment
npm run vercel:deploy
npm run vercel:dev
```

## 📖 Documentación

- [Guía de Deployment](docs/DEPLOYMENT.md)
- [Guía de Usuario](docs/USER_GUIDE.md)

## 🔧 Configuración

### **1. Configurar Firebase:**

```bash
# Usar script automatizado (Recomendado)
.\setup-firebase.ps1    # Windows
./setup-firebase.sh     # Linux/Mac
```

### **2. Configurar Variables de Entorno:**

1. Copia `config/env.example` a `config/.env`
2. Configura las variables de entorno de Firebase
3. Ejecuta `npm run install-deps`
4. Ejecuta `npm run dev` para desarrollo

## 📱 Características

- ✅ Seguimiento del estado de ánimo
- ✅ Diario personal
- ✅ Análisis con IA
- ✅ Chat con psicólogos
- ✅ Logros y estadísticas
- ✅ Modo offline
- ✅ PWA (instalable)
- ✅ Notificaciones push
- ✅ Tema oscuro/claro
