# Plantilla de modelo económico de Mood Log

**Estado:** herramienta para completar con cotizaciones y resultados propios; no contiene precios recomendados ni proyecciones de ventas.
**Mercado inicial previsto:** Colombia; primera versión para personas adultas.
**Propósito:** comparar la viabilidad de planes y canales antes de invertir en adquisición o ampliar datos sensibles.

## Cómo usarla

1. Duplica esta plantilla por escenario y registra fecha, fuente, moneda y responsable de cada supuesto.
2. Sustituye “por medir” por cotizaciones actuales y costos reales de Firebase, Vercel, Groq, soporte y canales de pago. No copies tarifas históricas sin validar región, nivel de uso y términos aplicables.
3. Construye escenarios conservador, base y alto usando rangos observados en entrevistas, pruebas y cohortes. No asumas que una respuesta favorable en entrevista equivale a una compra.
4. Recalcula con cohortes reales solo después de una prueba comercial autorizada. Separa pruebas de producto, investigación académica y atención clínica.

## Hoja de supuestos

| Variable | Unidad | Fuente / fecha | Conservador | Base | Alto |
|---|---|---|---:|---:|---:|
| Personas activas mensuales | cuentas/mes | Por medir | — | — | — |
| Días activos promedio por cuenta activa mensual | días/cuenta/mes | Por medir | — | — | — |
| Conversión de activo a pago | proporción | Por medir | — | — | — |
| Precio mensual del plan | COP/mes | Por probar | — | — | — |
| Precio anual del plan | COP/año | Por probar | — | — | — |
| Proporción de pagos anuales | proporción | Por medir | — | — | — |
| Comisión porcentual del canal de pago | proporción | Cotización vigente | — | — | — |
| Comisión fija por transacción | COP/transacción | Cotización vigente | — | — | — |
| Costos por cuenta activa mensual de infraestructura | COP/MAU/mes | Cotización/uso | — | — | — |
| Acciones de IA por día activo | acciones/día activo | Límite de producto | — | — | — |
| Costo de una acción de IA | COP/acción | Proveedor/uso | — | — | — |
| Costo variable de soporte | COP/MAU/mes | Medición | — | — | — |
| Gasto mensual de adquisición | COP/mes | Presupuesto | — | — | — |
| Nuevas cuentas pagadas atribuibles | cuentas/mes | Medición | — | — | — |
| Costos fijos mensuales (herramientas, legal, operación) | COP/mes | Cotizaciones/presupuesto | — | — | — |
| Impuestos y obligaciones aplicables | COP/% | Revisar con contador | — | — | — |

## Fórmulas para comparar planes

Define `MAU`, `dias_activos_promedio_por_MAU`, `conversion`, `precio_mensual`, `precio_anual`, `proporcion_anual`, `comision_pct`, `comision_fija`, `costo_infra_por_MAU`, `acciones_IA_por_dia_activo`, `costo_IA_por_accion`, `soporte_por_MAU` y `costos_fijos` como variables del escenario. Si tienes usuarios activos diarios (DAU), puedes reemplazar `MAU × días activos promedio` por `DAU × 30` para un mes de 30 días.

```text
cuentas_pagadas = MAU × conversion
precio_mensual_equivalente = precio_mensual × (1 − proporcion_anual)
                           + (precio_anual ÷ 12 × proporcion_anual)
ingreso_bruto = cuentas_pagadas × precio_mensual_equivalente
comisiones = ingreso_bruto × comision_pct
             + transacciones_del_mes × comision_fija
costo_IA = MAU × dias_activos_promedio_por_MAU × acciones_IA_por_dia_activo × costo_IA_por_accion
costo_variable = MAU × (costo_infra_por_MAU + soporte_por_MAU)
                 + costo_IA
contribucion = ingreso_bruto − comisiones − costo_variable
resultado_mensual_antes_de_impuestos = contribucion − costos_fijos
CAC = gasto_de_adquisicion ÷ nuevas_cuentas_pagadas_atribuibles
```

Los cálculos son una estructura de decisión, no una proyección ni un tratamiento contable. Verifica impuestos, retenciones, facturación, conversiones de moneda y cargos del proveedor con un contador y con los contratos vigentes. El precio anual se prorratea para comparar ingresos mensuales, pero la caja recibida y el reconocimiento contable pueden seguir reglas distintas.

### Sensibilidad de costo de IA (referencia vigente al 20-11-2026)

El backend predetermina `openai/gpt-oss-20b`; una variable solo de servidor puede cambiarlo a `openai/gpt-oss-120b`. Al 20-11-2026, Groq publica para 20B **USD 0,075/M tokens de entrada** y **USD 0,30/M de salida**; para 120B publica **USD 0,15/M de entrada** y **USD 0,60/M de salida**. Las tarifas no incluyen impuestos, cambio USD/COP, descuentos ni condiciones particulares de la cuenta; verifícalas antes de cada decisión comercial ([precios 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b), [precios 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b), [límites](https://console.groq.com/docs/rate-limits)).

```text
costo_por_accion_USD =
  tokens_entrada × precio_entrada_del_modelo ÷ 1.000.000
  + tokens_salida × precio_salida_del_modelo ÷ 1.000.000

costo_mensual_USD =
  MAU × días_activos_promedio_por_MAU × acciones_IA_por_día_activo × costo_por_accion_USD
```

Usa `0,075`/`0,30` para entrada/salida de 20B y `0,15`/`0,60` para 120B; los valores son USD por millón de tokens.

| Caso de sensibilidad (supuestos, no medición; 1.000 MAU × 30 días activos) | Tokens entrada/salida por acción | Acciones/cuenta/día activo | GPT OSS 20B por 1.000 MAU/mes | GPT OSS 120B por 1.000 MAU/mes |
|---|---:|---:|---:|---:|
| Chat de uso moderado | 1.500 / 400 | 2 | USD 13,95 | USD 27,90 |
| Chat frecuente | 1.500 / 400 | 10 | USD 69,75 | USD 139,50 |
| Análisis intensivo | 6.000 / 2.000 | 1 | USD 31,50 | USD 63,00 |

Los tokens de entrada de la tabla representan el total facturado como `prompt_tokens` (incluye instrucciones del sistema y contenido de usuario), no solo los caracteres que escribe la persona. `max_tokens` en el backend es un tope de salida (800 para chat/análisis de diario y 2.000 para análisis de ánimo), no el consumo típico. Reemplaza estos supuestos por histogramas de uso real del proveedor antes de presupuestar producción.

El backend permite hasta 40 solicitudes por cuenta al día y 8 dentro de cualquier ventana móvil de 60 segundos. Como estrés teórico en 20B, 40 acciones diarias de chat con 1.500 tokens de entrada y el máximo actual de 800 de salida sumarían cerca de **USD 423 por 1.000 cuentas activas/mes**; 40 análisis intensivos (6.000 tokens de entrada/2.000 de salida) sumarían **USD 1.260**. En 120B, con el precio publicado, serían aproximadamente **USD 846** y **USD 2.520** respectivamente. No son predicciones de consumo: la distribución real de tareas y tokens debe salir de facturación/uso del proveedor. El backend conserva contadores diarios de tokens de la respuesta Groq por usuario, modelo y tarea, sin texto de entrada/salida. Aún no calcula costo real, no captura fallos de escritura de forma recuperable y no constituye límite presupuestario; contrasta los contadores con la facturación del proveedor y configura el spend limit mensual de Groq más controles globales antes de escalar.

Groq no limita por UID de Mood Log: publica cuotas de modelo y proyecto con un techo de organización, y señala que ITPM/OTPM se controlan en la organización. Para el plan Developer, la tabla pública indica 30 RPM, 1.000 RPD, 8.000 TPM y 200.000 TPD para GPT OSS 20B y 120B; son valores base sujetos a excepción y **no confirman el plan, límites del proyecto ni techos organizacionales de Mood Log**. Comprueba la consola antes del piloto y separa proyectos por entorno cuando corresponda ([límites de Groq](https://console.groq.com/docs/rate-limits), [proyectos y límites](https://console.groq.com/docs/projects)).

La app limita cada UID a **40 solicitudes/día y 8 dentro de cualquier ventana móvil de 60 segundos** (`frontend/api/ai.ts`). En producción, también exige una cuota compartida configurable por scope/proyecto y la aplica transaccionalmente en Firestore a todas las instancias que usen el mismo scope y la misma base. Bajo el límite público Developer, 25 cuentas que consumen sus 40 solicitudes diarias ya alcanzarían 1.000 solicitudes/día; cuatro cuentas enviando 8 solicitudes cada una dentro del mismo minuto intentarían 32 RPM, por encima de 30 RPM. Un análisis de sensibilidad de 6.000 tokens de entrada + 2.000 de salida consumiría por sí solo el supuesto de 8.000 TPM. La cuota compartida de Mood Log no se ha configurado ni validado con la consola real y no cuenta tráfico de otras bases, otros proyectos/apps o tokens. Groq documenta límites de modelo por proyecto sujetos al techo organizacional; ITPM/OTPM se controlan a nivel de organización. Verifica valores de proyecto, techo organizacional y alcance compartido antes de habilitar IA en cualquier deployment ([límites de Groq](https://console.groq.com/docs/rate-limits), [proyectos y límites](https://console.groq.com/docs/projects)). Estas comparaciones son estrés de capacidad con la tarifa base pública, no límites observados de la cuenta.

El documento Firestore compartido serializa las solicitudes de un scope y puede volverse punto caliente; trátalo como control para una beta/piloto acotado, no como solución de alta concurrencia. Antes de una campaña de crecimiento, carga el backend con concurrencia objetivo y sustituye el contador por un servicio distribuido de límites con operaciones atómicas, observabilidad y prueba de failover. Mantén separado el presupuesto financiero de los límites de tasa y de tokens.

| MAU | Días activos supuestos por cuenta/mes | Solicitudes/día si cada cuenta usa IA 2 veces por día activo | Frente a 1.000 RPD públicos |
|---:|---:|---:|---:|
| 100 | 30 | 200 | 20% |
| 1.000 | 30 | 2.000 | 2× |
| 10.000 | 30 | 20.000 | 20× |

La tabla trata a cada MAU como activo los 30 días; es una sensibilidad de estrés y puede sobreestimar uso si las cuentas entran menos días. Sustituye por DAU/MAU y días activos observados cuando existan datos de producto autorizados. El código local ahora tiene una cuota compartida transaccional de solicitudes por proyecto/scope y producción falla de forma cerrada si no se configura; falta contrastar su scope/base y límites con Groq real, verificar concurrencia/fallos en staging, agregar un presupuesto de tokens/costo y probar alertas y pausa. La cuota de solicitudes usa una ventana móvil de 60 s y 24 h; el control del proveedor también puede depender de tokens y de tráfico fuera de la base Firestore. El límite por UID por sí solo no previene 429, sobreconsumo agregado ni gasto fuera de presupuesto.

### Sensibilidad de operaciones de Firestore para IA (estimación estática)

El flujo actual de `frontend/api/ai.ts` hace varias verificaciones y transacciones por solicitud. En el camino exitoso, sin reintentos de transacción y con `usage` devuelto por Groq, la lectura del código da este orden nominal:

| Tipo de solicitud | Lecturas de documentos | Escrituras de documentos | Eliminaciones |
|---|---:|---:|---:|
| Chat | 12 | 4 | 1 |
| Análisis de ánimo o diario | 14 | 4 | 1 |

Las lecturas de análisis incluyen la comprobación del consentimiento sensible; algunas lecturas del perfil se repiten en etapas distintas y cuentan por separado. Las escrituras incluyen cuota, evento de consentimiento, solicitud activa y contadores de uso; la eliminación corresponde al cierre de la solicitud activa. La cuenta no incorpora lecturas/escrituras del cliente, otras funciones del producto, reintentos de transacción, fallos, índices, reglas, almacenamiento ni tráfico. Es una proyección por conteo de operaciones del código, no una factura.

Para dimensionar con margen, la siguiente tabla usa **14 lecturas, 4 escrituras y 1 eliminación por solicitud** (todo el uso de IA se trata como análisis), **2 solicitudes por cuenta activa al día** y **30 días por mes**. Las cuotas gratuitas publicadas por Firebase se comparten con el resto del proyecto; no son una bolsa exclusiva de IA.

| Cuentas activas | Solicitudes/mes | Lecturas/mes | Escrituras/mes | Eliminaciones/mes | Lecturas/día | Escrituras/día | Eliminaciones/día |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 6.000 | 84.000 | 24.000 | 6.000 | 2.800 | 800 | 200 |
| 1.000 | 60.000 | 840.000 | 240.000 | 60.000 | 28.000 | 8.000 | 2.000 |
| 10.000 | 600.000 | 8.400.000 | 2.400.000 | 600.000 | 280.000 | 80.000 | 20.000 |

Como referencia de capacidad, Firebase publica para Cloud Firestore Standard sin costo hasta 50.000 lecturas, 20.000 escrituras y 20.000 eliminaciones al día, además de 1 GiB almacenado y 10 GiB/mes de salida de red. Estos límites aplican por proyecto y las tarifas por encima de ellos varían según ubicación. Con el supuesto anterior, 10.000 cuentas ya rebasarían los límites diarios gratuitos de lectura y escritura por el uso de IA; 1.000 quedarían por debajo en este cálculo, pero todavía hay que sumar el uso general de la aplicación. Revisa consumo y facturación de la base real antes de fijar precios o cuotas ([precios de Firebase](https://firebase.google.com/pricing), [facturación de Firestore](https://firebase.google.com/docs/firestore/pricing)).

Un estrés de 40 solicitudes diarias por cuenta, que coincide con el máximo de backend actual, produciría para 1.000 cuentas 560.000 lecturas, 160.000 escrituras y 40.000 eliminaciones diarias en este supuesto conservador; a ese volumen los máximos gratuitos ya no bastan. El límite por cuenta tampoco protege por sí solo la factura agregada: hacen falta alertas, un presupuesto global y una pausa controlada.

Para la línea de infraestructura web, Vercel publica Pro desde USD 20 por mes, con USD 20 de crédito de uso mensual y un asiento de despliegue incluido; asientos y consumo adicionales pueden cambiar el total. Es una tarifa de lista, no confirma el plan actual de Mood Log ni el consumo facturado del proyecto. Los precios publicados excluyen impuestos aplicables ([precios de Vercel](https://vercel.com/pricing), [detalle del plan Pro](https://vercel.com/docs/plans/pro-plan)). No se convierta a COP ni se agregue como costo total hasta confirmar plan, región, facturación y uso real.

### Equilibrio y valor de vida

```text
contribucion_mensual_por_cuenta_pagada =
  ingreso_mensual_equivalente_por_cuenta
  − comisiones_por_cuenta
  − (costo_variable_total_del_escenario ÷ cuentas_pagadas)

cuentas_pagadas_para_equilibrio =
  costos_fijos ÷ contribucion_mensual_por_cuenta_pagada

LTV_aproximado = contribucion_mensual_por_cuenta_pagada ÷ churn_mensual
```

La división del costo variable del escenario por cuentas pagadas asigna también el consumo de las cuentas gratuitas según la conversión usada. Si la conversión es cero, el costo por cuenta pagada y el equilibrio no están definidos. No uses el LTV aproximado antes de observar cancelaciones y contribución en cohortes durante un período suficiente. No uses benchmarks genéricos para declarar un CAC aceptable; fija el criterio de recuperación y margen antes del experimento.

## Escenarios de escala

Calcula cada fila con los mismos supuestos de precio, conversión, uso de IA y soporte; cambia únicamente el número de cuentas activas. Las cantidades son casos matemáticos para sensibilidad, no pronósticos.

| Cuentas activas mensuales | Conversión usada | Pagadas resultantes | Ingreso bruto | Costos variables | Contribución | Resultado antes de impuestos |
|---:|---:|---:|---:|---:|---:|---:|
| 100 | Por medir | Fórmula | Fórmula | Fórmula | Fórmula | Fórmula |
| 1.000 | Por medir | Fórmula | Fórmula | Fórmula | Fórmula | Fórmula |
| 10.000 | Por medir | Fórmula | Fórmula | Fórmula | Fórmula | Fórmula |

Incluye una prueba de estrés con el doble de acciones de IA y soporte esperado, mayor comisión de pago y menor conversión. La aplicación debe limitar gasto de IA y tener una respuesta clara al alcanzar cuotas; no habilites uso abierto hasta fijar presupuesto máximo y alertas.

## Investigación de precio y canal

- Entrevista primero sobre el problema, las alternativas y qué resultado sería útil; presenta opciones de precio después para reducir respuestas de cortesía.
- Prueba tres arquitecturas: núcleo gratuito con capacidades premium, suscripción y compra única. Registra preferencia y razones, pero no cobres ni afirmes disposición de pago hasta observar una acción real autorizada.
- Para una lista de espera o una prueba con pago, define antes aviso de privacidad, propósito, proveedor, retención, soporte y mecanismo de baja. Mantén el formulario separado de entradas de ánimo y de salud.
- No segmentes publicidad usando registros de ánimo, diario, pulso, HRV, inferencias emocionales ni estado de salud. No vendas esos datos.
- Compara canales por costo, cuentas que completan activación, retención, cancelación y costo de soporte. No optimices por cantidad de mediciones biométricas ni por frecuencia de uso compulsiva.

## Gate para invertir en crecimiento

Antes de escalar campañas, registra y aprueba internamente:

- segmento y necesidad repetida confirmados cualitativamente;
- precio y canal probados con el público adulto objetivo;
- costos de infraestructura, IA, pagos, soporte y cumplimiento con fuente y fecha;
- margen de contribución positivo en el escenario base y sensibilidad aceptable bajo estrés;
- presupuesto máximo, cuotas de IA, alertas y mecanismo de pausa;
- onboarding y privacidad entendibles, con consentimientos separados y opcionales donde corresponda;
- tratamiento sensible revisado para el mercado y la función realmente comercializada.

Una hoja financiera no cierra obligaciones legales ni sustituye la validación del producto. No incluyas datos de usuarios en esta plantilla.
