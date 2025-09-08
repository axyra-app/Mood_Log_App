# 🚀 Instrucciones de Deployment - Mood Log App

## 📋 **Checklist Pre-Deployment**

### ✅ **Configuración de Firebase**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa el existente
3. Habilita Authentication (Email/Password y Google)
4. Habilita Firestore Database
5. Configura las reglas de Firestore (ya incluidas en `firestore.rules`)

### ✅ **Variables de Entorno en Vercel**
Configura estas variables en el dashboard de Vercel:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# OpenAI Configuration (Opcional)
VITE_OPENAI_API_KEY=tu_openai_api_key
```

## 🚀 **Deployment a Vercel**

### **Opción 1: Deploy Automático desde GitHub**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub
4. Configura las variables de entorno
5. Haz clic en "Deploy"

### **Opción 2: Deploy Manual con Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel --prod
```

## 🔧 **Configuración Post-Deployment**

### **1. Configurar Firebase Hosting (Opcional)**
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login en Firebase
firebase login

# Inicializar hosting
firebase init hosting

# Deploy a Firebase Hosting
firebase deploy
```

### **2. Configurar Dominio Personalizado**
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

## 📊 **Monitoreo y Analytics**

### **Google Analytics (Opcional)**
1. Crea una cuenta en [Google Analytics](https://analytics.google.com/)
2. Crea una nueva propiedad
3. Obtén el Measurement ID
4. Agrega la variable `VITE_GA_MEASUREMENT_ID` en Vercel

### **Sentry para Error Tracking (Opcional)**
1. Crea una cuenta en [Sentry](https://sentry.io/)
2. Crea un nuevo proyecto
3. Obtén el DSN
4. Agrega la variable `VITE_SENTRY_DSN` en Vercel

## 🧪 **Testing Post-Deployment**

### **Funcionalidades a Verificar:**
- [ ] Página de inicio carga correctamente
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Dashboard se carga
- [ ] Registro de estado de ánimo funciona
- [ ] Análisis de IA funciona (si está configurado)
- [ ] PWA se puede instalar
- [ ] Funciona offline

### **Comandos de Testing:**
```bash
# Test local
npm run dev

# Test build
npm run build

# Test preview
npm run preview
```

## 🔒 **Seguridad**

### **Firebase Security Rules**
Las reglas de Firestore ya están configuradas en `firestore.rules`:
- Usuarios solo pueden acceder a sus propios datos
- Psicólogos pueden leer datos de sus pacientes
- Administradores tienen acceso completo

### **Variables de Entorno**
- Nunca commitees las variables de entorno
- Usa Vercel Dashboard para configurar secrets
- Rota las API keys regularmente

## 🆘 **Troubleshooting**

### **Error: Build Failed**
```bash
# Verificar dependencias
npm install

# Verificar variables de entorno
vercel env ls

# Rebuild local
npm run build
```

### **Error: Firebase Connection Failed**
1. Verifica que las variables de entorno estén configuradas
2. Verifica que Firebase esté habilitado
3. Revisa las reglas de Firestore
4. Verifica la consola del navegador

### **Error: PWA Not Working**
1. Verifica que el manifest.json esté correcto
2. Verifica que el service worker esté funcionando
3. Revisa la consola del navegador
4. Verifica que HTTPS esté habilitado

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Revisa la consola del navegador
3. Verifica las variables de entorno
4. Ejecuta tests localmente

---

**¡Tu aplicación está lista para producción! 🎉**

**URL de producción:** `https://tu-proyecto.vercel.app`
