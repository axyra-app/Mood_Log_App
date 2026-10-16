# Seguridad y privacidad

## Principios y alcance

Los registros de ánimo, las reflexiones y las conversaciones pueden contener información íntima. La privacidad debe verificarse extremo a extremo: en el cliente, las reglas de Firebase, los proveedores externos, el hosting y los procesos de operación.

Esta página describe los archivos de reglas y el código local revisados. **No confirma** cuáles reglas están desplegadas en Firebase, qué configuración aplica Vercel ni el cumplimiento legal del servicio. No usar datos personales reales hasta validar los flujos con usuarios distintos en un entorno de desarrollo.

## Firestore: reglas locales

`firebase/firestore.rules` define:

- `users/{userId}`: lectura y operaciones del propietario si el UID coincide con el ID del documento; alta y actualización requieren `role: 'user'`.
- `moodLogs` y `journalEntries`: el `userId` debe coincidir al crear, y se comprueba el dueño al leer, actualizar o borrar.
- `notifications`, `advancedReports`, `statistics` y `reminders`: acceso asociado al propietario autenticado y actualización sin cambiar su `userId`.
- `userSettings/{settingsId}`: lectura y escritura cuando el ID del documento coincide con el UID autenticado.
- `journalTemplates` y `journalPrompts`: lectura disponible para usuarios autenticados.
- Cualquier colección no listada: denegada por la regla final.

### Limitaciones y estado de validación

1. Las reglas de propiedad/rol y creación de `statistics` tienen ahora cobertura automatizada en `frontend/tests/security/firestore-rules.test.mjs`; ejecuta `cd frontend && npm run test:rules`. Esto valida las reglas versionadas en el emulador, no las reglas desplegadas en Firebase.
2. Las colecciones de chat persistente (`chats`, `messages`, `chatSessions` y `chatMessages`), `typing`, `crisisAssessments` y `crisisAlerts` no están permitidas por las reglas locales.
3. La inicialización desde cliente de plantillas/prompts no está permitida: las reglas solo conceden lectura.
4. Las reglas no son un esquema completo: faltan validaciones de campos, tipos, límites y estados permitidos. Consultas Firestore también deben limitarse para que la regla pueda probar el propietario de cada documento.
5. Las reglas de Storage limitan lectura/escritura/borrado a la carpeta del UID, restringen altas/cambios a imágenes JPEG/PNG/WebP o PDF y limitan archivos a 10 MiB. Hay pruebas con UID propio/ajeno/anónimo, tipo no permitido y tamaño excesivo. Estas reglas no validan contenido real del archivo.

Revisa [database-schema.md](./database-schema.md) para el mapa de incompatibilidades. No despliegues cambios de reglas sin pruebas de propietario, otro usuario y usuario sin autenticación.

## Cloud Storage

`firebase/storage.rules` limita rutas bajo `users/{userId}/...` al propietario y valida tamaño/MIME en altas y actualizaciones. `uploadFile` exige sesión, valida esas mismas restricciones y prefija la ruta con el UID autenticado; el nombre original no se guarda en metadata. El flujo de chat usa nombres aleatorios y solo tipos permitidos.

`getDownloadURL` produce una URL con token portador: quien obtiene el enlace puede acceder al archivo sin volver a pasar por las reglas de UID. No trates un enlace como privado por el solo hecho de que las reglas limiten la ruta; evita compartir archivos sensibles, no incluyas esos enlaces en logs y revisa revocación/rotación de tokens antes de ampliar el uso. No subas muestras de salud ni diarios por esta ruta.

## IA y secretos

Las llamadas activas a Groq pasan por `frontend/api/ai.ts`; el frontend no incluye la clave ni inicializa el SDK de Groq. La función exige un ID token de Firebase válido, valida tamaños de entrada y limita la cuota a 40 solicitudes diarias por UID mediante un contador en `aiUsage`. Las reglas por defecto deniegan el acceso directo de clientes a esa colección. La función necesita `GROQ_API_KEY`, `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT_JSON` en Vercel; no agregues claves a `VITE_*` ni a Git.

El chat, el análisis explícito de una entrada del diario y la generación de reportes pueden transmitir texto o datos emocionales a Groq. La interfaz informa antes de estas acciones; guardar una entrada no inicia por sí mismo el análisis. Revisa el tratamiento y las condiciones del proveedor antes de usar datos reales, y minimiza el contenido enviado. Las respuestas son informativas y de autorreflexión; no son atención clínica, diagnóstico ni servicio de emergencia.

La cuenta de servicio del backend es un secreto sensible. El SDK Admin omite las reglas de Firestore; para escribir el contador requiere permisos IAM de datos de Firestore que no se limitan a la colección `aiUsage`. Usa una cuenta de servicio dedicada con el rol mínimo disponible, limita su uso al entorno de Vercel y protégela como una credencial capaz de acceder a datos del proyecto. La cuota diaria reduce el abuso por cuenta, pero no garantiza un límite absoluto de facturación; controla también el uso en Groq y Vercel.

La configuración Firebase de cliente está escrita directamente en `frontend/src/services/firebase.ts`; una API key Firebase de cliente no es un secreto de servidor. La protección de datos depende de reglas, configuración del proyecto, restricciones de API y controles de acceso.

## Cifrado y caché

El diario se persiste como texto legible. La propuesta de cifrado con Web Crypto/AES-GCM documentada en el roadmap **no está implementada** y no debe describirse como cifrado de extremo a extremo. La PWA genera service worker y caché de recursos estáticos; no se ha verificado una estrategia offline para datos privados ni sincronización local.

## Verificación previa a producción

- Confirmar el proyecto y las reglas activas en Firebase Console.
- Ejecutar `cd frontend && npm run test:rules` para probar reglas locales de Firestore en un proyecto demo de emulador; complementar con pruebas de Storage, otros flujos y verificación del proyecto/reglas remotos antes de producción.
- Para cada colección: probar crear, leer/listar, actualizar y eliminar como dueño, segundo usuario y usuario anónimo.
- Probar Storage con UID propio, UID ajeno, tipo MIME/tamaño inválido y URLs de descarga.
- Revisar el bundle y las solicitudes de red para comprobar que no salen claves de servidor y que las acciones de IA transmiten solo el contenido indicado en la interfaz.
- Revisar dominios autorizados, IAM, acceso a Vercel, previews, logs, retención, eliminación de cuenta y respuesta a incidentes.
- Hacer revisar términos y política de privacidad por la persona responsable antes de recopilar datos reales.
