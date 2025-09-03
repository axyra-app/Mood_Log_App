# 🚀 Guía de Deployment - Mood Log App

## 📋 **Checklist Pre-Deployment**

### ✅ **Seguridad**

- [x] Variables de entorno configuradas
- [x] Rate limiting implementado
- [x] Validación del lado cliente
- [x] Headers de seguridad configurados
- [x] CSP (Content Security Policy) configurado

### ✅ **Testing**

- [x] Tests unitarios básicos
- [x] Tests de componentes críticos
- [x] Tests de integración básicos
- [x] Linting configurado

### ✅ **Monitoreo**

- [x] Sentry configurado para error tracking
- [x] Google Analytics configurado
- [x] Logging estructurado

### ✅ **CI/CD**

- [x] GitHub Actions configurado
- [x] Tests automáticos en CI
- [x] Build automático
- [x] Deploy automático a Vercel

---

## 🔧 **Configuración de Variables de Entorno**

### **En Vercel Dashboard:**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# OpenAI Configuration
VITE_OPENAI_API_KEY=tu_openai_api_key

# Sentry Configuration
VITE_SENTRY_DSN=tu_sentry_dsn

# Google Analytics
VITE_GA_MEASUREMENT_ID=tu_ga_measurement_id
```

### **En GitHub Secrets:**

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Agrega las mismas variables como secrets

---

## 🚀 **Proceso de Deployment**

### **Deployment Automático (Recomendado):**

1. **Push a main branch:**

   ```bash
   git add .
   git commit -m "feat: add production-ready features"
   git push origin main
   ```

2. **GitHub Actions ejecutará automáticamente:**
   - ✅ Instalación de dependencias
   - ✅ Linting
   - ✅ Tests
   - ✅ Build
   - ✅ Deploy a Vercel

### **Deployment Manual:**

1. **Instalar Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## 🔍 **Verificación Post-Deployment**

### **1. Funcionalidades Básicas:**

- [ ] Login/Registro funciona
- [ ] Dashboard carga correctamente
- [ ] Registro de estado de ánimo funciona
- [ ] Chat funciona
- [ ] Configuraciones se guardan

### **2. Seguridad:**

- [ ] Rate limiting funciona
- [ ] Headers de seguridad presentes
- [ ] CSP no bloquea funcionalidades

### **3. Monitoreo:**

- [ ] Sentry recibe errores
- [ ] Google Analytics tracking funciona
- [ ] Performance es aceptable

### **4. PWA:**

- [ ] App se puede instalar
- [ ] Funciona offline
- [ ] Manifest correcto

---

## 🛠️ **Troubleshooting**

### **Error: Build Failed**

```bash
# Verificar variables de entorno
vercel env ls

# Rebuild local
npm run build
```

### **Error: Tests Failed**

```bash
# Ejecutar tests localmente
npm run test:run

# Verificar linting
npm run lint
```

### **Error: Sentry Not Working**

- Verificar que `VITE_SENTRY_DSN` esté configurado
- Verificar que el DSN sea válido
- Revisar consola del navegador

### **Error: Analytics Not Working**

- Verificar que `VITE_GA_MEASUREMENT_ID` esté configurado
- Verificar que el ID sea válido
- Revisar Network tab en DevTools

---

## 📊 **Monitoreo en Producción**

### **Sentry Dashboard:**

- Ve a [Sentry Dashboard](https://sentry.io)
- Revisa errores en tiempo real
- Configura alertas por email/Slack

### **Google Analytics:**

- Ve a [Google Analytics](https://analytics.google.com)
- Revisa métricas de usuarios
- Configura goals y conversiones

### **Vercel Analytics:**

- Ve a tu proyecto en Vercel
- Revisa métricas de performance
- Monitorea Core Web Vitals

---

## 🔄 **Actualizaciones Futuras**

### **Para actualizar la app:**

1. **Desarrollo:**

   ```bash
   git checkout -b feature/nueva-funcionalidad
   # Hacer cambios
   git commit -m "feat: nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

2. **Pull Request:**

   - Crear PR en GitHub
   - GitHub Actions ejecutará tests
   - Revisar y aprobar PR

3. **Deploy:**
   - Merge a main
   - Deploy automático a producción

---

## 📞 **Soporte**

Si tienes problemas con el deployment:

1. **Revisar logs en Vercel Dashboard**
2. **Revisar errores en Sentry**
3. **Verificar variables de entorno**
4. **Ejecutar tests localmente**

---

**¡Tu aplicación está lista para producción! 🎉**
