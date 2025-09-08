# 🚀 Configuración de Variables de Entorno en Vercel

## ⚠️ **PROBLEMA IDENTIFICADO**
El deployment falló porque faltan las variables de entorno de Firebase en Vercel.

## 🔧 **SOLUCIÓN PASO A PASO**

### **1. Ve a tu proyecto en Vercel Dashboard**
- URL: https://vercel.com/dashboard
- Busca tu proyecto "Mood_Log_App"

### **2. Configura las Variables de Entorno**
Ve a **Settings** → **Environment Variables** y agrega estas variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ
VITE_FIREBASE_AUTH_DOMAIN=mood-log-app-0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mood-log-app-0
VITE_FIREBASE_STORAGE_BUCKET=mood-log-app-0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=39654401201
VITE_FIREBASE_APP_ID=1:39654401201:web:c0edd8ea835df67a84ae90
VITE_FIREBASE_MEASUREMENT_ID=G-8G4S8BJK98

# OpenAI Configuration (Opcional)
VITE_OPENAI_API_KEY=tu_openai_api_key_aqui
```

### **3. Configuración de Firebase**

#### **A. Ve a Firebase Console**
- URL: https://console.firebase.google.com/
- Proyecto: `mood-log-app-0`

#### **B. Habilita Authentication**
1. Ve a **Authentication** → **Sign-in method**
2. Habilita **Email/Password**
3. Habilita **Google** (opcional)

#### **C. Configura Firestore**
1. Ve a **Firestore Database**
2. Crea una base de datos en modo **production**
3. Las reglas ya están configuradas en `firestore.rules`

### **4. Redeploy**
Después de configurar las variables:
1. Ve a **Deployments** en Vercel
2. Haz clic en **Redeploy** en el último deployment
3. O haz un nuevo commit para trigger automático

## 🎯 **RESULTADO ESPERADO**
- ✅ Deployment exitoso
- ✅ Aplicación funcionando en https://mood-log-app-navy.vercel.app
- ✅ Firebase conectado
- ✅ Autenticación funcionando
- ✅ Base de datos funcionando

## 🆘 **Si sigues teniendo problemas:**

### **Verifica que las variables estén configuradas:**
```bash
# En Vercel Dashboard → Settings → Environment Variables
# Debe mostrar todas las variables VITE_FIREBASE_*
```

### **Verifica Firebase:**
```bash
# En Firebase Console
# Authentication debe estar habilitado
# Firestore debe tener una base de datos creada
```

### **Logs de error:**
- Ve a **Functions** → **Logs** en Vercel
- Revisa los logs del deployment

---

**¡Una vez configurado, tu aplicación estará 100% funcional! 🎉**
