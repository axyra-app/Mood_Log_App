# Diseño del registro de aceptación legal

**Estado:** implementación local parcial; pendiente de textos aprobados y validación de extremo a extremo.  
**Mercado:** Colombia, primera versión para mayores de 18 años.  
**Alcance:** aceptación de términos y constancia de recepción del aviso de privacidad. Este registro no autoriza por sí solo el tratamiento opcional de diario mediante IA, analítica ni datos de salud.

## Problema observado en la revisión inicial

`RegisterSimple` exige una casilla conjunta de términos y política, pero `AuthContext.signUp` y `signUpWithGoogle` solo reciben el estado de mayoría de edad. La casilla no se persiste. No hay una versión aceptada, una hora verificable ni un evento exportable/eliminable que vincule la selección con la cuenta. La navegación reactiva a `onAuthStateChanged` también puede avanzar mientras una escritura posterior sigue pendiente; el registro no debe darse por terminado hasta confirmar la persistencia.

## Implementación local actual

Se añadieron versiones técnicas provisionales, un endpoint backend `POST /api/legal-acceptance` (con `GET` para consultar vigencia), un evento idempotente creado por Admin SDK y una vista de solo propietario. Las altas por correo y Google envían el estado de la casilla y esperan la respuesta durable; si la escritura falla, la interfaz conserva el flujo y ofrece reintento. Para cuentas existentes, las rutas protegidas comprueban la versión actual y remiten a `/legal-acceptance` para revisión y renovación. El endpoint de IA también exige aceptación legal vigente. El perfil guarda una marca de vigencia que se compara junto al evento; exportación y eliminación incluyen `legalAcceptanceEvents`. La transacción Firestore escribe evento y perfil atómicamente; la prueba con Admin SDK verifica ambos documentos en el emulador.

La suite de reglas cubre el gate de aceptación en el emulador (29/29) y la suite API cubre el handler con dependencias simuladas (58/58 en la revisión actual). Pruebas adicionales ejecutan operaciones Admin contra Firestore Emulator y confirman que evento y perfil se guardan en la misma transacción, además de que la API de IA no recrea cuota, eventos, leases ni uso del proveedor después de borrar perfil y marcador de cuenta. La suite también detecta la alineación de versiones legales exigidas por Firestore y Storage. Falta el recorrido integrado de alta/renovación desde la UI, fallos reales de red, staging y CI. Los textos `co-terms-draft-v2-sensitive-data` / `co-privacy-draft-v4-groq-retention` no han sido aprobados. El evento registra la afirmación recibida por el servidor; no acredita de forma criptográfica quién pulsó el control ni constituye concepto jurídico. Las reglas de cliente exigen la marca de vigencia del perfil para las colecciones cubiertas; el gate del endpoint y esa marca no sustituyen una auditoría de cobertura de todas las rutas y colecciones.

## Datos mínimos del evento

Colección propuesta: `legalAcceptanceEvents`, un documento por cuenta y combinación de versiones. Campos:

| Campo | Uso |
|---|---|
| `userId` | Propietario Firebase verificado por el backend. |
| `termsVersion` | Identificador inmutable del texto de términos mostrado. |
| `privacyNoticeVersion` | Identificador inmutable del aviso mostrado. |
| `acceptedAt` | Timestamp asignado por Firestore desde el servidor. |
| `channel` | `registration` o `renewal`, para distinguir aceptación inicial de una renovación futura. |
| `identityProvider` | `email` o `google`, solo para distinguir la ruta de autenticación. No almacenar IP ni huella del dispositivo. |

El ID determinista derivado de UID y versiones hace la operación idempotente y evita registrar duplicados por reintentos. El registro no incluye el contenido de diarios, datos de salud, credenciales, texto del checkbox ni datos de Analytics.

## Flujo requerido

1. Mostrar términos y aviso vigentes mediante enlaces directos, con versiones administradas por separado. Mantener separada la declaración 18+ y cualquier consentimiento opcional.
2. No iniciar alta con correo o Google hasta que la persona seleccione la casilla requerida. La casilla debe reflejar la naturaleza jurídica que apruebe asesoría; no describir una mera constancia de lectura como autorización de datos sensibles.
3. Crear o autenticar la cuenta y completar la declaración de edad requerida por la política inicial.
4. Enviar al backend versiones, canal y una afirmación `accepted: true`, junto con un ID token Firebase. El backend valida token/revocación, versiones permitidas, existencia de la cuenta, mayoría declarada y ausencia de solicitud de borrado; escribe el evento usando Admin SDK y hora de servidor.
5. Mantener la ruta de registro en estado pendiente hasta recibir confirmación durable. Si la red o Firestore fallan, mantener acceso bloqueado al producto personal, explicar que la cuenta existe pero el registro no se confirmó y permitir reintentar sin crear otra cuenta.
6. Consultar la vigencia al autenticar y antes de abrir rutas protegidas. Si las versiones actuales cambiaron, solicitar aceptación explícita antes de acceder a datos personales o iniciar funciones de IA que dependan del gate. Analytics conserva su opt-in separado y apagado por defecto; la aceptación legal no lo activa. La lectura de pulso sigue siendo un prototipo aislado y no está habilitada por esta aceptación.
7. El endpoint solo registra las versiones de términos/aviso. Cada finalidad opcional conserva su propio control actual o futuro y su revocación.

## Seguridad, derechos y retención

- Solo el backend con credenciales de servicio crea eventos; el cliente no puede editarlos ni borrarlos.
- La persona titular puede leer su propio evento. No se permiten consultas entre cuentas.
- La exportación de datos incorpora estos eventos y el flujo de eliminación los elimina junto con los datos de cuenta, según la política aprobada.
- Los eventos son registros de auditoría minimizados, no una forma de prueba criptográfica de que una persona concreta pulsó la casilla. Se conservan solo durante el periodo definido por asesoría legal y la finalidad documentada.
- La revocación de consentimientos opcionales tiene eventos/estado por propósito. Aceptar términos o recibir el aviso no habilita por defecto IA, Analytics, biometría, investigación ni sincronización.
- Si el proveedor de identidad confirma una sesión y la escritura del evento falla, los reintentos deben ser idempotentes y no exponer servicios protegidos hasta registrar la aceptación vigente.

## Evidencia para cerrar ACT-11

Después de aprobar los textos y decidir retención, validar en entorno aislado:

- Alta por correo y alta/inicio de sesión por Google, incluyendo cuentas existentes y renovación.
- Casilla sin marcar, rechazo y cierre del diálogo de identidad.
- Fallo de red, fallo de Admin SDK, reintento y doble envío.
- Cambio de versión de términos sin cambio de aviso y viceversa, con bloqueo, reaceptación y reparación de una marca de perfil incompleta.
- Bloqueo de rutas y de funciones protegidas con aceptación ausente o vencida.
- Lectura propia, rechazo de acceso cruzado, inmutabilidad, exportación y borrado.
- Verificación del texto, versión y timestamp que realmente aparecen en la pantalla y en el evento.

No activar este flujo en producción hasta completar la revisión jurídica colombiana. Las pantallas actuales siguen marcadas como borradores.
