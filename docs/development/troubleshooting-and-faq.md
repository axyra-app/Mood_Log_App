# Solución de problemas y preguntas frecuentes

## Desarrollo local

### `npm run dev`: no encuentra `vite`

Instala primero las dependencias en el directorio que contiene `package.json`:

```sh
cd frontend
npm ci
npm run dev
```

### `npm run typecheck` o `npm run build`: no encuentra `tsc`/`vite`

Comprueba que estás en `frontend/` y que `npm ci` terminó correctamente. No instales dependencias globales como sustituto de las versiones fijadas en el lockfile.

### Build correcto, pero problemas de tipos

Vite transpila TypeScript, pero el build no sustituye el chequeo completo de tipos. Ejecuta:

```sh
npm run typecheck
```

Corrige los errores que reporte y vuelve a ejecutar tanto typecheck como build. El CI actual ejecuta build, no typecheck.

## Firebase

### `FirebaseError: Missing or insufficient permissions`

La escritura/consulta no coincide con las reglas locales o remotas, el usuario no está autenticado o el documento no pertenece al UID actual. Verifica:

1. `auth.currentUser` y el UID usado en la operación.
2. La colección exacta: el servicio `chatService` usa `chats`/`messages`, que las reglas locales no autorizan; el hook `useChat` usa `chatSessions`/`chatMessages`.
3. Que los documentos consultados tengan el campo de propietario requerido por la regla.
4. Que las reglas estén desplegadas en el proyecto esperado; el archivo local no confirma las reglas remotas.

No relajes reglas para silenciar el error. Reproduce primero en Emulator Suite o en un proyecto de desarrollo.

### Lectura de plantillas funciona, pero inicializarlas falla

Las reglas locales permiten lectura autenticada de `journalTemplates` y `journalPrompts`, pero no escritura. El servicio que intenta insertar datos predeterminados desde el cliente necesita una inicialización autorizada/protegida o datos cargados por un proceso confiable.

### Consulta Firestore requiere un índice

Comprueba los filtros y ordenamiento de la consulta, y usa el enlace generado por Firebase para identificar los campos del índice. Añade el índice a `firestore.indexes.json`, prueba en desarrollo y despliega índices solo al proyecto confirmado.

### No sé a qué Firebase se conecta el entorno local

La configuración del cliente se encuentra escrita en `frontend/src/services/firebase.ts`; las variables `VITE_FIREBASE_*` listadas en otro helper no reemplazan automáticamente esa configuración. Confirma el destino antes de crear o modificar datos. No uses datos personales para comprobar la conexión.

## Hosting y PWA

### Recargar una ruta interna devuelve 404

Comprueba que el proveedor sirve la SPA con la reescritura hacia `/index.html`. Vercel tiene esa reescritura en `frontend/vercel.json`; confirma también el directorio raíz y el output configurados en el proyecto de hosting.

### Se muestra una versión anterior

La PWA configura un service worker con actualización automática. Prueba recarga forzada; si persiste, inspecciona el service worker y cachés desde las herramientas del navegador. Evita borrar todos los datos del navegador si hay información local que necesites conservar.

## Preguntas de privacidad

### ¿El diario está cifrado de extremo a extremo?

No. El servicio guarda el contenido en texto legible en Firestore. El cifrado local descrito en el roadmap es una propuesta futura, no una función implementada.

### ¿La app funciona completamente sin conexión?

No está documentado ni implementado un flujo completo offline con cola de escritura y sincronización. El plugin PWA cachea recursos de la aplicación, pero esto no garantiza disponibilidad offline de datos de Firebase.

### ¿Puedo poner una clave de IA en `.env.local`?

No si se usa un prefijo `VITE_` y se pretende mantenerla privada: Vite publica esas variables en el cliente. El flujo de Groq actual se inicializa desde el navegador. Hace falta un backend con secreto de servidor antes de usar una clave privada o enviar información íntima.
