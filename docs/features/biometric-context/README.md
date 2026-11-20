# Feature brief: contexto biométrico para ánimo y diario

**ID:** `FEAT-BIO-001`

**Estado:** propuesta en descubrimiento; el prototipo Wear OS compila e instala en un AVD Wear OS 6/API 36, sin validación de sensor físico ni persistencia longitudinal.
**Propietario:** por asignar
**Última revisión:** 20 de noviembre de 2026
**Mercado inicial:** Colombia; primer lanzamiento dirigido a mayores de 18 años. Cualquier incorporación de menores requiere una fase y revisión independientes.
**Prioridad indicada por el fundador:** app directa Wear OS/Android (Health Services); Health Connect en el teléfono es complementario; iOS (HealthKit) queda para una etapa posterior
**Persistencia de la siguiente etapa longitudinal:** almacenamiento privado local solo en el reloj elegido; implementación y controles pendientes. Ver [Diseño técnico](technical-design.md) y [Registro de decisiones](decision-log.md).

## 1. Propósito

Investigar y definir una capacidad opcional para que la persona pueda ver, en una línea de tiempo personal, sus registros de ánimo y diario junto con datos fisiológicos importados desde una fuente de salud autorizada. El objetivo es aportar contexto a la autoobservación, no identificar automáticamente emociones ni ofrecer evaluación clínica.

**Alcance longitudinal acordado para la primera etapa:** el reloj conservará localmente solo las lecturas de pulso y los check-ins de ánimo capturados en ese mismo dispositivo. El historial de ánimo/diario de la app web no estará disponible en esa serie; no se sincroniza ni se copia al teléfono. La línea de tiempo combinada con otras fuentes sigue siendo una posibilidad futura sujeta a otro diseño y consentimiento.

## 2. Estado del documento

Este conjunto de documentos es una **especificación de propuesta**, no una integración comercial validada. El repositorio incluye una vista interna de desarrollo en `/__dev/health-context` con fixtures sintéticos y normalizadores puros para Health Connect, y una app nativa separada en `wearos/` con check-in manual y una lectura puntual de pulso mediante Health Services. El scaffold muestra aviso antes del permiso y guarda localmente una constancia versionada de aceptar/rechazar por intento; conserva hasta 100 eventos y ofrece consultar/borrar el log y abrir ajustes de permisos. No lee en segundo plano, no sincroniza ni persiste la muestra. El log no identifica cuenta ni se exporta, así que no sirve como registro de consentimiento para un piloto. No se ha compilado ni probado en emulador/reloj; no debe usarse con participantes ni anunciarse hasta completar revisión legal, de producto y técnica.

La dirección analítica elegida por el fundador es mostrar patrones personales de pulso y ánimo autoinformado a lo largo del tiempo. La salida futura se entiende como descriptiva y dentro de la persona; no implica diagnóstico, causalidad, predicción del ánimo actual ni monitoreo de crisis. El método, la retención final, el claim público y los gates de lanzamiento siguen por validar. El ADR-BIO-014 propone controles técnicos y un plazo inicial de 90 días, pero no están aprobados para datos reales.

La propuesta recibida que motivó esta revisión asume una plantilla y un backend distintos del repositorio actual. Sus ideas de producto se conservan como opciones; no se adopta por ello una migración a Enter Cloud, un cambio de React, ni una sustitución de Firebase. La arquitectura efectiva debe decidirse antes de implementar.

## 3. Decisión de almacenamiento

Por recomendación delegada por el fundador, la siguiente etapa longitudinal debe conservar datos únicamente en almacenamiento privado local del reloj; no se ha aprobado sincronización con teléfono, Firebase ni proveedores externos. Esta decisión no cambia el scaffold actual, que sigue sin persistir muestras. Retención, borrado, cifrado, exportación y consentimiento para persistir deben definirse antes de implementarlo.

Este paquete:

- documenta la decisión local inicial y las alternativas posteriores en [Diseño técnico](technical-design.md);
- define controles comunes y riesgos en [Privacidad y seguridad](privacy-security.md);
- registra la salida de producto elegida y las decisiones de datos/persistencia —incluida la propuesta técnica aún pendiente— en [Registro de decisiones](decision-log.md).

No se ha aprobado almacenamiento remoto de datos biométricos. La documentación Android advierte que los `DataItem` del Wear OS Data Layer pueden respaldarse en nube; no deben usarse para transferir muestras bajo una promesa “sin nube” sin revisión adicional.

## 4. Navegación

| Documento | Propósito |
|---|---|
| [Requisitos de producto](product-requirements.md) | Problema, alcance, actores, requisitos funcionales/no funcionales y criterios de aceptación. |
| [Metodología de análisis](analysis-methodology.md) | Alcance y límites de análisis descriptivo y asociaciones temporales. |
| [Diseño técnico](technical-design.md) | Alternativas de almacenamiento, componentes, flujos, modelo conceptual, sincronización y fallos. |
| [Privacidad y seguridad](privacy-security.md) | Inventario de datos, límites de confianza, amenazas, controles y ciclo de vida. |
| [Plan de validación](validation-plan.md) | Estrategia de pruebas, gates de lanzamiento, métricas y rollout. |
| [Registro de decisiones](decision-log.md) | Decisiones acordadas, controles pendientes y decisiones abiertas. |

## 5. Dirección propuesta por etapas

Las etapas siguientes ordenan la exploración y no certifican que una capacidad exista ni aprueban una migración técnica:

| Etapa | Alcance candidato | Condición para avanzar |
|---|---|---|
| 0 — Alineación y seguridad | Confirmar arquitectura existente, modelo canónico, entorno de pruebas, reglas y alcance funcional. | Aprobación de arquitectura y controles básicos; sin datos reales de salud. |
| 1 — Experiencia manual | Consolidar check-in, diario, historial y resúmenes descriptivos; sueño y pulso manuales solo si se aprueban como campos separados y con procedencia visible. | Recorridos completos, datos aislados por usuario, escalas y política de frecuencia de registro decididas. |
| 2 — Importación de salud | Evaluar importación iniciada por la persona desde un archivo exportado de Apple Health u otra fuente soportada. Procesamiento local y datos sintéticos primero; no sincronizar a la nube por defecto. | Parser acotado y probado, consentimiento, límites de tamaño, borrado y revisión de datos de salud. |
| 3 — Captura experimental | Investigar medición por cámara únicamente como experimento, con evaluación de señal y mensajes de limitación. | Prueba técnica y validación de calidad en dispositivos objetivo; nunca guardar una lectura que no supere controles definidos. |
| 4 — Insights opcionales | Evaluar asociaciones personales con método explícito; IA, si se considera, como decisión separada y posterior. | Validación estadística, privacidad, proveedor y consentimiento específicos. |

La capa social (feed, comparación, logros públicos) queda fuera de las primeras etapas. La gamificación no debe presionar a registrar datos ni exponer información íntima.

## 6. Resumen ejecutivo

La propuesta combina tres fuentes separadas:

1. **Autorreporte:** valoración, emociones, actividades y contexto introducidos voluntariamente.
2. **Diario:** texto y metadatos escritos por la persona.
3. **Biometría importada:** muestras con procedencia, hora, unidad y métrica originales.

La primera experiencia candidata es una línea de tiempo y resúmenes descriptivos transparentes. La siguiente iteración longitudinal elegida se limita a check-ins de ánimo y mediciones de pulso capturados en el mismo reloj y persistidos allí localmente; la app nativa Wear OS ya permite check-in manual y lectura puntual, pero aún no persiste ni resume muestras. No incorpora historial web/Firestore ni diario, y no copia datos al teléfono. El diario no se analiza semánticamente ni se envía a proveedores de IA por defecto. Cualquier persistencia remota o copia al teléfono requiere otra decisión.

La revisión de APIs oficiales confirma que iOS/HealthKit y Android/Health Connect requieren permisos de una app móvil; además, una app Wear OS propia accede a sensores mediante Health Services y permisos del reloj. HealthKit ofrece HRV SDNN; Health Connect, HRV RMSSD; los valores no son intercambiables. Android limita por defecto el historial leído de otras apps a 30 días previos al permiso. Ver [diseño técnico, compatibilidad](technical-design.md#21-compatibilidad-observada-en-documentación-oficial). La primera prueba priorizada es una app Wear OS directa con HR puntual y check-in manual; el prototipo en `wearos/` compiló e instaló en un AVD, sin validación física ni integración de producto longitudinal. Importar histórico desde Health Connect queda como complemento.

El fundador ya priorizó Wear OS/Android y pidió que Mood Log llegue directamente al reloj. Health Connect en el teléfono podrá importar registros de otras fuentes en una etapa complementaria. Para una etapa longitudinal se eligió almacenamiento privado local solo en el reloj, sin sincronización al teléfono o a la nube; esto aún no está implementado. El 20-11-2026 el módulo `wearos/` compiló e instaló en el AVD Wear OS 6/API 36. El contenedor móvil Capacitor `com.moodlog.app` es otra app; al instalarlo en el reloj mostró que falta WebView. Ver [ADR-BIO-012](decision-log.md#adr-bio-012-secuencia-de-integración-androidwear-os) y [ADR-BIO-001](decision-log.md#adr-bio-001-persistencia-de-muestras-biometricas).

## 7. Exclusiones críticas

- No diagnosticar ni predecir una condición.
- No inferir emoción o crisis a partir de una pulsación o de HRV.
- No presentar correlación temporal como causalidad.
- No usar umbrales fisiológicos universales para alertas.
- No enviar diario o biometría a IA por defecto.
- No condicionar el uso de Mood Log a conectar un wearable.
- No anunciar cifrado, almacenamiento local seguro, conexión nativa o sincronización antes de implementarlos y probarlos.
- No adoptar un nuevo backend ni migrar datos como consecuencia implícita de esta propuesta.
- No mostrar correlaciones con un mínimo fijo de observaciones como si ese mínimo por sí solo validara una conclusión.

## 8. Criterio para iniciar implementación

No comenzar la persistencia de observaciones reales ni un piloto hasta que:

- se apruebe el alcance del MVP y las métricas que se solicitarán;
- se definan retención, cifrado, exportación, borrado y comportamiento de errores para la persistencia local ya elegida;
- se defina el modelo de consentimiento, revocación y borrado;
- se verifique la disponibilidad y el comportamiento de las APIs en dispositivos objetivo;
- se realice revisión de seguridad, privacidad, producto y accesibilidad;
- exista un entorno aislado para pruebas y datos sintéticos.
- se concilie el modelo propuesto con Firebase y el código existente, o se apruebe por separado un plan de migración.

## 9. Contexto del repositorio

El frontend actual es React/Vite y se conecta directamente con Firebase. La estrategia móvil no incluye aún Capacitor ni una integración de salud nativa; véase [estrategia móvil](../../mobile/mobile-strategy.md). La base de datos y sus reglas tienen inconsistencias conocidas; véanse [datos y Firestore](../../firebase/database-schema.md) y [seguridad y privacidad actuales](../../firebase/security-and-privacy.md). La nueva función no debe añadir más persistencia hasta que esos controles estén consolidados.
