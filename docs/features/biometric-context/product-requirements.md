# Requisitos de producto: contexto biométrico

**Feature:** `FEAT-BIO-001`
**Estado:** dirección analítica elegida por el fundador; método y requisitos detallados por validar con usuarios, ingeniería y responsables de privacidad. Prioridad Wear OS/Android confirmada.

## 1. Problema

Los registros de ánimo y el diario reflejan la experiencia tal como la persona la recuerda y decide escribirla. El fundador eligió mostrar patrones personales de pulso y ánimo autoinformado a lo largo del tiempo. La salida futura busca aportar contexto para la reflexión, no asignar una emoción a partir de una lectura puntual ni sustituir el autorreporte. El prototipo actual solo muestra observaciones sintéticas y separadas; aún no calcula patrones, recibe datos reales ni integra la IA con sensores. El método y la implementación siguen abiertos.

Una medición fisiológica no representa directamente una emoción. El valor del producto consiste en presentar fuentes distintas lado a lado y ayudar a la persona a formular preguntas, sin afirmar que una métrica explique su estado de ánimo.

## 2. Objetivo y resultado esperado

Permitir que una persona adulta que lo elige:

- autorice de manera consciente una fuente de salud compatible;
- consulte en el reloj mediciones de pulso y check-ins de ánimo autoinformado que capturó desde ese reloj;
- entienda el origen, la cobertura, unidad y limitaciones de cada medición;
- explore, solo tras protocolo y revisión propios, asociaciones personales entre mediciones y sus autorreportes, sin convertir el pulso en etiqueta emocional;
- controle conexión, uso y eliminación de datos;
- use las funciones centrales de Mood Log sin conectar dispositivos.

La decisión de almacenamiento local solo en el reloj implica que el primer conjunto longitudinal no incluirá automáticamente registros de ánimo o diario guardados por la app web en Firestore, ni aparecerá en el teléfono/cuenta Mood Log. Una vista combinada entre dispositivos requiere otro ADR, una transferencia explícitamente revisada y una actualización de autorización, exportación, borrado y política. El diario no forma parte del emparejamiento inicial.

## 3. Personas y actores

| Actor | Necesidad / responsabilidad |
|---|---|
| Persona usuaria | Decide si conectar una fuente, qué categorías permitir y cuándo desconectar. Revisa sus datos y resultados. |
| Equipo de producto | Define el problema, el lenguaje, el alcance y los criterios de aceptación sin prometer resultados clínicos. |
| Ingeniería | Implementa integraciones compatibles, aislamiento de datos, sincronización, errores y eliminación. |
| Responsable de privacidad/seguridad | Revisa minimización, consentimiento, ciclo de vida, amenazas, proveedores y evidencia de controles. |
| Soporte | Atiende solicitudes de conexión, acceso, exportación y borrado según un proceso documentado; no ofrece atención clínica salvo que exista un servicio separado aprobado. |

## 4. Supuestos explícitos

- Las plataformas de salud y los dispositivos pueden diferir en tipos de datos, cobertura, frecuencia, unidades y permisos.
- El acceso desde la PWA actual no se considera disponible; se requerirá validar una aplicación o puente nativo.
- Una importación de archivo es una opción candidata para investigar; no equivale a conexión nativa ni lectura automática.
- Los permisos del sistema operativo no sustituyen el consentimiento y la explicación propios de Mood Log.
- Para la siguiente etapa longitudinal se eligió conservar las observaciones solo en el almacenamiento privado del reloj Wear OS, sin sincronizar al teléfono ni a Firebase. El ADR-BIO-014 propone archivo cifrado local, 90 días de retención y borrado en el reloj; son controles recomendados, pendientes de revisión jurídica, aprobación final, implementación y validación. La exportación a otro dispositivo queda fuera de esta prueba. Una futura app compañera local al teléfono requiere decisión separada; no transferir muestras mediante `DataItem` sin revisar su comportamiento de respaldo.
- Los patrones locales iniciales solo pueden usar check-ins de ánimo y lecturas de pulso capturados en el reloj. No pueden presentar el historial web/Firestore como parte de la serie, porque no se ha elegido ni implementado una transferencia entre dispositivos.
- La dirección elegida es mostrar patrones personales con mediciones repetidas y autorreportes propios. No habilita clasificación emocional desde pulso aislado, análisis semántico del diario ni tratamiento de datos reales sin método, consentimiento y validación separados.
- Una lectura puntual de pulso y un check-in actual no forman por sí solos una base para analizar patrón personal. Estudios relevantes emplean medidas repetidas y contextuales; habilitar un patrón requeriría diseñar consentimiento, retención y protocolo para esas observaciones adicionales.
- La propuesta de implementación compartida menciona un backend distinto, pero el repositorio actual documenta Firebase. No se aprueba una migración por inferencia; debe resolverse como decisión arquitectónica separada.
- No está decidido si se permite más de un check-in de ánimo por día. El diseño debe soportar la decisión de producto sin imponer un índice único prematuro.
- La escala canónica confirmada para el producto es 1–10, coherente con el flujo actual. No asumir la escala 1–5 de la propuesta ni transformar registros históricos.
- Existe un scaffold de lectura Wear OS y una vista web dev con fixtures sintéticos/resumen separado; no hay integración comercial, persistencia de muestras, sincronización ni análisis de asociación. La API activa de IA admite chat, análisis de diario y análisis de autorreportes de ánimo, pero no acepta pulso/HRV; la lectura del reloj no llega al teléfono, a Firebase ni a MIA. Esa ampliación requiere una tarea/payload definidos, una autorización específica, retención y borrado, evaluación de Groq y gates de calidad propios.

## 5. Alcance candidato del MVP

**Salida analítica elegida por el fundador:** mostrar patrones personales de pulso y ánimo autoinformado observados repetidamente a lo largo del tiempo. Esta decisión fija la dirección del producto, pero no aprueba todavía una fórmula de correlación, un muestreo, persistencia, sincronización, proveedor, claim de precisión ni lanzamiento con datos reales. Queda fuera de alcance inferir/clasificar el ánimo actual desde una lectura puntual.

### Incluido para evaluación

- Desarrollar primero el recorrido manual de ánimo y diario y resúmenes descriptivos, tras consolidar las capacidades ya existentes.
- Evaluar sueño y pulso en reposo como campos manuales opcionales únicamente si se separan claramente de la valoración emocional y se registra su procedencia.
- Evaluar una importación de archivo iniciada por la persona, con procesamiento local como hipótesis inicial y sin transferencia de muestras a la nube por defecto.
- El prototipo técnico prioriza una app nativa directa de Wear OS con una lectura puntual de pulso iniciada por la persona; sus muestras no se guardan ni sincronizan. El build y dispositivo siguen sin validación.
- Solicitar solo categorías de datos aprobadas y de forma opcional.
- Mostrar un estado comprensible de conexión y permisos parciales/revocados.
- En la etapa Wear OS, presentar en una línea de tiempo solo check-ins de ánimo y muestras fisiológicas capturados y conservados localmente en el reloj. La unión con historial web/Firestore o con diarios queda fuera hasta aprobar una transferencia entre dispositivos.
- Mantener pulso, ánimo autoinformado y texto de diario como entradas distintas; no combinar automáticamente el contenido del diario con biometría.
- Mostrar procedencia, métrica, unidad, fecha/hora, período y número de muestras disponibles.
- Ofrecer filtros por fuente y período.
- Permitir desconectar y solicitar eliminación de los datos importados por Mood Log.
- Mostrar mensajes para datos ausentes, fuente sin soporte, error de permiso o sincronización incompleta.

### Fuera de alcance

- Diagnóstico, triage, tratamiento o predicción clínica.
- Detección de crisis, envío de alertas a familiares o notificación a profesionales.
- Recomendaciones médicas o de tratamiento basadas en el pulso.
- Alertas automáticas por umbrales universales de HRV o frecuencia cardíaca.
- Clasificación automática del contenido de diarios.
- Envío del texto del diario o datos biométricos a un proveedor de IA en el MVP.
- Ranking, comparación social o puntuación de bienestar.
- Feed social, retos compartidos, clasificación entre personas y gamificación que genere presión en la primera versión.
- Captura de pulso por cámara como capacidad de producción antes de validar calidad y limitaciones por dispositivo.
- Requisito de tener un dispositivo para usar la aplicación.

## 6. Historias de usuario

- **US-01 — Consentimiento:** Como persona usuaria, quiero entender qué datos se solicitarán y para qué antes de autorizar, para decidir con conocimiento.
- **US-02 — Conexión opcional:** Como persona usuaria, quiero conectar o cancelar la conexión sin perder otras funciones.
- **US-03 — Control granular:** Como persona usuaria, quiero permitir solo las categorías necesarias y saber si un permiso fue denegado o revocado.
- **US-04 — Contexto temporal:** Como persona usuaria, quiero ver mis pulsaciones junto a check-ins de ánimo que hice en el mismo reloj; una relación con registros web o diario solo se ofrecerá si una futura transferencia entre dispositivos se aprueba y explica por separado.
- **US-05 — Interpretación transparente:** Como persona usuaria, quiero ver el origen, unidad, métrica y cobertura de los datos, para no confundir estimaciones con mediciones completas.
- **US-06 — Control de datos:** Como persona usuaria, quiero desconectar la fuente y solicitar la eliminación de lo importado a Mood Log.
- **US-07 — Alternativa sin dispositivo:** Como persona usuaria, quiero seguir utilizando Mood Log aunque no conecte datos de salud.
- **US-08 — Privacidad del diario:** Como persona usuaria, quiero que el contenido de mi diario no se analice ni envíe a terceros sin una explicación y autorización separadas.
- **US-09 — Exploración personal:** Como persona adulta que autoriza el uso de sensores, quiero revisar pulso y ánimo que registré en un período común y entender si hay una asociación observada en mis datos, sin que la aplicación afirme que el pulso detecta o causa una emoción.

- **US-10 — Alcance local claro:** Como persona usuaria, quiero saber que los patrones del primer recorrido longitudinal usan únicamente datos capturados en mi reloj y no incluyen el historial de la app web ni se sincronizan con mi teléfono, para interpretar la cobertura correctamente.

## 7. Requisitos funcionales

Prioridad: **P0** bloquea un piloto; **P1** importante antes de ampliar; **P2** posterior. Las prioridades son propuestas.

| ID | Prioridad | Requisito |
|---|---:|---|
| FR-001 | P0 | La conexión a fuentes de salud debe ser voluntaria y no bloquear ninguna función principal. |
| FR-002 | P0 | Antes de pedir permiso, la aplicación debe explicar categorías, finalidad, almacenamiento/procesamiento, revocación y eliminación. |
| FR-003 | P0 | La app debe solicitar únicamente los permisos aprobados para la plataforma y soportar permisos parciales. |
| FR-004 | P0 | La persona debe poder ver el estado de conexión y reconocer permiso denegado, revocado, no disponible o error. |
| FR-005 | P0 | Cada medición mostrada debe conservar y presentar fuente, tipo de métrica, unidad y marca temporal disponible. |
| FR-006 | P0 | La línea de tiempo debe distinguir visualmente las fuentes incluidas en su alcance. En la etapa local Wear OS solo presenta check-ins de ánimo y mediciones de pulso capturados en ese reloj; no incluirá silenciosamente datos web/Firestore o diarios de otros dispositivos. |
| FR-007 | P0 | No debe inferirse ni etiquetarse automáticamente una emoción a partir de las mediciones biométricas. |
| FR-008 | P0 | Desconectar una fuente debe detener futuras importaciones cuando la plataforma lo permita y explicar qué ocurre con datos ya importados. |
| FR-009 | P0 | Debe existir un flujo para solicitar/eliminar datos conservados por Mood Log, con confirmación y resultado visible. |
| FR-010 | P0 | La funcionalidad debe funcionar como experiencia degradada si faltan permisos, mediciones o conexión. |
| FR-011 | P1 | La persona puede filtrar fuentes y períodos sin modificar los datos de origen. |
| FR-012 | P1 | Los agregados deben mostrar cobertura y cantidad de observaciones; no deben rellenar silenciosamente datos ausentes. |
| FR-013 | P1 | Una importación repetida debe evitar crear registros duplicados visibles. |
| FR-014 | P1 | Solo si se aprueba una función futura de transferencia y asociación, la persona podrá abrir una entrada del diario relacionada temporalmente; el texto no se procesa ni forma parte de los patrones locales iniciales del reloj. |
| FR-015 | P2 | La persona puede exportar una vista combinada después de revisar qué información contiene el archivo. |
| FR-016 | P2 | La persona puede habilitar, por separado, una futura función de análisis semántico del diario tras consentimiento específico y revisión de proveedor. |
| FR-017 | P0 | Cada dato fisiológico debe conservar su propia fuente, método de captura/importación, unidad, timestamp y estado de calidad; no asumir una sola fuente/calidad para todo el registro de ánimo. |
| FR-018 | P0 | Una importación de archivo debe ser iniciada por la persona, limitada al tipo/formato aprobado, cancelable y procesada en un entorno aislado; el producto debe informar si el archivo o sus muestras se transmiten o persisten. |
| FR-019 | P1 | Antes de implementar persistencia, producto debe decidir si un día admite uno o varios registros y definir zona horaria/fecha de agrupación. |
| FR-020 | P1 | Las correlaciones no se habilitan por un umbral de muestra arbitrario; deben tener método, límites, validación y presentación aprobados. |
| FR-021 | P0 | El almacenamiento longitudinal elegido permanece en el reloj. No enviar ni copiar muestras o check-ins a teléfono, Wear OS Data Layer, Firebase, IA, logs, analítica o proveedor externo sin una nueva decisión y revisión. |
| FR-022 | P0 | El producto debe indicar claramente que la cobertura longitudinal local corresponde solo a observaciones capturadas en el reloj y no es el historial completo de Mood Log. |

## 8. Requisitos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| NFR-PRV-001 | Privacidad | Recopilar y conservar el mínimo de datos necesario para el caso de uso aprobado. |
| NFR-SEC-001 | Seguridad | Ningún dato debe quedar accesible entre cuentas; verificar con pruebas de autorización negativas. |
| NFR-SEC-002 | Seguridad | No almacenar credenciales/tokens de plataformas de salud en documentos accesibles al cliente ni en logs. |
| NFR-DATA-001 | Integridad | Mantener procedencia, unidades, semántica temporal y deduplicación según el diseño aprobado. |
| NFR-DATA-002 | Calidad | Distinguir dato ausente, permiso no otorgado, fuente no soportada y cero medición. |
| NFR-UX-001 | Usabilidad | Consentimiento, desconexión y eliminación deben ser comprensibles y localizables. |
| NFR-DATA-003 | Procedencia | El origen y calidad se asignan por medición, no a nivel de un check-in que puede contener datos de distintas procedencias. |
| NFR-SEC-003 | Importación | Los archivos de salud se tratan como datos altamente sensibles, con límites de tamaño, validación, cancelación y no exposición en logs o telemetría. |
| NFR-SEC-004 | Almacenamiento local | Excluir las observaciones de backups en nube/transferencias de dispositivo hasta que exista una decisión revisada; documentar y verificar el comportamiento de cifrado, respaldo, restauración y borrado del APK publicado. |
| NFR-ACC-001 | Accesibilidad | Flujos compatibles con teclado, lector de pantalla, contraste y escalado de texto. |
| NFR-REL-001 | Fiabilidad | Errores de fuente/sincronización no deben mostrarse como éxito ni borrar datos de origen. |
| NFR-PORT-001 | Portabilidad | El contrato de producto no debe asumir que iOS y Android exponen idénticos datos. |
| NFR-OBS-001 | Observabilidad | Telemetría técnica no debe registrar valores biométricos, texto del diario ni identificadores de salud. |
| NFR-MED-001 | Límites de uso | La interfaz debe indicar que los resultados son descriptivos y no son diagnóstico ni consejo clínico. |

Los valores medibles de rendimiento y disponibilidad siguen pendientes. ADR-BIO-014 propone 90 días de retención inicial para la prueba local; el plazo final requiere aprobación de producto y revisión jurídica antes de almacenar datos reales.

## 9. Criterios de aceptación de los recorridos principales

### AC-01: conectar

- La persona ve un aviso propio de Mood Log antes del permiso del sistema.
- Puede cancelar y volver a la aplicación sin activar importaciones.
- Un permiso parcial queda reflejado en la interfaz y no se interpreta como un fallo completo.
- No se solicitan categorías fuera del alcance aprobado.

### AC-02: consultar

- La línea de tiempo diferencia visualmente cada fuente.
- Una muestra conserva el dato recibido y la zona horaria/origen disponibles.
- Si no hay datos en el período, se muestra “sin datos disponibles”; no se infiere valor cero.
- El resumen muestra el número de observaciones y período incluido.

### AC-03: diario (función futura fuera del alcance local Wear OS)

- Esta aceptación no aplica a la etapa local Wear OS. Si se aprueba una futura asociación entre dispositivos, la entrada se relaciona por tiempo solo bajo una regla documentada y visible.
- El texto no se transmite a un proveedor externo ni se analiza semánticamente por defecto.
- El enlace temporal puede retirarse/eliminarse sin modificar la entrada original, salvo que el usuario elija esa operación.

### AC-04: revocar y borrar

- Tras revocación, no se solicitan nuevas muestras sin permiso.
- La aplicación explica por separado permisos del sistema y datos ya almacenados.
- La solicitud de borrado identifica alcance, progreso, resultado y errores parciales.
- Una falla de borrado no se representa como borrado exitoso.

### AC-05: alcance de patrones en el reloj

- La interfaz explica antes de guardar que los datos longitudinales de esta etapa se quedan en el reloj y no se sincronizan con el teléfono, la app web ni la nube.
- La vista incluye únicamente lecturas de pulso y check-ins capturados localmente en el reloj; no muestra el historial Firestore como si formara parte de la serie.
- La persona puede ver el período y cobertura disponible, y distinguir ausencia de datos de una lectura con valor cero.
- La configuración compilada y probada no respalda ni transfiere las observaciones locales; el directorio privado no se presenta como cifrado sin evidencia.

## 10. Métricas de éxito propuestas

Medir de forma agregada y compatible con privacidad:

- comprensión del consentimiento en pruebas de usabilidad;
- tasa de éxito/error de conexión e importación por plataforma;
- duplicados y muestras sin unidad/procedencia;
- éxito y duración de desconexión/eliminación;
- uso de filtros y comprensión de la línea de tiempo;
- errores de accesibilidad y rendimiento.

No usar “mejora del ánimo”, continuidad de registros ni valores biométricos como medida de éxito clínico.

## 11. Decisiones pendientes de producto

- Plataformas y dispositivos del primer piloto.
- Métricas biométricas iniciales: frecuencia cardíaca, HRV/VFC y/o ninguna.
- Ventana, frecuencia y período histórico de importación.
- Almacenamiento local, almacenamiento remoto o prueba comparativa (ver ADR-BIO-001).
- Definición de “dato cercano en el tiempo” para mostrar diario y mediciones.
- Uso futuro de análisis semántico del diario y consentimiento separado.
- Retención, exportación, eliminación y soporte.
- Idiomas y jurisdicciones de lanzamiento.
