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

  // Función para verificar si un log es de extensiones
  const isExtensionLog = (message: any) => {
    const messageStr = String(message);
    return (
      messageStr.includes('content-all.js') ||
      messageStr.includes('all-frames.js') ||
      messageStr.includes('Could not establish connection') ||
      messageStr.includes('Cannot determine language') ||
      messageStr.includes('Cross-Origin-Opener-Policy')
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

  console.log('🔧 Filtro de consola aplicado - logs de extensiones ocultos');
};

// Aplicar el filtro automáticamente
if (typeof window !== 'undefined') {
  filterExtensionLogs();
}
