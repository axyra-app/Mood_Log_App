# Seguridad y privacidad

## Principios y alcance

Los registros de ánimo, las reflexiones y las conversaciones pueden contener información íntima. La privacidad debe verificarse extremo a extremo: en el cliente, las reglas de Firebase, los proveedores externos, el hosting y los procesos de operación.

Esta página describe los archivos de reglas y el código local revisados. **No confirma** cuáles reglas están desplegadas en Firebase, qué configuración aplica Vercel ni el cumplimiento legal del servicio. No usar datos personales reales hasta validar los flujos con usuarios distintos en un entorno de desarrollo.

## Firestore: reglas locales

`firestore.rules` define:

- `users/{userId}`: lectura/escritura si el UID autenticado coincide con el ID del documento.
- `moodLogs` y `journalEntries`: el `userId` debe coincidir al crear, y se comprueba el dueño al leer, actualizar o borrar.
- `chatSessions`, `chatMessages`, `notifications`, `advancedReports` y `reminders`: controles de propiedad basados en `userId`.
- `statistics`: lectura/escritura sobre documentos cuyo propietario coincide.
- `journalTemplates` y `journalPrompts`: lectura disponible para usuarios autenticados.
- Cualquier colección no listada: denegada por la regla final.

### Limitaciones que requieren corrección y pruebas

1. Las reglas de `users` permiten al dueño modificar cualquier campo, incluido `role`. No usar un valor de rol escrito por el cliente para autorizar privilegios.
2. Las reglas de actualización de `chatSessions`, `chatMessages`, `notifications`, `advancedReports` y `reminders` comprueban al propietario del documento existente, pero no exigen en todos los casos que el documento nuevo conserve el mismo `userId`.
3. `statistics` no tiene una condición de creación basada en `request.resource`; los documentos nuevos pueden quedar bloqueados.
4. Los flujos de `chats`, `messages`, `typing`, `crisisAssessments` y `crisisAlerts` no están permitidos por las reglas locales. El hook de chat que usa `chatMessages` también debe comprobar que envía el `userId` requerido.
5. La inicialización desde cliente de plantillas/prompts no está permitida: las reglas solo conceden lectura.
6. Las reglas no son un esquema completo: faltan validaciones de campos, tipos, límites y estados permitidos. Consultas Firestore también deben limitarse para que la regla pueda probar el propietario de cada documento.

Revisa [database-schema.md](./database-schema.md) para el mapa de incompatibilidades. No despliegues cambios de reglas sin pruebas de propietario, otro usuario y usuario sin autenticación.

## Cloud Storage

`storage.rules` permite leer y escribir rutas bajo `users/{userId}/...` solo al propietario y deniega las demás rutas. No comprueba tamaño, tipo MIME ni contenido. El servicio `uploadFile` obtiene además una URL de descarga; trata estas URLs como datos que podrían compartirse y evita incluirlas en logs o documentos públicos. Verifica que todos los llamadores usen rutas con el UID esperado antes de habilitar cargas.

## IA y secretos

Algunos módulos del frontend inicializan Groq con `VITE_GROQ_API_KEY` y permiten explícitamente su uso desde navegador. **Una variable `VITE_*` no es secreta**: puede quedar en los archivos descargados por cualquier visitante. No guardar allí claves privadas; si una clave real ya se publicó en un bundle, revocarla/rotarla y revisar uso y facturación.

Las solicitudes de IA pueden transmitir el contenido del diario o contexto emocional a un tercero. Antes de habilitar el flujo se necesita un backend/función con secreto de servidor, una política de minimización de datos, consentimiento informado y documentación del proveedor y retención. El análisis local de fallback no equivale a una evaluación clínica. La app no debe presentarse como terapeuta, diagnóstico ni servicio de emergencia.

La configuración Firebase de cliente está escrita directamente en `frontend/src/services/firebase.ts`; una API key Firebase de cliente no es un secreto de servidor. La protección de datos depende de reglas, configuración del proyecto, restricciones de API y controles de acceso.

## Cifrado y caché

El diario se persiste como texto legible. La propuesta de cifrado con Web Crypto/AES-GCM documentada en el roadmap **no está implementada** y no debe describirse como cifrado de extremo a extremo. La PWA genera service worker y caché de recursos estáticos; no se ha verificado una estrategia offline para datos privados ni sincronización local.

## Verificación previa a producción

- Confirmar el proyecto y las reglas activas en Firebase Console.
- Probar reglas con Emulator Suite o un proyecto de desarrollo separado; el repositorio no demuestra que el emulador esté configurado.
- Para cada colección: probar crear, leer/listar, actualizar y eliminar como dueño, segundo usuario y usuario anónimo.
- Probar Storage con UID propio, UID ajeno, tipo MIME/tamaño inválido y URLs de descarga.
- Revisar el bundle y las solicitudes de red para comprobar que no salen claves de servidor ni datos que no tengan consentimiento.
- Revisar dominios autorizados, IAM, acceso a Vercel, previews, logs, retención, eliminación de cuenta y respuesta a incidentes.
- Hacer revisar términos y política de privacidad por la persona responsable antes de recopilar datos reales.
