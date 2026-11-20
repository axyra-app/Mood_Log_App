# Borrador de consentimiento del prototipo Wear OS

**Estado:** especificación técnica para prototipo interno; no aprobada para investigación con personas ni lanzamiento comercial. Requiere revisión jurídica colombiana y validación de uso previsto.
**Versión de copia/evento:** `co-wear-spot-hr-draft-v1`
**Fecha:** 19 de noviembre de 2026 (hora de Colombia)

El código también incluye una puerta independiente de autodeclaración 18+ (`co-18plus-wear-draft-v1`) antes de usar el check-in. No es autorización de salud y no sustituye el gate de cuenta de la app web ni verifica la edad real. La persona puede retirarla desde Privacidad y permisos; al retirarla, la app borra la marca local y cierra el prototipo.

## Propósito y alcance actual

Esta autorización cubre únicamente un intento puntual de leer frecuencia cardíaca para mostrar la medida en la pantalla actual del reloj. No autoriza guardar o sincronizar la muestra, asociarla a una cuenta, analizarla con IA, usarla para inferir emociones ni recogerla en segundo plano. El check-in de ánimo es un autorreporte independiente y permanece disponible si se rechaza el sensor.

La copia de producto se mantiene en el código de `wearos/app/src/main/java/app/moodlog/wear/MainActivity.java` y es:

> El pulso es un dato de salud. Si continúas, el reloj intentará una lectura para mostrarla solo en esta pantalla; no se guarda ni se envía. Medirlo es opcional: puedes usar el check-in manual sin dar este permiso. El pulso no mide emociones ni ofrece un diagnóstico.

El botón **Continuar** indica aceptación de esta lectura puntual. Después, Android puede mostrar el permiso de sensor. Aceptar el aviso de Mood Log no reemplaza el permiso del sistema, y conceder el permiso del sistema no autoriza tratamiento distinto al descrito aquí. **Ahora no** registra rechazo y mantiene disponible el uso manual.

## Evidencia local implementada

La app guarda en almacenamiento privado (`SharedPreferences`) un evento mínimo con:

| Campo | Uso |
|---|---|
| `schemaVersion` | Interpretar el formato del evento. |
| `consentVersion` | Relacionar la elección con la versión de este aviso. |
| `scope` | Identifica una sola lectura puntual mostrada en pantalla. |
| `decision` | `accepted` o `declined`. |
| `recordedAt` | Hora UTC ISO 8601 del dispositivo. |
| `appVersion` | Versión del build. |

El evento no contiene pulso, ánimo, texto libre, UID, identificador publicitario ni ubicación. Se escribe de forma síncrona antes de pedir permiso o iniciar la lectura aceptada; si no se puede guardar la aceptación, la app bloquea la lectura. La pantalla de privacidad permite consultar las últimas decisiones, borrar el registro y abrir ajustes del sistema para revisar/revocar el permiso de sensor. Borrar el log no revoca un permiso del sistema ni elimina datos de salud porque el prototipo no conserva muestras.

## Límites que impiden usarlo como consentimiento de piloto

- La evidencia no está ligada a una persona autenticada; `recordedAt` depende del reloj del dispositivo y no está sellado por servidor.
- La persona puede borrar el log, borrar los datos de la app o desinstalarla; no hay exportación ni recuperación.
- No se registra si Android concedió el permiso, si el sensor produjo una lectura o si la Activity llegó a mostrarla.
- No existe canal para ejercer derechos frente a un responsable identificado desde esta pantalla.
- El texto, la clasificación de los datos, la finalidad y la suficiencia de la evidencia no han sido aprobados jurídicamente.

Por estas razones, el log permite revisar el comportamiento del prototipo y mejorar trazabilidad local, pero no es evidencia suficiente de autorización para un piloto, investigación o tratamiento comercial.

## Puertas antes de habilitar persistencia o piloto

1. Definir la entidad responsable, finalidad, categorías, plazos, terceros, territorio y canales de derechos.
2. Separar al menos el permiso de lectura puntual del permiso para persistir, sincronizar o analizar cualquier medida.
3. Revisar el texto, carácter facultativo y método de prueba con asesoría colombiana; mantener alternativa funcional sin wearable.
4. Diseñar consulta, exportación, revocación y borrado sincronizados con la identidad del titular, incluidos fallos y permisos revocados.
5. Probar en emulador y relojes reales las rutas de aceptar, rechazar, cancelar, denegar el permiso Android, no disponibilidad del sensor, timeout, volver a segundo plano y revocar desde Settings.
6. Mantener las muestras sintéticas en desarrollo hasta cerrar revisión jurídica, privacidad, seguridad, clasificación regulatoria y protocolo de piloto.

## Mapeo al código

- Consentimiento contextual y persistencia: `MainActivity.onMeasurePressed()` / `recordConsent()`.
- Consulta y borrado local: `showPrivacyControls()` / `confirmConsentLogDeletion()`.
- Ajustes del permiso de plataforma: `openAppPermissions()`.
- Versión técnica: `SENSOR_CONSENT_VERSION`.
