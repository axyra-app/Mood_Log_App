# Requisitos de producto: contexto biométrico

**Feature:** `FEAT-BIO-001`
**Estado:** propuesta; requisitos por validar con usuarios, ingeniería y responsables de privacidad.

## 1. Problema

Los registros de ánimo y el diario reflejan la experiencia tal como la persona la recuerda y decide escribirla. Algunas personas pueden querer consultar datos fisiológicos cercanos en el tiempo para comprender mejor el contexto de sus propios registros.

Una medición fisiológica no representa directamente una emoción. El valor del producto consiste en presentar fuentes distintas lado a lado y ayudar a la persona a formular preguntas, sin afirmar que una métrica explique su estado de ánimo.

## 2. Objetivo y resultado esperado

Permitir que una persona que lo elige:

- autorice de manera consciente una fuente de salud compatible;
- consulte mediciones importadas junto con sus registros de ánimo y diario;
- entienda el origen, la cobertura, unidad y limitaciones de cada medición;
- controle conexión, uso y eliminación de datos;
- use las funciones centrales de Mood Log sin conectar dispositivos.

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
- No está decidido si las muestras se conservan solo en el dispositivo o se sincronizan en Firebase.
- No está decidido si en una fase futura se analizará semánticamente el texto libre del diario.
- La propuesta de implementación compartida menciona un backend distinto, pero el repositorio actual documenta Firebase. No se aprueba una migración por inferencia; debe resolverse como decisión arquitectónica separada.
- No está decidido si se permite más de un check-in de ánimo por día. El diseño debe soportar la decisión de producto sin imponer un índice único prematuro.
- La escala de ánimo canónica debe consolidarse con el modelo y la UI existentes antes de diseñar persistencia nueva; no asumir una escala 1–5 por estar en la propuesta.
- No existe integración implementada al momento de escribir esta especificación.

## 5. Alcance candidato del MVP

### Incluido para evaluación

- Desarrollar primero el recorrido manual de ánimo y diario y resúmenes descriptivos, tras consolidar las capacidades ya existentes.
- Evaluar sueño y pulso en reposo como campos manuales opcionales únicamente si se separan claramente de la valoración emocional y se registra su procedencia.
- Evaluar una importación de archivo iniciada por la persona, con procesamiento local como hipótesis inicial y sin transferencia de muestras a la nube por defecto.
- Conectar una fuente de salud nativa solo después de validar plataforma, permisos y arquitectura.
- Solicitar solo categorías de datos aprobadas y de forma opcional.
- Mostrar un estado comprensible de conexión y permisos parciales/revocados.
- Presentar registros de ánimo, entradas del diario y muestras fisiológicas en una línea de tiempo.
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
- **US-04 — Contexto temporal:** Como persona usuaria, quiero ver mis mediciones junto a entradas de ánimo y diario de fechas cercanas.
- **US-05 — Interpretación transparente:** Como persona usuaria, quiero ver el origen, unidad, métrica y cobertura de los datos, para no confundir estimaciones con mediciones completas.
- **US-06 — Control de datos:** Como persona usuaria, quiero desconectar la fuente y solicitar la eliminación de lo importado a Mood Log.
- **US-07 — Alternativa sin dispositivo:** Como persona usuaria, quiero seguir utilizando Mood Log aunque no conecte datos de salud.
- **US-08 — Privacidad del diario:** Como persona usuaria, quiero que el contenido de mi diario no se analice ni envíe a terceros sin una explicación y autorización separadas.

## 7. Requisitos funcionales

Prioridad: **P0** bloquea un piloto; **P1** importante antes de ampliar; **P2** posterior. Las prioridades son propuestas.

| ID | Prioridad | Requisito |
|---|---:|---|
| FR-001 | P0 | La conexión a fuentes de salud debe ser voluntaria y no bloquear ninguna función principal. |
| FR-002 | P0 | Antes de pedir permiso, la aplicación debe explicar categorías, finalidad, almacenamiento/procesamiento, revocación y eliminación. |
| FR-003 | P0 | La app debe solicitar únicamente los permisos aprobados para la plataforma y soportar permisos parciales. |
| FR-004 | P0 | La persona debe poder ver el estado de conexión y reconocer permiso denegado, revocado, no disponible o error. |
| FR-005 | P0 | Cada medición mostrada debe conservar y presentar fuente, tipo de métrica, unidad y marca temporal disponible. |
| FR-006 | P0 | La línea de tiempo debe distinguir visualmente autorreporte, diario y mediciones importadas. |
| FR-007 | P0 | No debe inferirse ni etiquetarse automáticamente una emoción a partir de las mediciones biométricas. |
| FR-008 | P0 | Desconectar una fuente debe detener futuras importaciones cuando la plataforma lo permita y explicar qué ocurre con datos ya importados. |
| FR-009 | P0 | Debe existir un flujo para solicitar/eliminar datos conservados por Mood Log, con confirmación y resultado visible. |
| FR-010 | P0 | La funcionalidad debe funcionar como experiencia degradada si faltan permisos, mediciones o conexión. |
| FR-011 | P1 | La persona puede filtrar fuentes y períodos sin modificar los datos de origen. |
| FR-012 | P1 | Los agregados deben mostrar cobertura y cantidad de observaciones; no deben rellenar silenciosamente datos ausentes. |
| FR-013 | P1 | Una importación repetida debe evitar crear registros duplicados visibles. |
| FR-014 | P1 | La persona puede abrir una entrada del diario relacionada temporalmente sin que el sistema procese el texto automáticamente. |
| FR-015 | P2 | La persona puede exportar una vista combinada después de revisar qué información contiene el archivo. |
| FR-016 | P2 | La persona puede habilitar, por separado, una futura función de análisis semántico del diario tras consentimiento específico y revisión de proveedor. |
| FR-017 | P0 | Cada dato fisiológico debe conservar su propia fuente, método de captura/importación, unidad, timestamp y estado de calidad; no asumir una sola fuente/calidad para todo el registro de ánimo. |
| FR-018 | P0 | Una importación de archivo debe ser iniciada por la persona, limitada al tipo/formato aprobado, cancelable y procesada en un entorno aislado; el producto debe informar si el archivo o sus muestras se transmiten o persisten. |
| FR-019 | P1 | Antes de implementar persistencia, producto debe decidir si un día admite uno o varios registros y definir zona horaria/fecha de agrupación. |
| FR-020 | P1 | Las correlaciones no se habilitan por un umbral de muestra arbitrario; deben tener método, límites, validación y presentación aprobados. |

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
| NFR-ACC-001 | Accesibilidad | Flujos compatibles con teclado, lector de pantalla, contraste y escalado de texto. |
| NFR-REL-001 | Fiabilidad | Errores de fuente/sincronización no deben mostrarse como éxito ni borrar datos de origen. |
| NFR-PORT-001 | Portabilidad | El contrato de producto no debe asumir que iOS y Android exponen idénticos datos. |
| NFR-OBS-001 | Observabilidad | Telemetría técnica no debe registrar valores biométricos, texto del diario ni identificadores de salud. |
| NFR-MED-001 | Límites de uso | La interfaz debe indicar que los resultados son descriptivos y no son diagnóstico ni consejo clínico. |

Los valores medibles de rendimiento, disponibilidad y retención quedan pendientes de decisión y no deben inventarse antes de definir escala, usuarios y plataforma.

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

### AC-03: diario

- La entrada se relaciona por tiempo solo bajo una regla documentada y visible.
- El texto no se transmite a un proveedor externo ni se analiza semánticamente por defecto.
- El enlace temporal puede retirarse/eliminarse sin modificar la entrada original, salvo que el usuario elija esa operación.

### AC-04: revocar y borrar

- Tras revocación, no se solicitan nuevas muestras sin permiso.
- La aplicación explica por separado permisos del sistema y datos ya almacenados.
- La solicitud de borrado identifica alcance, progreso, resultado y errores parciales.
- Una falla de borrado no se representa como borrado exitoso.

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
