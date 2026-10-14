# Metodología de análisis: contexto biométrico

**Estado:** propuesta conceptual; los métodos no están implementados ni clínicamente validados.
**Uso previsto:** visualización personal y exploratoria.

## 1. Propósito

Definir qué puede significar “analizar el ánimo junto con pulsaciones” sin convertir una medición fisiológica en una etiqueta emocional o una conclusión médica. El análisis debe mantener visibles las fuentes, la cobertura y los límites de los datos.

## 2. Niveles de análisis

### Nivel 0 — Visualización por separado (recomendado para prototipo)

Mostrar registros de ánimo, entradas y mediciones en una línea de tiempo, cada una con su origen. No calcular asociaciones ni leer el contenido semántico del diario.

### Nivel 1 — Resúmenes descriptivos

Calcular agregados por métrica y período seleccionado. Cada agregado debería mostrar:

- métrica y unidad originales;
- período y zona horaria de presentación;
- cantidad de registros recibidos y, cuando sea posible, cobertura temporal;
- método de agregación (por ejemplo, mediana o rango);
- ausencias, permisos parciales y límites de muestreo.

Los valores no deben mezclarse entre métricas HRV distintas ni dispositivos sin justificar comparabilidad. No reemplazar muestras faltantes por cero.

### Nivel 2 — Asociaciones temporales exploratorias (pospuesto; requiere aprobación)

Podría explorar si los registros de ánimo se sitúan cerca de ciertos patrones fisiológicos dentro de una ventana temporal elegida y explicada. El resultado sería una descripción exploratoria, específica de la persona y del conjunto observado.

No afirmar causalidad: cercanía temporal no demuestra que una medición produzca un cambio de ánimo, ni que un cambio de ánimo produzca la medición. La ausencia de asociación tampoco demuestra ausencia de relación.

No se adopta como criterio de validez el umbral `n ≥ 10` propuesto para el coeficiente de Pearson. Un mínimo de observaciones, por sí solo, no demuestra que una correlación sea estable o útil. Antes de habilitar asociaciones se deben elegir el método, los supuestos, el tratamiento de valores atípicos y datos faltantes, la incertidumbre, el sesgo de selección y el lenguaje de presentación; deben revisarse con datos sintéticos y una evaluación adecuada.

### Fuera de alcance

- Inferir emociones o estado de ánimo únicamente a partir de pulso/HRV.
- Predecir una condición de salud o un evento futuro.
- Generar un “puntaje biológico de bienestar” que oculte las métricas de origen.
- Crear alertas de crisis, diagnóstico, recomendación médica o tratamiento.
- Analizar el texto libre del diario de forma predeterminada o enviarlo a IA.

## 3. Relación con el diario

Para el MVP se propone una asociación temporal explícita: presentar entradas alrededor del período de una medición, sin clasificar contenido ni copiar el texto a datos biométricos.

Si se estudia análisis semántico en una fase posterior:

1. Crear un requisito y consentimiento separados.
2. Definir qué fragmentos se procesan y si salen del dispositivo.
3. Mantener la respuesta como hipótesis/reflexión, nunca como diagnóstico.
4. Permitir consultar o eliminarla independientemente de la entrada original.
5. Evaluar proveedor, logs, retención y backend antes de habilitarla.

## 4. Unidad temporal y población de datos

Antes de implementar cualquier cálculo se deben definir:

- zona horaria de visualización y cómo se conserva el timestamp fuente;
- ventana de asociación entre registro de ánimo y muestras;
- período y granularidad de agregación;
- tratamiento de mediciones instantáneas frente a intervalos;
- cobertura mínima y número mínimo de observaciones;
- tratamiento de registros duplicados, tardíos o modificados;
- exclusión o segmentación de actividad física, sueño u otros contextos si se autorizan.

Estos valores no se fijan en esta especificación porque dependen de los tipos reales de datos, la investigación de usuario y la validación técnica. No seleccionar umbrales por conveniencia de implementación.

## 5. Principios estadísticos y de presentación

- Comparar datos de una misma persona y la misma métrica, no con otras personas.
- Mostrar tamaños de muestra, cobertura y período; advertir cuando los datos sean insuficientes.
- Preferir resúmenes robustos y comprensibles; indicar el método utilizado.
- No usar un umbral de tamaño de muestra aislado como sello de validez estadística.
- No realizar inferencias sobre datos faltantes ni extrapolar tendencias fuera de lo observado.
- Evitar búsquedas repetidas de patrones sin control de comparaciones múltiples si se añaden correlaciones.
- Presentar unidades y procedencia originales; no reducir todas las medidas a una puntuación única.
- Separar hechos observados, cálculo, interpretación y texto generativo.
- Permitir revisar los registros que contribuyen a un resumen cuando sea apropiado.

## 6. Ejemplos de lenguaje

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

## 7. Requisitos analíticos

- **AN-001:** todo valor agregado identifica su métrica, unidad, método, período y cobertura.
- **AN-002:** los registros de ánimo mantienen su escala de autorreporte explícita; no mezclar escalas históricas sin migración definida.
- **AN-003:** el sistema distingue cero, dato faltante, permiso denegado y error.
- **AN-004:** no hay conclusión emocional inferida exclusivamente de datos biométricos.
- **AN-005:** toda asociación usa una ventana temporal definida, visible y validada.
- **AN-006:** una muestra insuficiente produce un estado informativo, no un resultado engañoso.
- **AN-007:** el diario no se clasifica semánticamente en el MVP.
- **AN-008:** las pruebas usan datos sintéticos con casos temporales, métricas y faltantes variados.

## 8. Referencia a otros documentos

- [Requisitos de producto](product-requirements.md)
- [Diseño técnico](technical-design.md)
- [Plan de validación](validation-plan.md)
- [Privacidad y seguridad](privacy-security.md)
