# Exploración: wearables y datos biométricos

## Estado

Mood Log no tiene una integración de Apple HealthKit, Google Health Connect, HealthKit, Health Connect ni Bluetooth identificada en el código revisado. Este documento es una exploración de producto y arquitectura futura, no una guía de configuración ni una promesa de compatibilidad.

La especificación de producto y tecnología para combinar importaciones opt-in con registros de ánimo y diario está en [Contexto biométrico para ánimo y diario](../features/biometric-context/README.md).

## Propósito posible

En el futuro, la persona podría optar por importar datos fisiológicos desde un dispositivo compatible para verlos junto con sus propios registros. La utilidad, precisión y comprensión de estos datos deben validarse antes de definir una función.

## Conceptos

| Dato | Significado general | Límites |
|---|---|---|
| Frecuencia cardíaca | Latidos por minuto registrados por un sensor. | Cambia con movimiento, salud, medicamentos, sueño, dispositivo y método de medición. No mide directamente una emoción. |
| HRV/VFC | Variación temporal entre latidos, expresada mediante métricas distintas, por ejemplo SDNN o RMSSD. | Métricas, ventanas y dispositivos no son intercambiables; una lectura aislada no diagnostica estrés ni enfermedad. |
| Otros datos de salud | Por ejemplo, sueño o actividad física, según la fuente. | Requieren permiso separado, procedencia y contexto; no asumir que están disponibles o son comparables. |

Evitar frases como “la HRV baja significa ansiedad” o “el pulso detectó un episodio de estrés”. No inferir causas, diagnósticos o crisis a partir de métricas biométricas.

## Opciones técnicas a investigar

### Aplicación web

Las APIs de navegador, incluido Web Bluetooth, tienen soporte limitado por dispositivo/navegador, requieren contexto seguro y permisos explícitos. No ofrecen acceso universal a los datos históricos de plataformas de salud. Cualquier experimento debe tener una matriz de compatibilidad y una alternativa para personas sin dispositivo.

### Aplicación móvil nativa

Una posible etapa posterior sería evaluar plugins nativos de Capacitor para APIs de salud de iOS y Android. Antes de seleccionar librerías, revisar mantenimiento, permisos, políticas de Apple/Google, revisiones de la tienda, requisitos de privacidad y manejo de datos. La selección aún no está hecha.

## Requisitos de producto y privacidad

- Opt-in explícito, granular y revocable; pedir solo los permisos necesarios.
- Explicar qué campos se leen, con qué frecuencia, para qué se usan y si salen del dispositivo.
- Mostrar procedencia, unidad, ventana de medición y limitaciones.
- Permitir desconectar la fuente y borrar los datos importados.
- No compartir datos de salud con publicidad, empleadores, aseguradoras o proveedores de IA sin una base y consentimiento revisados; la opción recomendada es no hacerlo.
- Evitar notificaciones que diagnostiquen o alarmen. La persona controla frecuencia y contenido.
- Evaluar normativa y revisión especializada en los territorios objetivo.

## Propuesta de fases

1. Investigación de necesidades y dispositivos objetivo.
2. Prototipo con datos sintéticos, sin importación real.
3. Evaluación de APIs, privacidad y permisos en cada plataforma.
4. Piloto opt-in, claramente etiquetado como experimental y sin inferencias clínicas.
5. Revisión de seguridad, accesibilidad, exactitud y soporte antes de ampliar.

No implementar umbrales universales de frecuencia cardíaca o HRV para disparar avisos. La línea base individual, el contexto y la validación de la función requerirían investigación y aprobación específica.
