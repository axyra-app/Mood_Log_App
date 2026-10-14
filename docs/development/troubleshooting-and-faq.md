# ❓ Solución de Problemas y Preguntas Frecuentes (FAQ & Troubleshooting)

---

## 💡 Preguntas Frecuentes de Producto y Negocio

### 1. ¿Por qué se retiró el módulo de psicólogos y citas médicas?
El proyecto nació originalmente como una plataforma universitaria para conectar estudiantes con psicólogos institucionales. Sin embargo, para escalar a una **aplicación de consumo masivo (B2C) estilo Strava**, el modelo de citas y expedientes médicos generaba:
- Alta fricción burocrática y regulatoria (leyes sanitarias, licencias médicas por país, HIPAA/GDPR médico).
- Dependencia de profesionales en línea en lugar de un uso diario autónomo.
- Riesgos de privacidad innecesarios.

El nuevo modelo se enfoca en el **auto-cuidado diario, hábitos consistentes, confidente con IA 24/7 y biomarcadores pasivos**. El código previo está respaldado intacto en la rama `backup-version-universitaria`.

### 2. ¿Pueden otras personas ver lo que escribo en mi diario?
**No.** La arquitectura actual implementa aislamiento estricto por usuario:
- A nivel de base de datos, las reglas de Firestore deniegan cualquier lectura o búsqueda que no pertenezca exactamente al `UID` del usuario que inició sesión.
- En la siguiente fase se implementará además **cifrado en el dispositivo**, de modo que ni los administradores de la base de datos puedan leer los textos del diario.

### 3. ¿La aplicación funciona si no tengo conexión a internet?
Sí, en modo básico. La aplicación es una **Progressive Web App (PWA)**:
- La interfaz y los gráficos se cargan desde la memoria caché del navegador (Service Worker).
- Si no hay conexión, los datos leídos previamente se mantienen en pantalla.

### 4. ¿Cómo se calculan las rachas (Streaks)?
Cada vez que registras tu estado de ánimo en `MoodFlow`, el sistema evalúa la fecha del último registro:
- Si registraste ayer o es tu primer registro del día de hoy, la racha aumenta en +1.
- Si pasaron más de 48 horas sin registrar, la racha se reinicia de forma amigable sin penalizaciones destructivas.

---

## 🛠️ Solución de Problemas Técnicos (Troubleshooting)

### 1. Error: `FirebaseError: Missing or insufficient permissions`
- **Causa:** Las reglas de seguridad de Firestore bloquearon la consulta porque no estás autenticado o intentaste acceder a un documento cuyo `userId` no coincide con tu `auth.uid`.
- **Solución:**
  1. Verifica que la sesión siga activa (`auth.currentUser` no es nulo).
  2. Asegúrate de que las consultas incluyan la cláusula de usuario:
     ```typescript
     query(collection(db, 'moodLogs'), where('userId', '==', user.uid))
     ```
  3. Despliega las reglas actualizadas con `firebase deploy --only firestore:rules`.

### 2. Error 404 al recargar páginas secundarias en Vercel (ej. `/dashboard`, `/journal`)
- **Causa:** Vercel está buscando una carpeta física `/dashboard/index.html` en vez de dirigir el tráfico al enrutador de React.
- **Solución:** Asegúrate de que existe el archivo `frontend/vercel.json` con la regla de reescritura:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 3. Error en TypeScript: `error TS6133: 'xyz' is declared but its value is never read`
- **Causa:** El compilador tiene activadas las opciones estrictas `noUnusedLocals` y `noUnusedParameters`.
- **Solución:**
  - Si es una importación o variable que no necesitas, elimínala.
  - Si es un parámetro obligatorio en un callback, añade un guion bajo al inicio: `(_event) => ...`.

### 4. La PWA no refleja cambios recién desplegados
- **Causa:** El Service Worker de Workbox mantiene en caché la versión anterior para carga instantánea.
- **Solución:**
  - En el navegador, abre DevTools (`F12`), ve a la pestaña **Application > Service Workers** y presiona **Update** o **Unregister**.
  - O realiza una recarga forzada sin caché con `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac).

### 5. Error en Google OAuth: `auth/popup-closed-by-user` o dominio no autorizado
- **Causa:** El dominio actual (ej. `localhost` o tu URL de Vercel `mood-log-app.vercel.app`) no está registrado en la lista de dominios autorizados de Firebase.
- **Solución:**
  1. Ve a **Firebase Console > Authentication > Settings > Authorized domains**.
  2. Agrega tu dominio de Vercel y `localhost`.
