# Mood Log App

Mood Log App es un proyecto web para registrar estados de ánimo, escribir reflexiones personales y explorar patrones de bienestar. Su dirección de producto es una experiencia individual, accesible y centrada en la privacidad. El repositorio está en transición: conviven flujos actuales con componentes y modelos heredados que aún deben consolidarse.

> **Estado y uso responsable:** este repositorio no demuestra que el producto esté listo para producción ni que sus controles remotos estén verificados. No uses datos reales de salud emocional hasta revisar las limitaciones de privacidad, reglas y servicios de IA descritas en la documentación técnica.

## Documentación

Empieza por el [índice de documentación](docs/README.md). Las guías cubren:

- [Plan de trabajo y estado de ejecución](docs/work-plan.md)
- [Visión de producto y hoja de ruta](docs/product/vision-and-roadmap.md)
- [Especificación de mejora: contexto biométrico](docs/features/biometric-context/README.md)
- [Guía de pantallas y estado funcional](docs/product/user-guide.md)
- [Flujos de usuario](docs/product/user-flows.md)
- [Firebase: seguridad y privacidad](docs/firebase/security-and-privacy.md)
- [Arquitectura](docs/architecture/overview.md)
- [Modelo de datos Firestore](docs/firebase/database-schema.md)
- [Guía de Firebase](docs/firebase/README.md)
- [Análisis técnico del proyecto](docs/analysis/project-analysis.md)
- [Visión y arquitectura](docs/product/vision-and-architecture.md)
- [Despliegue y operación](docs/development/deployment-guide.md)
- [Protocolo de seguridad ante crisis](docs/product/crisis-protocol.md)

## Estado del proyecto

La aplicación tiene rutas y pantallas para autenticación, dashboard, registro de ánimo, diario, estadísticas, reportes, chat, perfil y ajustes. Que exista una pantalla no garantiza que su flujo de datos esté completo o listo para producción.

Estado conocido a partir del código del repositorio:

- Frontend React 18, TypeScript y Vite; conexión cliente a Firebase Authentication, Firestore y Storage.
- La configuración de PWA genera service worker y manifiesto; no implementa por sí sola sincronización offline de registros.
- Los modelos de datos, especialmente chat y escala de ánimo, todavía requieren consolidación.
- Las solicitudes activas de IA pasan por una función de servidor en `frontend/api/ai.ts`; sus secretos no se deben exponer mediante variables `VITE_*`.
- El diario se almacena como texto legible; el cifrado de extremo a extremo descrito en ideas de producto no está implementado.
- CI ejecuta pruebas de reglas Firestore/Storage, typecheck, auditoría de dependencias de producción y build; aún no ejecuta pruebas generales de componentes/servicios. Consulta la [guía de desarrollo](docs/development/getting-started.md).
- Las reglas y configuración versionadas no confirman qué está desplegado en Firebase o en el proveedor de hosting.

Consulta el [análisis técnico del proyecto](docs/analysis/project-analysis.md) para el estado y la priorización de trabajo.

## Tecnología

- **Interfaz:** React 18, TypeScript, Vite, Tailwind CSS
- **Navegación:** React Router
- **Servicios de datos:** Firebase Authentication, Cloud Firestore y Cloud Storage
- **Gráficos:** Recharts
- **Exportación:** jsPDF y html2canvas
- **PWA:** vite-plugin-pwa / Workbox
- **IA:** las solicitudes activas pasan por una función de Vercel; revisa [seguridad y privacidad](docs/firebase/security-and-privacy.md)

## Acceso y desarrollo

Este repositorio documenta un proyecto privado. Las instrucciones de instalación, configuración de entornos y ejecución no se publican en este README; se gestionan por los canales internos del proyecto. La documentación técnica restante describe el estado versionado y no concede acceso a servicios, datos ni entornos desplegados.

## Privacidad y seguridad

El repositorio contiene reglas locales para Firestore y Storage, pero algunos servicios usan colecciones no incluidas en esas reglas. No se ha confirmado el estado remoto ni se deben inferir garantías de privacidad solo a partir de la existencia de una pantalla de login o de un repositorio privado.

No pongas secretos de servidor en variables `VITE_*`, no despliegues reglas sin revisar el proyecto destino y no envíes contenido íntimo a proveedores externos sin consentimiento y controles adecuados. Ver [Seguridad y privacidad](docs/firebase/security-and-privacy.md).

## Historial del producto

La rama `backup-version-universitaria` se menciona como referencia de la etapa anterior. Confirma su existencia y estado en GitHub antes de depender de ella como respaldo.
