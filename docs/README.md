# Documentación de Mood Log App

Este índice organiza la documentación del producto, su arquitectura y los procesos de desarrollo. Las guías técnicas describen el código y la configuración versionados; no confirman por sí solas el comportamiento de servicios desplegados. La documentación de producto separa explícitamente el estado observado de las ideas futuras.

## Producto

| Documento | Contenido |
|---|---|
| [Visión y hoja de ruta](product/vision-and-roadmap.md) | Propósito, principios, alcance recomendado, estado y etapas con criterios de salida. |
| [Guía de pantallas](product/user-guide.md) | Rutas de la aplicación y capacidades observadas con sus limitaciones. |
| [Flujos de usuario](product/user-flows.md) | Recorridos de ánimo, diario, chat, estadísticas y brechas conocidas. |
| [Glosario](product/glossary.md) | Definiciones de términos emocionales y técnicos utilizados por el proyecto. |
| [Seguridad ante crisis](product/crisis-protocol.md) | Límites actuales y requisitos para considerar una futura función de apoyo. |
| [Wearables y biometría](product/wearables-and-biometrics.md) | Exploración futura; no hay integración implementada identificada. |

## Especificaciones de funcionalidades

Las propuestas de mejora con requisitos, diseño técnico, privacidad y validación se documentan como paquetes independientes en `docs/features/`. Su presencia no significa que la funcionalidad esté aprobada o implementada.

| Feature | Contenido |
|---|---|
| [Contexto biométrico para ánimo y diario](features/biometric-context/README.md) | Brief, requisitos, metodología analítica, diseño técnico, privacidad/seguridad, validación y decisiones abiertas para Apple Health/Health Connect. |

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
- Conviven modelos B2C y código heredado; las colecciones de chat y la escala de ánimo requieren consolidación.
- Las reglas locales no cubren todas las colecciones usadas por el frontend y no se ha confirmado su estado remoto.
- El diario se almacena como texto legible. El cifrado local y la sincronización offline completa no están implementados.
- Las solicitudes activas de IA pasan por una función serverless autenticada; las variables `VITE_*` son públicas y no deben contener secretos.
- CI ejecuta pruebas de reglas Firestore/Storage, typecheck, auditoría de dependencias de producción y build; aún no ejecuta pruebas generales de componentes/servicios. Consulta las guías para comandos y validaciones.
- La existencia de un workflow de build no demuestra que Vercel despliegue automáticamente ni que el sitio sea privado.

Para una lectura ejecutiva, consulta el [análisis técnico](analysis/project-analysis.md) y la [visión y arquitectura del producto](product/vision-and-architecture.md). Antes de utilizar información real, revisa [seguridad y privacidad de Firebase](firebase/security-and-privacy.md) y confirma el proyecto y los servicios en sus paneles.
