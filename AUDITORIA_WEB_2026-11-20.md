# Revisión técnica de Mood Log — 20 de noviembre de 2026

## Alcance y límites
Revisión del código de autenticación, navegación protegida, confirmación de edad, APIs de IA/consentimientos/exportación/eliminación, reglas de Firestore y Storage, dependencias de producción y presentación pública móvil. Se ejecutaron pruebas automatizadas y se inspeccionaron inicio y acceso en navegador. No equivale a una prueba de penetración ni certifica ausencia de vulnerabilidades. No se accedió a registros personales ni se completaron declaraciones del usuario.

## Hallazgos corregidos
| Prioridad | Hallazgo | Corrección |
| --- | --- | --- |
| Alta | Avisos emitidos con toast no tenían un componente visible en la aplicación. Los errores parecían botones sin respuesta. | Toaster global y error persistente en confirmación de edad. |
| Alta | Respuestas asíncronas de perfiles anteriores podían actualizar el estado después de cambiar de cuenta. | Cada respuesta verifica la revisión de autenticación antes de modificar el estado. |
| Alta | Reintentar aceptación legal escribía una declaración de edad por su cuenta. | Se exige una declaración válida existente; el reintento solo registra aceptación legal. |
| Alta | Storage permitía nuevas subidas durante eliminación de la cuenta. | Se bloquean creaciones y actualizaciones mientras existe la solicitud de eliminación. |
| Media | La ruta de edad recientemente añadida no estaba en el servidor local de emuladores. | Ruta incorporada y cobertura de su puente local. |
| Media | Solicitudes de IA y edad podían mantener la interfaz esperando indefinidamente. | Límites de espera del cliente; se conserva el límite del servidor de IA. |
| Media | Respuesta JSON nula del servicio de edad causaba un error de acceso a propiedades. | Validación de respuesta antes de leerla. |
| Media | Restricción de almacenamiento del navegador podía impedir cargar o cambiar el tema. | Persistencia opcional; el tema sigue funcionando durante la sesión. |
| Media | Panel de notificaciones podía salirse del ancho móvil y sus botones no tenían nombre accesible. | Posición adaptada a móvil y etiquetas accesibles. |
| Baja | Exportación mostraba detalles internos innecesarios. | Texto más corto conservando las exclusiones reales. |
| Baja | Formularios móviles podían activar zoom; transiciones poco uniformes. | Texto de formularios de 16 px en móvil y entrada de 180 ms, desactivada con movimiento reducido. |

## Controles revisados
- Las APIs verifican identidad con Firebase y usan el UID autenticado; exportación y borrado no confían en un UID enviado en el cuerpo.
- IA exige consentimiento, edad y límites compartidos; los análisis de registros exigen consentimiento sensible. No se enviaron registros reales durante la revisión.
- Pruebas de aislamiento de datos, límites de tamaños/tipos, roles, cuotas, borrado concurrente y consentimiento.
- No aparecieron archivos .env o keystores en el inventario de archivos versionados consultado. Esto no es una auditoría del historial Git completo.
- npm audit --omit=dev: cero vulnerabilidades conocidas reportadas en esta ejecución. Esto no cubre fallos propios de la aplicación.

## Validación
- TypeScript: correcto.
- API: 60 pruebas existentes y 3 nuevas para la ruta de edad correctas.
- Unidad: 14 correctas. Configuración: 10 correctas.
- Seguridad Firebase: 31 pruebas correctas, incluida denegación de subidas durante eliminación.
- Navegador público: inicio a 375 px y acceso a 320 px sin desbordamiento horizontal; acceso con etiquetas y autocompletado de credenciales. Inicio sin errores de consola observados.
- Compilación de producción: se valida mediante el despliegue de Vercel; el entorno local utiliza emuladores deliberadamente.

## Pendientes que requieren evidencia adicional
- Recorrido completo autenticado de guardar/editar/borrar diario y ánimo, exportación y uso de IA con datos sintéticos. No se debe presentar el chequeo anónimo de una API como prueba de ese recorrido.
- CSP está en modo Report-Only: informa, pero no bloquea. Pasar a modo restrictivo requiere comprobar Google/Firebase y las rutas autenticadas para no bloquear el acceso.
- Confirmar ajustes reales de retención de Groq, plazos de proveedores y completar los borradores de privacidad con revisión competente antes de ampliar el lanzamiento.
- Las escrituras de perfil completo siguen validando el esquema actual: conviene revisar y migrar perfiles antiguos con campos incompatibles de forma controlada, sin borrar datos históricos.
- Diseño de las pantallas privadas: revisar con registros vacíos y abundantes, teclado móvil, lector de pantalla y zoom. Las mejoras de CSS no sustituyen esa revisión.
- Relojes físicos, App Store y Google Play quedan fuera de este despliegue web.

## Bloqueo de infraestructura confirmado
Firebase CLI rechazó el despliegue de Storage porque el servicio no está configurado en mood-log-app-01. La regla está probada y versionada, pero NO publicada. Las funciones que requieran adjuntos necesitan habilitar y configurar Storage; no se activó facturación ni se crearon recursos de pago.
