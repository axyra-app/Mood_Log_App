# Mood Log App - Aplicación de Seguimiento del Estado de Ánimo

Una aplicación web progresiva (PWA) profesional para el seguimiento del estado de ánimo con inteligencia artificial, que conecta usuarios con psicólogos y estudiantes de psicología.

## 🚀 Características

### Para Usuarios

- **PWA Instalable**: Instala la app en tu dispositivo para acceso rápido y offline
- **Flujo de Diario Inteligente**: Escribe sobre tu día y deja que la IA analice tus emociones
- **Selección Manual de Estado de Ánimo**: Opción para seleccionar explícitamente cómo te sientes
- **IA para Clasificación**: Análisis automático de emociones con inteligencia artificial
- **Preguntas de Motivación**: Sistema de preguntas cuando la IA no puede determinar tu estado
- **Historial Completo**: Ve todas tus entradas anteriores con análisis detallados
- **Guardado Automático**: Tus borradores se guardan automáticamente
- **Compartir Logros**: Comparte tus logros en redes sociales
- **Seguimiento de Patrones**: Identifica tendencias y patrones en tu estado de ánimo
- **Chat con Psicólogos**: Comunicación directa con profesionales de la salud mental
- **Metas Personalizadas**: Establece y sigue objetivos de bienestar
- **Reportes Detallados**: Análisis completo de tu progreso

### Para Psicólogos

- **Gestión de Pacientes**: Administra y monitorea a tus pacientes
- **Monitoreo en Tiempo Real**: Seguimiento continuo del progreso
- **Comunicación Directa**: Chat integrado para comunicación inmediata
- **Análisis Avanzados**: Herramientas profesionales de análisis
- **Programación de Sesiones**: Organiza sesiones de terapia eficientemente

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estado**: Zustand para gestión de estado
- **Routing**: React Router DOM
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **UI**: Tailwind CSS
- **Iconos**: Lucide React
- **PWA**: Vite PWA Plugin

## 🎨 Diseño

- **Colores**: Paleta profesional con azules, morados y blancos
- **Tema**: Modo claro y oscuro con transiciones suaves
- **Responsive**: Diseño adaptativo para móvil, tablet y desktop
- **Accesibilidad**: Componentes accesibles con Radix UI

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### Configuración

1. **Clona el repositorio**

```bash
git clone <repository-url>
cd mood-log-app
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Configura Firebase**

   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication y Firestore
   - Copia las credenciales de configuración

4. **Configura las variables de entorno**

```bash
cp env.example .env
```

Edita el archivo `.env` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

5. **Ejecuta el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📱 PWA

La aplicación es una PWA completa que se puede instalar en dispositivos móviles y de escritorio:

- **Instalación**: Los usuarios pueden instalar la app desde el navegador
- **Offline**: Funciona sin conexión a internet
- **Notificaciones**: Sistema de notificaciones push (próximamente)

## 🚀 Despliegue en Vercel

### Despliegue Automático

1. **Conecta tu repositorio a Vercel**

   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Importa tu proyecto desde GitHub

2. **Configura las variables de entorno**

   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Agrega todas las variables de Firebase del archivo `env.example`

3. **Despliega**
   - Vercel detectará automáticamente que es un proyecto Vite
   - El despliegue se realizará automáticamente

### Despliegue Manual

```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega
vercel

# Para producción
vercel --prod
```

### Script de Despliegue

Usa el script incluido para un despliegue completo:

```bash
# Windows (PowerShell)
.\deploy.ps1

# Linux/Mac
./deploy.sh
```

Este script:

- Instala dependencias
- Ejecuta tests
- Construye el proyecto
- Despliega a Vercel

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la construcción
- `npm run lint` - Linter de código

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── contexts/           # Contextos de React (Auth, Theme)
├── lib/               # Configuración de Firebase
├── pages/             # Páginas principales
├── services/          # Servicios (IA, API)
└── main.tsx          # Punto de entrada
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🎯 Roadmap

- [ ] Notificaciones push
- [ ] Integración con calendarios
- [ ] Reportes avanzados
- [ ] Modo offline completo
- [ ] Integración con wearables
- [ ] Análisis de patrones avanzados
- [ ] Sistema de recordatorios
- [ ] Exportación de datos

---

**Mood Log App** - Tu compañero personal para el bienestar mental 💙
