# Mood Log App - Despliegue en Vercel

## 🚀 Configuración para Vercel

Esta aplicación está optimizada para desplegarse en Vercel con las siguientes características:

### ✅ Configuraciones Incluidas

1. **vercel.json** - Configuración optimizada para SPA
2. **vite.config.ts** - Build optimizado para producción
3. **PWA Support** - Aplicación web progresiva
4. **Chunk Splitting** - Carga optimizada de recursos
5. **Security Headers** - Headers de seguridad configurados

### 🔧 Variables de Entorno Requeridas

Configura las siguientes variables en tu dashboard de Vercel:

```bash
# Firebase (Obligatorio)
VITE_FIREBASE_API_KEY=tu_api_key_de_firebase
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# OpenAI (Obligatorio para IA)
VITE_OPENAI_API_KEY=tu_api_key_de_openai

# App (Opcional)
VITE_APP_NAME=Mood Log App
VITE_APP_ENVIRONMENT=production
```

### 📦 Comandos de Build

```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### 🌐 Características de Vercel

- **SPA Routing**: Todas las rutas redirigen a index.html
- **Asset Caching**: Assets estáticos con cache de 1 año
- **Security Headers**: Headers de seguridad configurados
- **Edge Functions**: Soporte para funciones serverless
- **Automatic HTTPS**: SSL automático
- **Global CDN**: Distribución global de contenido

### 🔄 Despliegue Automático

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente que es un proyecto Vite
4. El despliegue se realizará automáticamente en cada push

### 📊 Optimizaciones Incluidas

- **Code Splitting**: Chunks separados por funcionalidad
- **Tree Shaking**: Eliminación de código no utilizado
- **Minificación**: Código minificado con Terser
- **Asset Optimization**: Optimización automática de assets
- **PWA**: Service Worker para funcionalidad offline

### 🛠️ Troubleshooting

Si encuentras problemas:

1. **Build Fails**: Verifica que todas las variables de entorno estén configuradas
2. **Routing Issues**: El vercel.json ya está configurado para SPA routing
3. **Performance**: Los chunks están optimizados para carga rápida
4. **PWA Issues**: Verifica que los iconos PWA estén en la carpeta public

### 📱 PWA Features

- Instalable en dispositivos móviles
- Funciona offline (con service worker)
- Notificaciones push (configurable)
- Iconos adaptativos

### 🔒 Security

- Headers de seguridad configurados
- XSS Protection habilitado
- Content Type Options configurado
- Frame Options configurado

¡Tu aplicación está lista para Vercel! 🎉
