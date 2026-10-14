# 🌐 Guía Interna de Despliegue en Producción (Vercel & Firebase)

> **USO INTERNO DEL EQUIPO FUNDADOR**  
> El pipeline de despliegue continuo (CI/CD) está vinculado de forma directa entre el repositorio privado de GitHub, el proyecto en Vercel y el backend en Firebase (`mood-log-app-01`).

---

## 1. Despliegue en Vercel

La configuración del frontend está en `frontend/vercel.json`. El workflow de GitHub Actions llamado deploy compila el proyecto, pero su paso final indica que Vercel gestiona el despliegue; ese workflow por sí solo **no demuestra** qué integración de GitHub está configurada ni qué ramas despliegan producción. Confirma en el panel de Vercel la conexión al repositorio, la rama de producción, previews y los permisos de despliegue antes de depender del despliegue automático.

### 1.1 Configuración Activa en Vercel

| Parámetro | Valor Configurado |
|---|---|
| **Proyecto Vercel** | `moodlogapp` (o el nombre asignado en su cuenta de equipo) |
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Enrutamiento SPA** | Gestionado por `frontend/vercel.json` (reescritura hacia `index.html`) |

### 1.2 Variables de entorno y claves

No configures claves privadas de proveedores de IA como variables `VITE_*` esperando que se mantengan secretas. Vite incorpora esas variables en el bundle del navegador; quien pueda cargar el sitio puede inspeccionarlas. Guardar una clave `VITE_*` en el panel de Vercel no cambia esta propiedad.

Las claves privadas de servidor deben vivir solo en un backend o función server-side y estar disponibles allí con variables sin prefijo `VITE_`. En el estado del frontend inspeccionado, `VITE_GROQ_API_KEY` se consume directamente desde código cliente; antes de producción debe migrarse a un backend/proxy protegido o deshabilitarse. La inicialización Firebase actual está escrita en `frontend/src/services/firebase.ts`; agregar variables Firebase al panel no cambia la configuración hasta que el código las consuma.

El uso del panel **Vercel Dashboard > Project Settings > Environment Variables** debe limitarse a variables realmente necesarias y configurar por entorno (`Development`, `Preview`, `Production`) según el propósito. No documentar un valor como secreto si termina en el navegador.

### 1.3 Restringir el acceso al sitio

El repositorio privado no vuelve privado automáticamente el dominio, las URLs de preview ni los recursos Firebase. Si el producto no debe estar disponible al público, configura controles de acceso a deployments en Vercel para los planes/entornos disponibles, restringe miembros del equipo y revisa previews. Además, exige autenticación en la aplicación y valida permisos con reglas Firebase. Comprueba el resultado desde una sesión de navegador no autenticada y desde una cuenta que no pertenezca al equipo. La configuración y disponibilidad exactas de Deployment Protection deben confirmarse en el panel de la cuenta.

---

## 2. Despliegue de Reglas de Seguridad en Firebase

Las reglas de seguridad de Firestore (`firestore.rules`) y Cloud Storage (`storage.rules`) residen en la raíz del repositorio. Para sincronizar cualquier cambio con la consola oficial de Firebase:

1. Inicia sesión con la cuenta de Google vinculada al proyecto:
   ```bash
   firebase login
   ```

2. Selecciona el proyecto del equipo:
   ```bash
   firebase use mood-log-app-01
   ```

3. Despliega las reglas de Firestore y Storage en la nube:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

Antes de desplegar, valida reglas y operaciones en Firebase Emulator Suite o en un proyecto de desarrollo separado. El repositorio apunta actualmente a un proyecto compartido mediante `.firebaserc` y la configuración cliente de Firebase; no ejecutes pruebas destructivas ni uses datos personales reales desde el entorno local sin confirmar qué backend se está utilizando. Verifica que el proyecto seleccionado sea el esperado con `firebase use` y contrasta reglas activas en Firebase Console.

4. Despliega índices compuestos si se agregaron nuevas consultas complejas:
   ```bash
   firebase deploy --only firestore:indexes
   ```

---

## 3. Comportamiento PWA y Actualización Automática

- Al completarse un nuevo despliegue en Vercel, el plugin `vite-plugin-pwa` genera automáticamente nuevos hashes para los bundles (`dist/assets/`).
- Los navegadores y dispositivos móviles de los usuarios que tengan la PWA instalada detectan la nueva versión a través del Service Worker y aplican la actualización en segundo plano sin interrumpir la experiencia.
