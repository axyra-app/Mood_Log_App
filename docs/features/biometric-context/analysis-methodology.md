# Metodología de análisis: contexto biométrico

**Estado:** la vista interna usa fixtures sintéticos y calcula mediana, rango, cantidad y período por fuente/métrica; no relaciona biometría con ánimo. El fundador solicitó usar pulso para analizar el ánimo, pero aún no ha elegido entre una asociación personal repetida y una inferencia del ánimo actual. Los métodos no están validados para Mood Log ni clínicamente validados; la salida actual solo sirve para revisar la presentación. **Revisión bibliográfica actualizada:** 20 de noviembre de 2026; se verificaron estado de publicación, población analítica y límites técnicos de las fuentes citadas.
**Uso previsto:** visualización personal y exploratoria.

## 1. Propósito

Definir qué puede significar “analizar el ánimo junto con pulsaciones” sin convertir una medición fisiológica en una etiqueta emocional o una conclusión médica. El análisis debe mantener visibles las fuentes, la cobertura y los límites de los datos.

## 2. Evidencia y límites de interpretación

La literatura longitudinal permite explorar asociaciones personales entre datos de wearables y ánimo autoinformado, pero no justifica asumir una relación universal ni leer un estado emocional directamente del pulso.

- Un **preprint medRxiv todavía no revisado por pares** analizó a 3.139 médicos en su primer año de residencia con datos de Fitbit y puntuaciones diarias de ánimo autoinformadas durante un año. Las asociaciones variaron entre personas y podían ser positivas, negativas o no significativas; el 20,3 % no mostró correlaciones significativas con las características estudiadas. La señal fue longitudinal y multimétrica (actividad, sueño, pulso en reposo), no una clasificación del ánimo desde una lectura puntual. La población y el diseño no representan automáticamente a usuarios colombianos de Mood Log ni demuestran causalidad. [He et al., *Personalized Insights Derived from Wearable Device Data and Large Language Models to Improve Well-Being*, preprint medRxiv](https://pmc.ncbi.nlm.nih.gov/articles/PMC12976902/).
- Un estudio exploratorio de 12 meses reclutó a 20 estudiantes universitarios, pero entrenó y evaluó los modelos predictivos sobre el subconjunto de 7 participantes con al menos 200 días de datos. Reportó resultados prometedores con varias modalidades; ese tamaño/modelo y su configuración no son una estimación de rendimiento transferible a Mood Log, a otra población o a una app que solo lea frecuencia cardíaca. [Jafarlou et al., *Objective Prediction of Next-Day's Affect Using Multimodal Physiological and Behavioral Data*](https://pubmed.ncbi.nlm.nih.gov/36920456/).
- Un estudio longitudinal de miembros de WHOOP durante 13 meses encontró asociaciones entre salud mental autoinformada y múltiples medidas: HRV, pulso en reposo, sueño y actividad. 181.574 personas fueron consideradas inicialmente; las muestras analíticas reportadas fueron 170.320–172.283 para análisis interpersonales y cerca de 3.196–3.197 para los intrapersonales, que requerían al menos ocho encuestas y datos suficientes. El análisis emparejó respuestas mensuales con ventanas fisiológicas de 14 o 28 días y excluyó ventanas con menos de 7 días de datos. Las asociaciones fueron pequeñas: el mayor coeficiente estandarizado interpersonal reportado fue 0,09 para estrés y pulso en reposo; la asociación intrapersonal mayor citada fue −0,04 para PHQ-2 y zonas de frecuencia cardíaca (proxy de actividad). Ningún efecto rezagado de fisiología hacia resultados mentales alcanzó significación; sí se reportó que el estrés autoinformado precedía ciertos cambios fisiológicos. Varios autores eran empleados/contratistas de WHOOP y la empresa aportó sus ingresos; considerar este vínculo y la población de usuarios del proveedor al ponderar la evidencia. No evalúa si una lectura puntual permite detectar ánimo ni valida Mood Log. [Presby et al., *Inter- and Intrapersonal Associations Between Physiology and Mental Health*](https://www.jmir.org/2025/1/e64955).
- Un estudio de 4 semanas con relojes inteligentes y 47 personas informó correlaciones de algunos índices **HRV** con síntomas autoinformados; los autores destacan inconsistencia entre significaciones, muestra pequeña y dificultad de interpretación temporal. HRV no equivale a pulso y estos datos no demuestran que una lectura puntual de HR permita clasificar emociones. [Jo et al., *Association between heart rate variability metrics from a smartwatch and self-reported depression and anxiety symptoms*](https://pmc.ncbi.nlm.nih.gov/articles/PMC11176536/).
- Un experimento de reconocimiento con 25 sujetos usó videos para evocar estados neutral/feliz/triste, emparejó la emoción objetivo con una línea base neutral y normalizó las características de HR con esa línea base. El protocolo publicó una señal del brazalete a 25 Hz. Es evidencia de viabilidad de laboratorio en ese dispositivo y diseño; no representa uso cotidiano ni ánimo autoinformado espontáneo. Además, su entrada no equivale a la métrica `HEART_RATE_BPM` que expone el `MeasureClient` del prototipo, así que no es una demostración de que la implementación actual pueda reproducir ese clasificador. [Shu et al., *Wearable Emotion Recognition Using Heart Rate Data from a Smart Bracelet*](https://pubmed.ncbi.nlm.nih.gov/32012920/).

### Consecuencias de producto

1. La puntuación que la persona registra sigue siendo la observación de ánimo; la frecuencia cardíaca y HRV son medidas fisiológicas separadas, no etiquetas emocionales.
2. El MVP debe empezar con registros paralelos y resúmenes descriptivos por fuente, tiempo y cobertura. Una línea temporal cercana a un check-in solo indica coexistencia temporal.
3. Si más adelante se prueba una asociación, debe estimarse dentro de la misma persona, comparando la métrica con su historial y sus propios registros repetidos. Mostrar también ausencia de patrón, calidad, faltantes y rango de incertidumbre; nunca forzar una conclusión.
4. El modelo no debe generar alertas, recomendaciones clínicas ni una clasificación automática de ansiedad, estrés o depresión. No usar un modelo poblacional ni un valor universal de pulso para asignar ánimo.
5. La evidencia recuperada estudia en su mayoría series longitudinales o ventanas multi-semana, HRV, sueño/actividad y medidas de salud mental específicas. El único estudio citado de clasificación de emociones desde pulso es una tarea de laboratorio con una señal de brazalete de 25 Hz; su señal y protocolo no coinciden con la lectura puntual en BPM que implementa el scaffold actual. Ninguno valida estimar el ánimo desde esa lectura. El producto debe cambiar el objetivo técnico y definir qué señal, frecuencia, duración, contexto y autorreporte repetido necesitaría —con permisos y retención revisados— o limitarse a mostrar contexto y autorreporte. No se debe inferir que recolectar más mediciones por sí solo resolvería la validez.
6. Los estudios citados no validan una versión comercial en Colombia, Health Connect, dispositivos Wear OS específicos ni el producto Mood Log. Se necesita un plan metodológico y un piloto separado antes de describir asociaciones como útiles para los usuarios.

El estado de ánimo cambia por muchos factores. Actividad física, sueño, enfermedad, fármacos, consumo de estimulantes, postura y contexto pueden modificar datos fisiológicos; una coincidencia temporal no identifica cuál de esos factores intervino. Por eso, un eventual análisis no debe presentar pulso/HRV como causa ni como detector.

## 3. Niveles de análisis

### Nivel 0 — Visualización por separado (implementado en prototipo sintético)

Mostrar las fuentes por separado, cada una con su origen. Para la etapa local Wear OS, el conjunto previsto se limita a check-ins de ánimo y mediciones capturados en el reloj; no incorporar registros web/Firestore o diario de otros dispositivos. No calcular asociaciones ni leer el contenido semántico del diario.

### Nivel 1 — Resúmenes descriptivos (implementados solo en el prototipo sintético)

Calcular agregados por métrica y período seleccionado. Cada agregado debería mostrar:

- métrica y unidad originales;
- período y zona horaria de presentación;
- cantidad de registros recibidos y, cuando sea posible, cobertura temporal;
- método de agregación (por ejemplo, mediana o rango);
- ausencias, permisos parciales y límites de muestreo.

Los valores no deben mezclarse entre métricas HRV distintas ni dispositivos sin justificar comparabilidad. No reemplazar muestras faltantes por cero.

La página interna `frontend/src/pages/dev/HealthContextPrototype.tsx` muestra actualmente mediana, rango y cantidad de observaciones separadas por métrica/fuente, además del período observado. Usa únicamente fixtures. No define cobertura de reloj, frecuencia esperada, tendencia ni suficiencia de muestra, y no se debe presentar como análisis de usuarios reales.

### Nivel 2 — Patrones personales temporales (dirección elegida; no implementado; requiere método y aprobación)

Podría explorar si los registros de ánimo se sitúan cerca de ciertos patrones fisiológicos dentro de una ventana temporal elegida y explicada. El resultado sería una descripción exploratoria, específica de la persona y del conjunto observado.

No afirmar causalidad: cercanía temporal no demuestra que una medición produzca un cambio de ánimo, ni que un cambio de ánimo produzca la medición. La ausencia de asociación tampoco demuestra ausencia de relación.

El fundador eligió mostrar patrones personales entre mediciones repetidas de pulso y ánimo autoinformado. Inferir el ánimo actual desde pulso sería otra función y queda fuera de esta sección. No se adopta como criterio de validez el umbral `n ≥ 10` propuesto para Pearson. Un mínimo de observaciones, por sí solo, no demuestra estabilidad o utilidad. Antes de habilitar asociaciones se deben elegir el método, supuestos, tratamiento de valores atípicos y faltantes, incertidumbre, sesgo de selección y lenguaje; revisarlos con datos sintéticos y evaluación apropiada.

### Fuera de alcance

- Inferir emociones o estado de ánimo únicamente a partir de pulso/HRV.
- Predecir una condición de salud o un evento futuro.
- Generar un “puntaje biológico de bienestar” que oculte las métricas de origen.
- Crear alertas de crisis, diagnóstico, recomendación médica o tratamiento.
- Analizar el texto libre del diario de forma predeterminada o enviarlo a IA.

## 4. Relación con el diario

Para el MVP se propone una asociación temporal explícita: presentar entradas alrededor del período de una medición, sin clasificar contenido ni copiar el texto a datos biométricos.

Si se estudia análisis semántico en una fase posterior:

1. Crear un requisito y consentimiento separados.
2. Definir qué fragmentos se procesan y si salen del dispositivo.
3. Mantener la respuesta como hipótesis/reflexión, nunca como diagnóstico.
4. Permitir consultar o eliminarla independientemente de la entrada original.
5. Evaluar proveedor, logs, retención y backend antes de habilitarla.

## 5. Unidad temporal y población de datos

Antes de implementar cualquier cálculo se deben definir:

- zona horaria de visualización y cómo se conserva el timestamp fuente;
- ventana de asociación entre registro de ánimo y muestras;
- período y granularidad de agregación;
- tratamiento de mediciones instantáneas frente a intervalos;
- cobertura mínima y número mínimo de observaciones;
- tratamiento de registros duplicados, tardíos o modificados;
- exclusión o segmentación de actividad física, sueño u otros contextos si se autorizan.

Estos valores no se fijan en esta especificación porque dependen de los tipos reales de datos, la investigación de usuario y la validación técnica. No seleccionar umbrales por conveniencia de implementación.

## 6. Principios estadísticos y de presentación

- Comparar datos de una misma persona y la misma métrica, no con otras personas.
- Mostrar tamaños de muestra, cobertura y período; advertir cuando los datos sean insuficientes.
- Preferir resúmenes robustos y comprensibles; indicar el método utilizado.
- No usar un umbral de tamaño de muestra aislado como sello de validez estadística.
- No realizar inferencias sobre datos faltantes ni extrapolar tendencias fuera de lo observado.
- Evitar búsquedas repetidas de patrones sin control de comparaciones múltiples si se añaden correlaciones.
- Presentar unidades y procedencia originales; no reducir todas las medidas a una puntuación única.
- Separar hechos observados, cálculo, interpretación y texto generativo.
- Permitir revisar los registros que contribuyen a un resumen cuando sea apropiado.

## 7. Ejemplos de lenguaje

### Adecuado

- “En el período seleccionado hay 18 mediciones de frecuencia cardíaca disponibles.”
- “Tus registros de ánimo y estas mediciones coinciden en hora en algunos días; esta vista no indica causalidad.”
- “No hay suficientes datos en este período para mostrar un resumen.”
- “La métrica HRV disponible es RMSSD, expresada en milisegundos, según la fuente conectada.”

### No adecuado

- “Tu pulso demuestra que estás ansioso.”
- “La baja HRV causó tu mal ánimo.”
- “Mood Log detectó una crisis.”
- “Tu cuerpo está en estado de depresión/estrés.”

## 8. Requisitos analíticos

- **AN-001:** todo valor agregado identifica su métrica, unidad, método, período y cobertura.
- **AN-002:** los registros de ánimo mantienen su escala de autorreporte explícita; no mezclar escalas históricas sin migración definida.
- **AN-003:** el sistema distingue cero, dato faltante, permiso denegado y error.
- **AN-004:** no hay conclusión emocional inferida exclusivamente de datos biométricos.
- **AN-005:** toda asociación usa una ventana temporal definida, visible y validada.
- **AN-006:** una muestra insuficiente produce un estado informativo, no un resultado engañoso.
- **AN-007:** el diario no se clasifica semánticamente en el MVP.
- **AN-008:** las pruebas usan datos sintéticos con casos temporales, métricas y faltantes variados.
- **AN-009:** ningún resultado derivado del pulso/HRV se muestra como una medición de emoción, diagnóstico o predicción de crisis.
- **AN-010:** los resultados exploratorios identifican que la asociación es personal, observacional y no causal; el usuario puede ver los registros y período que la componen.

## 9. Referencia a otros documentos

- [Requisitos de producto](product-requirements.md)
- [Diseño técnico](technical-design.md)
- [Plan de validación](validation-plan.md)
- [Privacidad y seguridad](privacy-security.md)
- [Documentación de MeasureClient de Android](https://developer.android.com/health-and-fitness/health-services/active-data/measure-client): referencia del tipo de medición puntual disponible para este prototipo; revisar contra la versión de API objetivo al implementar.
