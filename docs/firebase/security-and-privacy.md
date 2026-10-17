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
- `journalTemplates` y `journalPrompts`: lectura disponible para usuarios autenticados.
- Cualquier colección no listada: denegada por la regla final.

### Exportación de datos

La pantalla `/settings` permite descargar un archivo JSON de los datos que las reglas actuales hacen legibles para el usuario autenticado: perfil, documento `userSettings` y documentos propios de `moodLogs`, `journalEntries`, `notifications`, `advancedReports`, `statistics` y `reminders`. Las consultas por colección filtran por UID y recorren páginas de 500 documentos; no modifican Firestore. Las marcas de tiempo se serializan como fechas ISO. La exportación no incluye el contador interno `aiUsage` (solo accesible al backend) ni historial de chat de MIA (no persistido). Las colecciones heredadas denegadas por las reglas, incluida `crisisAssessments`, no son exportables desde este flujo.

### Eliminación de cuenta

Configuración ofrece una eliminación irreversible con frase explícita `ELIMINAR` y reautenticación del proveedor de acceso. `POST /api/delete-account` obtiene el UID exclusivamente de un token Firebase verificado, exige autenticación de los últimos 10 minutos y requiere que la función serverless use una cuenta de servicio Admin. La UI y el endpoint permanecen deshabilitados por defecto: antes de activar, desplegar y verificar las reglas en un proyecto aislado y conceder los permisos IAM del bucket; solo entonces definir juntas `VITE_ACCOUNT_DELETION_ENABLED=true` (build del frontend) y `ACCOUNT_DELETION_ENABLED=true` (Vercel serverless). Nunca se ejecuta una eliminación real como parte de las pruebas automatizadas.

El backend crea el marcador interno `accountDeletionRequests/{uid}`; las reglas de Firestore deniegan nuevas escrituras del cliente y el endpoint de IA rechaza nuevas solicitudes mientras el marcador existe, pero permiten lecturas y reintentos. Después borra por páginas de 400 los documentos propios de las colecciones activas y heredadas incluidas en la lista permitida del endpoint, elimina los archivos bajo `users/{uid}/`, el contador `aiUsage/{uid}` y, por último, los ajustes, perfil y usuario de Firebase Authentication. Si una etapa falla antes de borrar Auth, la cuenta se conserva y el usuario puede reintentar; si falla el borrado de Auth, se intenta restaurar perfil y ajustes. La función registra códigos técnicos de error, no contenido personal. Tras completar Auth, se quita el marcador; un fallo al quitar únicamente ese marcador se registra para limpieza operativa.

La identidad/cuenta Firebase y los datos gestionados por esta aplicación se eliminan; no se promete purga inmediata de copias de seguridad, registros operativos, Firebase Analytics ni contenido procesado por Groq u otros proveedores, sujetos a sus políticas de retención. Si las escrituras quedan pausadas tras un error, no iniciar nuevas entradas: reintentar la eliminación o contactar soporte para revisar permisos/estado. El service account de Vercel requiere `storage.objects.list` y `storage.objects.delete` en el bucket para completar también la limpieza de archivos; define `FIREBASE_STORAGE_BUCKET` cuando el bucket no siga el nombre por defecto `${FIREBASE_PROJECT_ID}.firebasestorage.app`.

### Limitaciones y estado de validación

1. La suite `frontend/tests/security/firestore-rules.test.mjs` contiene pruebas de reglas para perfiles, ánimo, diario, notificaciones, ajustes, reportes/recordatorios, el bloqueo durante eliminación de cuenta, plantillas/prompts y Storage, con operaciones permitidas/denegadas y validaciones de campos. Ejecuta `cd frontend && npm run test:rules`. La regla nueva aún requiere ejecución en CI/JDK 21 (el equipo local tiene Java 8); estas pruebas validan reglas versionadas en el emulador, no las reglas desplegadas en Firebase.
2. Las colecciones de chat persistente (`chats`, `messages`, `chatSessions` y `chatMessages`), `typing`, `crisisAssessments` y `crisisAlerts` no están permitidas por las reglas locales.
3. Las plantillas y prompts solo se leen desde Firestore; cuando no hay documentos, los valores predeterminados se sirven localmente y no se intenta escribir desde el cliente.
4. Las reglas validan campos raíz y algunos tipos/límites; no son un validador exhaustivo de los elementos de todas las listas ni del contenido interno de los mapas de análisis y ajustes. Mantén validación equivalente en la aplicación y amplía pruebas cuando cambien los modelos. Consultas Firestore también deben limitarse para que la regla pueda probar el propietario de cada documento.
5. Las reglas de Storage limitan lectura/escritura/borrado a la carpeta del UID, restringen altas/cambios a imágenes JPEG/PNG/WebP o PDF y limitan archivos a 10 MiB. La suite cubre propietario/ajeno/anónimo, reemplazo válido, MIME no permitido y tamaño excesivo. Estas reglas no validan contenido real del archivo.
6. Firebase CLI requiere JDK 21 o superior para los emuladores. La última ejecución local pasó las 22 pruebas usando temporalmente un JRE 21; no se cambió el Java instalado en el sistema.

### Analítica y telemetría

Los eventos de uso no deben incluir puntuaciones, notas, mensajes, texto de errores, rutas ni títulos que puedan contener información personal. Los eventos de registro de ánimo y error son agregados y no envían sus valores o mensajes; las vistas reportan únicamente el origen fijo de la aplicación. La prueba `frontend/tests/analytics.test.mjs` comprueba que esos campos no se envían. Esta minimización no reemplaza la revisión de consentimiento, retención ni configuración de Firebase Analytics y Google Analytics antes de ofrecer el servicio ampliamente.

Revisa [database-schema.md](./database-schema.md) para el mapa de incompatibilidades. Las reglas reforzadas están versionadas y pasaron las pruebas locales; su publicación en `mood-log-app-01` fue confirmada por el propietario en Firebase Console. Aún falta probar los recorridos completos en el proyecto y revisar denegaciones inesperadas.

## Imágenes y archivos: próximamente

La carga de fotos de perfil, imágenes y archivos adjuntos no está disponible en los flujos de usuario. Aunque el repositorio conserva reglas y un helper de Firebase Storage, no se debe presentar como una función habilitada. La opción de guardar estos objetos en Supabase es futura y todavía no está integrada; Firebase Authentication y Firestore continúan siendo los servicios activos.

Antes de habilitar archivos, definir bucket privado, políticas de acceso por UID, límites de tipo/tamaño, eliminación al borrar la cuenta y manejo de enlaces de descarga. No se debe poner una clave de servicio de Supabase en el frontend.

## IA y secretos

Las llamadas activas a Groq pasan por `frontend/api/ai.ts`; el frontend no incluye la clave ni inicializa el SDK de Groq. La función exige un ID token de Firebase válido, valida tamaños de entrada y limita la cuota a 40 solicitudes diarias por UID mediante un contador en `aiUsage`. Las reglas por defecto deniegan el acceso directo de clientes a esa colección. La función necesita `GROQ_API_KEY`, `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT_JSON` en Vercel; no agregues claves a `VITE_*` ni a Git.

El chat, el análisis explícito de una entrada del diario y la generación de reportes pueden transmitir texto o datos emocionales a Groq. La interfaz informa antes de estas acciones; guardar una entrada no inicia por sí mismo el análisis. Revisa el tratamiento y las condiciones del proveedor antes de usar datos reales, y minimiza el contenido enviado. Las respuestas son informativas y de autorreflexión; no son atención clínica, diagnóstico ni servicio de emergencia.

La cuenta de servicio del backend es un secreto sensible. El SDK Admin omite las reglas de Firestore; para escribir el contador requiere permisos IAM de datos de Firestore que no se limitan a la colección `aiUsage`. Usa una cuenta de servicio dedicada con el rol mínimo disponible, limita su uso al entorno de Vercel y protégela como una credencial capaz de acceder a datos del proyecto. La cuota diaria reduce el abuso por cuenta, pero no garantiza un límite absoluto de facturación; controla también el uso en Groq y Vercel.

La configuración Firebase de cliente está escrita directamente en `frontend/src/services/firebase.ts`; una API key Firebase de cliente no es un secreto de servidor. La protección de datos depende de reglas, configuración del proyecto, restricciones de API y controles de acceso.

## Cifrado y caché

El diario se persiste como texto legible. La propuesta de cifrado con Web Crypto/AES-GCM documentada en el roadmap **no está implementada** y no debe describirse como cifrado de extremo a extremo. La PWA genera service worker y caché de recursos estáticos; no se ha verificado una estrategia offline para datos privados ni sincronización local.

## Verificación previa a producción

- Confirmar el proyecto y las reglas activas en Firebase Console.
- Ejecutar `cd frontend && npm run test:rules` para probar las reglas locales de Firestore y Storage en un proyecto demo de emulador; complementar con pruebas manuales de flujos y verificación del proyecto/reglas remotos antes de producción.
- Para cada colección: probar crear, leer/listar, actualizar y eliminar como dueño, segundo usuario y usuario anónimo.
- Antes de habilitar el borrado a usuarios: probar eliminación completa y fallos parciales con un proyecto Firebase aislado, incluido Auth, bucket y permisos IAM; verificar el proyecto y bucket destino en Vercel.
- Mantener la carga de imágenes/archivos deshabilitada hasta definir e integrar un almacenamiento privado; no presentar el helper de Storage como función disponible.
- Revisar el bundle y las solicitudes de red para comprobar que no salen claves de servidor y que las acciones de IA transmiten solo el contenido indicado en la interfaz.
- Revisar dominios autorizados, IAM, acceso a Vercel, previews, logs, retención, eliminación de cuenta y respuesta a incidentes.
- Hacer revisar términos y política de privacidad por la persona responsable antes de recopilar datos reales.
