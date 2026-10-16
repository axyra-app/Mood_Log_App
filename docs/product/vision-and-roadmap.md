# Visión de producto y hoja de ruta

## 1. Resumen

Mood Log es un producto personal para observar y registrar el estado de ánimo, reflexionar mediante un diario y revisar patrones a lo largo del tiempo. La metáfora “Strava del bienestar emocional” representa la visualización del progreso personal y la constancia; no implica diagnóstico, recomendación clínica ni comparación entre personas.

El producto está en transición. El código contiene algunas de las pantallas objetivo, junto con servicios y modelos heredados. Esta hoja de ruta distingue la dirección deseada del estado implementado; consulta [la guía de usuario](./user-guide.md) y [la arquitectura](../architecture/overview.md) antes de asumir disponibilidad.

## 2. Necesidad que aborda

Muchas personas desean recordar cómo se sintieron, qué contexto acompañó ese estado y cómo cambia su experiencia con el tiempo. Una herramienta útil debe reducir la fricción, permitir control sobre los propios datos y presentar resultados de manera comprensible, sin patologizar fluctuaciones normales.

## 3. Principios

1. **Autoobservación, no diagnóstico.** Las escalas y patrones son descripciones del autorreporte.
2. **Control personal.** Registrar es voluntario; una racha rota no es una falta ni un fracaso.
3. **Privacidad verificable.** Las promesas públicas deben corresponder con controles técnicos y prácticas operativas demostrables.
4. **Transparencia.** Diferenciar contenido escrito por la persona, cálculos deterministas y respuestas generadas por IA.
5. **Inclusión.** Usar lenguaje claro y ofrecer una experiencia usable con teclado, lectores de pantalla y dispositivos móviles.
6. **Prudencia.** No inferir causalidad, riesgo clínico o estado fisiológico a partir de datos insuficientes.

## 4. Capacidades y estado

| Capacidad | Estado observado | Lo que falta para considerarla lista |
|---|---|---|
| Cuenta y perfil | Hay flujos con Firebase Authentication y Firestore. | Pruebas de autorización, errores, recuperación, eliminación de cuenta y verificación de configuración. |
| Registro de ánimo | La interfaz presenta un recorrido por pasos con valoración visual 1–10 y contexto. | Validar creación/edición/borrado y documentar compatibilidad de registros históricos. |
| Dashboard e historial | Hay una vista principal e historial de registros. | Verificar cálculos, límites temporales, estados vacíos/error y consistencia con zona horaria. |
| Diario | Hay interfaz para crear, consultar, editar y borrar entradas. | Asegurar reglas y operaciones; explicar tratamiento del texto y no prometer cifrado. |
| Estadísticas e informes | Hay vista de estadísticas y generación PDF del lado cliente. | Verificar cálculos y contenido exportado; eliminar afirmaciones clínicas o correlaciones no sustentadas. |
| Chat con IA | Hay selección de agentes; las solicitudes activas pasan por una función autenticada y la conversación permanece en la página. | Definir persistencia/esquema solo si se aprueba, revisar consentimiento y evaluar errores y seguridad. |
| Detección de crisis | Hay lógica heurística en un servicio. | No se encontró conexión al recorrido principal. No es un detector confiable ni un servicio de respuesta. |
| PWA | Plugin configurado para generar recursos PWA. | Pruebas en dispositivos; no ofrece por sí solo sincronización offline de datos. |
| Cifrado local | Propuesta futura. | No implementado. Requiere diseño y recuperación de claves antes de prometerlo. |
| Wearables / Capacitor | Propuesta exploratoria. | No hay integración nativa identificada en el código revisado. |

## 5. Alcance del MVP recomendado

### Incluido

- Autenticación y perfil básico.
- Registro y consulta del propio historial de ánimo.
- Diario personal con operaciones básicas.
- Presentación descriptiva de tendencias basada exclusivamente en registros de la persona.
- Controles de cuenta y privacidad que funcionen y estén documentados.

### Fuera del MVP hasta completar requisitos

- Diagnóstico, evaluación o predicción clínica.
- Detección de crisis con garantías de cobertura o atención humana.
- Asistente de IA que procese información íntima sin backend, consentimiento y evaluación.
- Cifrado de extremo a extremo anunciado antes de implementarse y probarse.
- Sincronización offline de entradas sensibles sin modelo de cifrado y resolución de conflictos.
- Alertas de estrés basadas en HRV u otros biomarcadores.

## 6. Hoja de ruta

### Etapa A — Consolidación y entorno seguro

- Definir escala y modelo canónico de ánimo, diario, chat y perfil.
- Aislar desarrollo en emulador o proyecto no productivo.
- Alinear tipos, servicios, reglas, índices y pruebas.
- Confirmar operaciones autorizadas para cada colección y ruta de Storage.

**Salida verificable:** pruebas de reglas con propietario, otro usuario y sesión anónima; ningún flujo de prueba escribe en producción por accidente.

### Etapa B — MVP fiable

- Completar los recorridos de cuenta, registro, historial, diario y edición/eliminación.
- Validar estadísticas con conjuntos de datos conocidos.
- Añadir typecheck y pruebas automatizadas a CI.
- Documentar límites y errores visibles en la interfaz.

**Salida verificable:** recorrido probado de extremo a extremo en un entorno aislado y comprobaciones automatizadas obligatorias.

### Etapa C — Experiencia móvil y accesible

- Mejorar navegación, tamaños táctiles, lectura de formularios, teclado y lector de pantalla.
- Medir rendimiento en dispositivos objetivo.
- Validar instalación/actualización PWA.
- Diseñar el offline como proyecto aparte y probar protección local, sincronización y conflictos.

### Etapa D — IA opcional y responsable

- Mantener solicitudes en el endpoint serverless autenticado y revisar periódicamente la protección de credenciales.
- Acordar consentimiento, minimización, retención y proveedores.
- Evaluar respuestas, errores, contenido de alto riesgo y límites de uso.
- Mantener alternativas accesibles si la IA no está disponible.

### Etapa E — Integración nativa/salud, sujeta a investigación

- Evaluar Capacitor y requisitos de tiendas.
- Analizar permisos, compatibilidad, calidad de datos y política de plataformas.
- Realizar revisión de privacidad y pruebas con usuarios.
- Evitar inferencias clínicas basadas en sensores.

### Secuencia propuesta para contexto biométrico

La propuesta detallada está en [Contexto biométrico para ánimo y diario](../features/biometric-context/README.md). Como secuencia de trabajo, se recomienda:

1. Consolidar la arquitectura, reglas, modelo canónico y entorno aislado antes de añadir nuevos datos sensibles.
2. Completar primero los recorridos manuales de ánimo/diario y resúmenes descriptivos; resolver la escala y la posibilidad de varios registros por día.
3. Evaluar importación de archivo de salud como una acción explícita de la persona, con datos sintéticos primero y procesamiento local como hipótesis inicial.
4. Mantener medición por cámara en fase experimental hasta validar señal, dispositivos, calidad y límites.
5. Posponer correlaciones, IA sobre diario/biometría y cualquier capa social hasta que cada una tenga requisitos, métodos y revisión propios.

Esta secuencia no aprueba migrar Firebase a otro backend. Tampoco valida un mínimo de diez observaciones para correlaciones ni define la escala de ánimo. Esos puntos permanecen registrados como decisiones abiertas.

## 7. Criterios para aceptar una nueva capacidad

Antes de anunciarla, debe contar con:

- Responsable y necesidad de usuario definida.
- Recorrido completo, incluyendo errores y estados vacíos.
- Contrato de datos documentado y reglas probadas.
- Consentimiento y minimización de datos evaluados.
- Pruebas automatizadas o evidencia reproducible apropiada.
- Texto de interfaz y documentación que indiquen límites reales.

## 8. Indicadores de producto

Los indicadores deberán ser agregados y minimizados. Se pueden medir completitud técnica de los flujos, errores de guardado, accesibilidad, rendimiento, finalización de solicitudes de exportación/borrado y uso voluntario de controles. No interpretar la frecuencia de registros como mejora clínica ni incentivar rachas que generen presión.

## 9. Documentación de apoyo

- [Visión general de arquitectura](../architecture/overview.md)
- [Datos y Firestore](../firebase/database-schema.md)
- [Seguridad y privacidad](../firebase/security-and-privacy.md)
- [Guía funcional](./user-guide.md)
- [Flujos](./user-flows.md)
- [Crisis y recursos](./crisis-protocol.md)
- [Estrategia móvil](../mobile/mobile-strategy.md)
- [Feature: contexto biométrico para ánimo y diario](../features/biometric-context/README.md)
