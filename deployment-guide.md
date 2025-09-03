# Guía de Deployment para Vercel

## Variables de Entorno Requeridas

Configura estas variables en el dashboard de Vercel (Settings > Environment Variables):

### Firebase Configuration

```
VITE_FIREBASE_API_KEY=AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ
VITE_FIREBASE_AUTH_DOMAIN=mood-log-app-0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mood-log-app-0
VITE_FIREBASE_STORAGE_BUCKET=mood-log-app-0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=39654401201
VITE_FIREBASE_APP_ID=1:39654401201:web:c0edd8ea835df67a84ae90
VITE_FIREBASE_MEASUREMENT_ID=G-8G4S8BJK98
```

### Opcionales

```
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Pasos para Deployment

1. **Configurar Variables de Entorno en Vercel:**

   - Ve a tu proyecto en Vercel Dashboard
   - Settings > Environment Variables
   - Agrega cada variable con su valor correspondiente
   - Asegúrate de que estén habilitadas para Production, Preview y Development

2. **Redeploy:**

   - Una vez configuradas las variables, haz un nuevo deployment
   - Puedes hacerlo desde el dashboard o haciendo push a tu repositorio

3. **Verificar:**
   - Abre las herramientas de desarrollador en tu navegador
   - Ve a la consola para verificar que no hay errores de Firebase
   - La aplicación debería cargar correctamente

## Troubleshooting

Si la página sigue en blanco:

1. **Verifica las variables de entorno** en Vercel Dashboard
2. **Revisa la consola del navegador** para errores
3. **Verifica que Firebase esté configurado correctamente** en tu proyecto de Firebase
4. **Asegúrate de que las reglas de Firestore permitan acceso** para usuarios autenticados
