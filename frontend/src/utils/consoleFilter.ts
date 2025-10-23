/**
 * Filtro de consola para ocultar logs de extensiones del navegador
 * Este archivo se puede importar en el main.tsx para aplicar el filtro
 */

// Función para filtrar logs de extensiones
export const filterExtensionLogs = () => {
  if (typeof window === 'undefined') return;

  // Guardar la función original de console
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  // Función para verificar si un log es de extensiones o errores conocidos
  const isExtensionLog = (message: any) => {
    const messageStr = String(message);
    return (
      messageStr.includes('content-all.js') ||
      messageStr.includes('all-frames.js') ||
      messageStr.includes('Could not establish connection') ||
      messageStr.includes('Cannot determine language') ||
      messageStr.includes('Cross-Origin-Opener-Policy') ||
      messageStr.includes('TypeError: u.toDateString is not a function') ||
      messageStr.includes('ErrorBoundary caught an error: TypeError: u.toDateString is not a function') ||
      messageStr.includes('chrome-extension://') ||
      messageStr.includes('firebase-') ||
      messageStr.includes('Statistics data:') ||
      messageStr.includes('Mood logs:') ||
      messageStr.includes('No mood logs found') ||
      messageStr.includes('Period dates:') ||
      messageStr.includes('Log date:') ||
      messageStr.includes('Logs in period:') ||
      messageStr.includes('Analizando datos de estado de ánimo:') ||
      messageStr.includes('Enviando prompt a Groq:') ||
      messageStr.includes('Respuesta de Groq:') ||
      messageStr.includes('Análisis parseado exitosamente:') ||
      messageStr.includes('Error parseando JSON:') ||
      messageStr.includes('Listener desconectado:') ||
      messageStr.includes('✅ Listener desconectado:')
    );
  };

  // Función wrapper que filtra los logs
  const createFilteredConsole = (originalMethod: Function) => {
    return (...args: any[]) => {
      // Si el mensaje es de extensiones, no lo mostrar
      if (args.some(arg => isExtensionLog(arg))) {
        return;
      }
      // De lo contrario, mostrar el log normalmente
      originalMethod.apply(console, args);
    };
  };

  // Aplicar el filtro a todos los métodos de console
  console.log = createFilteredConsole(originalConsole.log);
  console.warn = createFilteredConsole(originalConsole.warn);
  console.error = createFilteredConsole(originalConsole.error);
  console.info = createFilteredConsole(originalConsole.info);

  // Solo mostrar el mensaje de confirmación una vez
  if (!window.consoleFilterApplied) {
    console.log('🔧 Filtro de consola aplicado - logs de extensiones ocultos');
    window.consoleFilterApplied = true;
  }
};

// Aplicar el filtro automáticamente
if (typeof window !== 'undefined') {
  filterExtensionLogs();
}
