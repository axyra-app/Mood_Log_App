# Registro de decisiones: contexto biométrico

Este documento registra decisiones de la feature `FEAT-BIO-001`. Los estados indican si una decisión está acordada; las recomendaciones no se consideran aprobaciones.

## ADR-BIO-001 — Persistencia de muestras biométricas

- **Estado:** pendiente
- **Fecha:** 14 de octubre de 2026
- **Decisores:** por asignar (producto, ingeniería y privacidad/seguridad)
- **Contexto:** la propuesta requiere consultar datos de salud junto con ánimo y diario. Guardar las muestras en la nube habilita sincronización, pero amplía la exposición, retención, superficie de autorización y proceso de borrado. Procesar localmente reduce datos centrales, pero limita continuidad entre dispositivos.
- **Opciones:**
  1. **Local-only:** consultar y procesar en el dispositivo, sin persistir muestras en Firebase.
  2. **Sincronización en Firebase:** importar y conservar muestras por usuario.
  3. **Piloto comparativo:** evaluar ambas opciones primero con datos sintéticos y, si se aprueba, con un piloto opt-in controlado.
- **Recomendación provisional:** comenzar con datos sintéticos; para el primer piloto real, probar local-only antes de persistencia remota. Considerar cloud únicamente si se valida una necesidad de sincronización que justifique el riesgo adicional.
- **Consecuencias:** no crear una colección Firestore ni escribir reglas de datos biométricos hasta que se cierre esta decisión.
- **Criterios para cerrar:** utilidad entre dispositivos, compatibilidad, seguridad, privacidad, coste, eliminación/backups, experiencia y consentimiento.

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

## ADR-BIO-009 — Correlaciones en la primera versión

- **Estado:** pospuesto
- **Fecha:** 14 de octubre de 2026
- **Decisión:** no adoptar el coeficiente de Pearson con `n ≥ 10` como requisito suficiente para mostrar una correlación.
- **Motivo:** el tamaño de muestra aislado no valida estabilidad, supuestos ni utilidad; la lectura visual puede sugerir causalidad o certeza indebida.
- **Criterios para reabrir:** definir pregunta, método y supuestos, selección temporal, incertidumbre, datos faltantes, valores atípicos, evaluación y lenguaje comprensible. Hasta entonces, priorizar visualizaciones descriptivas.

## ADR-BIO-010 — Alcance de las etapas iniciales

- **Estado:** propuesta de secuenciación; sujeta a aprobación de producto
- **Fecha:** 14 de octubre de 2026
- **Secuencia candidata:** consolidación/seguridad → experiencia manual y resúmenes descriptivos → importación local de archivo evaluada con datos sintéticos → experimento de cámara sujeto a calidad → evaluación posterior de asociaciones e IA.
- **Exclusiones iniciales:** feed social, comparación entre personas, IA que combine diario y biometría, e integración de cámara en producción.
- **Consecuencias:** cada etapa requiere revisión y criterios de salida propios; completar una etapa no autoriza automáticamente la siguiente.

## Historial

| Fecha | Cambio |
|---|---|
| 2026-10-14 | Se creó el registro inicial; persistencia, plataformas y métricas permanecen abiertas. |
| 2026-10-14 | Se registraron decisiones pendientes sobre backend, procedencia, frecuencia/escala, asociaciones estadísticas y secuencia de etapas a partir de la revisión de la propuesta. |
