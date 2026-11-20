# Mood Log App

Mood Log App es un proyecto web para registrar estados de ánimo, escribir reflexiones personales y explorar patrones de bienestar. Su dirección de producto es una experiencia individual, accesible y centrada en la privacidad. El repositorio está en transición: conviven flujos actuales con componentes y modelos heredados que aún deben consolidarse.

> **Estado y uso responsable:** este repositorio no demuestra que el producto esté listo para producción ni que sus controles remotos estén verificados. No uses datos reales de salud emocional hasta revisar las limitaciones de privacidad, reglas y servicios de IA descritas en la documentación técnica.

## Documentación

Empieza por el [índice de documentación](docs/README.md). Las guías cubren:

- [Plan de trabajo y estado de ejecución](docs/work-plan.md)
- [Plan integral de mejora y lanzamiento](docs/plan-integral-mejora-lanzamiento.md)
- [Auditoría de preparación para lanzamiento](docs/analysis/production-readiness-audit.md)
- [Revisión legal para lanzamiento en Colombia](docs/legal/colombia-launch-readiness.md)
- [Inventario y trazabilidad de datos](docs/privacy/inventario-y-trazabilidad-de-datos.md)
- [Visión de producto y hoja de ruta](docs/product/vision-and-roadmap.md)
- [Especificación de mejora: contexto biométrico](docs/features/biometric-context/README.md)
- [Prototipo Wear OS](wearos/README.md)
- [Estrategia móvil Android/iOS](docs/mobile/mobile-strategy.md)
- [Sistema visual Mood Log](docs/design/mood-log-design-system.md)
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

- Mercado inicial confirmado: Colombia; primera salida para personas adultas (18+). Wear OS/Android es la primera plataforma de reloj priorizada.
- Frontend React 18, TypeScript y Vite; conexión cliente a Firebase Authentication, Firestore y Storage.
- PWA con manifiesto, service worker e iconos de marca. Capacitor 8 empaqueta las mismas pantallas en proyectos nativos Android e iOS; la app Android debug compila y el proyecto iOS está generado, pero requiere macOS/Xcode para compilar y firmar.
- La escala activa de ánimo es 1–10, pero permanecen modelos y servicios heredados que requieren consolidación; consulta el [esquema observado de Firestore](docs/firebase/database-schema.md).
- Las solicitudes activas de IA pasan por una función de servidor en `frontend/api/ai.ts`; sus secretos no se deben exponer mediante variables `VITE_*`.
- El prototipo Wear OS compila y se abrió en un emulador Wear OS 6/API 36. Su lectura de pulso es puntual y opcional; no guarda ni sincroniza pulso o check-in y no estima emociones a partir del sensor. Falta validación en relojes físicos.
- El diario se almacena como texto legible; el cifrado de extremo a extremo descrito en ideas de producto no está implementado.
- El workflow de CI incluye pruebas de reglas Firestore/Storage, API, configuración de índices y métricas, typecheck, auditoría de dependencias, build web y compilación Wear OS; todavía no hay una corrida remota que valide este checkout y faltan pruebas generales de interfaz. Consulta la [guía de desarrollo](docs/development/getting-started.md) y la [auditoría de lanzamiento](docs/analysis/production-readiness-audit.md).
- Las reglas y configuración versionadas no confirman qué está desplegado en Firebase o en el proveedor de hosting.

Consulta el [análisis técnico del proyecto](docs/analysis/project-analysis.md) para el estado y la priorización de trabajo.

## Tecnología

- **Interfaz:** React 18, TypeScript, Vite, Tailwind CSS
- **Apps móviles:** Capacitor 8, con proyectos nativos Android e iOS en `frontend/`
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

No se encontró una referencia remota a la rama `backup-version-universitaria`; no dependas de ella como respaldo.
