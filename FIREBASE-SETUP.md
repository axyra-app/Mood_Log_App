# 🔥 Configuración de Firebase para Mood Log App

## ⚠️ **PROBLEMA ACTUAL**
Los errores que estás viendo indican que Firebase no puede conectarse correctamente. Esto se debe a que:

1. **Variables de entorno no configuradas** o incorrectas
2. **Reglas de Firestore** muy restrictivas
3. **Configuración de Firebase** incompleta

## 🛠️ **SOLUCIÓN PASO A PASO**

### 1. **Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto con:

```bash
# Firebase Configuration - REEMPLAZA CON TUS VALORES REALES
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# OpenAI Configuration
VITE_OPENAI_API_KEY=tu_openai_api_key
```

### 2. **Obtener Configuración de Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mood-log-app-0`
3. Ve a **Configuración del proyecto** (⚙️)
4. En la sección **Tus aplicaciones**, selecciona tu app web
5. Copia la configuración que aparece

### 3. **Configurar Autenticación**

En Firebase Console:
1. Ve a **Authentication** → **Sign-in method**
2. Habilita **Email/Password**
3. Habilita **Google** (opcional)

### 4. **Configurar Firestore**

En Firebase Console:
1. Ve a **Firestore Database**
2. Crea la base de datos en modo **producción**
3. Selecciona una ubicación (recomendado: `us-central1`)

### 5. **Actualizar Reglas de Firestore**

Reemplaza tus reglas actuales con estas más permisivas para desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas temporales para desarrollo - PERMISIVAS
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas son para desarrollo. En producción, usa reglas más restrictivas.

### 6. **Verificar Configuración**

Después de configurar todo:

1. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Verifica en la consola del navegador** que no hay errores de Firebase

3. **Prueba el login** con un usuario de prueba

## 🔧 **TROUBLESHOOTING**

### Error: "Cannot determine language"
- **Causa**: Variables de entorno no configuradas
- **Solución**: Verifica que el archivo `.env` existe y tiene los valores correctos

### Error: "Firestore connection failed"
- **Causa**: Reglas de Firestore muy restrictivas
- **Solución**: Usa las reglas temporales de arriba

### Error: "Project not found"
- **Causa**: Project ID incorrecto
- **Solución**: Verifica el `VITE_FIREBASE_PROJECT_ID` en tu `.env`

## 📋 **CHECKLIST DE CONFIGURACIÓN**

- [ ] Archivo `.env` creado con variables correctas
- [ ] Firebase project configurado
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore Database creado
- [ ] Reglas de Firestore actualizadas
- [ ] Servidor reiniciado
- [ ] Login funcionando

## 🚀 **DESPUÉS DE CONFIGURAR**

Una vez que todo funcione:

1. **Crea usuarios de prueba** en Authentication
2. **Prueba el registro** de mood logs
3. **Verifica** que los datos se guardan en Firestore
4. **Configura reglas más restrictivas** para producción

## 📞 **SI SIGUES TENIENDO PROBLEMAS**

1. Verifica que todas las variables de entorno estén correctas
2. Asegúrate de que el proyecto de Firebase esté activo
3. Revisa la consola del navegador para errores específicos
4. Prueba con las reglas de Firestore más permisivas

¡Con esta configuración, Firebase debería funcionar perfectamente! 🎉
