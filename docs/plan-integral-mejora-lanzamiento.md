# Plan integral de mejora y lanzamiento de Mood Log

**Estado:** plan de ejecución propuesto; el producto todavía no está certificado para lanzamiento comercial ni para procesar biometría real.  
**Actualizado:** 20 de noviembre de 2026  
**Objetivo:** llevar Mood Log desde la aplicación web actual hasta un producto de bienestar personal, comercializable, accesible, seguro y preparado para integrar datos voluntarios de relojes inteligentes.  
**Mercado inicial confirmado por el fundador:** Colombia; primera salida dirigida a personas mayores de 18 años. Una expansión posterior a otras edades o países requiere evaluación legal, privacidad y seguridad propia antes de habilitarla.
**Prioridad de reloj indicada por el fundador:** Wear OS/Android. La primera prueba será una app Mood Log directamente en el reloj Wear OS que registra un check-in manual de ánimo junto con una lectura de pulso iniciada por la persona. Health Connect en el teléfono podrá complementar la experiencia con datos históricos de otras apps; no reemplaza el objetivo de ejecutar Mood Log en el reloj.

> Este plan organiza el trabajo técnico, de producto, privacidad y cumplimiento. No es una opinión jurídica ni certifica cumplimiento. La clasificación regulatoria depende del propósito previsto, las funciones y las afirmaciones de producto en cada país; debe revisarla un abogado local y, cuando corresponda, un especialista regulatorio antes de recopilar datos reales o abrir ventas.

## 1. Decisión de producto que guía el plan

Mood Log debe ayudar a una persona a registrar su propio ánimo, revisar sus experiencias y explorar datos fisiológicos autorizados como contexto personal. El autorreporte sigue siendo la fuente de referencia para el ánimo. Un pulso o una métrica de variabilidad cardíaca no se presentarán como una lectura objetiva de felicidad, ansiedad, estrés, depresión o crisis.

Esta cautela también concuerda con evidencia longitudinal: se han observado asociaciones personales entre métricas de wearables y ánimo autoinformado, pero su dirección varía entre individuos y en una cohorte amplia hubo participantes sin asociaciones significativas. Otro estudio predictivo pequeño seleccionó solo siete de veinte estudiantes para modelar por disponibilidad de datos. Estos resultados justifican investigación personalizada, no un reclamo de precisión o generalización para Mood Log. El resumen metodológico, implicaciones del producto y referencias están en [metodología de análisis biométrico](features/biometric-context/analysis-methodology.md).

La IA que ya está disponible para consultas básicas se conserva como capacidad de autorreflexión opcional. Su presencia no convierte el producto en atención clínica ni autoriza a enviar diario o biometría a un proveedor. Cada tarea de IA debe tener su propio propósito, consentimiento, minimización de datos, límites, monitoreo y revisión.

La primera experiencia comercial debe poder utilizarse sin conectar un reloj, sin aceptar IA y sin compartir datos con amigos. El uso social no debe exponer registros individuales ni comparar perfiles de salud.

## 2. Situación inicial del repositorio

La revisión del código y los documentos disponibles indica que:

- La app es una SPA de React, TypeScript y Vite, con Firebase Authentication, Firestore y Storage; una función serverless en `frontend/api/ai.ts` encamina las tareas de IA a Groq.
- Hay pantallas de cuenta, registro de ánimo, diario, estadísticas, reportes, chat, perfil y ajustes. Tener una pantalla no demuestra que todo el recorrido esté listo para venderse.
- La escala de ánimo documentada y usada por el flujo principal es 1–10; el producto permite varios registros por día.
- El diario se guarda como texto legible en Firestore. No existe cifrado de extremo a extremo implementado.
- La PWA cachea recursos, pero no implementa sincronización offline completa.
- La configuración de Firebase cliente se separó a variables `VITE_FIREBASE_*`; la app falla explícitamente si falta una variable requerida y CI usa identificadores ficticios para builds de validación. Cada Preview/Production todavía debe configurarse y verificarse por separado en Vercel.
- La app web no tiene integración funcional con HealthKit, Health Connect, Bluetooth, Capacitor o watchOS. Se añadió un módulo fuente nativo Wear OS con lectura puntual y check-in visible. El 20 de noviembre de 2026 se instalaron Platform 36, Build Tools 36.0.0, Platform-tools 37.0.3 y se configuraron `ANDROID_HOME`, `ANDROID_SDK_ROOT` y el PATH del usuario. `:app:assembleDebug` produjo un APK local tras declarar Guava Android directamente para el tipo público `ListenableFuture` que usa el cliente Health Services. El build emitió avisos no fatales de versión XML del SDK y de Gradle; el APK no se instaló ni probó en emulador/reloj. La sincronización al teléfono/cuenta queda para una etapa posterior.
- Las reglas de Firebase tienen pruebas locales, pero falta comprobar los recorridos completos en un entorno aislado con usuarios distintos y verificar de manera independiente la configuración desplegada.
- El repositorio ya contiene una especificación biométrica útil. El fundador delegó la decisión de almacenamiento inicial y se eligió persistencia privada local solo en el reloj para una siguiente iteración longitudinal; no está implementada. Retención, cifrado, exportación y borrado siguen pendientes. Plataformas complementarias y método analítico continúan abiertos; cualquier uso con participantes depende de revisión de privacidad y consolidación del producto base.
- La función de IA existente tiene autenticación con revocación de sesión, validación de entradas y cuota transaccional por UID de 40 solicitudes por día de Colombia y 8 por minuto. Esto reduce abusos por cuenta, pero no limita tráfico distribuido desde múltiples cuentas; falta control de edge/infraestructura y revisar retención/procesamiento del proveedor, calidad de respuestas y uso seguro en producción.
- Los flujos de IA ahora requieren una versión explícita de consentimiento; el backend registra por tarea UID, versión y hora, sin guardar el contenido. Antes de crear el evento de aceptación por tarea y la marca de solicitud activa, la transacción revalida la elegibilidad, la aceptación legal y, para análisis de registros, la autorización sensible vigente junto con su evento. El evento se exporta y elimina con la cuenta. Deben probarse las carreras de revocación/eliminación en Firestore Emulator y todos los recorridos; revisarse jurídicamente los textos y la evidencia. El registro del servidor no prueba por sí solo una interacción humana.
- El gate 18+ ahora tiene una implementación local de autodeclaración con versión y fecha: cubre registro por correo/Google, reingreso de cuentas sin declaración, rutas protegidas y endpoint de IA; reglas locales restringen acceso a datos personales del producto. No verifica la edad real y requiere revisión jurídica y validación técnica antes de considerarse listo para lanzamiento.
- Se añadió autorización independiente y revocable para almacenar registros de ánimo/diario, con pantalla dedicada, evento y marcador administrados por servidor, bloqueo de escritura en reglas Firebase, registro en exportación/borrado y gate para análisis IA de esas tareas. Los endpoints de aceptación legal y autorización sensible ahora vuelven a comprobar dentro de su transacción el perfil, la mayoría de edad y el bloqueo de eliminación, y el segundo verifica además el evento legal vigente; esto reduce carreras entre esos cambios de cuenta. La protección todavía no se ha ejercitado en Firestore Emulator. El texto/versionado son borradores, la interfaz todavía no tiene recorrido integrado validado y la autorización no cubre sensores ni Wear OS.

Fuentes de trabajo en el repositorio: [análisis técnico](analysis/project-analysis.md), [plan de trabajo vigente](work-plan.md), [arquitectura](architecture/overview.md), [seguridad y privacidad](firebase/security-and-privacy.md), [modelo de datos](firebase/database-schema.md) y el paquete [biométrico](features/biometric-context/README.md).

La [comparación competitiva inicial](product/analisis-competitivo-inicial.md) resume capacidades declaradas por ocho referentes internacionales de ánimo, salud y Wear OS, e identifica similitudes, límites de privacidad y claims no verificados. Es un benchmark documental: no implica disponibilidad, demanda o precio comprobados en Colombia ni sustituye la validación con adultos colombianos.

El inventario trazable de datos y sus hallazgos iniciales está en [inventario y trazabilidad de datos](privacy/inventario-y-trazabilidad-de-datos.md). La [revisión legal para lanzamiento en Colombia](legal/colombia-launch-readiness.md) traduce los riesgos colombianos de datos sensibles, proveedores/transmisiones internacionales, finalidad de wearables/INVIMA y derechos del titular en gates y evidencias. El [procedimiento de derechos e incidentes](legal/colombia-rights-and-incident-runbook.md) convierte los plazos de Ley 1581 y los reportes a SIC en un flujo de operación y prueba de mesa. Estos documentos son evaluaciones estáticas; no acreditan configuración remota ni sustituyen concepto jurídico.

## 3. Resultados que definirán el éxito

1. Una persona puede crear, consultar, editar, exportar y eliminar sus propios registros, con aislamiento probado frente a otras cuentas.
2. La aplicación explica qué recoge, para qué, dónde se procesa, quién lo recibe, cuánto tiempo se conserva y cómo retirar permisos o solicitar eliminación.
3. El núcleo funciona sin sensores y la integración de salud es opcional, granular y revocable.
4. La primera integración de salud muestra medidas con su fuente, unidad, fecha, cobertura y limitaciones, sin convertirlas en un diagnóstico o etiqueta emocional.
5. La IA es una herramienta de reflexión acotada, transparente y separable del diario y de la biometría.
6. Los reclamos comerciales, la política de privacidad, los permisos de plataforma y el comportamiento del producto describen exactamente el mismo tratamiento.
7. Hay evidencias repetibles de pruebas, revisión de seguridad, respuesta a incidentes, soporte y eliminación antes del lanzamiento.

## 4. Reglas de ejecución y puertas de control

- Mantener Firebase como arquitectura de referencia durante la estabilización; cualquier migración requiere decisión, evaluación, plan de reversión y autorización separados.
- No probar con datos emocionales o biométricos reales durante desarrollo. Usar emuladores, fixtures sintéticos y cuentas de prueba hasta cerrar las revisiones correspondientes.
- No hacer despliegues remotos, cambiar reglas de producción ni activar borrado de cuentas como parte de este plan sin el control y autorización adecuados.
- Ninguna fase se considera completada por tener código o una pantalla: requiere evidencia de criterios de salida y documentación actualizada.
- Usar una matriz de trazabilidad entre requisito, flujo, dato, permiso, regla, prueba y política pública.
- Si se añaden menores, investigación académica, atención clínica, empleadores, aseguradoras, publicidad, alertas o recomendaciones sanitarias, detener el alcance afectado y reabrir evaluación de producto, privacidad y regulación.
- Las obligaciones dependen del territorio y del rol de Mood Log frente a sus usuarios y proveedores. Antes de cada mercado debe confirmarse la base legal, la transferencia internacional, los derechos, los plazos y las obligaciones de registro o notificación que apliquen.

## 5. Fases y criterios de salida

Las duraciones son estimaciones de planificación y no compromisos. Cada fase puede abarcar varios sprints según capacidad del equipo.

### Fase 0 — Alinear mercado, usuarios y propósito

**Objetivo:** decidir qué se vende, a quién y bajo qué promesa antes de ampliar el tratamiento de datos.

**Trabajo:**

- Colombia, adultos (18+) como público inicial y Wear OS/Android como plataforma inicial están definidos. El fundador eligió mostrar patrones personales entre pulso y ánimo autoinformado a lo largo del tiempo. No se inferirá ni clasificará el ánimo actual desde una lectura puntual, ni se atribuirá causalidad. El prototipo técnico actual todavía solo muestra una lectura puntual y no calcula patrones. No se procesarán datos reales ni se anunciará esta salida hasta validar método, almacenamiento, consentimiento, proveedores y clasificación regulatoria. También siguen pendientes el modelo comercial y los claims públicos.
- Definir el propósito previsto como bienestar y autorreflexión personal para la primera versión; registrar expresamente las funciones excluidas.
- Tratar a la comunidad universitaria de los fundadores como primer canal de descubrimiento, no como mercado ya validado. Entrevistar a 12–15 adultos colombianos con variedad de edades y hábitos digitales sobre necesidad, frecuencia, confianza, uso del reloj y alternativas actuales. Esta muestra cualitativa descubre problemas; no estima demanda nacional.
- Usar cuotas de cobertura por edad adulta (18–24, 25–34, 35–49, 50+) sin fecha de nacimiento; registrar canal y experiencia de dispositivo en categorías amplias. No iniciar hasta identificar responsable/contacto, entregar aviso para las notas codificadas, fijar acceso/retención/borrado y preparar una ruta humana de seguridad para revelaciones espontáneas; el protocolo de crisis del proyecto no está operativo. No presentar las notas como anónimas ni conservar detalles identificables.
- Probar tareas de usabilidad con un prototipo y datos totalmente sintéticos. No pedir diarios, síntomas, capturas de salud, acceso a cuentas personales ni lecturas del reloj en esta etapa.
- Separar las entrevistas de descubrimiento (12–15 adultos) de las sesiones de usabilidad de reloj (5–8 adultos, con al menos 3 usuarios Wear OS); estas últimas evalúan interacción con datos sintéticos, no compatibilidad física, precisión ni demanda de mercado.
- Comparar en entrevistas tres hipótesis de negocio: núcleo gratuito con funciones opcionales pagas, suscripción y compra única. Presentar tarjetas de precio como investigación, sin cobrar ni pedir datos de contacto; documentar objeciones y quién pagaría, no solo quién dice que la idea gusta.
- Modelar costo por usuario activo y margen bruto con escenarios de uso de Firebase, Vercel, Groq, soporte y tiendas/dispositivos. Mantener la IA con cuotas y presupuesto; no usar anuncios dirigidos ni venta de datos emocionales/biométricos como fuente de ingresos.
- Evaluar canales de adquisición de bajo costo —comunidades universitarias, referidos voluntarios y contenido educativo— con páginas/prototipos que no recolecten diarios ni datos de salud. Si se recopilan correos para una lista de espera, definir aviso, finalidad, base, retención y consentimiento separados antes de activarla.
- Separar claramente el producto comercial de cualquier estudio académico. Si hay investigación con participantes o publicación, consultar al comité de ética de la universidad y al asesor jurídico antes de reclutar o analizar datos.
- Elaborar inventario de datos y diagrama de flujo para web, Firebase, Vercel, Groq, analítica, correo, soporte y plataformas de salud.

**Entregables:** brief del producto, perfil de usuario, claims permitidos/prohibidos, mapa de datos, mercados y plataformas priorizados, registro de decisiones y riesgos; informe de descubrimiento con hallazgos y limitaciones usando la [guía de entrevistas](product/guia-descubrimiento-usuarios.md); matriz de precios probados; [plantilla del modelo económico](product/plantilla-modelo-economico.md) completada con supuestos editables y presupuesto de IA/infraestructura.

**Puerta de salida:** el equipo puede describir con precisión quién usa el producto, qué problema resuelve, qué información trata y qué no promete; existe evidencia de necesidades repetidas, hipótesis de precio/canal y costo unitario estimado. No tratar un grupo universitario pequeño ni una prueba de precio declarativa como prueba de product-market fit.

### Fase 1 — Cerrar seguridad, datos y recorridos centrales

**Objetivo:** que el núcleo actual sea confiable antes de importar nuevas categorías de información.

**Trabajo:**

- Confirmar un entorno Firebase aislado y separar configuración local, pruebas, staging y producción.
- Auditar cada llamada activa de Firestore/Storage contra sus reglas, índices y esquema. Documentar cuáles módulos heredados siguen en alcance y retirar los demás de manera segura.
- Probar inicio/registro, perfil, CRUD completo de ánimo y diario, reportes, exportación y eliminación de cuenta; incluir usuario propietario, otra cuenta y sesión anónima donde corresponda.
- Consolidar contratos de datos y validación compartida entre tipos, interfaz, servicios, funciones y reglas. Mantener escala 1–10 y datos históricos sin transformación implícita.
- Resolver zona horaria, timestamps, orden, límites, paginación, idempotencia y varios registros diarios.
- Revisar CI: typecheck, reglas con emulador, pruebas de API, datos, servicios y componentes críticos, build, dependencias y análisis estático. Mantener cobertura del comportamiento sensible, no solo cobertura numérica.
- Revisar CSP y cabeceras, CORS, autenticación y autorización de endpoints, límites de abuso, manejo de errores, secreto de servicio y permisos IAM mínimos.
- La API de IA aplica un límite transaccional por UID (40 solicitudes por día calendario de Colombia y 8 por ventana móvil de 60 s) y, en producción, exige límite compartido configurable por scope/proyecto (RPM y una ventana móvil de 24 h), coordinado entre las instancias que compartan scope y Firestore. Si la configuración falta o es inválida, falla de forma cerrada antes de enviar datos al proveedor. El contador global de solicitudes no limita tokens/costo ni tráfico de otras bases o servicios que compartan límites Groq; sus valores todavía deben verificarse y configurarse por proyecto real. La ventana móvil del UID evita ráfagas de borde, mientras los límites compartidos y provider 429 cubren fallas a escala de aplicación/proveedor. Antes de aumentar cupos, probar concurrencia/fallos del contador en staging, agregar política de tokens/presupuesto/pausa, verificar proyectos y techos Groq, y acordar comportamiento si Firestore falla. Groq documenta límites por proyecto sujetos al techo organizacional, y límites ITPM/OTPM de organización; consultar [límites](https://console.groq.com/docs/rate-limits) y [proyectos](https://console.groq.com/docs/projects). Configurar en Groq un spend limit mensual con alertas; confirmar requisitos y demora de la consola, pues no evita todo exceso. Consultar el [modelo económico y el comparativo de cuotas de proveedor](product/plantilla-modelo-economico.md). Configurar controles de edge/IP en el hosting y evaluar Firebase App Check para el endpoint propio. El cliente debe enviar el token y el backend verificarlo; iniciar en monitoreo y hacer cumplir solo tras revisar el tratamiento del proveedor de atestación, dominios, costos, falsos rechazos y aviso de privacidad. Ver [guía de despliegue](development/deployment-guide.md).

**Entregables:** modelo canónico, mapa de operaciones, suite de regresión, informe de autorización, ambientes separados y guía reproducible de despliegue/rollback.

**Puerta de salida:** ningún recorrido de núcleo depende de una colección sin permiso previsto; pruebas de aislamiento pasan; exportar y borrar reflejan exactamente los datos del usuario; staging no apunta a producción.

### Fase 2 — Privacidad, derechos y cumplimiento para Colombia

**Objetivo:** convertir privacidad en controles observables de producto y operación.

**Trabajo:**

- Contratar una revisión jurídica colombiana de Ley 1581 de 2012, Decreto 1074 de 2015 y reglas aplicables al tratamiento de información sensible; definir responsable/encargados, finalidades, base/consentimiento y obligaciones operativas.
- Tratar pulso/HRV asociado a una cuenta o historial personal como información de salud sensible desde el diseño hasta que asesoría confirme la clasificación y el alcance exactos. La Ley 1581 también incluye datos relativos a la salud y biométricos entre los sensibles. Para cualquier piloto, el aviso debe identificar explícitamente datos y finalidad, explicar que suministrarlos es facultativo, obtener autorización previa y explícita, y mantener una alternativa funcional sin wearable; no condicionar actividades al suministro de datos sensibles. La app aún no recolecta estas muestras.
- Solicitar concepto de asesoría regulatoria sobre el uso previsto y las afirmaciones de ánimo/salud antes de publicar. INVIMA indica que una aplicación puede ser dispositivo médico según el uso y finalidad previstos por el fabricante; un descargo de responsabilidad aislado no determina la clasificación. Si el uso previsto o las funciones cambian, volver a evaluar la clasificación y los requisitos de registro con INVIMA.
- Resolver jurídicamente cómo se ofrece el registro de ánimo y diario ante el carácter sensible que puede tener la información emocional. El checkout ya tiene un flujo separado, versionado y revocable para nuevos autoinformes; la copia y la evidencia requieren validación legal, UI integrada y pruebas del entorno antes de su uso comercial. La autorización no debe mezclarse con el envío a IA ni con el consentimiento de wearable. No abrir recolección/comercialización hasta que asesoría apruebe finalidades, alternativa funcional y flujo previo, explícito, informado y facultativo.
- Pedir al abogado que clasifique cada relación internacional como transferencia o transmisión (Firebase, Vercel, Groq y otros proveedores), documente países/roles/contratos y determine el mecanismo aplicable según la normativa y las instrucciones vigentes de la SIC. No inferir cumplimiento a partir del nombre del proveedor o una ubicación comercial.
- Determinar, con asesoría, si aplica inscripción/actualización de bases en el RNBD u otra obligación para la organización concreta; no asumir que aplica ni que no aplica por ser una startup pequeña.
- Preparar aviso de privacidad y autorización informada que identifiquen categorías sensibles, finalidades, carácter opcional, terceros, transferencias, retención, derechos y canal de atención. Guardar evidencia consultable de la versión, fecha, alcance y revocación del consentimiento.
- Separar consentimientos de cuenta, registros de ánimo/diario, IA, lectura de cada categoría de salud, sincronización remota, analítica opcional e investigación. El permiso sensible para ánimo/diario ya tiene gate y evento versionado server-managed; Wear OS guarda de momento solo la respuesta local al aviso de Mood Log por lectura, sin identidad/exportación/sync. Ese historial no registra si Android concedió el permiso ni si hubo lectura. Ambos textos y la evidencia deben revisarse jurídicamente. Mantener disponibles las funciones de cuenta que no requieran datos sensibles y explicar que las funciones de registro no operan sin autorización.
- Definir proceso operativo y UI para consulta, rectificación, actualización, revocación, exportación y supresión; probar borrado total y fallos parciales, incluidos proveedores, índices, logs y copias según sus límites reales.
- Revisar contratos, términos, ubicación, subencargados, retención y transferencias internacionales de Firebase, Vercel, Groq y analítica; limitar el envío y registrar las instrucciones a encargados.
- Establecer calendario de retención por tipo de dato, política de respaldos, eliminación verificable, respuesta a incidentes y canal de consultas/reclamos.
- Revisar con asesoría colombiana la autodeclaración 18+ ya implementada, decidir si es suficiente o si hace falta un método proporcional adicional, y validar texto, evidencia, cuentas existentes y vías de acceso. No asumir que una casilla equivale a verificación suficiente; evitar recopilar fecha completa de nacimiento salvo necesidad jurídica/operativa demostrada. Mantener a menores fuera hasta una fase y evaluación separadas.
- Comprobar en emulador que las reglas bloquean lectura y escritura antes de la declaración, permiten guardar la declaración y mantienen los recorridos legítimos; comprobar también endpoint de IA y reglas/backend del entorno de lanzamiento.

**Entregables:** matriz legal por flujo/territorio, registro de tratamientos, política pública, textos de consentimiento, contratos revisados, calendario de retención, procedimiento de derechos y plan de incidentes.

**Puerta de salida:** abogado responsable documenta jurisdicción, rol, obligaciones y textos aprobados; cada uso sensible se corresponde con un consentimiento y una función implementados; no se lanza sin mecanismo probado de derechos y eliminación.

**Fuentes oficiales de referencia (consultadas el 20-11-2026, no sustituyen asesoría):** [Ley 1581 de 2012, SIC](https://sedeelectronica.sic.gov.co/transparencia/normativa/ley-estatutaria-1581-de-2012), [Decreto 1377 de 2013](https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646), [SIC: datos de salud como sensibles](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/tratamiento-de-datos-sensibles-relativos-la-salud), [MinSalud: Resolución 1644 de 2026, que derogó la 2654 de 2019](https://www.minsalud.gov.co/Comunicaciones/noticias/2026/Paginas/colombia-da-un-salto-historico-en-telesalud-y-telemedicina-el-ministerio-de-salud-expide-una-reglamentacion-mas-moderna.aspx), [texto compilado de la Resolución 1644 de 2026](https://normativa.colpensiones.gov.co/compilacion/docs/resolucion_minsaludps_1644_2026.htm), [INVIMA: software y uso previsto](https://observatorios.invima.gov.co/productos-vigilados/dispositivos-medicos/preguntas-frecuentes-dispositivos), [SIC: transferencias internacionales](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/alcance-de-la-circular-002-de-2025-sobre-transferencias-internacionales-de-datos) y [SIC: obligación de RNBD](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/cuales-personas-estan-obligadas-realizar-el-registro-de-bases-de-datos-personales-en-el-rnbd). La obligación del RNBD y el mecanismo de circulación/transmisión dependen de la entidad, rol, activos, destinatarios y reglas vigentes; el asesor debe confirmar aplicabilidad al caso de Mood Log. La Resolución 1644 aplica a actividades de telesalud y servicios de telemedicina en el sistema de salud; no se concluye que aplique automáticamente a toda app de bienestar. Abogado colombiano debe decidir alcance según el uso previsto y la prestación concreta.

**Precisión de vigencia regulatoria verificada el 20-11-2026:** INVIMA explica que una aplicación puede ser dispositivo médico según el uso, la aplicación y la finalidad prevista conforme a los artículos 6 y 7 del Decreto 4725 de 2005; la página oficial del Ministerio aún presenta ese decreto como el marco aplicable y lista la propuesta de nuevo régimen como consulta pública. Por tanto, el proyecto de decreto difundido en PDF no se trata aquí como norma vigente. Esta distinción no determina la clasificación de Mood Log: el uso previsto, claims, funciones y modelo de prestación deben revisarse con asesoría regulatoria antes del lanzamiento. Fuentes: [FAQ oficial de INVIMA sobre software](https://investigacionsanitaria.invima.gov.co/productos-vigilados/dispositivos-medicos/preguntas-frecuentes-dispositivos), [marco de dispositivos médicos del Ministerio de Salud](https://www.minsalud.gov.co/salud/medicamentos-y-tecnologias/Paginas/dispositivos-medicos-equipos-biomedicos.aspx), [Decreto 4725 de 2005 en el normograma de INVIMA](https://normograma.invima.gov.co/normograma/compilacion/docs/decreto_4725_2005.htm).

**Precisión sobre RNBD y datos sensibles:** el concepto publicado por la SIC resume que deben registrar bases las sociedades y entidades sin ánimo de lucro con activos totales superiores a 100.000 UVT y las personas jurídicas públicas. No quedar sujeto a esa inscripción no exime de las obligaciones sustantivas de Ley 1581, como autorización cuando aplique, políticas, gestión integral, atención de consultas/reclamos y seguridad. La obligación de Mood Log depende de la persona jurídica, activos y rol reales; confirmar con abogado y contador antes de operar. Fuente: [SIC, personas obligadas a registrar bases en el RNBD](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/cuales-personas-estan-obligadas-realizar-el-registro-de-bases-de-datos-en-el-rnbd).

### Fase 3 — Hacer el producto base comercial y accesible

**Objetivo:** completar experiencia y confianza, no solo la capacidad biométrica.

**Trabajo:**

- Validar navegación y formularios en móvil; revisar accesibilidad de teclado, lector de pantalla, contraste, foco, movimiento y tamaños táctiles.
- Revisar mensajes de error, estados sin conexión, guardado, espera, carga, datos incompletos y permiso denegado.
- Crear ajustes de privacidad claros, sesión/dispositivos, exportación y eliminación, configuración de notificaciones y explicación de qué es local o remoto.
- Revisar calidad del historial y reportes; mostrar tamaños de muestra, períodos y límites y evitar rachas o métricas que presionen a las personas.
- Añadir canal de soporte, preguntas frecuentes, proceso de contacto y versión/historial de políticas.
- Medir telemetría de confiabilidad agregada y minimizada; nunca enviar notas, valores fisiológicos, mensajes o texto de error.

**Entregables:** recorridos validados en dispositivos acordados, revisión de accesibilidad, guía de usuario, soporte y analítica minimizada.

**Puerta de salida:** usuarios de prueba completan los recorridos y entienden guardado, privacidad, IA y eliminación sin acompañamiento técnico.

### Fase 4 — IA útil, opcional y gobernada

**Objetivo:** conservar la IA existente para consultas básicas, mejorando su control sin convertirla en evaluador de salud.

**Trabajo:**

- Inventariar todas las tareas de IA y qué payloads envía hoy el cliente. La función actual admite chat, análisis de diario y análisis de ánimo; revisar qué tareas están expuestas en UI y bajo qué avisos.
- Mantener la consulta conversacional como opt-in por interacción; crear confirmación clara antes de enviar diario o datos emocionales a Groq. No enviar biometría ni combinarla con el diario en la primera versión.
- Investigar y documentar retención, entrenamiento, subprocesadores, ubicación, seguridad y condiciones del proveedor. Formalizar contrato/DPA o elegir otro proveedor si se requiere.
- La documentación oficial consultada el 20-11-2026 indica que la inferencia no se retiene por defecto, pero las entradas/salidas pueden registrarse hasta 30 días por confiabilidad o abuso; ZDR está disponible a todos los clientes y los datos retenidos residen en GCP en EE. UU. El DPA asigna al cliente deberes sobre avisos, autorizaciones y derecho a transferir/acceder a los datos, y contempla subprocesadores y transferencia a EE. UU. u otros países. Verificar en la organización de Mood Log ZDR efectivo, términos/DPA aceptados, subprocesadores y settings; asesoría colombiana debe resolver transmisión/transferencia y suficiencia para el propósito. Mientras no se confirme, no enviar pulso/HRV ni ampliar el payload sensible.
- Minimizar campos, ventana temporal y longitud; excluir identificadores directos y secretos; verificar límites de entrada/salida, cuota, costo, abuso, timeout y fallback honesto.
- En el checkout existe un limitador compartido de solicitudes por scope/proyecto en una transacción de Firestore, requerido en Preview/Production y fail-closed si falta o hay discrepancia. Configurar sus límites solo tras verificar Groq Console; ensayar concurrencia y fallos en staging. El documento único puede convertirse en punto caliente: tratarlo como control de piloto, no arquitectura de alta concurrencia. Antes de crecimiento fuerte, sustituirlo por un servicio distribuido de límites con operación atómica, alta disponibilidad y prueba de failover; agregar aparte presupuesto/reserva de tokens y gasto, ya que el contador actual solo suma solicitudes.
- Evaluar App Check para el endpoint serverless con monitoreo antes de enforcement. Firebase documenta [verificación de tokens App Check en backends propios](https://firebase.google.com/docs/app-check/custom-resource-backend) y [su proveedor web reCAPTCHA Enterprise](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider); el servicio de atestación y su procesamiento deben incorporarse al análisis de privacidad antes de habilitarlo.
- Probar salidas con un conjunto revisado de escenarios en español, sesgos, alucinaciones, lenguaje clínico, instrucciones maliciosas en el diario, crisis y sugerencias inseguras. Evitar una etiqueta `riskLevel` que se interprete como evaluación clínica o que dispare acciones sin una revisión específica.
- Mostrar límites y origen de la respuesta; permitir salir, borrar conversación local y reportar una respuesta. Definir guion de emergencia como orientación a ayuda local, no promesa de monitoreo ni intervención.
- No usar conversaciones ni texto de ánimo para entrenar, personalizar anuncios o ampliar finalidades por defecto.

**Entregables:** catálogo de capacidades IA, evaluación del proveedor, aviso de datos por tarea, conjunto de evaluación, límites de uso, observabilidad sin contenido y protocolo de respuesta.

**Puerta de salida:** una revisión humana valida resultados y fallos; no se transfiere contenido sin aviso/acción explícita; las cuotas compartidas están configuradas según la cuenta real y pasan pruebas de concurrencia en staging; no se anuncian diagnósticos, tratamiento ni detección automática de crisis. La cuota Firestore no demuestra capacidad masiva ni limita por sí sola tokens/gasto.

### Fase 5 — Descubrimiento técnico de relojes

**Objetivo:** escoger la ruta según los dispositivos reales y el tipo de medición que aporta valor.

**Decisiones:**

- **App directa de Wear OS (primer prototipo elegido):** check-in manual de ánimo en el reloj con lectura puntual de frecuencia cardíaca iniciada por la persona y visible mientras se mide. No ejecutar muestreo continuo pasivo ni sincronizar muestras durante la prueba inicial.
- **Lectura desde el teléfono:** Health Connect puede importar muestras que una app compañera ya haya escrito; es una vía complementaria para consultar histórico y no equivale a tener la app Mood Log en el reloj.
- Separar la app nativa del reloj del cliente Android móvil que mantiene la UI React. La persistencia privada local en el reloj ya fue elegida para la etapa longitudinal; después de demostrar el sensor, diseñar y revisar sus controles antes de implementarla. La copia al teléfono, autenticación/sync y uso del Wear OS Data Layer quedan fuera de esa decisión y requieren ADR separado; no asumir que Capacitor empaqueta una app de reloj ni accede a Health Services sin código nativo.
- Antes de añadir almacenamiento longitudinal, sacar de `MainActivity` las responsabilidades de permisos/lectura, elegibilidad y consentimiento, estado de pantalla y persistencia; introducir una interfaz local de repositorio y un modelo de observación que permita inspeccionar cifrado, retención, borrado y backup sin acoplarlos a la UI.
- Encuestar a usuarios adultos y elegir al menos dos modelos Wear OS concretos para pruebas. Evitar una promesa de “todos los relojes”: Garmin, Fitbit, Samsung y otros pueden sincronizar datos por rutas y niveles de detalle distintos y no todos ejecutan Wear OS.

**Prototipo:** app nativa Wear OS con permiso de sensor solicitado en contexto, check-in de ánimo manual y medición puntual de HR con Health Services `MeasureClient`; mostrar origen, timestamp, unidad y ausencia/error del sensor. Usar lecturas sintéticas para UI y un reloj de prueba para validar el flujo de hardware. No sincronizar, enviar a IA ni persistir valores de salud; solo se guarda en el almacenamiento privado del reloj una constancia mínima versionada de la respuesta al aviso de Mood Log, que la persona puede consultar y borrar. No hay identidad, exportación ni sincronización de ese log, y no registra el resultado del permiso runtime ni si llegó lectura; por lo que no satisface el proceso de consentimiento para un piloto. Health Connect histórico se valida por separado como complemento.

**Entregables:** matriz dispositivo/OS/fuente/métrica/permisos, prueba de concepto por plataforma, informe de compatibilidad, consumo y limitaciones, decisión de integración.

**Puerta de salida:** la lectura se inicia por la persona, funciona en dos modelos objetivo, ausencia y revocación quedan diferenciadas, el consumo se mide y el check-in manual sigue disponible sin sensor. No hay red ni persistencia fuera del dispositivo en esta fase.

### Fase 6 — Diseño de datos y análisis personal

**Objetivo:** mostrar contexto real sin asumir causalidad ni convertir asociación en diagnóstico.

**Modelo conceptual recomendado:**

- `MoodEntry`: autorreporte 1–10, emociones/contexto que el usuario decide incluir, timestamp y zona aplicables.
- `HealthObservation`: tipo exacto de métrica, valor/unidad, timestamp fuente, intervalo, fuente/app/dispositivo si está disponible, método de captura, calidad/estado y referencia de importación idempotente.
- `ConsentGrant`: categoría, propósito, versión de aviso, fuente, estado, fecha de concesión/revocación y alcance. No guardar más identificadores de dispositivo de los necesarios.
- `ImportJob`: estado, ventana solicitada, recuentos y errores técnicos no sensibles; no duplicar muestras en logs.

**Persistencia:** la siguiente etapa elegida conserva las observaciones solo en el reloj, sin nube ni teléfono; el scaffold actual todavía no persiste muestras. Antes de habilitarla, definir retención, cifrado/gestión de claves, exportación, borrado y fallos. Una copia en teléfono exige una app compañera y diseño de transporte local; Android advierte que los `DataItem` del Wear OS Data Layer pueden respaldarse en nube. Cualquier guardado en Firebase requiere un ADR adicional, colección, reglas por propietario, retención, exportación, eliminación, cifrado adecuado, pruebas negativas y revisión legal/seguridad aparte.

**Cobertura de la primera serie local:** solo puede combinar pulso medido y ánimo autoinformado capturado dentro de la app de reloj. Los registros de ánimo/diario que hoy viven en Firestore y la UI web no entran en esa serie ni se muestran como parte de ella. Si se desea una vista web/teléfono común, se necesita otro ADR que cubra transferencia, consentimiento, cifrado, límites de Data Layer, acceso, retención y borrado; no reutilizar el `HealthObservation` local como si ya tuviera sincronización.

**Análisis por etapas:** primero línea de tiempo separada; luego estadística descriptiva con método, período, cantidad y cobertura; asociaciones exploratorias solo después de definir hipótesis, ventanas, confusores, faltantes, valores atípicos e incertidumbre con asesoría metodológica. No usar `n ≥ 10` como sello de validez.

**Puerta de salida:** los gráficos distinguen fuente y período; no mezclan HRV (por ejemplo, RMSSD y SDNN); no rellenan faltantes con cero; el texto no afirma causalidad ni asigna un estado emocional a partir de pulso.

### Fase 7 — Piloto voluntario controlado

**Objetivo:** comprobar valor, comprensión y seguridad antes de comercializar la integración.

**Trabajo:**

- Definir protocolo, tamaño y reclutamiento, consentimiento, duración, compensación si aplica, criterios de retiro, contacto y plan de datos. Separar piloto de investigación universitaria si se busca producir conocimiento generalizable.
- Usar inicialmente dispositivos de prueba y datos sintéticos; para piloto con personas, obtener revisión jurídica, privacidad/seguridad y comité de ética cuando aplique.
- No recopilar más de las métricas aprobadas; no iniciar monitoreo pasivo en segundo plano sin finalidad y permiso justificados.
- Medir comprensión, errores de permisos, fallos de importación, carga de soporte, utilidad percibida, revocación, exportación y eliminación; no optimizar por duración de uso o volumen biométrico.
- Separar la evaluación de facilidad/valor de producto de una investigación sobre asociación fisiología–ánimo. El piloto técnico no autoriza entrenar o anunciar un detector; para desarrollar y validar un modelo predictivo se requiere protocolo de investigación y evaluación ética/metodológica independiente.
- Tener protocolo de suspensión inmediata, incidentes, retiro y borrado de participantes.

**Puerta de salida:** no hay hallazgos críticos abiertos; los usuarios entienden que la app no detecta emociones ni sustituye profesionales; eliminación y revocación funcionan de punta a punta.

### Fase 8 — Preparación de tiendas y lanzamiento

**Objetivo:** publicar solo el alcance revisado en los mercados y dispositivos que realmente se probaron.

**Trabajo:**

- Revisar condiciones y formularios de privacidad/salud de App Store y Play Console. Apple requiere política visible y restringe el uso de datos de HealthKit para publicidad/marketing; Google requiere declaración de app de salud, justificación de permisos Health Connect y divulgación/aviso acordes.
- Completar fichas de privacidad y seguridad, descripción, clasificación por edad, permisos mínimos, capturas y claims. No decir “detecta ansiedad”, “mide tu salud mental” o “previene crisis” sin evidencia y evaluación regulatoria apropiadas.
- Ejecutar revisión de seguridad independiente, análisis de dependencias, pruebas de penetración del alcance acordado, abuso/limitación de IA, flujos de derechos, respaldos y recuperación.
- Preparar soporte, preguntas de privacidad, reporte de incidentes, comunicación de interrupciones, respuesta a vulnerabilidades, rollback y feature flags.
- Congelar versión, entornos, proveedores, políticas y modelo de datos; completar checklist por plataforma y mercado y obtener aprobación de responsables.

**Puerta de salida:** lanzamiento firmado por responsables de producto, ingeniería, privacidad/legal y seguridad; cero vulnerabilidades críticas/altas sin mitigación aceptada; tiendas y documentación reflejan la implementación real.

### Fase 9 — Operación, escala y mejora continua

**Objetivo:** crecer sin acumular datos ni sacrificar confianza.

- Monitorizar disponibilidad, latencia, fallos de permisos/importación, errores de borrado, costos y soporte; telemetría agregada, sin valores de salud ni texto.
- Revisar trimestralmente permisos de servicio, dependencias, proveedores, condiciones de IA, textos legales y políticas de plataforma; revisar antes ante cambios materiales.
- Ejecutar ejercicios de incidentes, restauración de respaldos, eliminación y reversión; medir tiempo de detección y cierre.
- Publicar notas de versión y explicar cambios de finalidades; pedir nuevo consentimiento cuando corresponda.
- Ampliar mercados, plataformas, métricas o análisis solo con una decisión documentada, revisión legal y criterios de validación propios.

## 6. Matriz de cumplimiento y revisión por mercado

| Territorio/canal | Revisión que debe realizarse antes del lanzamiento | Evidencia exigida |
|---|---|---|
| Colombia (mercado inicial confirmado) | Ley 1581/2012 y Decreto 1074/2015; naturaleza sensible de datos de salud/biométricos; autorización previa, explícita e informada; roles, derechos, transferencias, encargados, medidas de seguridad, RNBD si aplica y protocolo de incidentes. La Ley 1581 incluye los datos relativos a la salud y biométricos entre los sensibles; la SIC indica que se informe clara y expresamente la finalidad y la potestad de suministrarlos o no. Validación de abogado colombiano. | Concepto/matriz jurídica de alcance, aviso y consentimientos revisados, registro de tratamientos, contratos y procesos de derechos/borrado. |
| App Store / HealthKit | Reglas vigentes de App Review y HealthKit; disclosure de cada dato; política accesible, retención y borrado; restricciones de publicidad/marketing/uso secundario de salud. | Formulario/ficha revisados, permisos mínimos, política y descripción acordes al build. |
| Google Play / Health Connect | Health Apps declaration, Data safety, política pública dentro y fuera de la app, disclosure prominente y justificación de cada permiso/tipo de datos conforme a usos permitidos. | Declaración de Play Console aprobada, permisos mínimos, política y propósito verificados. |
| Unión Europea, si se habilita | GDPR, especialmente categoría de datos de salud y condiciones aplicables; derechos, roles, transferencias, contratos y posible DPIA según riesgo/alcance. | Evaluación de abogado de privacidad de la UE, base/condición, documentación y medidas aplicables. |
| Estados Unidos, si se habilita | Determinar si aplica HIPAA según entidad/relación funcional; revisar leyes federales/estatales de privacidad de salud y consumidor, breach notification, claims y clasificación de software sanitario. HIPAA no se debe presumir automáticamente para toda app de consumo. | Matriz federal/estatal y decisión por función/relación; revisión de asesoría especializada antes de aceptar usuarios. |

Fuentes oficiales de referencia, para revisión por profesionales: [Ley 1581 de 2012 en el Gestor Normativo de Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981), [orientación de la SIC sobre finalidad y suministro voluntario de datos de salud](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/tratamiento-de-datos-sensibles-relativos-la-salud), [App Review Guidelines de Apple](https://developer.apple.com/app-store/review/guidelines/), [política de Health Apps de Google Play](https://support.google.com/googleplay/android-developer/answer/18265346), [GDPR en EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/) y [política de software médico de FDA](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/policy-device-software-functions-and-mobile-medical-applications). Si se declara un propósito médico o se dan recomendaciones individualizadas de diagnóstico/tratamiento, la evaluación regulatoria debe repetirse; un aviso de “no es consejo médico” no resuelve por sí solo la clasificación.

## 7. Registro priorizado de riesgos

| Riesgo | Prioridad | Mitigación y señal de cierre |
|---|---|---|
| Inferir ánimo/ansiedad desde pulso y causar falsa confianza o alarma | Crítica | Propósito de autorreflexión; no etiquetar emoción; evaluación de contenido y claims; lenguaje revisado con usuarios y profesionales. |
| Fuga de diario o datos fisiológicos por permisos, reglas, logs o proveedores | Crítica | Minimización, entornos, reglas, revisión de proveedores, no envío por defecto, escaneo de tráfico/logs y pruebas de acceso cruzado. |
| Consentimiento amplio o incomprensible | Alta | Permiso granular por dato y propósito, versiones auditables, revocación y continuidad del núcleo sin dar permiso. |
| Borrado incompleto en Firebase, proveedor IA, caché o backups | Alta | Mapa de ciclo de vida, proceso probado, comunicación exacta de límites y reconciliación/reintentos. |
| Variación de frecuencia/calidad entre dispositivo y fuente | Alta | Matriz por dispositivo y fuente, procedencia, cobertura, timestamps y fallback visible; no prometer universalidad. |
| Confusión entre IA conversacional y atención clínica | Alta | Delimitar funciones y copy, evaluación adversarial, no diagnosticar, no prometer emergencia ni monitoreo. |
| Incumplir política de plataforma o cambiarla | Alta | Revisión pre-release y periódica, registro de permisos/justificación, claims y ficha sincronizados. |
| Uso social entre amigos expone datos íntimos o genera presión | Alta | Sin rankings/compartición de biometría en MVP; compartir solo contenido elegido explícitamente; controles y vista previa. |
| Costos, abuso o dependencia de IA/proveedores | Media/alta | Cuotas y presupuesto, alertas de costo, límites de payload, proveedor alterno evaluado, respuesta de error honesta. |
| Desfase entre código, documentación y servicios desplegados | Alta | Inventario de entornos, release checklist, revisión de reglas remotas y evidencia firmada para cada despliegue. |

## 8. Métricas de producto y calidad

**Confiabilidad:** porcentaje de guardados correctos, errores por flujo, latencia percibida, tasa de fallos de importación y de borrado.  
**Confianza y control:** comprensión de consentimientos, revocaciones completadas, exportaciones y eliminaciones exitosas, consultas de soporte de privacidad.  
**Utilidad:** claridad percibida de la línea de tiempo, frecuencia voluntaria de check-in y valoración de utilidad; evitar usar rachas como éxito individual.  
**Viabilidad comercial:** conversión del onboarding, retención voluntaria a 7/30 días, disposición a pagar contrastada con comportamiento, costo de adquisición por canal, costo mensual por usuario activo, margen por plan y tasa de cancelación; medir solo con telemetría autorizada y sin registrar contenido sensible. No fijar precios finales ni escalar adquisición hasta contrastar costos y comprensión de privacidad.
**Calidad de datos:** cobertura, duplicados, medidas sin unidad/fuente, huecos, errores de zona horaria y discrepancia entre muestra solicitada e importada.  
**IA:** satisfacción por tarea, respuestas inseguras detectadas, correcciones, reportes, costo por sesión y respeto de límites; no evaluar como modelo clínico sin un programa clínico específico.  
**Privacidad:** datos sensibles que salen del dispositivo por función, proveedores con acceso, retención efectiva, errores de borrado y hallazgos críticos abiertos.

## 9. Próximo ciclo: acciones concretas

1. Mantener el alcance de salida como Colombia / 18+ y obtener revisión jurídica y validación técnica de la autodeclaración implementada y su evidencia.
2. Congelar la promesa de lanzamiento como autorreflexión y bienestar, y crear un listado de claims no permitidos.
3. Abrir una matriz de trazabilidad de datos: dato → origen → propósito → permiso → destino → retención → borrado → prueba.
4. Actualizar el estado real del trabajo vigente con evidencia actual y resolver contradicciones en documentación/índice.
5. Crear staging aislado y cerrar los recorridos críticos de ánimo, diario, exportación y eliminación.
6. Programar revisión jurídica colombiana y revisión contractual de Firebase, Vercel y Groq antes de usar datos reales.
7. Auditar las pantallas y solicitudes actuales de IA; mantener consultas básicas, separar consentimientos por tarea y excluir biometría del payload.
8. Encuestar a usuarios adultos objetivo y seleccionar al menos dos modelos Wear OS concretos para probar la experiencia de Mood Log directamente en el reloj, además de sus móviles y fuentes de salud disponibles.
9. Instalar/configurar Android SDK y dispositivos de prueba; construir un prototipo nativo Wear OS con Health Services `MeasureClient`, check-in manual y lectura puntual iniciada por usuario. No sincronizar ni persistir muestras fuera del reloj durante esa prueba.
10. Ejecutar el descubrimiento de 12–15 entrevistas adultas y una ronda separada de 5–8 sesiones de usabilidad (incluyendo al menos 3 usuarios Wear OS), solo después de aprobar aviso, retención y ruta de seguridad; usar datos sintéticos, no pedir datos de salud ni cobrar.
11. Construir un modelo mensual de costos para 100, 1.000 y 10.000 usuarios activos, diferenciando uso de IA, hosting, soporte y almacenamiento; definir límites de gasto y de uso antes de abrir el acceso.
12. Evaluar en una fase posterior el puente Wear OS–teléfono y la importación opcional desde Health Connect; comprobar permisos, cadencia, revocación, origen y borrado con modelos probados. Adoptar lectura pasiva o continua únicamente si el caso de uso, permisos y batería lo justifican.
13. Definir el protocolo del piloto, los criterios de suspensión y el paquete de lanzamiento antes de invitar participantes.

## 10. Referencias internas y externas

- Documentos internos: [plan de trabajo](work-plan.md), [análisis técnico](analysis/project-analysis.md), [seguridad y privacidad](firebase/security-and-privacy.md), [especificación biométrica](features/biometric-context/README.md), [metodología de análisis](features/biometric-context/analysis-methodology.md), [plan de validación biométrica](features/biometric-context/validation-plan.md).
- Lanzamiento en Colombia: [matriz legal de preparación](legal/colombia-launch-readiness.md); resolver sus gates P0 antes de habilitar datos reales de ánimo/diario para beta y de pulso para Wear OS.
- Plataformas: [HealthKit](https://developer.apple.com/documentation/healthkit), [Health Connect: inicio y permisos](https://developer.android.com/health-and-fitness/health-connect/get-started), [Health Services de Wear OS](https://developer.android.com/health-and-fitness/health-services).
- Legal y tiendas: enlaces oficiales de la matriz de cumplimiento de la sección 6. Confirmar versiones vigentes cuando se elija fecha, país y plataforma de lanzamiento.
