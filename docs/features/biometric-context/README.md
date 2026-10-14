# Feature brief: contexto biométrico para ánimo y diario

**ID:** `FEAT-BIO-001`

**Estado:** propuesta en descubrimiento
**Propietario:** por asignar
**Última revisión:** 14 de octubre de 2026
**Plataformas consideradas:** iOS (Apple Health/HealthKit) y Android (Health Connect)
**Persistencia de las muestras:** decisión abierta; alternativas documentadas en [Diseño técnico](technical-design.md) y [Registro de decisiones](decision-log.md).

## 1. Propósito

Investigar y definir una capacidad opcional para que la persona pueda ver, en una línea de tiempo personal, sus registros de ánimo y diario junto con datos fisiológicos importados desde una fuente de salud autorizada. El objetivo es aportar contexto a la autoobservación, no identificar automáticamente emociones ni ofrecer evaluación clínica.

## 2. Estado del documento

Este conjunto de documentos es una **especificación de propuesta**, no una descripción de una función implementada. El repositorio actual no contiene una integración identificada con HealthKit, Health Connect ni un puente nativo. La app no debe anunciar ni recopilar estas mediciones hasta completar las decisiones, implementación, revisión y pruebas descritas aquí.

La expresión “análisis” en este paquete significa, salvo decisión posterior revisada, resumen descriptivo y exploración de asociaciones personales. No significa diagnóstico, causalidad, predicción o monitoreo de crisis.

La propuesta recibida que motivó esta revisión asume una plantilla y un backend distintos del repositorio actual. Sus ideas de producto se conservan como opciones; no se adopta por ello una migración a Enter Cloud, un cambio de React, ni una sustitución de Firebase. La arquitectura efectiva debe decidirse antes de implementar.

## 3. Decisión de almacenamiento

La persona responsable del producto ha indicado que la decisión entre **procesamiento exclusivamente en el dispositivo** y **persistencia/sincronización en Firebase** debe quedar abierta en esta etapa.

Este paquete:

- documenta ambos enfoques y sus costos en [Diseño técnico](technical-design.md);
- define controles comunes y riesgos en [Privacidad y seguridad](privacy-security.md);
- registra la decisión pendiente y la opción recomendada para el primer piloto en [Registro de decisiones](decision-log.md).

No se ha aprobado aún almacenamiento remoto de datos biométricos.

## 4. Navegación

| Documento | Propósito |
|---|---|
| [Requisitos de producto](product-requirements.md) | Problema, alcance, actores, requisitos funcionales/no funcionales y criterios de aceptación. |
| [Metodología de análisis](analysis-methodology.md) | Alcance y límites de análisis descriptivo y asociaciones temporales. |
| [Diseño técnico](technical-design.md) | Alternativas de almacenamiento, componentes, flujos, modelo conceptual, sincronización y fallos. |
| [Privacidad y seguridad](privacy-security.md) | Inventario de datos, límites de confianza, amenazas, controles y ciclo de vida. |
| [Plan de validación](validation-plan.md) | Estrategia de pruebas, gates de lanzamiento, métricas y rollout. |
| [Registro de decisiones](decision-log.md) | Decisiones tomadas, abiertas y recomendación provisional. |

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

La primera experiencia candidata es una línea de tiempo y resúmenes descriptivos transparentes. Para datos de salud importados, se recomienda empezar con datos sintéticos y evaluar procesamiento local antes de considerar persistencia remota. El diario no se analiza semánticamente en el alcance inicial ni se envía a proveedores de IA por defecto. La persistencia sigue abierta.

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

No comenzar el desarrollo de integración real hasta que:

- se apruebe el alcance del MVP y las métricas que se solicitarán;
- se elija, o se autorice explícitamente un piloto comparativo para elegir, la política de persistencia;
- se defina el modelo de consentimiento, revocación y borrado;
- se verifique la disponibilidad y el comportamiento de las APIs en dispositivos objetivo;
- se realice revisión de seguridad, privacidad, producto y accesibilidad;
- exista un entorno aislado para pruebas y datos sintéticos.
- se concilie el modelo propuesto con Firebase y el código existente, o se apruebe por separado un plan de migración.

## 9. Contexto del repositorio

El frontend actual es React/Vite y se conecta directamente con Firebase. La estrategia móvil no incluye aún Capacitor ni una integración de salud nativa; véase [estrategia móvil](../../mobile/mobile-strategy.md). La base de datos y sus reglas tienen inconsistencias conocidas; véanse [datos y Firestore](../../architecture/database-schema.md) y [seguridad y privacidad actuales](../../architecture/security-and-privacy.md). La nueva función no debe añadir más persistencia hasta que esos controles estén consolidados.
