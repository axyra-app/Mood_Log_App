# Procedimiento operativo de derechos e incidentes — Colombia

**Estado:** borrador de operación para personalizar y validar con asesoría colombiana.
**Aplicación prevista:** Beta comercial de Mood Log en Colombia, adultos 18+.
**Límite:** no habilita tratamiento ni sustituye la política, el análisis de aplicabilidad ni el criterio jurídico vigente.

## 1. Canales que deben quedar listos antes de beta

No publicar marcadores de posición. El responsable de Mood Log debe completar y probar:

- Correo visible de privacidad: `POR DEFINIR`.
- Formulario autenticado en la app o canal alternativo accesible: `POR DEFINIR`.
- Persona suplente cuando el responsable primario no esté disponible: `POR DEFINIR`.
- Identidad, NIT/dirección y rol del Responsable que aparecerán en política y avisos: `POR DEFINIR`.
- Zona horaria de operación del SLA: Colombia; los plazos legales se cuentan en días hábiles según asesoría, no como temporizadores de 24 horas.

El canal debe aceptar consultas/reclamos aunque la persona haya cerrado sesión. No solicitar que envíe notas de ánimo, diarios ni datos de salud por correo sin cifrado/control definido. Registrar la solicitud y contestar por el canal más seguro que la persona haya habilitado.

## 2. Clasificación y términos legales observados

La Ley 1581 de 2012 diferencia **consultas** sobre la información personal y **reclamos** de corrección, actualización, supresión o presunto incumplimiento. Registrar fecha y hora de recepción, tipo, identidad/autorización, contenido mínimo y responsable asignado. El abogado debe verificar en cada caso la norma especial que pueda establecer un plazo menor.

| Tipo | Término del texto legal consultado | Reglas operativas que deben activar el contador |
|---|---|---|
| Consulta de datos personales | Máximo 10 días hábiles desde la recepción. Si no es posible, informar motivos y fecha antes del vencimiento; la extensión no puede superar 5 días hábiles después del término inicial. | Asignar el mismo día hábil. Entregar respuesta comprensible y datos que reposen en sistemas controlados, incluidos proveedores cuando corresponda. Escalar al responsable de privacidad si a día hábil 5 aún faltan respuestas de proveedor o una exportación está fallando. |
| Reclamo completo | Máximo 15 días hábiles desde el día siguiente a la recepción. Si no se puede cumplir, informar los motivos y nueva fecha antes del vencimiento; la extensión no puede superar 8 días hábiles después del término inicial. | Revisar completitud. Si está incompleto, pedir subsanación dentro de los 5 días siguientes a su recepción; transcurridos 2 meses sin respuesta, la ley contempla desistimiento. Si quien lo recibe no es competente, trasladar dentro de 2 días hábiles e informar al titular. Al recibirse completo, dejar en la base la leyenda “reclamo en trámite” y motivo en máximo 2 días hábiles, hasta decidirlo. |
| Queja posterior ante SIC | La Ley 1581 exige agotar previamente consulta/reclamo ante responsable o encargado. | La respuesta final identifica el canal de atención y conserva evidencia de entrega. No obstaculizar ni desincentivar el derecho del titular de acudir a la SIC. |

Estos términos provienen de los artículos 14–16; el equipo debe convertirlos a fechas reales (calendario de festivos Colombia incluido) y recibir aprobación jurídica antes de producción. Fuente primaria: [Ley 1581 de 2012 — Función Pública, artículos 14–16](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981).

## 3. Flujo de atención

### A. Recepción y acuse

1. Crear un folio aleatorio no basado en correo o UID; registrar hora local, canal, solicitud original y sistema que la recibió.
2. Enviar acuse que confirme recepción, folio, categoría provisional, responsable asignado, fecha límite calculada y canal de seguimiento.
3. No incluir contenido del diario ni datos fisiológicos en el asunto, logs, herramienta de tickets de terceros o respuesta automática.
4. Si la solicitud llegó a un proveedor/encargado, pedir su traslado seguro al Responsable de Mood Log de inmediato; no reiniciar el contador legal.

### B. Identidad, alcance y clasificación

1. Para una persona con sesión activa, vincular la solicitud a la cuenta sin pedir un documento adicional por defecto. Para una cuenta inaccesible o un representante, usar verificación proporcional aprobada jurídicamente; no solicitar más datos sensibles de los necesarios.
2. Clasificar como: acceso/consulta, copia de autorización, corrección/actualización, revocación, supresión, limitación/reclamo o presunto incumplimiento. Puede incluir más de una categoría.
3. Si faltan los elementos exigidos para un reclamo, pedirlos dentro del plazo legal y dejar constancia de la fecha. No confundir una consulta de acceso con un reclamo incompleto.
4. Si el Responsable no es competente para resolver una solicitud recibida, asignar traslado dentro del plazo aplicable e informar a la persona.

### C. Ejecución según el derecho

| Solicitud | Sistemas/acciones que debe cubrir el inventario técnico | Respuesta verificable |
|---|---|---|
| Acceso/copia | Firebase Auth, Firestore, Storage, consentimientos, exportación, Vercel y Groq según sus contratos y registros; datos locales de Wear OS solo si ya existe vínculo/sync. | Entregar los datos personales localizables en formato seguro; explicar categorías/finalidades/destinos y limitaciones con claridad. Una exportación de la app no prueba por sí sola que cubra logs y proveedores. |
| Corrección/actualización | Perfil y documentos editables; derivados/reporte/uso de IA; replicar corrección al encargado cuando corresponda. | Confirmar qué fue actualizado, en qué sistemas y cuándo; conservar la trazabilidad mínima de la solicitud. |
| Revocación | Marcar autorización correspondiente (analítica, dato sensible, IA por tarea o wearable); detener nuevas escrituras/envíos de ese propósito; revocar permiso del SO cuando aplique. | Distinguir claramente revocar de borrar: si la revocación no borra automáticamente registros existentes, indicarlo y ofrecer el mecanismo de supresión aplicable. |
| Supresión/eliminación | Ejecutar flujo probado de borrado de Firestore/Storage/Auth; datos derivados; encargados/proveedores; réplicas, respaldos y dispositivo. Revisar obligaciones legales de conservación antes de eliminar. | Resumir sistemas cubiertos, fecha, datos no eliminados y motivo legal/operativo; registrar fallos/reintentos. No afirmar purga de copias/proveedores sin evidencia. |
| Objeción o reclamo | Detener temporalmente la operación cuestionada cuando proceda y evaluar su fundamento; involucrar responsable y abogado. | Enviar decisión motivada, cambios adoptados o fundamento de rechazo, e indicar canal para continuar el ejercicio de derechos. |

La tabla de sistemas debe actualizarse al agregar proveedor, región, nueva colección, funcionalidad de IA, reloj o modalidad de pago.

### D. Cierre y evidencia

- Responder dentro del plazo, por lenguaje claro y canal autorizado; pedir una confirmación técnica de entrega solo si es apropiado.
- Guardar folio, tipo de solicitud, fechas, rol responsable, decisión, sistemas consultados, proveedores contactados, resultado y prueba de envío.
- Guardar el mínimo necesario del caso; no copiar diario, payloads de IA o muestras de salud al sistema de tickets. Definir una retención legalmente revisada para el registro de la solicitud.
- Si hay rechazo total/parcial, explicar la razón, el derecho/canal que sigue y qué datos o sistemas quedaron afectados.
- Al menos trimestralmente, revisar solicitudes vencidas, fallos de borrado, recurrencias y modificaciones de proveedores. No usar estos datos para marketing.

## 4. Incidentes de seguridad con datos personales

1. **Recibir y contener:** cualquier integrante escala inmediatamente pérdida, robo, exposición, acceso o uso no autorizado al responsable de seguridad/privacidad. No borrar evidencia, cambiar permisos en masa ni publicar detalles sin coordinar la contención.
2. **Abrir registro:** folio, detección, cuándo se informó al área encargada, sistemas/categorías/volumen aproximado, cuentas afectadas, riesgo y acciones; evitar almacenar copias de los datos afectados en el ticket.
3. **Contener e investigar:** revocar credenciales/tokens, limitar acceso, preservar logs, corregir regla/configuración y comprobar que el vector quedó cerrado. Evaluar por separado Firebase, Vercel, Groq, SDKs, analítica, correo, dispositivos/backups y encargados.
4. **Escalar en el día:** responsable, privacidad, seguridad, dirección y asesoría colombiana deciden aplicabilidad y notificaciones; el análisis no debe retrasar contención.
5. **Evaluar reporte a SIC:** la orientación pública de SIC indica reporte de incidentes dentro de 15 días hábiles desde que se detectan y se ponen en conocimiento del área/persona encargada; el canal varía si el responsable está obligado a RNBD o no. Confirmar el texto y canal vigentes con asesoría antes de operar y antes de cada incidente. Fuente: [SIC — obligación de reporte de incidentes](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/cumplimiento-de-la-obligacion-del-reporte-de-incidentes-de-seguridad).
6. **Evaluar comunicación al titular:** decidir y documentar si la ley, la autoridad, contratos, el nivel de riesgo o el deber de transparencia requiere contacto; no importar automáticamente un plazo extranjero que no aplique.
7. **Cerrar y prevenir repetición:** informe de causa, cronología, decisiones, reportes, notificaciones, costo/impacto, acciones correctivas, responsable y fecha. Probar la corrección y actualizar el modelo de amenazas.

## 5. Controles de calendario y capacidad

- La plataforma de tickets debe abrir un reloj legal por solicitud y alertas internas a 50%, 75% y 90% del término; asignar suplente para ausencias.
- Objetivo interno sugerido: resolver antes de 10 días hábiles consultas y 15 días hábiles reclamos, sin usar las extensiones legales como SLA normal.
- Si un proveedor no contesta a tiempo, el responsable de Mood Log sigue siendo dueño de la atención al titular; definir en contrato el plazo interno de cooperación menor que el plazo legal disponible.
- Nunca confirmar eliminación total hasta haber conciliado colecciones, subcolecciones, Storage, Analytics, hosting, proveedor IA, respaldos, cache/local storage y wearable.
- La persona responsable conserva el control de acceso a folios; aplicar MFA, mínimo privilegio, auditoría y retención mínima de tickets.

## 6. Prueba de mesa previa al lanzamiento

Hacer un ensayo con dos cuentas ficticias y proveedores sandbox, sin datos reales:

1. una consulta de acceso sobre una cuenta activa;
2. un reclamo incompleto recibido por un canal incorrecto;
3. una revocación de autorización IA y otra de datos sensibles;
4. una solicitud de supresión con un artefacto en Storage y fallo inicial del proveedor;
5. un token/cuenta de prueba expuesto en un log simulado;
6. una decisión de reporte SIC que distinga obligación RNBD y canal aplicable.

**Salida:** cada solicitud tiene folio, dueño, fecha límite, respuesta segura y evidencia; los plazos se calculan correctamente; los proveedores de prueba reciben la solicitud; no se confunde revocación con borrado; incidente puede contenerse y el análisis de reporte ocurre a tiempo. El responsable y abogado firman el acta. No usar una prueba local de API para afirmar que un proveedor remoto fue borrado.
