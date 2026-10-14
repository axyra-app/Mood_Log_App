# Estrategia móvil

## Estado actual

El frontend es una SPA responsive en React/Vite y configura `vite-plugin-pwa`. El build está preparado para generar recursos de PWA; no se encontró integración Capacitor ni una experiencia offline de lectura/escritura con sincronización. La configuración por sí sola no confirma instalación o funcionamiento en todos los dispositivos.

## Objetivo de experiencia

Facilitar consultas breves y voluntarias en teléfonos sin ocultar controles de privacidad ni forzar notificaciones o rachas. Las prioridades de diseño son:

- Formularios sencillos y legibles.
- Navegación predecible, con foco visible y soporte de teclado/lector de pantalla.
- Áreas táctiles adecuadas y contenido que se adapte a distintos tamaños.
- Estados explícitos de conexión, carga, error y guardado.
- Compatibilidad con safe areas y preferencias de movimiento/contraste.
- Sin divulgación de contenido íntimo en notificaciones, widgets o pantalla bloqueada.

## Navegación propuesta

Una barra inferior puede evaluarse como alternativa móvil después de consolidar las rutas actuales:

| Destino propuesto | Ruta existente | Observación |
|---|---|---|
| Inicio | `/dashboard` | Dashboard actual. |
| Registrar | `/mood-flow` | Acción principal; su escala debe alinearse con el modelo de datos. |
| Diario | `/journal` | Contiene texto personal; evitar exponerlo en previews o notificaciones. |
| Estadísticas | `/statistics` | Resúmenes descriptivos. |
| Perfil/ajustes | `/profile`, `/settings` | Consolidar navegación según el alcance del MVP. |

La barra no está documentada como implementada; validar navegación, safe area y accesibilidad antes de adoptarla.

## PWA y modo sin conexión

El service worker puede cachear recursos de aplicación. Esto no implica que Firebase funcione offline ni que los registros pendientes se sincronicen correctamente.

Antes de implementar offline se debe definir:

1. Qué datos pueden guardarse localmente y por cuánto tiempo.
2. Cifrado local y bloqueo en dispositivos compartidos.
3. Cola, reintentos, idempotencia y conflictos de edición/eliminación.
4. Indicadores de “pendiente”, “guardado” y error de sincronización.
5. Limpieza tras cerrar sesión, revocar consentimiento o borrar cuenta.
6. Pruebas sin red, cambio de cuenta, almacenamiento lleno y actualización de service worker.

No anunciar soporte offline de diarios ni datos emocionales hasta que se pruebe ese flujo completo.

## Aplicación nativa

Capacitor podría ser una opción posterior para empaquetar la experiencia web, pero aún no está integrado. Antes de decidir:

- Evaluar mantenimiento, plugins y requisitos de Apple App Store y Google Play.
- Revisar permisos, privacidad, autenticación, enlaces profundos y almacenamiento seguro.
- Probar compatibilidad y accesibilidad en dispositivos físicos.
- Definir actualización, soporte y distribución.
- Evaluar por separado el acceso a APIs de salud; un wrapper nativo no concede permisos automáticamente.

No asumir reutilización del 100% de código ni publicación automática en tiendas.

## Criterios de aceptación móvil

- Recorridos principales probados en tamaños y sistemas acordados.
- Formularios accesibles, sin desplazamiento horizontal y con foco visible.
- Navegación por teclado y lector de pantalla verificada.
- Estados de error y pérdida de conexión comprensibles.
- La instalación y actualización PWA comprobadas en cada navegador soportado.
- Ningún contenido personal se filtra en notificaciones o cachés sin decisión de privacidad.
