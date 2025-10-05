# 📋 HISTORIAS DE USUARIO - MOOD LOG APP

## 📝 HISTORIA DE USUARIO 1: Registro de Usuario

| Campo                  | Valor                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Registro de nuevo usuario                                                                                                                                      |
| **ID HISTORIA**        | HU01                                                                                                                                                           |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                                     |
| **PROYECTO**           | Mood Log App                                                                                                                                                   |
| **DESCRIPCIÓN**        | Yo **como** usuario nuevo **requiero** un formulario de registro **para** crear una cuenta y acceder a las funcionalidades de seguimiento del estado de ánimo. |
| **RIESGO**             | Medio                                                                                                                                                          |
| **TIPO**               | Nueva                                                                                                                                                          |
| **ESTADO**             | Registrada                                                                                                                                                     |
| **PRIORIDAD**          | 1                                                                                                                                                              |
| **PUNTOS**             | 8                                                                                                                                                              |
| **MODULO**             | Autenticación                                                                                                                                                  |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                                     | RESULTADO ESPERADO                                                                                                                                         |
| ---------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1          | Acceder a la pantalla de registro          | El sistema presenta los campos: nombre completo, email, contraseña, confirmación de contraseña, tipo de usuario (Usuario/Psicólogo) y botón "Crear cuenta" |
| 2          | Ingresar datos incompletos                 | El sistema valida que todos los campos estén completos y muestra mensaje "Todos los campos son obligatorios"                                               |
| 3          | Ingresar email inválido                    | El sistema valida el formato del email y muestra mensaje "Formato de email inválido"                                                                       |
| 4          | Ingresar contraseña menor a 6 caracteres   | El sistema valida la longitud de la contraseña y muestra mensaje "La contraseña debe tener al menos 6 caracteres"                                          |
| 5          | Las contraseñas no coinciden               | El sistema valida que las contraseñas coincidan y muestra mensaje "Las contraseñas no coinciden"                                                           |
| 6          | Presionar "Crear cuenta" con datos válidos | El sistema crea la cuenta exitosamente y redirige al dashboard correspondiente según el tipo de usuario                                                    |

---

## 📝 HISTORIA DE USUARIO 2: Inicio de Sesión

| Campo                  | Valor                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Iniciar sesión                                                                                                                                                         |
| **ID HISTORIA**        | HU02                                                                                                                                                                   |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                                             |
| **PROYECTO**           | Mood Log App                                                                                                                                                           |
| **DESCRIPCIÓN**        | Yo **como** usuario registrado **requiero** un formulario de inicio de sesión **para** acceder a mi cuenta y usar las herramientas de seguimiento del estado de ánimo. |
| **RIESGO**             | Alto                                                                                                                                                                   |
| **TIPO**               | Nueva                                                                                                                                                                  |
| **ESTADO**             | Registrada                                                                                                                                                             |
| **PRIORIDAD**          | 1                                                                                                                                                                      |
| **PUNTOS**             | 5                                                                                                                                                                      |
| **MODULO**             | Autenticación                                                                                                                                                          |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                                                               | RESULTADO ESPERADO                                                                                          |
| ---------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1          | Acceder a la pantalla de inicio de sesión                            | El sistema presenta los campos de email, contraseña y el botón "Iniciar sesión"                             |
| 2          | Ingresar campos vacíos                                               | El sistema valida si algún campo está vacío y muestra el mensaje "Email y contraseña son obligatorios"      |
| 3          | Presionar "Iniciar sesión" con credenciales correctas                | El sistema valida las credenciales y permite el acceso al dashboard correspondiente                         |
| 4          | Presionar "Iniciar sesión" con credenciales incorrectas              | El sistema valida las credenciales y muestra el mensaje "Email o contraseña incorrectos"                    |
| 5          | Intentar iniciar sesión múltiples veces con credenciales incorrectas | El sistema permite máximo 3 intentos fallidos, al tercero muestra mensaje "Usuario bloqueado temporalmente" |

---

## 📝 HISTORIA DE USUARIO 3: Registro de Estado de Ánimo

| Campo                  | Valor                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NOMBRE**             | Registrar estado de ánimo                                                                                                                                    |
| **ID HISTORIA**        | HU03                                                                                                                                                         |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                                   |
| **PROYECTO**           | Mood Log App                                                                                                                                                 |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** registrar mi estado de ánimo diario **para** hacer seguimiento de mi bienestar emocional y recibir análisis personalizados. |
| **RIESGO**             | Medio                                                                                                                                                        |
| **TIPO**               | Nueva                                                                                                                                                        |
| **ESTADO**             | Registrada                                                                                                                                                   |
| **PRIORIDAD**          | 1                                                                                                                                                            |
| **PUNTOS**             | 13                                                                                                                                                           |
| **MODULO**             | Registro de Estado de Ánimo                                                                                                                                  |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                                          | RESULTADO ESPERADO                                                                                                      |
| ---------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1          | Acceder al flujo de registro de estado de ánimo | El sistema presenta la pantalla de selección de estado de ánimo con 5 opciones (Muy mal, Mal, Regular, Bien, Excelente) |
| 2          | Seleccionar un estado de ánimo                  | El sistema avanza al paso 2 mostrando un campo de texto para describir sentimientos                                     |
| 3          | Describir sentimientos y continuar              | El sistema avanza al paso 3 mostrando opciones de actividades, emociones y escalas de energía, estrés y sueño           |
| 4          | Seleccionar actividades realizadas              | El sistema permite seleccionar múltiples actividades de una lista predefinida                                           |
| 5          | Seleccionar emociones experimentadas            | El sistema permite seleccionar múltiples emociones de una lista predefinida                                             |
| 6          | Ajustar escalas de energía, estrés y sueño      | El sistema permite ajustar valores del 1 al 10 usando controles deslizantes                                             |
| 7          | Continuar al análisis final                     | El sistema muestra un resumen de todos los datos ingresados                                                             |
| 8          | Guardar el registro                             | El sistema guarda el registro y muestra el análisis generado por IA                                                     |

---

## 📝 HISTORIA DE USUARIO 4: Análisis con Inteligencia Artificial

| Campo                  | Valor                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NOMBRE**             | Análisis de estado de ánimo con IA                                                                                                                                 |
| **ID HISTORIA**        | HU04                                                                                                                                                               |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                                         |
| **PROYECTO**           | Mood Log App                                                                                                                                                       |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** recibir análisis personalizados de mi estado de ánimo **para** entender mejor mis patrones emocionales y recibir recomendaciones. |
| **RIESGO**             | Alto                                                                                                                                                               |
| **TIPO**               | Nueva                                                                                                                                                              |
| **ESTADO**             | Registrada                                                                                                                                                         |
| **PRIORIDAD**          | 2                                                                                                                                                                  |
| **PUNTOS**             | 8                                                                                                                                                                  |
| **MODULO**             | Análisis con IA                                                                                                                                                    |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                                | RESULTADO ESPERADO                                                                              |
| ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1          | Completar registro de estado de ánimo | El sistema procesa los datos y genera un análisis automático                                    |
| 2          | Recibir análisis de IA                | El sistema presenta insights sobre el estado de ánimo, patrones identificados y recomendaciones |
| 3          | Ver recomendaciones personalizadas    | El sistema sugiere actividades específicas basadas en el estado de ánimo registrado             |
| 4          | Acceder a análisis histórico          | El sistema permite ver análisis anteriores y comparar tendencias                                |
| 5          | Exportar análisis                     | El sistema permite exportar el análisis en formato PDF o imagen                                 |

---

## 📝 HISTORIA DE USUARIO 5: Dashboard Personal

| Campo                  | Valor                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NOMBRE**             | Dashboard personal del usuario                                                                                                                         |
| **ID HISTORIA**        | HU05                                                                                                                                                   |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                             |
| **PROYECTO**           | Mood Log App                                                                                                                                           |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** un dashboard personal **para** ver mi progreso, estadísticas y acceder rápidamente a las funcionalidades principales. |
| **RIESGO**             | Medio                                                                                                                                                  |
| **TIPO**               | Nueva                                                                                                                                                  |
| **ESTADO**             | Registrada                                                                                                                                             |
| **PRIORIDAD**          | 2                                                                                                                                                      |
| **PUNTOS**             | 10                                                                                                                                                     |
| **MODULO**             | Dashboard                                                                                                                                              |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                                        | RESULTADO ESPERADO                                                                        |
| ---------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1          | Acceder al dashboard después del login        | El sistema muestra saludo personalizado, estadísticas del día y acceso rápido a funciones |
| 2          | Ver estadísticas de estado de ánimo           | El sistema presenta gráficos de tendencias de los últimos 7 días                          |
| 3          | Acceder al registro rápido de estado de ánimo | El sistema proporciona botón de acceso directo al flujo de registro                       |
| 4          | Ver actividad reciente                        | El sistema muestra los últimos registros de estado de ánimo                               |
| 5          | Acceder al chat con psicólogo                 | El sistema proporciona acceso directo al chat si hay psicólogo asignado                   |
| 6          | Ver logros y medallas                         | El sistema muestra progreso y logros desbloqueados                                        |

---

## 📝 HISTORIA DE USUARIO 6: Chat con Psicólogo

| Campo                  | Valor                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Comunicación con psicólogo                                                                                                                           |
| **ID HISTORIA**        | HU06                                                                                                                                                 |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                           |
| **PROYECTO**           | Mood Log App                                                                                                                                         |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** comunicarme directamente con mi psicólogo asignado **para** recibir apoyo profesional y seguimiento de mi progreso. |
| **RIESGO**             | Alto                                                                                                                                                 |
| **TIPO**               | Nueva                                                                                                                                                |
| **ESTADO**             | Registrada                                                                                                                                           |
| **PRIORIDAD**          | 2                                                                                                                                                    |
| **PUNTOS**             | 12                                                                                                                                                   |
| **MODULO**             | Chat                                                                                                                                                 |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                             | RESULTADO ESPERADO                                              |
| ---------- | ---------------------------------- | --------------------------------------------------------------- |
| 1          | Acceder al chat desde el dashboard | El sistema abre la interfaz de chat con el psicólogo asignado   |
| 2          | Enviar mensaje de texto            | El sistema permite escribir y enviar mensajes de texto          |
| 3          | Recibir mensajes del psicólogo     | El sistema muestra mensajes recibidos en tiempo real            |
| 4          | Ver historial de conversación      | El sistema mantiene y muestra el historial completo de mensajes |
| 5          | Enviar archivos adjuntos           | El sistema permite adjuntar imágenes o documentos               |
| 6          | Recibir notificaciones de mensajes | El sistema notifica cuando llegan mensajes nuevos               |

---

## 📝 HISTORIA DE USUARIO 7: Dashboard de Psicólogo

| Campo                  | Valor                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Dashboard profesional para psicólogos                                                                                                                      |
| **ID HISTORIA**        | HU07                                                                                                                                                       |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                                 |
| **PROYECTO**           | Mood Log App                                                                                                                                               |
| **DESCRIPCIÓN**        | Yo **como** psicólogo **requiero** un dashboard profesional **para** gestionar mis pacientes, monitorear su progreso y acceder a herramientas de análisis. |
| **RIESGO**             | Medio                                                                                                                                                      |
| **TIPO**               | Nueva                                                                                                                                                      |
| **ESTADO**             | Registrada                                                                                                                                                 |
| **PRIORIDAD**          | 2                                                                                                                                                          |
| **PUNTOS**             | 15                                                                                                                                                         |
| **MODULO**             | Dashboard Psicólogo                                                                                                                                        |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                            | RESULTADO ESPERADO                                                                |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------- |
| 1          | Acceder al dashboard de psicólogo | El sistema muestra métricas del día, alertas urgentes y lista de pacientes        |
| 2          | Ver métricas del día              | El sistema presenta: pacientes activos, sesiones programadas, mensajes pendientes |
| 3          | Revisar alertas urgentes          | El sistema muestra pacientes que requieren atención inmediata                     |
| 4          | Ver lista de pacientes            | El sistema presenta todos los pacientes asignados con su estado actual            |
| 5          | Acceder al perfil de paciente     | El sistema permite ver detalles completos del progreso de cada paciente           |
| 6          | Programar citas                   | El sistema permite crear y gestionar citas con pacientes                          |
| 7          | Acceder al chat con pacientes     | El sistema proporciona acceso directo al chat con cada paciente                   |

---

## 📝 HISTORIA DE USUARIO 8: Sistema de Alertas de Crisis

| Campo                  | Valor                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Detección y alertas de crisis                                                                                                                                   |
| **ID HISTORIA**        | HU08                                                                                                                                                            |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                                      |
| **PROYECTO**           | Mood Log App                                                                                                                                                    |
| **DESCRIPCIÓN**        | Yo **como** sistema **requiero** detectar automáticamente situaciones de crisis **para** alertar a psicólogos y proporcionar recursos de emergencia a usuarios. |
| **RIESGO**             | Alto                                                                                                                                                            |
| **TIPO**               | Nueva                                                                                                                                                           |
| **ESTADO**             | Registrada                                                                                                                                                      |
| **PRIORIDAD**          | 1                                                                                                                                                               |
| **PUNTOS**             | 10                                                                                                                                                              |
| **MODULO**             | Crisis Detection                                                                                                                                                |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                                    | RESULTADO ESPERADO                                                             |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| 1          | Detectar patrones de crisis en registros  | El sistema analiza automáticamente los registros de estado de ánimo            |
| 2          | Generar alerta para psicólogo             | El sistema notifica inmediatamente al psicólogo asignado                       |
| 3          | Mostrar recursos de emergencia al usuario | El sistema presenta números de emergencia y recursos de apoyo                  |
| 4          | Crear registro de crisis                  | El sistema documenta la situación para seguimiento                             |
| 5          | Escalar alerta si no hay respuesta        | El sistema aumenta la prioridad de la alerta si no hay respuesta del psicólogo |

---

## 📝 HISTORIA DE USUARIO 9: Gestión de Perfil de Usuario

| Campo                  | Valor                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Gestión de perfil personal                                                                                                                |
| **ID HISTORIA**        | HU09                                                                                                                                      |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                |
| **PROYECTO**           | Mood Log App                                                                                                                              |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** gestionar mi perfil personal **para** mantener actualizada mi información y configurar mis preferencias. |
| **RIESGO**             | Bajo                                                                                                                                      |
| **TIPO**               | Nueva                                                                                                                                     |
| **ESTADO**             | Registrada                                                                                                                                |
| **PRIORIDAD**          | 3                                                                                                                                         |
| **PUNTOS**             | 5                                                                                                                                         |
| **MODULO**             | Perfil de Usuario                                                                                                                         |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                            | RESULTADO ESPERADO                                                        |
| ---------- | --------------------------------- | ------------------------------------------------------------------------- |
| 1          | Acceder a configuración de perfil | El sistema presenta formulario con información personal actual            |
| 2          | Modificar información personal    | El sistema permite actualizar nombre, email y otros datos                 |
| 3          | Cambiar contraseña                | El sistema permite cambiar contraseña con validación de seguridad         |
| 4          | Configurar preferencias           | El sistema permite ajustar configuraciones de notificaciones y privacidad |
| 5          | Guardar cambios                   | El sistema valida y guarda los cambios realizados                         |

---

## 📝 HISTORIA DE USUARIO 10: Modo Oscuro/Claro

| Campo                  | Valor                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Alternar modo oscuro/claro                                                                                                              |
| **ID HISTORIA**        | HU10                                                                                                                                    |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                              |
| **PROYECTO**           | Mood Log App                                                                                                                            |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** alternar entre modo oscuro y claro **para** personalizar la experiencia visual según mis preferencias. |
| **RIESGO**             | Bajo                                                                                                                                    |
| **TIPO**               | Nueva                                                                                                                                   |
| **ESTADO**             | Registrada                                                                                                                              |
| **PRIORIDAD**          | 3                                                                                                                                       |
| **PUNTOS**             | 3                                                                                                                                       |
| **MODULO**             | Interfaz de Usuario                                                                                                                     |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                               | RESULTADO ESPERADO                                                 |
| ---------- | ------------------------------------ | ------------------------------------------------------------------ |
| 1          | Presionar botón de modo oscuro/claro | El sistema alterna entre los temas visuales                        |
| 2          | Verificar cambio de tema             | El sistema aplica el nuevo tema a toda la interfaz                 |
| 3          | Persistir preferencia                | El sistema recuerda la preferencia del usuario en futuras sesiones |

---

## 📝 HISTORIA DE USUARIO 11: Cerrar Sesión

| Campo                  | Valor                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Cerrar sesión                                                                                                                                     |
| **ID HISTORIA**        | HU11                                                                                                                                              |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                        |
| **PROYECTO**           | Mood Log App                                                                                                                                      |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** cerrar mi sesión de forma segura **para** proteger mi información personal cuando termine de usar la aplicación. |
| **RIESGO**             | Bajo                                                                                                                                              |
| **TIPO**               | Nueva                                                                                                                                             |
| **ESTADO**             | Registrada                                                                                                                                        |
| **PRIORIDAD**          | 2                                                                                                                                                 |
| **PUNTOS**             | 2                                                                                                                                                 |
| **MODULO**             | Autenticación                                                                                                                                     |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                           | RESULTADO ESPERADO                                            |
| ---------- | -------------------------------- | ------------------------------------------------------------- |
| 1          | Presionar botón de cerrar sesión | El sistema muestra modal de confirmación                      |
| 2          | Confirmar cierre de sesión       | El sistema cierra la sesión y redirige a la pantalla de login |
| 3          | Cancelar cierre de sesión        | El sistema cierra el modal y mantiene la sesión activa        |

---

## 📝 HISTORIA DE USUARIO 12: Estadísticas y Reportes

| Campo                  | Valor                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NOMBRE**             | Visualización de estadísticas                                                                                                                       |
| **ID HISTORIA**        | HU12                                                                                                                                                |
| **FECHA (dd/mm/aaaa)** | 24/03/2025                                                                                                                                          |
| **PROYECTO**           | Mood Log App                                                                                                                                        |
| **DESCRIPCIÓN**        | Yo **como** usuario **requiero** ver estadísticas detalladas de mi progreso **para** entender mejor mis patrones emocionales y celebrar mis logros. |
| **RIESGO**             | Medio                                                                                                                                               |
| **TIPO**               | Nueva                                                                                                                                               |
| **ESTADO**             | Registrada                                                                                                                                          |
| **PRIORIDAD**          | 3                                                                                                                                                   |
| **PUNTOS**             | 8                                                                                                                                                   |
| **MODULO**             | Estadísticas                                                                                                                                        |

### CRITERIOS DE ACEPTACIÓN

| # CRITERIO | ACCIÓN                               | RESULTADO ESPERADO                                           |
| ---------- | ------------------------------------ | ------------------------------------------------------------ |
| 1          | Acceder a la sección de estadísticas | El sistema presenta gráficos y métricas del progreso         |
| 2          | Ver tendencias de estado de ánimo    | El sistema muestra gráficos de líneas con evolución temporal |
| 3          | Ver distribución de emociones        | El sistema presenta gráficos de barras o pie charts          |
| 4          | Filtrar por período                  | El sistema permite seleccionar rangos de fechas específicos  |
| 5          | Exportar reportes                    | El sistema permite descargar reportes en PDF                 |
