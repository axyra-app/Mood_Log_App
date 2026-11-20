# Documentación de Mood Log App

Este índice organiza la documentación del producto, su arquitectura y los procesos de desarrollo. Las guías técnicas describen el código y la configuración versionados; no confirman por sí solas el comportamiento de servicios desplegados. La documentación de producto separa explícitamente el estado observado de las ideas futuras.

## Producto

| Documento | Contenido |
|---|---|
| [Visión y hoja de ruta](product/vision-and-roadmap.md) | Propósito, principios, alcance recomendado, estado y etapas con criterios de salida. |
| [Guía de pantallas](product/user-guide.md) | Rutas de la aplicación y capacidades observadas con sus limitaciones. |
| [Flujos de usuario](product/user-flows.md) | Recorridos de ánimo, diario, chat, estadísticas y brechas conocidas. |
| [Glosario](product/glossary.md) | Definiciones de términos emocionales y técnicos utilizados por el proyecto. |
| [Seguridad ante crisis](product/crisis-protocol.md) | Límites actuales, borrador de actuación para entrevistas de producto en Colombia y requisitos para una futura función de apoyo. |
| [Wearables y biometría](product/wearables-and-biometrics.md) | Estado del scaffold Wear OS, límites del prototipo y requisitos antes de datos reales. |
| [Consentimiento Wear OS (borrador)](privacy/wearos-consent-draft.md) | Copia versionada, evidencia local y puertas pendientes para el permiso puntual de pulso. |
| [Revisión legal para lanzamiento en Colombia](legal/colombia-launch-readiness.md) | Matriz P0/P1/P2 de privacidad, datos sensibles, proveedores internacionales, INVIMA, edad, investigación y gates de lanzamiento con fuentes oficiales. |
| [Procedimiento de derechos e incidentes](legal/colombia-rights-and-incident-runbook.md) | Flujo operativo para consultas/reclamos, plazos de Ley 1581, ejecución de derechos, respuesta a incidentes y prueba de mesa. |
| [Plan integral de mejora y lanzamiento](plan-integral-mejora-lanzamiento.md) | Hoja de ejecución para producto, seguridad, privacidad, cumplimiento, IA, wearables y lanzamiento comercial. |
| [Plantilla de modelo económico](product/plantilla-modelo-economico.md) | Escenarios editables de precio, conversión, costos, equilibrio, CAC y sensibilidad; sin tarifas ni ventas inventadas. |
| [Análisis competitivo inicial](product/analisis-competitivo-inicial.md) | Benchmark documental de apps de ánimo y wearables; separa capacidades declaradas de la validación de mercado pendiente en Colombia. |
| [Guía de descubrimiento de usuarios](product/guia-descubrimiento-usuarios.md) | Protocolo de entrevistas adultas con muestra por edades, aviso/retención de notas, demo sintética y límites para no generalizar resultados. |
| [Inventario y trazabilidad de datos](privacy/inventario-y-trazabilidad-de-datos.md) | Flujos observados en código, destinos, avisos/consentimientos, dudas y acciones antes del lanzamiento. |
| [Diseño del registro de aceptación legal](privacy/consent-ledger-design.md) | Flujo técnico para vincular aceptación/versiones con cuenta, exportación, fallos y renovación; pendiente de textos legales aprobados. |

## Especificaciones de funcionalidades

Las propuestas de mejora con requisitos, diseño técnico, privacidad y validación se documentan como paquetes independientes en `docs/features/`. Su presencia no significa que la funcionalidad esté aprobada o implementada.

| Feature | Contenido |
|---|---|
| [Contexto biométrico para ánimo y diario](features/biometric-context/README.md) | Brief, requisitos, metodología analítica, diseño técnico, privacidad/seguridad, validación y decisiones abiertas para Wear OS/Health Services; Health Connect e iOS son etapas complementarias/futuras. |

## Arquitectura

| Documento | Contenido |
|---|---|
| [Visión general](architecture/overview.md) | Componentes actuales, flujos de datos y alcance de la PWA. |
| [Análisis técnico completo](analysis/project-analysis.md) | Hallazgos, estado técnico, riesgos y prioridades del proyecto. |
| [Visión y arquitectura del producto](product/vision-and-architecture.md) | Propósito, principios, alcance y hoja de ruta. |

## Firebase

La documentación específica de Firebase se agrupa en [`firebase/`](firebase/README.md). El archivo requerido por Firebase CLI permanece en la raíz; las reglas e índices de Firestore y Storage están en `firebase/`.

## Desarrollo y operación

| Documento | Contenido |
|---|---|
| [Plan de trabajo](work-plan.md) | Etapas, dependencias, entregables y estado de consolidación antes de biometría. |
| [Inicio local](development/getting-started.md) | Requisitos, instalación, validación y conexión a Firebase. |
| [Estándares de código](development/code-standards.md) | TypeScript, React, accesibilidad, privacidad y validación. |
| [Despliegue](development/deployment-guide.md) | Configuración versionada, workflows, Firebase y controles de acceso. |
| [Solución de problemas](development/troubleshooting-and-faq.md) | Fallos comunes de build, Firebase, hosting y privacidad. |
| [Estrategia móvil](mobile/mobile-strategy.md) | Experiencia responsive, PWA actual y opciones móviles futuras. |

## Estado técnico resumido

- El frontend es una SPA React/Vite que se conecta directamente a Firebase desde el navegador.
- La escala 1–10 y los registros múltiples por día están confirmados para el flujo activo; permanecen modelos/servicios heredados que requieren decisión y cobertura.
- Las reglas locales tienen pruebas de aislamiento y gates de edad, aceptación legal y consentimiento sensible; las colecciones heredadas sin regla explícita siguen denegadas. Falta auditar el entorno remoto.
- El diario se almacena legible en Firestore. No hay cifrado de extremo a extremo ni sincronización offline completa.
- Las solicitudes activas de IA pasan por una función serverless autenticada; las variables `VITE_*` son públicas y no deben contener secretos. Se aplica cuota por UID y producción exige un limitador compartido de solicitudes configurable en Firestore; sus valores reales y consistencia entre despliegues aún deben verificarse. No hay cuota global de tokens ni límite presupuestario de IA.
- El workflow de CI versionado ejecuta reglas Firestore/Storage, API, configuración, unidades, typecheck, auditoría, build/PWA y compilación del prototipo Wear OS; antes verifica la presencia de Android SDK Platform 36, Build Tools 36.0.0 y Platform-Tools. El runner Ubuntu 24.04 sigue siendo una imagen administrada con paquetes preinstalados, no una imagen reproducible fijada por digest. El cambio actual del checkout aún no tiene corrida remota; tampoco hay recorrido autenticado integral probado en staging.
- La aplicación no está lista para lanzamiento comercial: los textos legales son borradores, faltan revisiones colombiana/regulatoria, configuración remota y validación completa de Wear OS. Consulta el [estado de preparación para lanzamiento](analysis/production-readiness-audit.md).

Para una lectura ejecutiva, consulta el [análisis técnico](analysis/project-analysis.md), el [estado de preparación](analysis/production-readiness-audit.md) y la [visión y arquitectura del producto](product/vision-and-architecture.md). Antes de utilizar información real, revisa [seguridad y privacidad de Firebase](firebase/security-and-privacy.md) y confirma el proyecto y los servicios en sus paneles.
