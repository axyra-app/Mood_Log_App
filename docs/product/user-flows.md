# Flujos principales de usuario

## Propósito y límites

Los diagramas representan recorridos objetivo y puntos de integración del código revisado. No son pruebas de que la configuración de Firebase, IA o producción esté disponible. Las brechas actuales están señaladas para evitar confundir diseño con comportamiento probado.

## 1. Registro de ánimo

```mermaid
sequenceDiagram
    actor P as Persona usuaria
    participant UI as MoodFlowSimple
    participant Hook as useMood
    participant FS as Cloud Firestore

    P->>UI: Selecciona valoración visual y completa pasos
    UI->>Hook: createMoodLog(datos del registro)
    Hook->>FS: Escribe documento en moodLogs
    FS-->>Hook: Resultado o error de reglas/conexión
    Hook-->>UI: ID o error
    UI->>UI: Solicita análisis de fallback local
    UI-->>P: Muestra resultado o estado de error
```

**Estado observado:** el formulario y servicio existen. `useMood` agrega el UID actual al registro. La escala del tipo compartido y algunos documentos no coincide con el selector visual; las reglas y el modelo deben probarse en desarrollo.

**No asumir:** actualización de una racha persistida, una puntuación clínica, guardado del resultado de IA mostrado o funcionamiento sin conexión.

## 2. Diario

```mermaid
sequenceDiagram
    actor P as Persona usuaria
    participant UI as Journal / JournalEditor
    participant Hook as useJournal
    participant AI as Servicio de análisis (si está habilitado)
    participant FS as Cloud Firestore

    P->>UI: Crea o edita una entrada
    UI->>Hook: Enviar contenido y metadatos
    opt Análisis de texto configurado
        Hook->>AI: Solicita análisis
        AI-->>Hook: Resultado o error
    end
    Hook->>FS: Escribe journalEntries
    FS-->>Hook: Confirmación o rechazo de reglas
    Hook-->>UI: Actualiza estado y muestra resultado
```

**Estado observado:** el hook/servicio permite operaciones de diario y suscripción a entradas. El contenido se guarda legible. La configuración actual de reglas y los accesos de IA requieren revisión; no describir el diario como cifrado.

## 3. Chat de apoyo

```mermaid
sequenceDiagram
    actor P as Persona usuaria
    participant UI as AIChat
    participant Agent as Agente IA cliente
    participant Provider as Proveedor externo (según configuración)

    P->>UI: Escribe un mensaje
    UI->>Agent: Envía texto y contexto básico
    Agent->>Provider: Solicitud desde el navegador
    Provider-->>Agent: Respuesta o error
    Agent-->>UI: Texto de respuesta
    UI-->>P: Muestra la conversación en la página
```

**Estado observado:** los mensajes se mantienen en estado de la página; no se encontró persistencia en este componente. El servicio se ejecuta desde el cliente y puede requerir una clave `VITE_*`. El historial se pierde al desmontar/recargar la vista. El motor heurístico de crisis del repositorio no aparece conectado a este flujo.

**Bloqueantes antes de habilitar con datos reales:** backend seguro, consentimiento y minimización, revisión de nombres/textos que sugieren atención profesional, política de retención y plan de errores/abuso.

## 4. Estadísticas y exportación

```mermaid
sequenceDiagram
    actor P as Persona usuaria
    participant UI as Statistics
    participant Hook as useMood / useJournal
    participant FS as Cloud Firestore
    participant PDF as jsPDF en navegador

    P->>UI: Selecciona período
    UI->>Hook: Consulta registros y entradas disponibles
    Hook->>FS: Lee documentos del usuario
    FS-->>Hook: Datos o error
    Hook-->>UI: Registros cargados
    UI->>UI: Calcula y muestra resúmenes descriptivos
    opt La persona solicita exportar
        UI->>PDF: Compone el reporte en el cliente
        PDF-->>P: Descarga archivo PDF
    end
```

La exportación se genera en el dispositivo según la implementación revisada. Antes de compartir un PDF, la persona debe poder revisar su contenido; los datos resumidos no prueban causalidad ni son una evaluación clínica.

## 5. Crisis y ayuda inmediata: no es un flujo operativo

El repositorio contiene lógica heurística de detección y menciona colecciones para evaluaciones, pero no se encontró una llamada a `detectCrisisSignals` desde las páginas de registro, diario o chat, ni un flujo integrado que garantice respuesta inmediata. Las reglas locales tampoco autorizan las colecciones de crisis mencionadas por ese servicio.

Por lo tanto, no presentar actualmente esta secuencia como función disponible:

```mermaid
flowchart LR
    A[Texto introducido] -.-> B[Heurística no conectada al recorrido]
    B -.-> C[Respuesta y recursos por definir]
```

El [protocolo de crisis](./crisis-protocol.md) describe los requisitos que deben cumplirse antes de diseñar o anunciar una capacidad de apoyo de emergencia.
