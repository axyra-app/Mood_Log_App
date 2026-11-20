# Registro de decisiones: contexto biométrico

Este documento registra decisiones de la feature `FEAT-BIO-001`. Los estados indican si una decisión está acordada; las recomendaciones no se consideran aprobaciones.

## ADR-BIO-001 — Persistencia de muestras biométricas

- **Estado:** almacenamiento local solo en el reloj elegido para la siguiente etapa longitudinal; implementación y controles pendientes.
- **Fecha:** 20 de noviembre de 2026 (decisión sobre etapa inicial; contexto creado el 14 de octubre de 2026).
- **Decisores:** por asignar (producto, ingeniería y privacidad/seguridad)
- **Contexto:** la propuesta requiere consultar datos de salud junto con ánimo y diario. Guardar las muestras en la nube habilita sincronización, pero amplía la exposición, retención, superficie de autorización y proceso de borrado. Procesar localmente reduce datos centrales, pero limita continuidad entre dispositivos.
- **Opciones evaluadas:** almacenamiento local en el reloj; almacenamiento local en un teléfono Android compañero; sincronización en Firebase; piloto comparativo.
- **Decisión delegada por el fundador:** para la siguiente etapa longitudinal, mantener las observaciones únicamente en almacenamiento privado local del reloj. No sincronizar al teléfono, Firebase, servicios de Google ni proveedor de IA.
- **Motivo:** habilitar una evaluación de utilidad personal minimizando transferencias, complejidad de plataforma y exposición centralizada; el alcance actual ya es una app nativa Wear OS.
- **Consecuencias:** el scaffold actual sigue sin persistir pulso o ánimo. Antes de implementar, definir retención, cifrado/gestión de claves, exportación, borrado, fallos de almacenamiento y consentimiento específico para guardar pares pulso/ánimo. El primer conjunto longitudinal solo podrá combinar observaciones capturadas en el reloj; no incluirá automáticamente ánimo o diario guardados en Firestore y no aparecerá en el teléfono/cuenta web. No crear colección Firestore ni reglas de datos biométricos.
- **Etapa posterior posible:** si se demuestra valor de una pantalla en el teléfono, evaluar almacenamiento local en app Android compañera y un canal transitorio con ACK/reintentos. No usar `DataClient`/`DataItem` para muestras sin revisión: la documentación Android indica que estos elementos pueden respaldarse en nube. La sincronización remota requiere otro ADR.
- **Criterios pendientes:** retención y controles locales, utilidad, comprensión y compatibilidad; la decisión no autoriza el uso con participantes ni cierra gates legales o regulatorios.
- **Referencias técnicas primarias:** [sincronización del Wear OS Data Layer](https://developer.android.com/training/wearables/data/sync), [tipos de cliente Data Layer](https://developer.android.com/training/wearables/data/client-types).

## ADR-BIO-002 — Análisis del contenido del diario

- **Estado:** decisión provisional para MVP; confirmar en revisión de producto
- **Fecha:** 14 de octubre de 2026
- **Decisión propuesta:** relacionar temporalmente entradas y mediciones sin analizar semánticamente el texto en el MVP.
- **Motivo:** el contenido del diario es altamente sensible y el repositorio actual ya contiene llamadas de IA iniciadas desde el cliente. El valor inicial puede probarse con fechas y datos estructurados sin una transferencia adicional de texto.
- **Consecuencias:** cualquier análisis semántico futuro requiere feature separada, consentimiento, minimización, backend seguro, proveedor revisado y documentación del ciclo de vida.

## ADR-BIO-003 — Interpretación de resultados

- **Estado:** principio aprobado para la documentación de esta propuesta
- **Decisión:** presentar asociaciones temporales y resúmenes descriptivos; no inferir emoción, diagnóstico, causa o crisis a partir de pulso/HRV.
- **Consecuencias:** no definir umbrales clínicos ni recomendaciones automáticas de salud dentro de esta feature sin una nueva evaluación y aprobación.

## ADR-BIO-004 — Plataforma de integración

- **Estado:** pendiente
- **Opciones:** prueba nativa de iOS y Android; Capacitor con plugin compatible; otra implementación nativa; posponer biometría.
- **Criterios:** acceso real a tipos de datos requeridos, permisos, mantenimiento, compatibilidad, políticas de tienda, seguridad, accesibilidad y costo.
- **Restricción:** la PWA actual no se considerará integrada a HealthKit/Health Connect por defecto.

## ADR-BIO-005 — Métricas iniciales

- **Estado:** pendiente
- **Candidatas:** frecuencia cardíaca y métricas HRV concretas, identificadas por estándar/fuente.
- **Criterios:** disponibilidad real por plataforma, calidad/procedencia, utilidad validada, claridad de interpretación y minimización.
- **Restricción:** no tratar SDNN y RMSSD como equivalentes ni usar lecturas como diagnóstico.

## ADR-BIO-006 — Arquitectura y backend de la feature

- **Estado:** pendiente; se mantiene la arquitectura actual como referencia para el diseño, sin aprobar migración.
- **Fecha:** 14 de octubre de 2026
- **Contexto:** la propuesta recibida describe Enter Cloud, mientras que el repositorio actual usa Firebase. Adoptar ambas o migrar sin plan crearía inconsistencia de identidad, datos, seguridad y operación.
- **Opciones:** mantener Firebase y adaptar el diseño a sus controles; aprobar una migración completa con plan separado; posponer biometría hasta consolidar el modelo actual.
- **Restricción provisional:** no crear un segundo backend ni modificar el proveedor de autenticación como parte de la feature sin decisión explícita.
- **Criterios para cerrar:** estado real de servicios, coste de migración, identidad, seguridad, reglas, exportación/borrado, continuidad de datos, operación y pruebas de reversión.

## ADR-BIO-007 — Procedencia de cada observación

- **Estado:** principio de diseño propuesto; contrato de datos pendiente.
- **Fecha:** 14 de octubre de 2026
- **Decisión propuesta:** conservar fuente, método de captura, timestamp, unidad y calidad por observación; no declarar una sola fuente para un registro que combine ánimo manual, sueño y pulso de distintas fuentes.
- **Consecuencias:** no implementar un campo global `metrics_source`/`metrics_quality` en el registro diario sin demostrar que representa todos sus valores; diseñar un modelo de mediciones separado si se necesita persistencia.

## ADR-BIO-008 — Frecuencia y escala del check-in

- **Estado:** escala resuelta; frecuencia y zona horaria pendientes
- **Fecha:** 14 de octubre de 2026
- **Contexto:** el flujo activo permite varios registros por día y usa escala 1–10; la propuesta biométrica sugiere un único registro diario y escala 1–5.
- **Decisión:** conservar 1–10 y no imponer unicidad diaria ni transformar registros históricos.
- **Pendiente:** definir una zona horaria de cuenta si se necesita que las rachas y los períodos sean consistentes entre dispositivos.

## ADR-BIO-009 — Patrones personales de pulso y ánimo

- **Estado:** salida de producto elegida; método, datos y lanzamiento siguen pendientes de validación.
- **Actualizado:** 20 de noviembre de 2026.
- **Decisión del fundador:** mostrar patrones personales de pulso y ánimo. En la primera salida analítica que llegue a aprobarse, explorar relaciones descriptivas dentro de la misma persona entre lecturas repetidas de pulso y ánimo autoinformado.
- **Exclusión explícita:** no inferir ni clasificar el ánimo actual a partir del pulso, especialmente de una lectura puntual; no atribuir causalidad, diagnosticar, predecir condiciones o detectar crisis.
- **Lo que no queda decidido por esta elección:** métricas y ventana temporal, método estadístico, frecuencia de medición, retención final, copia local al teléfono, sincronización remota, población/dispositivos de validación, consentimiento definitivo, claim público y clasificación regulatoria. ADR-BIO-001 elige almacenamiento local solo en reloj; ADR-BIO-014 propone controles de implementación todavía pendientes de aprobación. Los primeros patrones no combinarán el historial web/Firestore ni diarios, salvo que se apruebe otra transferencia.
- **Evidencia de capacidad actual:** el prototipo Wear OS toma una lectura puntual y muestra el ánimo autoinformado en la misma pantalla. No guarda ni sincroniza muestras, no recibe series longitudinales ni calcula asociaciones.
- **Límite de método:** no adoptar `Pearson` con `n ≥ 10` ni ningún mínimo aislado como prueba suficiente. Una cantidad fija de muestras no valida estabilidad, utilidad ni transferencia entre personas/dispositivos. Los estudios revisados no validan leer un estado emocional desde una pulsación puntual.
- **Criterios antes de diseñar o activar la salida:** definir pregunta y claim, población/dispositivos, protocolo y repetición de muestreo, alineación temporal, confusores, calidad/faltantes, método, incertidumbre, interpretación y evaluación de comprensión/daños. Usar únicamente fixtures sintéticos hasta cerrar privacidad/consentimiento y revisión regulatoria colombiana.

## ADR-BIO-010 — Alcance de las etapas iniciales

- **Estado:** propuesta de secuenciación; sujeta a aprobación de producto
- **Fecha:** 14 de octubre de 2026
- **Secuencia candidata:** consolidación/seguridad → experiencia manual y resúmenes descriptivos → importación local de archivo evaluada con datos sintéticos → experimento de cámara sujeto a calidad → evaluación posterior de asociaciones e IA.
- **Exclusiones iniciales:** feed social, comparación entre personas, IA que combine diario y biometría, e integración de cámara en producción.
- **Consecuencias:** cada etapa requiere revisión y criterios de salida propios; completar una etapa no autoriza automáticamente la siguiente.

## ADR-BIO-011 — Ruta de plataforma para el primer prototipo

- **Estado:** prioridad de producto acordada: Wear OS/Android. Compatibilidad técnica y datos de reloj por modelo aún pendientes de prueba.
- **Fecha:** 19 de noviembre de 2026
- **Evidencia técnica:** el frontend de producto es una SPA/PWA; existe además un scaffold fuente nativo en `wearos/` que compiló como APK debug local el 20 de noviembre de 2026, aún sin validación de emulador o dispositivo. HealthKit requiere app iOS y sus permisos; Health Connect requiere una app Android; una app de reloj Wear OS accede a sus sensores mediante Health Services y los permisos propios del reloj. HealthKit ofrece HRV SDNN; Health Connect documenta HRV RMSSD, que no deben combinarse como una sola serie.
- **Decisión de alcance registrada en ADR-BIO-012:** primera prueba directa en el reloj Wear OS con una lectura puntual de pulso iniciada por usuario y check-in manual. El muestreo pasivo/continuo se pospone. Health Connect desde el teléfono se conserva como importación histórica complementaria; no sustituye la app en el reloj.
- **Consecuencia operativa:** el 20-11-2026 se instalaron en Windows `platforms/android-36`, `build-tools/36.0.0`, Build Tools 35.0.0 requerido por el plugin y `platform-tools` 37.0.3; se configuraron `ANDROID_HOME`, `ANDROID_SDK_ROOT` y PATH del usuario. El fundador revisó y autorizó el uso de la licencia del SDK. `:app:assembleDebug` pasó y generó APK local; falta emulador/reloj de prueba. Para construir/firmar y probar HealthKit hace falta acceso a macOS/Xcode y dispositivos Apple.
- **Criterios para cerrar:** probar el flujo directo en al menos dos modelos Wear OS, validar permiso, lectura, cancelación, revocación, cadencia y batería; definir controles de la persistencia local ya elegida. La sincronización reloj-teléfono/cuenta es una decisión posterior independiente.
- **Referencias primarias:** [autorización HealthKit](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data), [tipos HealthKit](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier), [tipos Health Connect](https://developer.android.com/health-and-fitness/health-connect/data-types), [límites de lectura Health Connect](https://developer.android.com/health-and-fitness/health-connect/read-data).

## ADR-BIO-012 — Secuencia de integración Android/Wear OS

- **Estado:** app directa de Wear OS elegida como primera prueba técnica; scaffold compilado como APK debug local, aún sin probar en dispositivos.
- **Fecha:** 19 de noviembre de 2026
- **Decisión de alcance:** el primer prototipo funcional será una app nativa de reloj Wear OS que combina un check-in manual del ánimo con una lectura puntual de frecuencia cardíaca iniciada por la persona. Usará `MeasureClient` mientras la pantalla/acción está activa. Mostrará ambas entradas separadas, con hora/origen/estado de lectura; no etiquetará emociones, no ejecutará captura continua en segundo plano y no enviará ni persistirá muestras fuera del dispositivo durante la prueba técnica.
- **Progresión del producto:** después de validar lectura y UX en el reloj, implementar almacenamiento longitudinal privado solo en el reloj cuando estén aprobados retención, cifrado, consentimiento, exportación y borrado. La sincronización con el teléfono o la cuenta Mood Log sigue sin aprobación; cualquier canal de transporte (incluido Wear OS Data Layer) y el almacenamiento Firebase requieren otro ADR y revisión de nube/respaldos. Health Connect en teléfono queda como integración complementaria para importar historial que otras apps ya escribieron, no como sustituto de la app directa solicitada.
- **Restricciones de la ruta Health Connect:** requiere móvil Android 9 o posterior con Google Play Services; Health Connect está integrado en Android 14+, y en Android 13 o anteriores se instala como app. El acceso a otros datos históricos tiene un límite predeterminado de 30 días antes del permiso; ampliar esa ventana requiere un permiso adicional. Una serie de frecuencia cardíaca contiene muestras, y cada categoría necesita permisos declarados/revisados.
- **Restricciones de captura directa:** `MeasureClient` es para mediciones activas/puntuales en una experiencia visible; Health Services también ofrece `PassiveMonitoringClient`, pero las actualizaciones pasivas se agrupan en intervalos no predecibles. No se debe asumir frecuencia de muestreo fija ni diseñar monitorización continua para el primer prototipo. Captura más larga o durante ejercicio requiere evaluar `ExerciseClient`, consumo y finalidad aparte. Los permisos cambian según versión de Wear OS; deben declararse y pedirse en contexto según la matriz oficial vigente.
- **Prueba de compatibilidad requerida:** probar al menos dos relojes Wear OS concretos con versiones representativas de OS, verificando permiso de sensor, disponibilidad de Health Services, flujo/precisión de lectura, señal ausente, cancelación, revocación, timestamp, batería y comportamiento tras bloquear la pantalla. Un modelo no probado no se anuncia como compatible.
- **Arquitectura de la prueba inicial:** app Android nativa en el reloj Wear OS, separada del frontend React. El scaffold actual usa una Activity Java y Health Services; muestra confirmación contextual antes del permiso y guarda localmente el evento mínimo de decisión, con retención acotada a 100 eventos, pero no la muestra de salud. El log local es borrable y no tiene identidad/exportación/sync, por lo que no es ledger apto para piloto. La app compañera y la sincronización se decidirán después de validar el flujo del reloj; un wrapper Capacitor no sustituye la integración nativa con Health Services.
- **Criterio para avanzar:** disponer de Android SDK/ADB, reloj Wear OS y teléfono de prueba; demostrar lectura solo iniciada por usuario, permisos y revocación, ausencia de datos bien diferenciada, experiencia de check-in manual sin sensor, y cero escritura/red fuera del dispositivo en esta fase.
- **Referencias oficiales consultadas:** [Health Services en Wear OS](https://developer.android.com/health-and-fitness/health-services), [lectura puntual de frecuencia cardíaca](https://developer.android.com/health-and-fitness/health-services/measure-client), [tipos de permisos por Wear OS](https://developer.android.com/health-and-fitness/health-services/permissions), [compatibilidad/cadencia pasiva](https://developer.android.com/health-and-fitness/health-services/compatibility), [tipos y permisos de Health Connect](https://developer.android.com/health-and-fitness/health-connect/data-types), [disponibilidad y versiones Android de Health Connect](https://developer.android.com/health-and-fitness/health-connect/availability), [lectura e historial de Health Connect](https://developer.android.com/health-and-fitness/health-connect/read-data).

## ADR-BIO-013 — Significado de “analizar el estado de ánimo” con pulso

- **Estado:** resuelta respecto a la salida de producto; las condiciones metodológicas y regulatorias continúan abiertas.
- **Fecha:** 20 de noviembre de 2026 (hora de Colombia).
- **Decisión confirmada por el fundador:** mostrar patrones personales de pulso y ánimo. Se interpreta como exploración descriptiva dentro de la misma persona, usando observaciones repetidas y ánimo autoinformado. No se ha aprobado una función de inferencia emocional.
- **Lo que el código permite hoy:** lectura puntual y check-in manual en el scaffold Wear OS; ninguna muestra se persiste. La vista web interna usa fixtures sintéticos, ofrece línea de tiempo y resumen descriptivo separado; no calcula asociación.
- **Evidencia relevante:** cohortes y experimentos revisados emplean series o ventanas repetidas, múltiples métricas y/o línea base personal; en una cohorte longitudinal grande, los efectos rezagados fisiología→resultado mental no fueron significativos. Un experimento de clasificación basado en HR con 25 sujetos usó emociones inducidas en laboratorio y baseline neutral. Estos resultados no validan clasificación de ánimo libre desde una lectura puntual.
- **Siguiente decisión y puertas:** definir claim descriptivo, población/dispositivos, tipo y ventana de medición, protocolo, calidad/faltantes/confusores, método, incertidumbre y evaluación de comprensión/daños. Asesoría colombiana debe revisar finalidad, consentimiento y clasificación regulatoria antes de muestras reales. La persistencia local en reloj está elegida en ADR-BIO-001/014, pero sus controles, la copia al teléfono y toda sincronización remota requieren decisiones y gates propios.

## ADR-BIO-014 — Controles propuestos para persistencia privada en Wear OS

- **Estado:** recomendación técnica para la siguiente iteración; no autoriza uso con participantes ni cambia la decisión de almacenamiento solo en el reloj.
- **Fecha:** 20 de noviembre de 2026.
- **Contexto:** ADR-BIO-001 fija dónde residirán los datos, pero la app actual no los guarda y faltan controles concretos de ciclo de vida.
- **Decisión recomendada:** para la primera prueba longitudinal, guardar un archivo local versionado y cifrado con AES-256-GCM. Mantener la clave no exportable en Android Keystore y el archivo dentro del directorio interno privado de la app. La documentación Android recomienda AES-GCM y Keystore para claves; el almacenamiento interno específico de la app también está aislado por el sandbox y cifrado por la plataforma desde API 29. No presentar ninguno de esos controles como protección frente a dispositivo comprometido, sistema operativo alterado o app ejecutada con el reloj desbloqueado.
- **Contrato mínimo:** conservar solo valor de ánimo autoinformado en escala 1–10, pulso en bpm, timestamps de origen y captura, identificador aleatorio de sesión, fuente `Health Services MeasureClient` y estado básico de calidad. No persistir diario, texto libre, ubicación, identificadores de salud externos, perfil/cuenta ni muestras que no correspondan a una acción iniciada por la persona. Cada sesión conserva pulso y ánimo como observaciones independientes enlazadas por el identificador local; no fabricar el dato faltante ni trasladar una lectura a otro check-in.
- **Retención inicial recomendada:** 90 días móviles; mostrar esta duración antes de consentir, borrar automáticamente registros vencidos al abrir la app y antes de calcular la vista histórica, y permitir borrar una observación o todo el historial desde el reloj. El plazo es una propuesta de producto y requiere aprobación jurídica antes de guardar datos reales.
- **Integridad y fallos:** cifrar el archivo completo; usar escritura temporal, sincronización a disco y reemplazo atómico; versionar el formato; no escribir valores, plaintext, claves ni contenido del archivo en logs, preferencias, eventos, cachés, analítica o crash reports. Ante clave perdida/inválida, tag GCM inválido, esquema desconocido o escritura incompleta, fallar cerrado, explicar que el historial no se puede leer y ofrecer borrado local; nunca reconstruirlo ni subirlo.
- **Eliminación y copia:** borrar la observación o el archivo local y retirar la clave administrada por Keystore cuando se borre todo el historial. No afirmar borrado forense de memoria flash. Mantener excluidos backup y transferencia entre dispositivos; no introducir Room/DB sincronizada, Data Layer, teléfono, Firebase, red ni IA. La desinstalación elimina el almacenamiento específico de la app según Android. La exportación a otro dispositivo queda fuera de esta prueba hasta definir un flujo explícito que informe la copia resultante y sus riesgos.
- **Consentimiento:** antes de solicitar el permiso de sensor y antes del primer guardado, explicar categorías, finalidad descriptiva, plazo de 90 días, cifrado local, ausencia de sincronización, limitaciones, borrado y pérdida al cambiar/reinstalar el reloj. Registrar localmente versión y momento de la decisión; el evento existente que registra la respuesta al aviso no demuestra que Android concedió el permiso ni que se guardó una muestra.
- **Puerta de salida:** implementar primero con fixtures sintéticos. Antes de habilitar datos reales, completar revisión jurídica colombiana, aprobar textos y retención, definir el protocolo/método de patrones, validar lectura y cifrado en build/emulador/reloj, verificar backups/transferencias del APK y demostrar autorización, retiro, eliminación, corrupción y recuperación ante fallos. El consentimiento local de prototipo no equivale a autorización comercial revisada.
- **Base técnica:** [almacenamiento específico de app](https://developer.android.com/training/data-storage/app-specific), [guía de almacenamiento Android](https://developer.android.com/training/data-storage), [criptografía y Android Keystore](https://developer.android.com/privacy-and-security/cryptography), [sincronización Wear OS](https://developer.android.com/training/wearables/data/sync) y [tipos de cliente Data Layer](https://developer.android.com/training/wearables/data/client-types).

## Historial

| Fecha | Cambio |
|---|---|
| 2026-10-14 | Se creó el registro inicial; persistencia, plataformas y métricas permanecen abiertas. |
| 2026-10-14 | Se registraron decisiones pendientes sobre backend, procedencia, frecuencia/escala, asociaciones estadísticas y secuencia de etapas a partir de la revisión de la propuesta. |
| 2026-11-19 | Se documentaron diferencias verificadas de permisos, acceso histórico y definiciones de HRV entre HealthKit y Health Connect; plataforma se mantiene pendiente hasta conocer dispositivos objetivo. |
| 2026-11-19 | El fundador priorizó Wear OS/Android para el primer prototipo; la decisión no implica que los relojes/modelos sean compatibles ni cierra el tipo de app o la persistencia. |
| 2026-11-19 | Se corrigió la ruta para priorizar un check-in Wear OS directo con lectura puntual de HR iniciada por el usuario. Health Connect queda como importación complementaria; sincronización/cuenta y arquitectura móvil se mantienen como decisiones posteriores. |
| 2026-11-19 | Se añadió `wearos/` con scaffold Java, manifiesto con permisos por versión, lectura puntual y Gradle Wrapper 8.13. La dependencia resuelve; `assembleDebug` aún no puede avanzar porque el entorno no tiene Android SDK configurado y no se han probado emuladores/relojes. |
| 2026-11-20 | Se revalidaron las fuentes primarias de evidencia sobre pulso y ánimo. La metodología ahora identifica como preprint el análisis de 3.139 médicos, aclara el tamaño de las submuestras intrapersonales del estudio WHOOP y distingue la señal de brazalete de 25 Hz del dato `HEART_RATE_BPM` disponible en el scaffold. Se dejó abierta la salida analítica hasta decisión del fundador. |
| 2026-11-20 | El fundador eligió mostrar patrones personales de pulso y ánimo autoinformado. Se actualizó ADR-BIO-009/013; inferencia emocional desde una lectura puntual queda explícitamente fuera de alcance. Método, persistencia, consentimiento, claims y validación siguen abiertos. |
| 2026-11-20 | A solicitud del fundador de recomendar la mejor ruta de almacenamiento inicial, se eligió almacenamiento privado solo en el reloj para la siguiente etapa longitudinal; implementación, retención y controles permanecen pendientes. Se anotó que Wear OS `DataItem` puede respaldarse en nube y requiere revisión antes de transportar datos sensibles. |
| 2026-11-20 | Se añadió ADR-BIO-014 con una propuesta de cifrado, datos mínimos, retención inicial, borrado y fallos para persistencia local. Los controles son recomendación técnica pendiente de implementación y revisión jurídica; no habilitan datos reales. |
