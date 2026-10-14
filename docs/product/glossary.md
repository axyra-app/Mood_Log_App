# Glosario de Mood Log

Definiciones en lenguaje claro de términos utilizados en el producto y su documentación. Los términos describen conceptos, no funcionalidades automáticamente disponibles en la aplicación.

## Bienestar y autoobservación

### Estado de ánimo
Cómo describe una persona su tono emocional general durante un período. En Mood Log es un autorreporte; no equivale a una evaluación psicológica.

### Emoción
Experiencia afectiva que una persona identifica, por ejemplo, alegría, tristeza, enfado o calma. Las categorías son orientativas y pueden variar entre personas y culturas.

### Registro o check-in
Entrada voluntaria en la que la persona anota una valoración y, opcionalmente, emociones, actividades o contexto.

### Escala de valoración
Conjunto ordenado de valores utilizado para expresar una percepción. La interfaz actual muestra una selección visual de 1 a 10, mientras que el tipo de datos compartido todavía refleja una escala antigua; la escala canónica está pendiente de unificación.

### Etiqueta o contexto
Palabra o categoría que la persona añade a un registro, por ejemplo trabajo, descanso o actividad física. Una asociación observada no demuestra que la etiqueta haya causado un cambio de ánimo.

### Racha
Conteo de días consecutivos con una actividad registrada. Una racha no representa salud, progreso clínico ni valor personal; su diseño debe evitar culpa o presión.

### Tendencia
Resumen de cambios observados durante un período definido. Depende de la cantidad, consistencia y calidad de los registros.

## IA y límites de uso

### IA generativa
Sistema que produce texto a partir de una solicitud. Puede equivocarse, responder de forma inadecuada o inventar información; no equivale a una persona profesional ni a una fuente clínica.

### Análisis determinista
Resultado calculado por reglas o código establecido, sin una respuesta generativa. También puede tener errores y requiere definir claramente cómo se calcula.

### Detección heurística
Reglas simples, por ejemplo coincidencias de palabras, utilizadas para señalar patrones. No es un detector clínico y puede generar falsos positivos y falsos negativos.

## Tecnología

### Frontend
Parte de la aplicación que se ejecuta en el navegador y presenta la interfaz. En este proyecto está construida con React y TypeScript.

### SPA (Single-Page Application)
Aplicación web que cambia de vista sin descargar una página HTML completa en cada navegación. Mood Log usa React Router para las rutas del cliente.

### PWA (Progressive Web App)
Aplicación web que puede ofrecer instalación y recursos como manifiesto o service worker. Una PWA no garantiza por sí sola trabajo offline de datos ni sincronización.

### Firebase Authentication
Servicio de Firebase para administrar identidad y sesiones de cuenta. La autenticación identifica al usuario; las reglas de Firestore/Storage deben autorizar cada operación.

### Cloud Firestore
Base de datos documental de Firebase. Es schemaless: los tipos TypeScript del cliente no validan automáticamente documentos ni sustituyen reglas de seguridad.

### Cloud Storage
Servicio de almacenamiento de archivos. El acceso depende de sus reglas; una URL de descarga puede permitir acceso a quien la reciba según el mecanismo utilizado.

### Variable `VITE_*`
Variable de entorno que Vite expone al código cliente al compilar. No debe usarse para secretos de servidor.

### Firebase Emulator Suite
Herramientas locales para desarrollar y probar servicios de Firebase. Un emulador solo se usa si el proyecto está configurado y el cliente apunta a él.

### Cifrado de extremo a extremo
Diseño criptográfico en el que el contenido se cifra antes de salir del dispositivo y solo los extremos autorizados poseen la clave de descifrado. Mood Log aún no implementa este modelo para el diario.

### HRV / VFC
Variabilidad del tiempo entre latidos, calculada con métodos que dependen del sensor, la ventana de medición y la métrica elegida. No debe interpretarse aisladamente como diagnóstico de estrés o salud.

### RHR / frecuencia cardíaca en reposo
Estimación de la frecuencia cardíaca en condiciones de reposo. Su significado depende del contexto y del método del dispositivo; no permite inferir por sí sola un estado emocional.
