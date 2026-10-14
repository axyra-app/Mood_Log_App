# Plan de validación: contexto biométrico

**Estado:** plan propuesto; no hay implementación que validar todavía.

## 1. Objetivos de calidad

La validación debe demostrar que la persona mantiene control, que los datos conservan significado y procedencia, que no hay acceso cruzado entre cuentas, y que la vista explica límites y ausencias con honestidad. Un prototipo de interfaz o build exitoso no basta para demostrar privacidad, precisión o utilidad.

## 2. Entornos y datos

- **Diseño/UX:** datos sintéticos claramente marcados.
- **Pruebas automatizadas:** fixtures sintéticos, distintos formatos, zonas horarias, permisos y faltantes.
- **Prueba técnica de plataforma:** dispositivos de prueba y cuentas dedicadas; datos personales reales solo tras aprobación, consentimiento y controles.
- **Producción:** no habilitar hasta cumplir todos los gates de este documento.

Nunca usar exportaciones de usuarios reales como fixtures de pruebas.

## 3. Capas de prueba

### 3.1 Requisitos y comprensión

- Usabilidad del consentimiento, permisos parciales, revocación y borrado.
- Prueba de comprensión: una persona puede explicar qué se lee, dónde se guarda y qué significa/desconecta.
- Confirmar que el lenguaje no sugiere diagnóstico, causalidad o monitoreo.

### 3.2 Contrato y normalización

- Unidades compatibles, precisión decimal y límites.
- Procedencia/calidad por observación cuando un día incluya valores de distintas fuentes.
- Muestras con timestamp local/UTC, cambios de zona horaria y horario de verano.
- HRV SDNN y RMSSD claramente separadas.
- Fuente, dispositivo y procedencia desconocidos o incompletos.
- Registros duplicados, tardíos, corregidos o borrados en origen.
- Datos vacíos distintos de permisos denegados o error.

### 3.3 Integración de plataforma

Por cada sistema/dispositivo de la matriz de soporte:

- permiso completo, parcial, denegado y revocado desde Ajustes;
- usuario sin dispositivo o sin muestras;
- lectura inicial, lectura incremental, reintento y cancelación;
- actualización del SO, reinstalación y cambio de cuenta;
- limitaciones conocidas de tipos, rango temporal y granularidad.

No marcar una plataforma “compatible” hasta probarla en dispositivos representativos y versiones acordadas.

### 3.4 Importación de archivos

- Archivo sintético válido, vacío, truncado, malformado y de tamaño superior al límite.
- Cancelación durante selección/parseo y recuperación del estado de interfaz.
- Confirmar que la importación no transmite archivo ni muestras a red, logs, analítica o reportes.
- Verificar extracción mínima, eliminación de temporales y cambio de cuenta.
- Confirmar que versiones/formats desconocidos fallan de forma visible y segura.

### 3.5 Seguridad y privacidad

- Intentar leer, modificar y borrar muestras con otro UID y sin sesión.
- Intentar crear valores con campos adicionales, valores inválidos y volúmenes excesivos.
- Confirmar que tokens/identificadores no aparecen en Firestore/logs/analytics.
- Inspeccionar solicitudes de red y bundle para detectar secretos o contenido de diario.
- Desconectar, borrar, repetir la sincronización y verificar que no reaparecen datos eliminados.
- Evaluar caché/almacenamiento local tras logout y cambio de cuenta.

### 3.6 UX, accesibilidad y rendimiento

- Navegación por teclado y lector de pantalla.
- Contraste, tamaño de texto, foco y mensajes de error.
- Gráficos con alternativa textual/tabular.
- Consumo de batería, memoria y datos de red durante importación.
- Períodos con volumen alto y ausencia de datos.

## 4. Casos de prueba con identificadores

| ID | Escenario | Resultado esperado |
|---|---|---|
| BIO-T-001 | Persona cancela antes de permiso nativo | No se inicia lectura; resto de la app sigue disponible. |
| BIO-T-002 | Autoriza solo una categoría | Se importa solo esa categoría; interfaz explica permiso parcial. |
| BIO-T-003 | No hay muestras en período | Mensaje “sin datos disponibles”, no valor cero ni error genérico. |
| BIO-T-004 | HRV con métrica/unidad no reconocida | Se rechaza o presenta como no compatible; nunca se mezcla con otra métrica. |
| BIO-T-005 | Dos registros idénticos al repetir importación | No aparecen duplicados visibles conforme a la estrategia de idempotencia aprobada. |
| BIO-T-006 | Cambio de zona horaria | Hora local y orden temporal siguen siendo correctos, preservando timestamp fuente. |
| BIO-T-007 | Permiso revocado desde Ajustes del SO | No se realizan lecturas futuras; estado aparece como desconectado/revocado. |
| BIO-T-008 | Usuario B intenta acceder a datos de A | Acceso denegado en todas las operaciones aplicables. |
| BIO-T-009 | Cuenta cerrada/cambiada en dispositivo | No se muestran datos de la cuenta anterior al nuevo usuario. |
| BIO-T-010 | Solicitud de borrado falla parcialmente | Estado muestra fallo/alcance pendiente; no afirma éxito completo. |
| BIO-T-011 | Línea de tiempo con entradas y muestras cercanas | Fuentes se distinguen; no hay etiqueta de emoción inferida ni afirmación causal. |
| BIO-T-012 | Contenido de diario con texto sensible | No se envía a proveedor externo ni aparece en logs en el MVP. |
| BIO-T-013 | Fuente no soportada o API falla | Mensaje explicativo; el registro manual sigue disponible. |
| BIO-T-014 | Conjunto con grandes intervalos sin datos | Gráfico mantiene huecos y muestra cobertura; no inventa valores. |
| BIO-T-015 | Importación de archivo malformado o sobre el límite | Se rechaza de forma segura, se informa del error y no queda archivo temporal o importación parcial no declarada. |
| BIO-T-016 | Cancelar importación durante parseo | Se detiene el proceso y se limpian temporales; no se presenta una importación como completa. |
| BIO-T-017 | Revisar tráfico y telemetría durante importación local | No se transmite contenido del archivo ni muestras ni se incluyen en logs/analytics. |
| BIO-T-018 | Un registro combina ánimo manual y medida importada | Cada valor conserva su procedencia y calidad; ninguna fuente se atribuye al conjunto completo. |
| BIO-T-019 | Dataset de correlación con n=10, datos atípicos o patrón temporal | No se muestra correlación como válida solo por superar el umbral; se aplica el método aprobado o se informa que aún no está habilitada. |

## 5. Criterios de salida por etapa

### Prototipo con datos sintéticos

- Requisitos y flujos aprobados por producto.
- Navegación y textos comprensibles en pruebas de usabilidad.
- Diferenciación visual de fuentes y estados vacíos/error.

### Prueba técnica privada

- Matriz de compatibilidad ejecutada en dispositivos acordados.
- Lectura y permisos validados; sin secretos en bundle ni tokens en logs.
- Datos sintéticos o pruebas autorizadas, no tráfico a entorno de producción.
- Estrategia de almacenamiento, revocación y borrado seleccionada y revisada.

### Piloto limitado

- Revisión de seguridad/privacy completada y riesgos aceptados por responsables.
- Reglas negativas y flujo de borrado pasan.
- Consentimiento y política reflejan exactamente procesamiento/retención.
- No hay inferencias clínicas ni procesamiento semántico de diario por defecto.
- Soporte, incident response, límites del piloto y rollback definidos.

### Lanzamiento general

- Evidencia reproducible, monitorización sin contenido sensible y documentación pública revisada.
- Métricas de fiabilidad y soporte acordadas.
- Proceso operativo de revocación, exportación, acceso y eliminación probado.
- Cualquier cambio de proveedor/plataforma reabre evaluación de privacidad y compatibilidad.

## 6. Rollout y reversión

El rollout futuro debería ser progresivo: feature flag interna → pruebas con datos sintéticos → piloto opt-in limitado → evaluación → decisión de ampliar. La función debe poder deshabilitar nuevas importaciones sin afectar registros de ánimo/diario.

Plan de reversión:

1. Deshabilitar la integración/entrada nueva.
2. Detener trabajos de sincronización en curso.
3. Comunicar estado y pasos a participantes según el plan aprobado.
4. Conservar solo lo que la política requiere y eliminar lo demás mediante el proceso probado.
5. Investigar incidente sin copiar contenido de salud a logs.

## 7. Métricas operativas

Registrar, en forma agregada y sin muestras/diarios/IDs persistentes:

- éxito/fallo de conexión por plataforma;
- tasa de importación parcial;
- duplicados detectados;
- fallos de borrado y reintentos;
- errores del puente y tiempos de operación;
- disponibilidad del flujo y errores de interfaz.

No recopilar valores fisiológicos como telemetría de producto por defecto.
