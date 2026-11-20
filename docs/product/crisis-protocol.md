# Seguridad ante situaciones de crisis

## Estado y alcance

Este documento define principios y requisitos para cualquier futura función de apoyo. **No describe un servicio actualmente operativo.** Se retiró del código activo el detector heurístico heredado porque asignaba niveles de riesgo y sugería acciones sin validación ni un flujo de atención asociado. Tampoco existe un sistema de atención humana, monitoreo continuo o escalamiento a emergencias.

No presentar Mood Log como detector fiable de suicidio/autolesión, servicio de urgencias, línea de crisis ni sustituto de atención profesional.

## Mensaje para las personas usuarias

Si se habilita una experiencia de IA o bienestar, debe comunicar claramente que:

- Mood Log es una herramienta de autoobservación, no un servicio clínico o de emergencia.
- Una respuesta automatizada puede no reconocer una situación de riesgo y puede equivocarse.
- La aplicación no garantiza monitoreo continuo ni una respuesta humana.
- En una emergencia inmediata, la persona debe contactar a los servicios locales de emergencia o a una persona de confianza.

La información debe mostrarse antes de que la persona comparta texto sensible y estar disponible desde el flujo de conversación.

## Límite de la versión actual

Mood Log no clasifica riesgo ni ofrece detección o atención de crisis. La IA puede no reconocer una situación urgente; su aviso de emergencia no equivale a monitoreo ni respuesta inmediata. Las colecciones heredadas de evaluaciones permanecen en las rutinas de eliminación para cubrir datos antiguos, pero no se crean desde el código activo revisado.

## Borrador operativo para entrevistas de producto en Colombia

**Estado:** borrador al 20 de noviembre de 2026. Guía interna para moderadores; requiere aprobación del responsable del proyecto y revisión profesional antes de usarla. No crea una función de crisis en Mood Log ni sustituye un protocolo clínico.

### Antes de una sesión

- Nombrar un moderador responsable y un contacto de respaldo que pueda atender una pausa por seguridad durante la sesión.
- Dar el aviso de privacidad de investigación de producto, explicar quién tendrá acceso a las notas codificadas y su fecha de borrado. No registrar en las notas diagnósticos, tratamientos, ideación, métodos ni relatos de crisis.
- Mantener el guion fuera de evaluación clínica: no preguntar por síntomas, ideación, autolesión, diagnósticos ni tratamientos; trabajar con pantallas, cuentas y mediciones sintéticas.
- Tener a mano una hoja de recursos aprobada. La línea de emergencia 123 se identifica oficialmente como línea única nacional; confirmar en cada revisión operativa que el dato y su disponibilidad sigan vigentes ([Función Pública](https://www1.funcionpublica.gov.co/preguntas-frecuentes/-/asset_publisher/sqxafjubsrEu/content/linea-unica-de-emergencias-nacional-123/28585938)).
- La búsqueda local de recursos devolvió la **Línea de Atención para la Salud Mental** con este contacto: [+57 (606) 7359950](tel:+576067359950?oai_link_source=model_response_hotline), [https://construyendonos.org/](https://construyendonos.org/?oai_link_source=model_response_hotline). La fuente consultada no especifica cobertura territorial ni horario; no ofrecerla como nacional hasta confirmar directamente ambos datos y volver a verificarla antes de cada ciclo.
- Si el equipo no tiene un responsable disponible, la hoja de recursos no está verificada o el aviso/retención no están listos, no empezar sesiones que traten sobre ánimo.

### Si alguien revela malestar o una situación urgente

1. Pausar la tarea y la toma de notas. Agradecer la confianza y decir: “No necesitas contarme detalles para esta entrevista. Podemos parar ahora; si quieres, puedo ayudarte a buscar un recurso de apoyo”.
2. No investigar, diagnosticar, debatir, prometer confidencialidad absoluta ni decir que Mood Log vigila o notificará a alguien.
3. Si la persona indica que existe peligro inmediato, terminar la entrevista y priorizar conectarla con servicios de emergencia o una persona de confianza que ella elija. Para una emergencia en Colombia, ofrecer llamar al 123; si la sesión es remota, animar a que contacte los servicios locales y al responsable de sesión, sin inventar ubicación ni cobertura. La orientación del [Instituto Nacional de Salud](https://www.ins.gov.co/Noticias/Paginas/Prevenir-el-suicidio-es-posible%2C-reconoce-las-señales%2C-pregunta-y-busca-ayuda-a-tiempo.aspx) recomienda acudir de forma urgente a atención especializada ante peligro inmediato.
4. No dejar sola a una persona en peligro inmediato durante una sesión presencial; mantener la compañía mientras se activa ayuda con su participación, conforme a la orientación del Instituto Nacional de Salud enlazada arriba. El moderador no sustituye al profesional de salud ni realiza una evaluación de riesgo.
5. No copiar el relato a la matriz de hallazgos. Registrar únicamente, si hace falta para seguimiento operativo, el código aleatorio de sesión, que se pausó por seguridad, fecha, acción logística acordada y responsable; mantener esa nota separada y eliminarla en el plazo aprobado.
6. Si se requiere recolectar identidad o ubicación para activar ayuda, explicar el motivo y compartir solo el mínimo necesario con el servicio/contacto elegido; no reutilizar esa información para el producto o investigación.

Esta guía debe revisarse por un profesional de salud mental y asesoría jurídica antes del primer reclutamiento. Si no se puede ofrecer una ruta humana adecuada con los recursos efectivamente disponibles en la ubicación de la persona, cerrar la sesión sin pedir más detalles y activar el proceso local que el equipo haya aprobado previamente.

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
