# 📖 Glosario de Términos (Conceptos para Todos)

Este glosario está diseñado para que cualquier persona —sin importar si tiene formación técnica, médica o de negocios— pueda entender con total claridad cada concepto utilizado en **Mood Log App**.

---

## 🧠 Términos de Bienestar Emocional y Psicología

### 1. Estado de Ánimo (Mood) vs. Emoción (Emotion)
- **Emoción:** Una reacción psicofisiológica intensa pero breve ante un estímulo específico (ej. sentir un sobresalto de miedo al escuchar un frenazo o una alegría súbita al recibir una buena noticia).
- **Estado de Ánimo:** Un estado emocional más difuso, duradero y de menor intensidad que acompaña a la persona durante horas o días (ej. sentirse apático, sereno, melancólico o motivado a lo largo de una semana).

### 2. Valencia y Activación (Arousal)
- **Valencia:** Qué tan placentera o displacentera es una emoción (va de negativa/desagradable a positiva/agradable).
- **Activación (Arousal):** El nivel de energía o alerta física asociado a la emoción (ej. la *ira* tiene alta energía, la *tristeza* baja energía; la *euforia* alta energía, la *calma* baja energía).

### 3. Registro de Ánimo (Check-in Emocional)
El acto deliberado de pausar durante unos segundos al día para auto-observarse, nombrar lo que se siente y calificarlo en una escala numérica del 1 al 10. La psicología contemporánea demuestra que el simple hecho de "etiquetar la emoción" (*affect labeling*) reduce la hiperactividad de la amígdala cerebral.

### 4. Racha (Streak)
El número consecutivo de días en los que el usuario ha realizado al menos un registro en la aplicación. Inspirado en plataformas de hábitos y deporte como Duolingo y Strava, sirve como incentivo conductual para crear disciplina de auto-cuidado.

### 5. Detonantes (Triggers)
Eventos, personas, contextos o actividades específicas que preceden a un cambio en el estado de ánimo (ej. *trabajo, discusión, falta de sueño, comida, ejercicio, clima*).

### 6. Técnica 4-7-8 y Respiración Cuadrada (Box Breathing)
Ejercicios de respiración rítmica controlada que estimulan el **nervio vago** (el interruptor del sistema nervioso parasimpático), reduciendo la frecuencia cardíaca y mitigando ataques de pánico o picos de estrés en menos de 2 minutos.

---

## 💓 Términos Biométricos y Wearables

### 1. Wearable
Cualquier dispositivo electrónico inteligente que se lleva puesto en el cuerpo de forma continua, como un reloj inteligente (*Apple Watch, Galaxy Watch, Garmin*) o una banda de pulso.

### 2. Frecuencia Cardíaca en Reposo (RHR - Resting Heart Rate)
La cantidad de latidos por minuto (BPM) cuando el cuerpo está completamente relajado y quieto. Si la persona está sentada pero su pulso se dispara sin haber hecho esfuerzo físico, es un indicador fisiológico directo de estrés mental o ansiedad.

### 3. Variabilidad del Ritmo Cardíaco (HRV / VFC)
No late a un ritmo exacto de metrónomo; entre latido y latido hay variaciones de milisegundos (ej. 850ms, luego 920ms, luego 810ms).
- **Alta HRV:** Significa que el corazón es flexible y se adapta rápidamente al estrés (estado saludable y de calma).
- **Baja HRV:** Significa que el cuerpo está atrapado en modo de lucha o huida (*Fight or Flight*), síntoma de agotamiento o estrés agudo.

---

## 💻 Términos Técnicos y de Software

### 1. PWA (Progressive Web App)
Una aplicación construida con tecnologías web (HTML, CSS, JavaScript) que se comporta como una aplicación móvil nativa: puede instalarse en la pantalla de inicio del teléfono, funcionar a pantalla completa y trabajar sin conexión a internet.

### 2. Frontend y SPA (Single Page Application)
- **Frontend:** La parte visual de la aplicación con la que interactúa el usuario (botones, colores, formularios).
- **SPA:** Aplicación web de página única. Al navegar entre pantallas no se recarga toda la página en blanco; React intercambia instantáneamente los componentes en pantalla, haciendo que se sienta instantánea.

### 3. Serverless (Sin Servidor)
Modelo donde no es necesario alquilar ni administrar un servidor tradicional de Linux/Windows que esté encendido 24/7. Servicios como Firebase y Vercel se encargan de ejecutar la lógica, escalar automáticamente y almacenar datos según la demanda exacta.

### 4. Firebase Authentication, Firestore y Cloud Storage
- **Authentication:** Módulo de inicio de sesión seguro (maneja contraseñas, tokens y cuentas de Google).
- **Firestore:** Base de datos moderna basada en documentos donde se guardan los números de ánimo, fechas y textos.
- **Storage:** Almacén digital para archivos pesados (fotos de perfil).

### 5. Cifrado de Extremo a Extremo (E2EE / AES-GCM)
Método de seguridad donde los textos del diario se convierten en un código ininteligible en el propio teléfono del usuario antes de subirse a la nube. Ni siquiera los administradores o desarrolladores de la base de datos pueden leer lo que escribió la persona.
