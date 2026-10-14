# Mood Log App: visión y dirección del producto

**Versión:** 3.0
**Fecha de revisión:** 14 de octubre de 2026
**Estado:** definición de producto en evolución; implementación en transición

Este documento reúne el propósito del producto y sus decisiones de alto nivel. La implementación observada y sus limitaciones se describen en [`docs/architecture/`](docs/architecture/overview.md). Una capacidad que aparece en la visión o en la hoja de ruta no debe considerarse disponible hasta que esté implementada, probada y documentada como tal.

## 1. Propósito

Mood Log busca ayudar a una persona a observar su estado de ánimo a lo largo del tiempo mediante registros sencillos, reflexiones personales y visualizaciones comprensibles. La intención es facilitar la autoobservación y el reconocimiento de patrones, no medir la salud clínica ni sustituir atención profesional.

La metáfora de “Strava del bienestar emocional” expresa tres ideas de producto:

1. **Registro de baja fricción:** capturar un check-in emocional de forma simple y voluntaria.
2. **Progreso personal visible:** mostrar historial y tendencias sin convertir la constancia en una obligación o fuente de culpa.
3. **Reflexión contextual:** ayudar a relacionar experiencias y hábitos desde los datos que la persona elige registrar, sin afirmar causalidad.

## 2. Personas usuarias y necesidad

La persona usuaria principal es alguien que quiere llevar un registro personal de su estado de ánimo y reflexionar sobre su experiencia cotidiana. El producto debe ser comprensible, accesible, discreto y explícito sobre qué datos guarda y qué límites tiene.

## 3. Principios de producto

### Autonomía y lenguaje no clínico

La persona decide qué registrar, qué consultar y cuándo participar. Las métricas describen entradas registradas; no son diagnósticos ni evaluaciones clínicas.

### Privacidad por diseño

Los registros emocionales son sensibles. La recopilación debe ser mínima, con controles de acceso probados y decisiones transparentes sobre almacenamiento, proveedores externos, exportación y eliminación. El estado actual y las brechas están documentados en [Seguridad y privacidad](docs/architecture/security-and-privacy.md).

### Progreso sin culpa

Las rachas y recordatorios, si se ofrecen, deben ser opcionales y no presentar pausas como fracaso. El producto debe permitir desactivar estímulos que generen presión.

### Evidencia y límites

Una correlación en un historial personal no demuestra que una actividad cause un cambio de ánimo. Biometría, IA y ejercicios de bienestar requieren validación, consentimiento y mensajes prudentes antes de su lanzamiento.

## 4. Alcance del producto

### Núcleo previsto

- Registro personal de ánimo y contexto elegido por la persona.
- Diario privado para reflexiones.
- Historial y visualizaciones descriptivas.
- Herramientas de exportación, edición y eliminación claramente explicadas.
- Interfaz web adaptable a dispositivos móviles.

### Funciones experimentales o dependientes de decisiones

- Respuestas reflexivas generadas por IA.
- Recordatorios, rachas y notificaciones.
- Recursos de apoyo para momentos de angustia.
- Integración con plataformas de salud y dispositivos wearables.
- Empaquetado nativo mediante Capacitor.

Estas funciones no deben anunciarse como servicios confiables o listos para producción sin pruebas funcionales, revisión de seguridad y aprobación de producto.

## 5. Estado del producto

El repositorio contiene rutas y pantallas para autenticación, dashboard, registro de ánimo, diario, estadísticas, informes, chat, perfil y ajustes. Sin embargo, la existencia de la interfaz no demuestra que todo su recorrido funcione. Persisten modelos y servicios de la antigua plataforma profesional; hay discrepancias entre contratos de datos y reglas Firebase.

Algunos hechos importantes del estado actual:

- El registro de ánimo dispone de una escala visual de 1 a 10; el tipo compartido `MoodLog` mantiene una escala comentada como 1 a 5. Debe definirse el contrato canónico.
- El diario se guarda como texto legible; no hay cifrado de extremo a extremo implementado.
- Las llamadas de algunos agentes IA se originan desde el navegador y usan configuración `VITE_*`; no se deben usar secretos de servidor en ese contexto.
- El chat mantiene más de un modelo de almacenamiento y la pantalla revisada no persiste el historial de conversación.
- El motor de detección de crisis no aparece conectado al flujo de check-in o chat en el frontend revisado.
- La PWA cachea recursos estáticos; no hay sincronización offline completa demostrada.
- La compilación, las reglas remotas y la configuración de hosting requieren validación independiente.

El estado detallado está en [`ANALISIS_PROYECTO.md`](ANALISIS_PROYECTO.md) y en la documentación técnica.

## 6. Hoja de ruta propuesta

Las fases son una propuesta de secuencia, no compromisos de fecha. Cada fase debe cerrar criterios verificables antes de declarar su finalización.

### Fase 0 — Alinear alcance y seguridad

- Confirmar qué pantallas y flujos pertenecen al producto B2C.
- Aislar desarrollo en Firebase Emulator Suite o un proyecto no productivo.
- Acordar el modelo de propietario, escalas, colecciones y retención.
- Quitar o deshabilitar llamadas de IA cliente con claves privadas.

**Criterio de salida:** el equipo conoce qué datos guarda cada flujo, a dónde se envían y cómo se autorizan; las reglas pasan pruebas de acceso cruzado.

### Fase 1 — MVP personal fiable

- Completar registro, sesión y perfil básico.
- Consolidar registro, consulta, edición y eliminación de registros de ánimo.
- Completar el diario con controles de acceso probados.
- Definir estadísticas descriptivas y su significado.
- Incorporar typecheck y pruebas relevantes al CI.

**Criterio de salida:** recorrido funcional probado en entorno aislado, sin errores de permisos ni discrepancias de contrato y con políticas coherentes.

### Fase 2 — Experiencia móvil y accesibilidad

- Revisar navegación, formularios y rendimiento en teléfonos.
- Mejorar accesibilidad de teclado, lector de pantalla, contraste y áreas táctiles.
- Verificar instalación y actualización PWA en navegadores objetivo.
- Diseñar, si se aprueba, un flujo offline que especifique cifrado local, sincronización y conflictos.

**Criterio de salida:** pruebas documentadas en dispositivos y navegadores acordados; no asumir soporte offline hasta validar lecturas y escrituras.

### Fase 3 — IA reflexiva segura (opcional)

- Definir consentimiento y minimización de datos.
- Mover llamadas a un backend con secreto de servidor y límites de uso.
- Revisar calidad, seguridad, límites y rutas de escalamiento humano.
- Indicar claramente que la IA puede equivocarse y no reemplaza ayuda profesional.

**Criterio de salida:** revisión técnica, de privacidad y de producto completada; no se envían datos antes del consentimiento requerido.

### Fase 4 — Aplicación nativa y sensores (exploratoria)

- Evaluar Capacitor solo tras estabilizar la web.
- Investigar permisos, políticas de las tiendas, privacidad y calidad de sensores de salud.
- Validar la utilidad con usuarios antes de proponer alertas biométricas.

**Criterio de salida:** estudio de viabilidad y evaluación de privacidad; no inferir crisis, ansiedad o diagnósticos de datos fisiológicos.

## 7. Medidas de éxito

Las métricas de producto deben ser agregadas, minimizadas y compatibles con el consentimiento y la privacidad. Posibles indicadores, sujetos a revisión:

- Finalización satisfactoria del registro de ánimo.
- Porcentaje de errores de guardado y permisos.
- Retención voluntaria y uso de controles de privacidad.
- Accesibilidad y rendimiento en dispositivos objetivo.
- Solicitudes de exportación/eliminación completadas.

No usar la cantidad o continuidad de registros como medida individual de salud mental ni como sustituto de resultados clínicos.

## 8. Documentos relacionados

- [Índice de documentación](docs/README.md)
- [Arquitectura implementada](docs/architecture/overview.md)
- [Datos y Firestore](docs/architecture/database-schema.md)
- [Seguridad y privacidad](docs/architecture/security-and-privacy.md)
- [Guía de usuario y estado funcional](docs/product/user-guide.md)
- [Roadmap detallado](docs/product/vision-and-roadmap.md)
- [Especificación de contexto biométrico](docs/features/biometric-context/README.md)
