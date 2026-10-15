# Seguridad y privacidad

## Principios y alcance

Los registros de ánimo, las reflexiones y las conversaciones pueden contener información íntima. La privacidad debe verificarse extremo a extremo: en el cliente, las reglas de Firebase, los proveedores externos, el hosting y los procesos de operación.

Esta página describe los archivos de reglas y el código local revisados. **No confirma** cuáles reglas están desplegadas en Firebase, qué configuración aplica Vercel ni el cumplimiento legal del servicio. No usar datos personales reales hasta validar los flujos con usuarios distintos en un entorno de desarrollo.

## Firestore: reglas locales

`firestore.rules` define:

- `users/{userId}`: lectura y operaciones del propietario si el UID coincide con el ID del documento; alta restringida a `role` ausente o `user`, y actualización que conserva el rol existente.
- `moodLogs` y `journalEntries`: el `userId` debe coincidir al crear, y se comprueba el dueño al leer, actualizar o borrar.
- `chatSessions`, `chatMessages`, `notifications`, `advancedReports`, `statistics` y `reminders`: creación con propietario autenticado y actualización que conserva el `userId` del dueño existente.
- `statistics`: lectura, creación, actualización y borrado del propietario.
- `journalTemplates` y `journalPrompts`: lectura disponible para usuarios autenticados.
- Cualquier colección no listada: denegada por la regla final.

### Limitaciones y estado de validación

1. Las reglas de propiedad/rol y creación de `statistics` tienen ahora cobertura automatizada en `frontend/tests/security/firestore-rules.test.mjs`; ejecuta `cd frontend && npm run test:rules`. Esto valida las reglas versionadas en el emulador, no las reglas desplegadas en Firebase.
2. Los flujos de `chats`, `messages`, `typing`, `crisisAssessments` y `crisisAlerts` no están permitidos por las reglas locales. El hook de chat que usa `chatMessages` también debe comprobar que envía el `userId` requerido.
3. La inicialización desde cliente de plantillas/prompts no está permitida: las reglas solo conceden lectura.
4. Las reglas no son un esquema completo: faltan validaciones de campos, tipos, límites y estados permitidos. Consultas Firestore también deben limitarse para que la regla pueda probar el propietario de cada documento.
5. Las reglas de Storage limitan lectura/escritura/borrado a la carpeta del UID, restringen altas/cambios a imágenes JPEG/PNG/WebP o PDF y limitan archivos a 10 MiB. Hay pruebas con UID propio/ajeno/anónimo, tipo no permitido y tamaño excesivo. Estas reglas no validan contenido real del archivo.

Revisa [database-schema.md](./database-schema.md) para el mapa de incompatibilidades. No despliegues cambios de reglas sin pruebas de propietario, otro usuario y usuario sin autenticación.

## Cloud Storage

`storage.rules` limita rutas bajo `users/{userId}/...` al propietario y valida tamaño/MIME en altas y actualizaciones. `uploadFile` exige sesión, valida esas mismas restricciones y prefija la ruta con el UID autenticado; el nombre original no se guarda en metadata. El flujo de chat usa nombres aleatorios y solo tipos permitidos.

`getDownloadURL` produce una URL con token portador: quien obtiene el enlace puede acceder al archivo sin volver a pasar por las reglas de UID. No trates un enlace como privado por el solo hecho de que las reglas limiten la ruta; evita compartir archivos sensibles, no incluyas esos enlaces en logs y revisa revocación/rotación de tokens antes de ampliar el uso. No subas muestras de salud ni diarios por esta ruta.

## IA y secretos

Algunos módulos del frontend inicializan Groq con `VITE_GROQ_API_KEY` y permiten explícitamente su uso desde navegador. **Una variable `VITE_*` no es secreta**: puede quedar en los archivos descargados por cualquier visitante. No guardar allí claves privadas; si una clave real ya se publicó en un bundle, revocarla/rotarla y revisar uso y facturación.

Las solicitudes de IA pueden transmitir el contenido del diario o contexto emocional a un tercero. Antes de habilitar el flujo se necesita un backend/función con secreto de servidor, una política de minimización de datos, consentimiento informado y documentación del proveedor y retención. El análisis local de fallback no equivale a una evaluación clínica. La app no debe presentarse como terapeuta, diagnóstico ni servicio de emergencia.

La configuración Firebase de cliente está escrita directamente en `frontend/src/services/firebase.ts`; una API key Firebase de cliente no es un secreto de servidor. La protección de datos depende de reglas, configuración del proyecto, restricciones de API y controles de acceso.

## Cifrado y caché

El diario se persiste como texto legible. La propuesta de cifrado con Web Crypto/AES-GCM documentada en el roadmap **no está implementada** y no debe describirse como cifrado de extremo a extremo. La PWA genera service worker y caché de recursos estáticos; no se ha verificado una estrategia offline para datos privados ni sincronización local.

## Verificación previa a producción

- Confirmar el proyecto y las reglas activas en Firebase Console.
- Ejecutar `cd frontend && npm run test:rules` para probar reglas locales de Firestore en un proyecto demo de emulador; complementar con pruebas de Storage, otros flujos y verificación del proyecto/reglas remotos antes de producción.
- Para cada colección: probar crear, leer/listar, actualizar y eliminar como dueño, segundo usuario y usuario anónimo.
- Probar Storage con UID propio, UID ajeno, tipo MIME/tamaño inválido y URLs de descarga.
- Revisar el bundle y las solicitudes de red para comprobar que no salen claves de servidor ni datos que no tengan consentimiento.
- Revisar dominios autorizados, IAM, acceso a Vercel, previews, logs, retención, eliminación de cuenta y respuesta a incidentes.
- Hacer revisar términos y política de privacidad por la persona responsable antes de recopilar datos reales.
