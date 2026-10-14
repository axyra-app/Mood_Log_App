# Análisis completo de Mood Log App

**Fecha del análisis:** 10 de octubre de 2026  
**Alcance:** revisión estática del código, las reglas/configuración de Firebase, el frontend y validaciones locales. No se tuvo acceso a la consola de Firebase ni al proyecto de Vercel; por tanto, no se confirma qué configuración está desplegada actualmente.

## Resumen ejecutivo

Mood Log App es una aplicación web progresiva (PWA) construida con React, TypeScript y Vite. Utiliza Firebase Authentication, Cloud Firestore y Cloud Storage desde el navegador, y contiene módulos para usuarios y psicólogos: registro de ánimo, diario, estadísticas, reportes, citas, chat, notificaciones e historial médico.

La aplicación tiene una base visual y funcional amplia. Sin embargo, la revisión encontró riesgos graves de privacidad, flujos incompletos, inconsistencias en los datos y ausencia de validaciones automáticas suficientes. El build de Vite termina, pero el chequeo de tipos de TypeScript falla. **No se recomienda usar el sistema con datos reales de salud mental hasta corregir y probar las reglas de Firebase y revisar la exposición de archivos.**

| Área | Evaluación |
|---|---|
| Arquitectura | Frontend SPA conectado directamente a Firebase |
| Funciones de producto | Varias pantallas listas visualmente; ciertos flujos aún son simulados o inconsistentes |
| Seguridad y privacidad | Crítica: reglas demasiado permisivas en registros sensibles y archivos |
| Integración de IA | Hay llamadas a Groq desde el navegador; otro flujo principal entrega análisis locales de fallback |
| Build y TypeScript | El build de Vite funciona; `tsc --noEmit` falla por errores de sintaxis |
| Pruebas | No se encontraron pruebas automatizadas ni scripts de test/lint/typecheck en el paquete |
| Despliegue | Vercel contiene rewrite para SPA; la configuración de Firebase Storage debe verificarse |

## 1. Arquitectura

- Aplicación de una sola página con React 18, TypeScript, React Router y Vite.
- Firebase se inicializa desde el frontend para Auth, Firestore y Storage.
- Las rutas y los proveedores principales se organizan en [frontend/src/App.tsx](frontend/src/App.tsx).
- El cliente de Firebase está en [frontend/src/services/firebase.ts](frontend/src/services/firebase.ts).
- La configuración de Vercel reescribe las rutas a `index.html`, una configuración habitual para una SPA: [frontend/vercel.json](frontend/vercel.json).
- Vite genera también un service worker/manifest PWA, pero eso por sí solo no demuestra que las operaciones de la aplicación funcionen sin conexión.
- No se encontró un backend propio dentro del repositorio. La lógica de negocio y varias operaciones de datos se ejecutan desde el navegador.

La amplitud de funcionalidades es una fortaleza, pero aumenta el costo de mantener reglas de acceso y modelos de datos consistentes. Hay diversos servicios para chats, citas, notificaciones y análisis que parecen manejar esquemas distintos. Conviene definir un único contrato para cada función y emplearlo en componentes, servicios y reglas.

## 2. Hallazgos de seguridad y privacidad

### 2.1 Crítico: lectura y escritura global de estados de ánimo

Las reglas de Firestore permiten a cualquier usuario autenticado leer, crear, modificar y eliminar cualquier documento de `moodLogs`: [firestore.rules](firestore.rules#L28-L33). Los registros pueden contener emociones y notas personales, por lo que esto implica riesgo directo de exposición de datos sensibles.

**Recomendación:** sustituir esta política por permisos que comprueben que `request.auth.uid` coincide con el `userId` del documento. Validar también el dueño en las escrituras y limitar campos/valores aceptados.

### 2.2 Crítico: chats accesibles a cualquier usuario autenticado

Las reglas de `chatSessions` y `chatMessages` permiten acceso general a cualquier persona autenticada: [firestore.rules](firestore.rules#L63-L72). Otro problema relacionado: el servicio principal también utiliza colecciones `chats` y `messages`: [frontend/src/services/chatService.ts](frontend/src/services/chatService.ts). Esas colecciones no aparecen en las reglas mostradas y, si no hay otra regla coincidente en Firebase, las operaciones se deniegan por defecto.

**Recomendación:** elegir un esquema único de chat y restringir cada sesión/mensaje a sus participantes. Probar lectura, escritura y suscripciones tanto con el emulador como con usuarios distintos.

### 2.3 Crítico: Storage permite descargas públicas y escrituras amplias

La regla general de Storage permite lectura pública y escritura a todo usuario autenticado para cualquier ruta: [storage.rules](storage.rules#L18-L24). El servicio de hojas de vida carga archivos bajo `psychologist-cvs`, fuera de las rutas específicas de usuario/psicólogo: [frontend/src/services/cvService.ts](frontend/src/services/cvService.ts#L18-L45).

**Recomendación:** quitar acceso general, organizar archivos bajo rutas por UID y limitar lectura al dueño y a los usuarios que deban tener acceso. Aplicar restricciones de tamaño/tipo de archivo y comprobar qué archivos existentes son públicos.

### 2.4 Alto: rol de psicólogo controlable desde el cliente

El formulario de perfil permite establecer un rol y el contexto guarda datos de perfil enviados desde el frontend: [frontend/src/pages/CompleteProfile.tsx](frontend/src/pages/CompleteProfile.tsx#L107-L150) y [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx#L425-L465). Las reglas permiten a cada usuario escribir su propio documento de `users` sin limitar los campos editables: [firestore.rules](firestore.rules#L7-L15).

Un rol profesional no debería confiarse a un valor editable por el navegador. Debe asignarse mediante verificación administrativa o una función confiable del servidor y validarse en los permisos de datos.

### 2.5 Alto: configuración de reglas de Storage sospechosa

En [firebase.json](firebase.json#L60-L69), la configuración de Storage aparece apuntando a `"y"`, no a `storage.rules`. Esto puede impedir desplegar el archivo de reglas esperado mediante Firebase CLI. Hay que verificar y corregirlo antes de cualquier despliegue. La revisión no pudo comprobar las reglas activas en la consola.

### 2.6 Claves y llamadas a IA

La configuración de Firebase está definida en el código del cliente: [frontend/src/services/firebase.ts](frontend/src/services/firebase.ts#L7-L15). Una API key de Firebase para cliente no es una credencial de servidor; no obstante, no protege datos. La seguridad debe depender de Auth, las reglas, las restricciones de API y, donde corresponda, App Check.

Los servicios de Groq se inicializan en el frontend y habilitan expresamente uso en navegador: [frontend/src/services/specializedAgents.ts](frontend/src/services/specializedAgents.ts#L1-L7) y [frontend/src/services/aiAgents.ts](frontend/src/services/aiAgents.ts#L1-L7). Una clave configurada como `VITE_*` queda accesible al cliente. **Si se configuró una clave real ahí, debe rotarse y considerarse expuesta.** Las solicitudes que contienen notas emocionales deben pasar por un backend o función confiable; también se debe decidir qué información se comparte con el proveedor y actualizar el consentimiento y la política de privacidad.

## 3. Funciones y recorridos de producto

### 3.1 Escala de ánimo inconsistente

El registro presenta una escala del 1 al 10: [frontend/src/pages/MoodFlowSimple.tsx](frontend/src/pages/MoodFlowSimple.tsx#L30-L45). Otros análisis mezclan referencias `/5` y `/10` y umbrales que parecen pertenecer a escalas distintas, como en [frontend/src/services/aiService.ts](frontend/src/services/aiService.ts#L190-L220) y [frontend/src/pages/Statistics.tsx](frontend/src/pages/Statistics.tsx#L275-L290).

Esto puede producir interpretaciones, estadísticas y recomendaciones incorrectas. Antes de mejorar reportes, se debe establecer una escala única, alinear etiquetas, validaciones y umbrales, y decidir cómo migrar o interpretar los registros anteriores.

### 3.2 Flujos que aparentan estar simulados o incompletos

- El formulario alternativo de cita muestra éxito, pero no implementa el guardado a Firestore: [frontend/src/components/CreateAppointmentModal.tsx](frontend/src/components/CreateAppointmentModal.tsx#L25-L57).
- El historial médico tiene lógica de guardado simulada: [frontend/src/pages/MedicalHistory.tsx](frontend/src/pages/MedicalHistory.tsx#L59-L87).
- Los reportes avanzados comienzan con lista vacía y guardan el reporte generado en estado local: [frontend/src/components/AdvancedReports.tsx](frontend/src/components/AdvancedReports.tsx#L90-L110) y [frontend/src/components/AdvancedReports.tsx](frontend/src/components/AdvancedReports.tsx#L160-L190).
- La burbuja flotante genera respuestas de ejemplo en el cliente: [frontend/src/components/FloatingChatBubble.tsx](frontend/src/components/FloatingChatBubble.tsx#L45-L90).
- El servicio `aiService.analyzeMood()` usa siempre análisis de fallback en el flujo revisado; la llamada real a OpenAI está comentada: [frontend/src/services/aiService.ts](frontend/src/services/aiService.ts#L39-L90).

Por eso, el README y la interfaz deben distinguir claramente entre funciones implementadas, prototipos y capacidades planeadas.

### 3.3 Alertas de crisis: no presentarlas como evaluación clínica

La lógica de crisis incluye heurísticas de palabras clave y valores de ánimo: [frontend/src/services/crisisDetection.ts](frontend/src/services/crisisDetection.ts#L25-L70). Tales heurísticas pueden producir falsos positivos o no detectar una situación. No deben presentarse como diagnóstico, evaluación fiable ni mecanismo de emergencia.

Además, `CrisisAlert` requiere propiedades obligatorias de evaluación y acciones: [frontend/src/components/CrisisAlert.tsx](frontend/src/components/CrisisAlert.tsx#L1-L15), pero se instancia vacío en [frontend/src/pages/MoodFlowSimple.tsx](frontend/src/pages/MoodFlowSimple.tsx#L205-L212). El build de Vite no detectó esa incompatibilidad de tipos. También se debe confirmar que la detección se invoque realmente y que haya un procedimiento humano de respuesta. Si la app ofrece apoyo para emergencias, debe mostrar recursos correctos para los países donde opere y no prometer monitoreo que no existe.

### 3.4 Política de privacidad y términos

Los documentos legales mencionan retención, borrado, seguridad y otras prácticas: [frontend/src/pages/TermsSimple.tsx](frontend/src/pages/TermsSimple.tsx#L140-L190) y [frontend/src/pages/PrivacySimple.tsx](frontend/src/pages/PrivacySimple.tsx#L75-L155). Esas afirmaciones deben coincidir con la operación real y revisarse con asesoría pertinente, especialmente por el tipo de datos, los proveedores externos de IA, el consentimiento y los derechos de eliminación.

## 4. Calidad, build y despliegue

### 4.1 Build exitoso, pero chequeo TypeScript fallido

Ejecuté `npm ci` y `npm run build` desde `frontend`. El build de Vite terminó correctamente y generó la PWA. También reportó chunks grandes y advertencias de imports dinámicos/estáticos mezclados.

Luego ejecuté `npx tsc --noEmit --pretty false`. **Falló** con errores de sintaxis en [frontend/src/utils/env.ts](frontend/src/utils/env.ts#L90-L99) y [frontend/src/utils/logger.ts](frontend/src/utils/logger.ts#L35-L42), cuyas implementaciones contienen expresiones incompletas. El build de Vite no sustituye un chequeo completo de TypeScript. No encontré scripts de test, lint o typecheck en [frontend/package.json](frontend/package.json#L1-L12), ni archivos de pruebas en el workspace.

**Recomendación:** arreglar esos errores y hacer que el CI ejecute typecheck obligatorio antes de aceptar cambios o desplegar.

### 4.2 Auditoría de dependencias

La instalación reportó **49 vulnerabilidades** en el conjunto auditado. Una auditoría de dependencias de producción reportó **22**: 12 moderadas, 7 altas y 3 críticas. `jspdf` aparece en el informe con avisos críticos y una actualización que podría ser un cambio mayor. Los totales dependen de las versiones y de la base de advisories vigente; no se recomienda aplicar actualizaciones forzadas sin probar el build y la exportación PDF.

### 4.3 Rendimiento del bundle

El build generó un chunk de Firebase de aproximadamente 637 KB y un chunk principal cercano a 971 KB antes de gzip. Vite advierte de chunks mayores a 500 KB. Recomiendo carga diferida por rutas, revisar las importaciones mixtas y mantener jsPDF/html2canvas fuera de la carga inicial cuando no se usan.

### 4.4 PWA y modo offline

La compilación genera service worker y precache. Eso no garantiza que diario, registros, chat o citas puedan funcionar sin conexión ni que la sincronización posterior sea segura. Para ofrecer modo offline completo hay que definir caché local, sincronización, conflictos y protección de datos en dispositivos compartidos.

## 5. Plan de trabajo priorizado

### Fase 0 — Seguridad antes de usar datos reales

1. Restringir Firestore por UID, participantes y relaciones verificadas; no dejar accesibles globalmente ánimos, diarios, chats o expedientes.
2. Retirar lectura pública y escritura general de Storage; revisar la exposición de CV y otros documentos.
3. Verificar reglas activas en la consola de Firebase y corregir la ruta de Storage en `firebase.json`.
4. Retirar claves de IA del cliente y rotar cualquier clave real que se haya configurado como `VITE_*`.
5. No cargar datos de personas reales hasta verificar las reglas con pruebas de autorización.

### Fase 1 — Base técnica fiable

1. Corregir los errores de sintaxis en `env.ts` y `logger.ts`.
2. Añadir scripts de typecheck, lint y pruebas; ejecutarlos en CI.
3. Crear pruebas de reglas para el dueño, otros usuarios, psicólogos aprobados y usuarios sin autenticación.
4. Usar Firebase Emulator Suite o un entorno de pruebas separado para validar cambios.

### Fase 2 — Cerrar un MVP

Recomiendo comenzar con este recorrido de usuario:

**Registro/inicio de sesión → completar perfil → registrar ánimo → consultar historial y estadísticas → exportar o eliminar datos.**

Luego decidir explícitamente si diario, citas, psicólogos y chats estarán en el MVP. Para cada función, documentar colecciones, campos, operaciones, quién accede y cómo se maneja un error. Unificar servicios y modelos de datos de chat/citas antes de seguir añadiendo pantallas.

### Fase 3 — IA y seguridad clínica

1. Mover llamadas a IA a un backend/función confiable y nunca exponer secretos en el bundle.
2. Definir qué datos se envían, pedir consentimiento claro y describir el proveedor y su uso en la política.
3. Etiquetar la IA como apoyo informativo, no como profesional, diagnóstico o detector fiable de crisis.
4. Si se anuncia atención urgente, definir recursos por país y un procedimiento real de respuesta.

### Fase 4 — Operación y lanzamiento

1. Actualizar dependencias de forma controlada y probar PDF, autenticación y PWA.
2. Configurar monitoreo sin guardar notas, conversaciones ni otra información sensible en logs.
3. Verificar variables, dominios autorizados, reglas y despliegues reales en Vercel/Firebase.
4. Alinear README, interfaz, términos y política con lo que sí funciona.
5. Definir copias de seguridad, eliminación de cuenta/datos y respuesta a incidentes.

## Conclusión

El proyecto tiene una base de producto extensa y un build capaz de producir la SPA/PWA, pero terminarlo no consiste principalmente en añadir más pantallas. La prioridad es **proteger los datos, unificar los modelos y cerrar los flujos que aún son simulados**. Después, hay que hacer pasar el chequeo TypeScript y automatizar pruebas.

**No recomiendo usar Mood Log App con diarios, conversaciones ni información de salud mental de personas reales hasta corregir y verificar las reglas de Firestore y Storage.**