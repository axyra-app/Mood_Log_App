# 🔧 Troubleshooting - Registro de Psicólogos

## 🚨 **Problema Identificado:**

Los psicólogos se quedan cargando después del registro y no pueden acceder al dashboard de psicólogos.

## 🔍 **Diagnóstico:**

### **1. Verificar en la Consola del Navegador:**

Abre las herramientas de desarrollador (F12) y busca estos mensajes:

```javascript
// Mensajes esperados:
'Creando perfil de psicólogo...';
'Perfil de psicólogo creado exitosamente';
'ProtectedRoutePsychologist Debug: Loading: false, User: true, Role: psychologist, Timeout: false';
```

### **2. Verificar en Firebase Console:**

1. Ve a Firebase Console > Firestore Database
2. Busca la colección `users` - debe tener el documento del psicólogo
3. Busca la colección `psychologists` - debe tener el documento del psicólogo

### **3. Verificar Variables de Entorno:**

Asegúrate de que estas variables estén configuradas en Vercel:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

## 🛠️ **Soluciones Implementadas:**

### **1. Mejorado AuthContext:**

- ✅ Agregado logging para debug
- ✅ Mejorado manejo de errores en creación de psicólogos
- ✅ Agregados campos profesionales al estado del usuario

### **2. Mejorado ProtectedRoutePsychologist:**

- ✅ Aumentado timeout a 10 segundos
- ✅ Agregado debug info en pantalla
- ✅ Mejorado logging en consola

### **3. Agregado DebugInfo Component:**

- ✅ Muestra información de debug en tiempo real
- ✅ Solo visible en desarrollo
- ✅ Información del usuario y estado de carga

## 🧪 **Pasos para Probar:**

### **1. Registro de Psicólogo:**

1. Ve a `/register`
2. Selecciona "Psicólogo" como rol
3. Completa todos los campos requeridos
4. Haz clic en "REGISTRARSE"
5. **IMPORTANTE**: Revisa la consola del navegador para mensajes de debug

### **2. Verificar Redirección:**

1. Después del registro exitoso, deberías ser redirigido a `/dashboard-psychologist`
2. Si se queda cargando, revisa el debug info en la esquina inferior derecha
3. Revisa los logs en la consola

### **3. Verificar en Firebase:**

1. Ve a Firebase Console
2. Verifica que existan los documentos en ambas colecciones
3. Verifica que el rol sea "psychologist"

## 🚨 **Errores Comunes y Soluciones:**

### **Error: "User is not psychologist"**

**Causa**: El rol no se está guardando correctamente en Firestore
**Solución**:

1. Verifica las reglas de Firestore
2. Verifica que las variables de entorno estén correctas
3. Revisa los logs de Firebase

### **Error: "Loading infinito"**

**Causa**: El estado de loading no se está actualizando
**Solución**:

1. Espera 10 segundos (timeout)
2. Revisa la consola para mensajes de error
3. Verifica la conexión a Firebase

### **Error: "No user"**

**Causa**: El usuario no se está autenticando correctamente
**Solución**:

1. Verifica que el registro se complete exitosamente
2. Revisa los logs de autenticación
3. Verifica las variables de entorno

## 📊 **Debug Info en Pantalla:**

El componente DebugInfo muestra:

- **Loading**: Estado de carga
- **User**: Si existe el usuario
- **Role**: Rol del usuario
- **Email**: Email del usuario
- **UID**: ID único del usuario
- **Professional Title**: Título profesional
- **Specialization**: Especialización

## 🔄 **Flujo Correcto:**

1. **Usuario se registra como psicólogo**
2. **Se crea documento en colección `users`** con rol "psychologist"
3. **Se crea documento en colección `psychologists`** con datos profesionales
4. **AuthContext actualiza el estado** con todos los datos
5. **ProtectedRoutePsychologist verifica** el rol
6. **Redirección exitosa** al dashboard de psicólogos

## 📞 **Si el problema persiste:**

1. **Revisa la consola** para mensajes de error específicos
2. **Verifica Firebase Console** para ver si se crean los documentos
3. **Revisa las reglas de Firestore** para permisos
4. **Verifica las variables de entorno** en Vercel
5. **Contacta soporte** con los logs específicos

## 🎯 **Próximos Pasos:**

1. **Probar el registro** de un psicólogo
2. **Revisar los logs** en la consola
3. **Verificar Firebase** para confirmar que se crean los documentos
4. **Confirmar redirección** al dashboard correcto
