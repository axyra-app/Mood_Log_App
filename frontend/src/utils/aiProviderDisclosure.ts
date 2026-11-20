/**
 * Draft per-request disclosure based on Groq's public data controls documentation.
 * Keep aligned with AI_CONSENT_VERSION and re-check before production releases.
 */
export const GROQ_RETENTION_DISCLOSURE =
  'Groq indica que por defecto no retiene entradas y respuestas de inferencia, pero puede registrar temporalmente datos de entrada/salida hasta 30 días para confiabilidad o abuso. Mood Log no ha verificado si Zero Data Retention está activo; los datos retenidos se alojan en Estados Unidos y su DPA contempla procesamiento en países donde operan sus subprocesadores.';
