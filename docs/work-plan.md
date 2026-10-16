# Plan de trabajo: consolidación de Mood Log

**Estado:** en curso
**Actualizado:** 14 de octubre de 2026
**Objetivo:** estabilizar las capacidades centrales antes de iniciar integraciones biométricas.

## Principios de ejecución

- Mantener Firebase como arquitectura actual durante esta consolidación; no se aprueba una migración ni un segundo backend.
- Usar un proyecto Firebase aislado o emuladores para validar escrituras y reglas. No usar datos personales reales.
- No desplegar reglas ni cambiar configuración remota sin confirmar el proyecto destino y obtener aprobación explícita.
- Cerrar decisiones de producto y datos antes de imponerlas en tipos, documentos o índices.
- Mantener cada etapa revisable, con validación reproducible y criterios de salida.
- Posponer importación real de salud, cámara, IA combinada, comparaciones sociales y correlaciones hasta superar los gates de este plan.

## Etapas y dependencias

| Etapa | Trabajo | Entregable / criterio de salida | Estado |
|---|---|---|---|
| 0. Alcance y restricciones | Delimitar el núcleo: check-in manual, diario, historial y resúmenes descriptivos. Registrar lo que se pospone y conservar Firebase como arquitectura existente, sin aprobar migración. | Alcance reflejado en la documentación de producto y biometría; decisiones pendientes explícitas. | **Completada** |
| 1. Seguridad de Firebase | Auditar reglas de Firestore y Storage frente a llamadores activos. Crear pruebas de autorización para propietario, otra cuenta y usuario anónimo; corregir brechas confirmadas sin romper flujos; revisar CI y dependencias de producción. | Pruebas negativas y positivas reproducibles en emulador; reglas locales alineadas con las operaciones; dependencias de producción sin avisos conocidos; ningún despliegue implícito. | **En curso** |
| 2. Modelo canónico | Confirmar escala de ánimo, frecuencia de entradas por día, zona horaria/fecha, campos del diario y procedencia por observación. Comparar con los documentos y servicios existentes. | Decisiones registradas y estrategia de compatibilidad/migración propuesta antes de cambiar esquema. | **Parcial** |
| 3. Flujos centrales | Probar creación, consulta, edición y borrado de ánimo y diario, además de historial, formularios, estados vacíos, fallos y uso móvil. | Recorridos completos en entorno aislado; datos y estados consistentes tras recarga. | **En curso** |
| 4. Calidad automatizada | Incorporar typecheck y pruebas pertinentes al flujo automatizado; ejecutar build y dejar comandos y resultados documentados. | CI valida tipos y pruebas relevantes, además del build; fallos visibles y reproducibles. | **Parcial** |
| 5. Descubrimiento biométrico | Solo tras completar seguridad/modelo: validar un prototipo con fixtures sintéticos y estudiar importación local iniciada por la persona. | Prueba de concepto con límites, consentimiento, borrado y evaluación documentados; sin ingesta real ni persistencia cloud no aprobada. | Bloqueada por etapas 1–4 |

## Trabajo activo: etapa 1

La revisión inicial identificó brechas y ya hay una primera corrección local cubierta por el emulador:

- El alta de perfiles ya restringe el rol a ausente o `user`; el dueño no puede cambiar el rol existente.
- Las reglas de actualización de colecciones con `userId` impiden cambiar el propietario.
- `statistics` permite crear documentos propios, con pruebas de aislamiento.
- Hay servicios que usan colecciones sin reglas explícitas y algunos flujos de inicialización escriben plantillas aunque las reglas locales solo permiten leerlas.
- `firebase/storage.rules` ahora restringe por UID, valida tipo y tamaño; la subida del cliente comprueba sesión, MIME, límite y nombres no controlados. Los enlaces `getDownloadURL` son bearer links y no deben tratarse como privados solo por las reglas.
- `npm audit --omit=dev` inicialmente reportó 20 avisos de producción. Se actualizaron Firebase 13, React Router 7 y jsPDF 4, y se aplicó un override parcheado de gRPC.

Las pruebas actuales cubren perfiles/roles, acceso propietario/otra cuenta/anónimo, transferencia de propietario, creación de estadísticas y Storage con acceso propietario/ajeno/anónimo, MIME y tamaño. CI también ejecuta las pruebas de API, configuración de índices y métricas. En la última verificación local pasaron `npm run test:api`, `npm run test:config`, `npm run test:unit`, `npm run typecheck`, `npm run build` y `npm audit --omit=dev` (0 vulnerabilidades de producción). `npm run test:rules` no pudo ejecutarse localmente porque Java disponible es anterior a 21, requisito de Firebase CLI; ejecutar en CI o con JDK 21 para validar estas reglas. La etapa sigue en curso: falta ampliar cobertura a todas las operaciones activas y decidir qué flujos heredados conservar. Una colección sin reglas explícitas no se habilitará automáticamente; primero se decide si el flujo sigue dentro del producto. El audit completo de dependencias de desarrollo no se volvió a ejecutar en esta revisión. No se desplegaron reglas remotas.

## Decisiones que se deben cerrar en la etapa 2

1. **Escala:** decisión confirmada: usar 1–10, consistente con el registro activo. No convertir ni borrar registros históricos.
2. **Frecuencia diaria:** el flujo actual permite varios registros por día; mantenerlo y no imponer unicidad por `(userId, fecha)` hasta que producto decida lo contrario. Las rachas actuales usan días calendario locales del dispositivo; una zona horaria de cuenta sigue pendiente.
3. **Procedencia:** fuente y calidad pertenecen a cada observación de una métrica, no a un registro compuesto de ánimo que puede mezclar entradas manuales e importadas.
4. **Backend:** conservar Firebase durante las etapas iniciales. Una migración requiere decisión, análisis, plan de reversión y aprobación aparte.

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
