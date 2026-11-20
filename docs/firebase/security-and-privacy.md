# Seguridad y privacidad

## Principios y alcance

Los registros de ánimo, las reflexiones y las conversaciones pueden contener información íntima. La privacidad debe verificarse extremo a extremo: en el cliente, las reglas de Firebase, los proveedores externos, el hosting y los procesos de operación.

Esta página describe los archivos de reglas y el código revisado. El propietario del proyecto confirmó que pegó y publicó las reglas de Firestore en `mood-log-app-01` desde Firebase Console; no se verificaron por separado mediante API ni se validaron aún los flujos completos con usuarios reales. Esto no confirma la configuración de Vercel ni el cumplimiento legal del servicio. No usar datos personales reales hasta validar los flujos con cuentas distintas en un entorno de desarrollo.

## Firestore: reglas locales

`firebase/firestore.rules` define:

- `users/{userId}`: acceso del propietario; restringe los campos del perfil, exige el rol `user` y no permite elevar el rol.
- `moodLogs` y `journalEntries`: propietario autenticado, campos permitidos, escala de puntuación 1–10 y límites de contenido/listas.
- `notifications`: acceso asociado al propietario, campos permitidos y cambios limitados al estado de lectura.
- `userSettings/{settingsId}`: ID del documento ligado al UID, campos raíz permitidos y objetos de ajustes tipados como mapas.
- `advancedReports`, `statistics` y `reminders`: acceso asociado al propietario y actualización sin cambiar el `userId`.
- `aiConsentEvents`: el propietario adulto puede leer el registro mínimo de consentimiento generado por la API; el cliente no puede crear, cambiar ni borrar estos eventos.
- `legalAcceptanceEvents`: el propietario puede leer la aceptación versionada de términos/aviso; solo la API Admin puede crear el evento y el cliente no puede editarlo ni borrarlo. El endpoint también exige que el perfil tenga la marca de las versiones actuales.
- `journalTemplates` y `journalPrompts`: lectura disponible para usuarios autenticados.
- El acceso a datos personales de las colecciones anteriores exige perfil con autodeclaración 18+ versión `co-18plus-v1` y marca de aceptación legal vigente (`co-terms-draft-v2-sensitive-data` / `co-privacy-draft-v4-groq-retention`); `users/{userId}` sigue legible por su dueño para completar ambos gates.
- Cualquier colección no listada: denegada por la regla final.

`firebase/storage.rules` también exige mayoría declarada y marca de aceptación legal vigente mediante lectura del perfil de Firestore. Firebase documenta que el uso de `firestore.get()` desde reglas de Storage requiere habilitar permisos de conexión entre ambos productos en el proyecto; confirma esa configuración al desplegar y valida el bucket remoto. La suite de reglas ejercita la versión local de Storage con el emulador.

### Exportación de datos

La pantalla `/settings` descarga un JSON versión 8 a través de un endpoint autenticado que verifica el UID del token. Incluye perfil, `userSettings`, registros propios de las colecciones activas y heredadas de la lista de exportación, sus subcolecciones, y una proyección allowlist de `aiUsage` (contadores reportados por Groq por modelo/tarea/día). La propiedad `coverage` marca la copia como parcial: no incluye binarios de Storage, preferencias locales del prototipo Wear OS, logs de hosting/proveedores ni metadatos operativos temporales. El historial de MIA no se persiste. Los documentos heredados se buscan por `userId` o `uid`, según la colección; el listado de exportación se mantiene explícito para no incluir colecciones arbitrarias. La respuesta NDJSON se procesa solo si contiene su registro terminal con el conteo completo. El cliente reúne el JSON completo en memoria para descargarlo, por lo que falta probar cuentas grandes. Las marcas de tiempo se serializan como fechas ISO. Esta exportación Admin de servidor no cambia las reglas de lectura/escritura del cliente y todavía necesita prueba integrada en staging.

### Eliminación de cuenta

Configuración ofrece una eliminación irreversible con frase explícita `ELIMINAR` y reautenticación del proveedor de acceso. `POST /api/delete-account` obtiene el UID exclusivamente de un token Firebase verificado, exige autenticación de los últimos 10 minutos y requiere que la función serverless use una cuenta de servicio Admin. La UI y el endpoint permanecen deshabilitados por defecto: antes de activar, desplegar y verificar las reglas en un proyecto aislado y conceder los permisos IAM del bucket; solo entonces definir juntas `VITE_ACCOUNT_DELETION_ENABLED=true` (build del frontend) y `ACCOUNT_DELETION_ENABLED=true` (Vercel serverless). Nunca se ejecuta una eliminación real como parte de las pruebas automatizadas.

El backend crea el marcador interno `accountDeletionRequests/{uid}`; las reglas de Firestore deniegan nuevas escrituras del cliente y los endpoints de IA y aceptación legal rechazan solicitudes mientras el marcador existe. Después consulta por páginas de hasta 400 documentos propios en las colecciones activas y heredadas permitidas y aplica `recursiveDelete` con un `BulkWriter` compartido y concurrencia de lectura limitada a cada documento, incluidos sus subcolecciones; luego elimina los archivos bajo `users/{uid}/`, el contador `aiUsage/{uid}` y, por último, los ajustes, perfil y usuario de Firebase Authentication. Si una etapa falla antes de borrar Auth, la cuenta se conserva y el usuario puede reintentar; si falla el borrado de Auth, se intenta restaurar perfil y ajustes. La función registra códigos técnicos de error, no contenido personal. Tras completar Auth, se quita el marcador; un fallo al quitar únicamente ese marcador se registra para limpieza operativa. La cobertura de subcolecciones se verificó con un fixture simulado, no con Firestore Emulator ni el proyecto remoto.

La identidad/cuenta Firebase y los datos gestionados por esta aplicación se eliminan; no se promete purga inmediata de copias de seguridad, registros operativos, Firebase Analytics ni contenido procesado por Groq u otros proveedores, sujetos a sus políticas de retención. Si las escrituras quedan pausadas tras un error, no iniciar nuevas entradas: reintentar la eliminación o contactar soporte para revisar permisos/estado. El service account de Vercel requiere `storage.objects.list` y `storage.objects.delete` en el bucket para completar también la limpieza de archivos; define `FIREBASE_STORAGE_BUCKET` cuando el bucket no siga el nombre por defecto `${FIREBASE_PROJECT_ID}.firebasestorage.app`.

### Limitaciones y estado de validación

1. La suite `frontend/tests/security/*.test.mjs` contiene 29 pruebas para perfiles, ánimo, diario, notificaciones, ajustes, reportes/recordatorios, eliminación de cuenta, eventos de consentimiento, plantillas/prompts, Storage, gate 18+, aceptación legal, acceso de exportación a `aiUsage` y prevención de escrituras IA después de borrar la cuenta. `npm run test:rules` pasó 29/29 con JDK 21 y archivos serializados: se comprueba que edad y aceptación vigente sean necesarias para crear registros/archivos, que el cliente no pueda poner la marca legal, que el evento solo lo lea su titular y que el propietario pueda leer su contador sin listarlo o escribirlo. La prueba Admin nueva confirma contra Firestore Emulator que las transacciones rechazan crear cuota/lease/evento y uso del proveedor cuando ya no existe el perfil elegible, incluso si el marcador de borrado ya se limpió. Estas pruebas validan reglas versionadas, no las reglas desplegadas en Firebase; el CI actualizado con auditoría de todas las dependencias aún debe ejecutarse.
2. `frontend/tests/api/legal-acceptance.test.mjs` cubre sesión, elegibilidad, versiones, idempotencia, evento y marca de perfil, vigencia, bloqueo durante borrado y fallo atómico con dependencias simuladas. `npm run test:api` pasó 58/58 en la revisión actual. Además, `legal-acceptance-admin-emulator.test.mjs` ejecuta el handler con Admin SDK contra Firestore Emulator y confirma la escritura transaccional del evento y perfil. Esto no valida el proyecto Firebase remoto.
3. Las colecciones de chat persistente (`chats`, `messages`, `chatSessions` y `chatMessages`), `typing`, `crisisAssessments` y `crisisAlerts` no están permitidas por las reglas locales.
4. Las plantillas y prompts solo se leen desde Firestore; cuando no hay documentos, los valores predeterminados se sirven localmente y no se intenta escribir desde el cliente.
5. Las reglas validan campos raíz y algunos tipos/límites; no son un validador exhaustivo de los elementos de todas las listas ni del contenido interno de los mapas de análisis y ajustes. Mantén validación equivalente en la aplicación y amplía pruebas cuando cambien los modelos. Consultas Firestore también deben limitarse para que la regla pueda probar el propietario de cada documento.
6. Las reglas de Storage limitan lectura/escritura/borrado a la carpeta del UID, restringen altas/cambios a imágenes JPEG/PNG/WebP o PDF y limitan archivos a 10 MiB. La suite cubre propietario/ajeno/anónimo, reemplazo válido, MIME no permitido y tamaño excesivo. Estas reglas no validan contenido real del archivo.
7. Firebase CLI requiere JDK 21 o superior para los emuladores. La ejecución local usó el JDK 21 ya instalado, anteponiéndolo al `PATH` solo para ese proceso; no se modificó la configuración global de Java.

### Analítica y telemetría

Los eventos de uso no deben incluir puntuaciones, notas, mensajes, texto de errores, rutas ni títulos que puedan contener información personal. Los eventos definidos usan nombres, categorías y etiquetas fijas; las vistas reportan únicamente el origen fijo de la aplicación. La prueba `frontend/tests/analytics.test.mjs` comprueba que el consentimiento requiere opción explícita, versión vigente y marca temporal, y que los eventos no se envían por defecto aunque exista un `gtag` global. La revisión del bundle y payloads de red de staging sigue pendiente.

**Control local implementado; revisión de lanzamiento pendiente:** Firebase Analytics ya no se inicializa desde `firebase.ts`. El helper `analytics.ts` carga el SDK solo si el perfil contiene opt-in `co-analytics-v1` vigente, tras guardar la preferencia. La opción parte apagada, desactiva page views automáticos y se apaga al cerrar sesión o revocar. Se retiró el segundo ID del helper `gtag`; queda un `measurementId` en la configuración Firebase. Falta comprobar el bundle y tráfico real de staging (incluidos requests/cookies previos al opt-in), revisar configuración, payloads, retención y transferencias, y aprobar el texto/base con asesoría colombiana. El [inventario de datos](../privacy/inventario-y-trazabilidad-de-datos.md) registra evidencia y acciones. Los cambios son locales y no prueban configuración remota.

Revisa [database-schema.md](./database-schema.md) para el mapa de incompatibilidades. El propietario confirmó la publicación histórica de un conjunto anterior de reglas Firestore en `mood-log-app-01`; las reglas versionadas actualmente sí pasan pruebas locales, pero no hay evidencia de que esta versión reforzada esté desplegada. Faltan validación de destino, configuración de Storage/Firestore y recorridos completos autenticados en staging.

## Imágenes y archivos: próximamente

La carga de fotos de perfil, imágenes y archivos adjuntos no está disponible en los flujos de usuario. Aunque el repositorio conserva reglas y un helper de Firebase Storage, no se debe presentar como una función habilitada. La opción de guardar estos objetos en Supabase es futura y todavía no está integrada; Firebase Authentication y Firestore continúan siendo los servicios activos.

Antes de habilitar archivos, definir bucket privado, políticas de acceso por UID, límites de tipo/tamaño, eliminación al borrar la cuenta y manejo de enlaces de descarga. No se debe poner una clave de servicio de Supabase en el frontend.

## IA y secretos

Las llamadas activas a Groq pasan por `frontend/api/ai.ts`; el frontend no incluye la clave ni inicializa el SDK de Groq. La función exige un ID token de Firebase válido, valida tamaños de entrada y limita la cuota a 40 solicitudes diarias y 8 por minuto por UID mediante un contador en `aiUsage`. La regla permite únicamente `get` del documento propio para soportar la exportación; lectura de colección y toda escritura desde cliente se deniegan. La función necesita `GROQ_API_KEY`, `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT_JSON` en Vercel; no agregues claves a `VITE_*` ni a Git.

La documentación oficial de Groq consultada el 20 de noviembre de 2026 describe no retener por defecto los datos de inferencia, posibles logs de entradas/salidas por confiabilidad o abuso hasta 30 días, opción Zero Data Retention (ZDR) disponible para todos los clientes y almacenamiento de datos retenidos en GCP en EE. UU. El Trust Center indica que Customer Data no se usa para entrenar modelos. El DPA público pone en cabeza del cliente asegurar los avisos/autorizaciones y el derecho a transferir o dar acceso a los datos, permite subprocesadores y contempla transferencias a EE. UU. y otros países. **No se verificaron** la configuración ZDR, aceptación contractual/DPA, región ni la organización de la cuenta de Mood Log; no presentes esas condiciones generales como settings confirmados del producto ni como conclusión de cumplimiento colombiano. Revisar [Your Data in GroqCloud](https://console.groq.com/docs/your-data), el [Trust Center FAQ](https://trust.groq.com/faq), el [DPA de GroqCloud](https://console.groq.com/docs/legal/customer-data-processing-addendum) y las [políticas vigentes](https://console.groq.com/docs/legal) antes del uso comercial.

El chat, el análisis explícito de una entrada del diario y la generación de reportes pueden transmitir texto o datos emocionales a Groq. La interfaz informa antes de estas acciones; guardar una entrada no inicia por sí mismo el análisis. Revisa el tratamiento y las condiciones del proveedor antes de usar datos reales, y minimiza el contenido enviado. Las respuestas son informativas y de autorreflexión; no son atención clínica, diagnóstico ni servicio de emergencia.

La cuenta de servicio del backend es un secreto sensible. El SDK Admin omite las reglas de Firestore; para escribir el contador requiere permisos IAM de datos de Firestore que no se limitan a la colección `aiUsage`. Usa una cuenta de servicio dedicada con el rol mínimo disponible, limita su uso al entorno de Vercel y protégela como una credencial capaz de acceder a datos del proyecto. La cuota diaria reduce el abuso por cuenta, pero no garantiza un límite absoluto de facturación; controla también el uso en Groq y Vercel.

La configuración Firebase de cliente está escrita directamente en `frontend/src/services/firebase.ts`; una API key Firebase de cliente no es un secreto de servidor. La protección de datos depende de reglas, configuración del proyecto, restricciones de API y controles de acceso.

## Cifrado y caché

El diario se persiste como texto legible. La propuesta de cifrado con Web Crypto/AES-GCM documentada en el roadmap **no está implementada** y no debe describirse como cifrado de extremo a extremo. La PWA genera service worker y caché de recursos estáticos; no se ha verificado una estrategia offline para datos privados ni sincronización local.

## Verificación previa a producción

- Confirmar el proyecto y las reglas activas en Firebase Console.
- Ejecutar `cd frontend && npm run test:rules` para probar las reglas locales de Firestore y Storage en un proyecto demo de emulador; complementar con pruebas manuales de flujos y verificación del proyecto/reglas remotos antes de producción. La suite incluye bloqueo de datos y archivos antes de la declaración.
- Para cada colección: probar crear, leer/listar, actualizar y eliminar como dueño, segundo usuario y usuario anónimo.
- Antes de habilitar el borrado a usuarios: probar eliminación completa y fallos parciales con un proyecto Firebase aislado, incluido Auth, bucket y permisos IAM; verificar el proyecto y bucket destino en Vercel.
- Mantener la carga de imágenes/archivos deshabilitada hasta definir e integrar un almacenamiento privado; no presentar el helper de Storage como función disponible.
- Revisar el bundle y las solicitudes de red para comprobar que no salen claves de servidor y que las acciones de IA transmiten solo el contenido indicado en la interfaz.
- Revisar dominios autorizados, IAM, acceso a Vercel, previews, logs, retención, eliminación de cuenta y respuesta a incidentes.
- Hacer revisar términos y política de privacidad por la persona responsable antes de recopilar datos reales.
