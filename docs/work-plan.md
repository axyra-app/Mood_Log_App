# Plan de trabajo: consolidación de Mood Log

> Para la hoja de ruta de comercialización, privacidad/legal, IA y wearables a nivel de producto, consulta el [plan integral de mejora y lanzamiento](plan-integral-mejora-lanzamiento.md). Este documento conserva el seguimiento de la consolidación técnica ya iniciada.

**Estado:** en curso
**Actualizado:** 20 de noviembre de 2026
**Objetivo:** estabilizar las capacidades centrales antes de iniciar integraciones biométricas.

## Principios de ejecución

- Mantener Firebase como arquitectura actual durante esta consolidación; no se aprueba una migración ni un segundo backend.
- Usar un proyecto Firebase aislado o emuladores para validar escrituras y reglas. No usar datos personales reales.
- No desplegar reglas ni cambiar configuración remota sin confirmar el proyecto destino y obtener aprobación explícita.
- Cerrar decisiones de producto y datos antes de imponerlas en tipos, documentos o índices.
- Mantener cada etapa revisable, con validación reproducible y criterios de salida.
- Mantener la carga de imágenes/archivos como capacidad futura; no integrar Supabase Storage hasta decidir proveedor, políticas y ciclo de eliminación.
- Posponer importación real de salud, cámara, IA combinada, comparaciones sociales y correlaciones hasta superar los gates de este plan.

## Etapas y dependencias

| Etapa | Trabajo | Entregable / criterio de salida | Estado |
|---|---|---|---|
| 0. Alcance y restricciones | Delimitar el núcleo: check-in manual, diario, historial y resúmenes descriptivos. Registrar lo que se pospone y conservar Firebase como arquitectura existente, sin aprobar migración. | Alcance reflejado en la documentación de producto y biometría; decisiones pendientes explícitas. | **Completada** |
| 1. Seguridad de Firebase | Auditar reglas de Firestore y Storage frente a llamadores activos. Crear pruebas de autorización para propietario, otra cuenta y usuario anónimo; corregir brechas confirmadas sin romper flujos; revisar CI y dependencias de producción. | Pruebas negativas y positivas reproducibles en emulador; reglas locales alineadas con las operaciones; dependencias de producción sin avisos conocidos; ningún despliegue implícito. | **En curso** |
| 2. Modelo canónico | Confirmar escala de ánimo, frecuencia de entradas por día, zona horaria/fecha, campos del diario y procedencia por observación. Comparar con los documentos y servicios existentes. | Decisiones registradas y estrategia de compatibilidad/migración propuesta antes de cambiar esquema. | **Parcial** |
| 3. Flujos centrales | Probar creación, consulta, edición y borrado de ánimo y diario, además de historial, formularios, estados vacíos, fallos y uso móvil. | Recorridos completos en entorno aislado; datos y estados consistentes tras recarga. | **En curso** |
| 4. Calidad automatizada | Incorporar typecheck y pruebas pertinentes al flujo automatizado; ejecutar build y dejar comandos y resultados documentados. | CI valida reglas, API, índices, métricas, tipos, auditoría de producción y build; fallos visibles y reproducibles. | **Completada** |
| 5. Descubrimiento biométrico | Prototipo web con fixtures y módulo nativo Wear OS de lectura puntual de pulso, sin persistencia ni red. Para la siguiente etapa longitudinal ya se eligió persistencia privada solo en el reloj; el ADR-BIO-014 propone archivo cifrado y retención inicial de 90 días, sujeto a revisión jurídica y aprobación antes de cualquier dato real. No hay sincronización ni piloto real aprobados. | Vista y normalizador sintéticos; fuente nativa con check-in y medición puntual iniciada por usuario. Antes de persistir: probar en emulador/relojes, separar responsabilidades de la Activity, aprobar permisos/consentimiento, cifrado, respaldo, retención, eliminación y derechos de acceso/exportación local, además de evaluación legal/metodológica. | **Parcial** — el build local `:app:assembleDebug` pasó el 20-11-2026 tras instalar SDK Platform 36, Build Tools 36.0.0/35.0.0 y Platform-tools 37.0.3; se generó APK debug. No se ha probado en emulador ni dispositivo y el paso nuevo aún no se ha observado en CI remota. El test JVM puro pasó 7/7 en una ejecución anterior. Las etapas 1–4 siguen abiertas |

## Trabajo activo: etapa 1

La revisión inicial identificó brechas y ya hay una primera corrección local cubierta por el emulador:

- El alta de perfiles ya restringe el rol a ausente o `user`; el dueño no puede cambiar el rol existente.
- Las reglas de actualización de colecciones con `userId` impiden cambiar el propietario.
- `statistics` permite crear documentos propios, con pruebas de aislamiento.
- Colecciones heredadas sin regla explícita permanecen denegadas por defecto. Se retiró el inicializador de plantillas sin llamadores que intentaba escribir en colecciones solo de lectura; el servicio activo usa plantillas locales de respaldo.
- `firebase/storage.rules` ahora restringe por UID, valida tipo y tamaño; la subida del cliente comprueba sesión, MIME, límite y nombres no controlados. Los enlaces `getDownloadURL` son bearer links y no deben tratarse como privados solo por las reglas.
- La revisión anterior había visto 20 alertas de producción. `npm audit fix` aplicó solo actualizaciones compatibles en el lockfile y el audit anterior reportó 0 vulnerabilidades. Las 12 alertas moderadas del toolchain se cerraron con una resolución de `glob@14.0.6` y `minimatch@11.0.9` por override, sin bajar Firebase CLI. Se verificaron emuladores Firestore/Storage (26/26), build de Vite/PWA, typecheck y suites API/configuración/unidad y verificador del manifest/iconos PWA tras un `npm ci` limpio. El workflow ahora audita todas las dependencias. Mantener la suite de emuladores y build como validación funcional de esta resolución transitiva al actualizar herramientas.

La suite de reglas contiene 29 pruebas e incluye los gates de edad y aceptación legal, propietario/Storage y validaciones de datos, además de la prevención de escrituras IA después de borrar la cuenta. En esta revisión `npm run test:rules` pasó 29/29 en emuladores demo con JDK 21; los archivos de test se serializan para evitar que el test Admin limpie/emita datos a la vez que la suite de reglas. Incluye transacciones Admin contra Firestore Emulator para aceptación/consentimiento y para comprobar que no se recreen datos de IA tras eliminar el perfil y la marca de borrado. `npm run test:api` pasó 58/58; `npm run test:config` pasó 9/9 y la suite unitaria 14/14. También pasaron typecheck, build/PWA y `npm audit --audit-level=low` (0 vulnerabilidades). El build usa variables Firebase ficticias y conserva una advertencia de importación dinámica/estática de Firebase. Se retiró una expectativa CSP obsoleta que exigía permitir Postimg, host ya ausente del sitio. El workflow actual ejecuta auditoría completa, pero debe repetirse en CI con el estado actual. El propietario confirmó que publicó reglas de Firestore anteriores en `mood-log-app-01`; las reglas modificadas actuales no están desplegadas ni verificadas allí. Las reglas de Storage nuevas usan `firestore.get()`, por lo que debe habilitarse la conexión Firestore/Storage en el proyecto destino y comprobarse el bucket antes del despliegue. La etapa sigue en curso: falta probar manualmente recorridos activos y decidir qué flujos heredados conservar. Una colección sin reglas explícitas no se habilitará automáticamente; primero se decide si el flujo sigue dentro del producto. La carga de fotos/archivos permanece fuera de la UI.

### Inventario para comercialización y privacidad

Se creó el [plan integral de mejora y lanzamiento](plan-integral-mejora-lanzamiento.md), la [matriz estática de datos/proveedores](privacy/inventario-y-trazabilidad-de-datos.md) y el [diseño del registro de aceptación legal](privacy/consent-ledger-design.md). Analytics está apagado por defecto con opt-in versionado local. Privacy/Terms siguen como borradores. ACT-11 tiene implementación local parcial: eventos backend idempotentes, reintento en registro, renovación de documentos vigentes para cuentas existentes, gates en rutas e IA, autorización separada y revocable para almacenar autoinformes, marca verificada por reglas, propietario, exportación y borrado. Se configuró un recorrido local con Firebase Auth/Firestore/Storage Emulator, proxy API y una barrera Admin que solo arranca con proyecto `demo-mood-log-local` y hosts loopback exactos. Una cuenta sintética de Auth Emulator verificó su token y alcanzó el gate de edad de la API legal sin aceptar términos. En la revisión actual pasaron `typecheck`, API 58/58, config 10/10, unidad 14/14, reglas 29/29 y build/PWA. El scaffold Wear OS muestra autodeclaración 18+ local versionada y revocable y eventos locales mínimos por intento; no guarda medidas. El 20-11-2026 `:app:assembleDebug` pasó y generó el APK; no se ha ejecutado en emulador ni reloj. Faltan recorrido de aceptación integrado desde UI, errores de red y staging, validación en reloj, además de aprobación jurídica. P0 restantes: determinar con asesoría si el tratamiento del operador de Mood Log está sujeto a Ley 1581 y si es aplicable la excepción de ámbito exclusivamente personal/doméstico; resolver autorización y ejercicio de derechos sobre registros que existirían solo en el reloj; decidir retención final, exportación/borrado local y explicar el rol del responsable/contacto sin asumir cuenta ni sincronización; determinar clasificación INVIMA por uso previsto; validar Analytics en staging; revisar consentimiento IA/18+ con asesoría; verificar borrado y configuración ZDR/proveedores en la app web. No convertir el log local en evento Firebase como atajo: la etapa del reloj no tiene cuenta ni transferencia aprobada. Los cambios locales no prueban comportamiento desplegado.

El fundador definió Colombia y una primera versión solo para mayores de 18 años. Se añadió localmente una autodeclaración 18+ para registro por correo y Google, pantalla de confirmación para cuentas sin declaración vigente, bloqueo de rutas y de IA, y condiciones de acceso en reglas locales de Firestore y Storage para datos personales. Las funciones de IA requieren la versión `co-ai-groq-v3-retention-and-location`; la copia informa datos potencialmente sensibles, retención pública de hasta 30 días, ubicación de datos retenidos en EE. UU. y que ZDR no ha sido verificado para la organización. El backend registra UID, tarea, versión y hora, sin almacenar el contenido. Exportación/eliminación cubren esos eventos. La autodeclaración no comprueba edad real y el evento no demuestra por sí solo que la persona leyó o aceptó ni que el consentimiento cumpla los requisitos legales. Además, se implementó autorización separada para almacenar registros de ánimo/diario, revocable sin borrado automático. Falta revisión jurídica de textos y métodos, probar todos los recorridos y verificar el despliegue antes de publicar.

**Recorrido local parcial (20 de noviembre):** Home y registro cargan contra Vite local. En el formulario, los controles de aceptación de términos/privacidad y declaración 18+ aparecen desmarcados y tanto la creación de cuenta como Google permanecen deshabilitados. Se completaron los campos con valores ficticios y el alta siguió bloqueada sin marcar esos controles. Luego se creó una identidad sintética directamente en Auth Emulator y se inició sesión desde la UI: la app redirigió a `/age-confirmation`, mostró la casilla 18+ vacía y mantuvo `Continuar` deshabilitado. No se confirmó edad ni se aceptaron términos. El paso siguiente —aceptación general, consentimiento de almacenamiento sensible, autorización IA y acceso a rutas autenticadas— sigue sin verificación UI. Firebase Emulators, el puente API local y Vite se iniciaron solo en loopback; no se llamó a servicios remotos. Se apagaron al terminar, por lo que la identidad temporal dejó de estar disponible. Para repetir, iniciar Emulator Suite con JDK 21+ (la máquina tiene JDK 21 instalado, aunque `java` por defecto resuelve a JDK 17); esta dependencia se añadió a la guía de desarrollo.

## Decisiones que se deben cerrar en la etapa 2

1. **Escala:** decisión confirmada: usar 1–10, consistente con el registro activo. No convertir ni borrar registros históricos.
2. **Frecuencia diaria:** el flujo actual permite varios registros por día; mantenerlo y no imponer unicidad por `(userId, fecha)` hasta que producto decida lo contrario. Las rachas actuales usan días calendario locales del dispositivo; una zona horaria de cuenta sigue pendiente.
3. **Procedencia:** fuente y calidad pertenecen a cada observación de una métrica, no a un registro compuesto de ánimo que puede mezclar entradas manuales e importadas.
4. **Backend:** conservar Firebase durante las etapas iniciales. Una migración requiere decisión, análisis, plan de reversión y aprobación aparte.
5. **Zona horaria:** sigue pendiente decidir si las rachas e informes usarán la zona del dispositivo o una zona guardada en el perfil; no se cambia el esquema hasta cerrar esta decisión.

## Criterios de cierre del plan

- Las operaciones del núcleo están probadas con propietario, otra cuenta y sesión anónima en un entorno aislado.
- Modelo y decisiones de producto están documentados y reflejados consistentemente en tipos, servicios, reglas e interfaz.
- Flujos CRUD, historial y estados de error/vacío pasan sus pruebas.
- Typecheck, pruebas automatizadas y build pasan en local y en CI.
- La siguiente etapa biométrica comienza con datos sintéticos; cualquier uso de muestras reales o persistencia remota requiere autorización y controles independientes.

## Referencias

- [Análisis técnico del proyecto](analysis/project-analysis.md)
- [Visión de producto y hoja de ruta](product/vision-and-roadmap.md)
- [Visión y arquitectura del producto](product/vision-and-architecture.md)
- [Arquitectura](architecture/overview.md)
- [Datos y Firestore](firebase/database-schema.md)
- [Seguridad y privacidad](firebase/security-and-privacy.md)
- [Especificación de contexto biométrico](features/biometric-context/README.md)
