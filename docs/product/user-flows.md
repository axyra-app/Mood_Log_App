# 🔄 Flujos de Usuario Principales (User Journeys)

Este documento detalla los 4 flujos principales de experiencia del usuario en **Mood Log App**, ilustrando el paso a paso tanto a nivel de interfaz como a nivel de datos.

---

## Flujo 1: Registro Rápido Diario (Check-in Emocional)

Este es el flujo nuclear de la aplicación (objetivo: completarse en menos de 5 segundos).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as Pantalla MoodFlow
    participant Hook as useMood
    participant DB as Cloud Firestore

    U->>UI: Toca el botón central "+" o "Registrar Ánimo"
    UI->>U: Muestra selector del 1 al 10 con color dinámico
    U->>UI: Desliza el puntaje (ej. 8/10)
    U->>UI: Selecciona emoción (ej. "Motivado") y tag (ej. "Trabajo")
    U->>UI: Toca "Guardar Registro"
    UI->>Hook: createMoodLog({ score: 8, mood: 'Motivado', tags: ['Trabajo'] })
    Hook->>DB: Guarda documento en colección moodLogs
    Hook->>DB: Actualiza racha (+1) en users/{uid}
    DB-->>UI: Confirmación exitosa
    UI->>U: Muestra confeti / animación de racha y vuelve a Dashboard
```

---

## Flujo 2: Desahogo en el Diario con Respuesta Empática

El usuario utiliza el diario para exteriorizar pensamientos profundos y recibir retroalimentación reflexiva.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant J as Pantalla Journal
    participant AI as aiService (Confidente)
    participant DB as Cloud Firestore

    U->>J: Entra a "Diario Personal"
    U->>J: Escribe su reflexión libre o elige un prompt guiado
    U->>J: Presiona "Guardar y reflexionar con IA"
    J->>DB: Guarda la entrada en journalEntries/{entryId}
    J->>AI: Solicita análisis reflexivo respetuoso del texto
    AI-->>J: Retorna pregunta socrática o validación empática
    J->>DB: Actualiza la entrada con el campo aiFeedback
    J->>U: Muestra la reflexión del confidente en una tarjeta suave
```

---

## Flujo 3: Activación del Protocolo de Contención de Crisis

Si en cualquier momento la persona escribe palabras de autolesión o ideación autolítica, se activa la respuesta de protección inmediata.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant Chat as Chat / Diario
    participant Det as crisisDetection
    participant Modal as Modal de Crisis

    U->>Chat: Escribe texto con expresiones de riesgo severo
    Chat->>Det: Analiza texto en tiempo real
    Det-->>Chat: Resultado: RIESGO_CRITICO
    Chat->>Chat: Bloquea respuestas casuales del modelo
    Chat->>Modal: Despliega inmediatamente Modal de Emergencia
    Modal->>U: Muestra botón telefónico directo a Línea de Vida (ej. 988 / 024)
    Modal->>U: Ofrece ejercicio de Respiración Guiada 4-7-8
    U->>Modal: Selecciona llamar o iniciar respiración
```

---

## Flujo 4: Consulta de Progreso y Descarga de PDF

El usuario revisa su consistencia a lo largo del mes y genera un informe personal.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant Stats as Pantalla Statistics
    participant PDF as pdfReportService
    participant DB as Cloud Firestore

    U->>Stats: Navega a la pestaña "Estadísticas"
    Stats->>DB: Consulta moodLogs ordenados por fecha de los últimos 30 días
    DB-->>Stats: Retorna lista de registros del usuario
    Stats->>Stats: Calcula media móvil, días con mejor ánimo y detonantes clave
    Stats->>U: Renderiza gráficos de tendencia y mapa de emociones
    U->>Stats: Pulsa botón "Descargar Resumen Mensual en PDF"
    Stats->>PDF: Compila métricas y gráficos en documento PDF con jsPDF
    PDF->>U: Descarga automática de 'mi_resumen_emocional.pdf' en el dispositivo
```
