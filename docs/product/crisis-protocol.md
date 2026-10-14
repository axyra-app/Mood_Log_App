# Seguridad ante situaciones de crisis

## Estado y alcance

Este documento define principios y requisitos para cualquier futura función de apoyo. **No describe un servicio actualmente operativo.** El repositorio contiene reglas heurísticas en `frontend/src/services/crisisDetection.ts`, pero no se encontró su integración con los recorridos de check-in, diario o chat. Tampoco se encontró un sistema de atención humana, monitoreo continuo o escalamiento a emergencias.

No presentar Mood Log como detector fiable de suicidio/autolesión, servicio de urgencias, línea de crisis ni sustituto de atención profesional.

## Mensaje para las personas usuarias

Si se habilita una experiencia de IA o bienestar, debe comunicar claramente que:

- Mood Log es una herramienta de autoobservación, no un servicio clínico o de emergencia.
- Una respuesta automatizada puede no reconocer una situación de riesgo y puede equivocarse.
- La aplicación no garantiza monitoreo continuo ni una respuesta humana.
- En una emergencia inmediata, la persona debe contactar a los servicios locales de emergencia o a una persona de confianza.

La información debe mostrarse antes de que la persona comparta texto sensible y estar disponible desde el flujo de conversación.

## Límites del detector heurístico actual

El servicio existente contiene listas de términos y reglas para asignar niveles de señal. Este enfoque puede:

- No detectar expresiones indirectas, idioma, contexto, negación, ironía o errores ortográficos.
- Marcar contenido no relacionado con una emergencia.
- Producir niveles de riesgo sin validación clínica.
- Depender de datos de un esquema anterior, como notificaciones a psicólogos.
- Intentar persistir en colecciones no habilitadas por las reglas locales.

No se deben usar sus niveles, confianza o puntuación para afirmar una evaluación válida. No se deben guardar ni transmitir estos análisis sin una decisión de privacidad, finalidad y retención.

## Requisitos antes de considerar una función de crisis

1. **Definir el propósito:** prevención de daño, acceso a recursos o simple información; evitar prometer detección automática.
2. **Revisión de especialistas:** seguridad clínica, accesibilidad, idioma y diversidad cultural deben revisarse por profesionales pertinentes.
3. **Diseñar respuesta y límites:** explicar claramente si hay o no monitoreo humano; no insinuar que alguien recibirá una alerta si no existe un proceso atendido.
4. **Recursos locales verificables:** mantener recursos oficiales por jurisdicción, comprobar cobertura, horarios, idioma y costo; mostrar fecha de verificación y alternativa de emergencia local. No reutilizar números sin confirmar su vigencia en fuentes oficiales.
5. **Pruebas de escenarios:** falsos positivos, falsos negativos, texto ambiguo, idioma, negación, indisponibilidad de red, errores y menores de edad cuando corresponda.
6. **Privacidad y seguridad:** minimizar datos, establecer consentimiento, acceso, retención y eliminación; probar reglas y cualquier sistema de notificación.
7. **Lenguaje no coercitivo:** ofrecer opciones, no culpabilizar, no bloquear acceso a la cuenta o a los datos y no sustituir la decisión de la persona.
8. **Plan operativo:** responsable, horarios, jurisdicciones, incidentes, soporte y procedimiento de actualización de recursos.

## Diseño futuro posible

Una experiencia futura podría ofrecer acceso visible a recursos locales y herramientas voluntarias de grounding o respiración. Debe describirse como información o ejercicio de bienestar, sin prometer que detendrá una crisis ni que active atención profesional. La persona debe poder descartarlo y acceder a ayuda externa.

## Revisión antes de lanzamiento

- [ ] La función no se presenta como diagnóstico o detector fiable.
- [ ] Se ha probado en cada idioma y jurisdicción de lanzamiento.
- [ ] Los recursos se verificaron en fuentes oficiales y tienen fecha de revisión.
- [ ] La interfaz deja claro si existe monitoreo humano y quién lo realiza.
- [ ] Las rutas de emergencia no dependen de una conexión o llamada que la app no pueda garantizar.
- [ ] El flujo se probó en dispositivos y con lectores de pantalla.
- [ ] Las prácticas de datos y textos legales corresponden con el comportamiento real.

Hasta completar esta revisión, el protocolo debe considerarse una especificación pendiente, no una funcionalidad de Mood Log.
