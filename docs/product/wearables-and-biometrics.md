# Exploración: wearables y datos biométricos

## Estado

La app web de Mood Log todavía no integra HealthKit, Health Connect ni Bluetooth. El repositorio incluye una app fuente nativa de Wear OS con check-in manual y lectura puntual de pulso mediante Health Services. El check-in comienza sin una puntuación de ánimo; solo un toque explícito establece autorreporte. El prototipo exige una autodeclaración local 18+ al iniciar; puede retirarse, pero no verifica edad real ni identifica cuenta. Pide confirmación antes del permiso Android, mantiene opcional la lectura y separa visualmente pulso y ánimo. La nueva ruta guarda solo un registro local versionado de aceptar/rechazar, ofrece consultar/borrar ese registro y abrir los ajustes del permiso. No persiste ni sincroniza la muestra de pulso o ánimo. `:app:assembleDebug` produjo un APK debug el 20 de noviembre de 2026; no se instaló ni se ejecutó en emulador o reloj, por lo que no acredita compatibilidad de dispositivos ni constituye una función lanzable. La evidencia local no identifica a una persona, no puede exportarse/sincronizarse y no es suficiente para un piloto. Este documento describe el estado actual, los límites y la ruta de validación.

La vista interna `/__dev/health-context` usa solo fixtures y muestra resumen descriptivo separado (mediana, rango, conteo y período) junto a la línea de tiempo. No calcula asociación pulso-ánimo ni acepta datos reales. La dirección elegida para una etapa longitudinal es combinar localmente en el reloj solo lecturas de pulso y check-ins de ánimo capturados allí; no incluye por ahora registros web/Firestore ni diario. La posibilidad de una línea de tiempo ampliada se describe en [Contexto biométrico para ánimo y diario](../features/biometric-context/README.md) y requiere aprobar una transferencia separada.

## Propósito posible

En el futuro, la persona podría optar por importar datos fisiológicos desde un dispositivo compatible para verlos con su autorreporte. La primera serie longitudinal elegida se limitaría a los registros creados dentro del reloj. La utilidad, precisión y comprensión deben validarse antes de definir una función.

## Conceptos

| Dato | Significado general | Límites |
|---|---|---|
| Frecuencia cardíaca | Latidos por minuto registrados por un sensor. | Cambia con movimiento, salud, medicamentos, sueño, dispositivo y método de medición. No mide directamente una emoción. |
| HRV/VFC | Variación temporal entre latidos, expresada mediante métricas distintas, por ejemplo SDNN o RMSSD. | Métricas, ventanas y dispositivos no son intercambiables; una lectura aislada no diagnostica estrés ni enfermedad. |
| Otros datos de salud | Por ejemplo, sueño o actividad física, según la fuente. | Requieren permiso separado, procedencia y contexto; no asumir que están disponibles o son comparables. |

Evitar frases como “la HRV baja significa ansiedad” o “el pulso detectó un episodio de estrés”. No inferir causas, diagnósticos o crisis a partir de métricas biométricas.

### Evidencia y recomendación de producto (20 de noviembre de 2026)

La literatura explora reconocimiento de emociones con varias señales fisiológicas y dispositivos portátiles; no demuestra que una lectura puntual de pulso identifique por sí sola el estado de ánimo de una persona. Una revisión sistemática de 34 estudios sobre señales de wearables en vida diaria considera el campo factible, pero todavía con brechas: predominio de estudios de laboratorio, clases binarias o reducidas, validación externa insuficiente y poco contexto en los estudios revisados. El fundador eligió como dirección de producto mostrar patrones personales descriptivos de pulso y ánimo autoinformado, sin etiquetar emociones ni usar predicciones poblacionales. Esta elección no valida la utilidad ni el método; para la etapa local, solo se podrían combinar check-ins y mediciones capturados en el reloj. Fuente: [Saganowski et al., IEEE Transactions on Affective Computing, revisión sistemática](https://doi.org/10.1109/TAFFC.2022.3176135).

La clasificación automática se consideraría investigación posterior, con consentimiento de investigación separado, protocolo y revisión ética pertinentes, anotaciones contemporáneas de los participantes, actividad y contexto, datos suficientes, evaluación individual y externa, análisis de errores por subgrupo y dispositivo, y revisión de claims y clasificación regulatoria colombiana. No debe mostrarse como una función disponible ni inferir salud mental a partir de una correlación.

## Estado técnico actual y siguientes opciones

El módulo fuente está en [`wearos/`](../../wearos/README.md). La primera iteración no crea cuenta, no sincroniza con el teléfono, no escribe en Health Connect ni persiste la muestra. Para una etapa longitudinal posterior se eligió persistencia privada local en el reloj, pero aún no se implementa; los registros web/Firestore no llegarán al reloj sin una transferencia separadamente aprobada. El build local con Android SDK Platform 36 y Gradle 8.13 ya produjo un APK; para validar permisos y lecturas se requiere un emulador Wear OS y después relojes físicos compatibles.

Health Connect en un cliente Android móvil sigue siendo una vía complementaria para importar muestras históricas ya escritas por otras apps. No sustituye ejecutar Mood Log directamente en el reloj ni está dentro del almacén local elegido en la primera etapa longitudinal.

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
