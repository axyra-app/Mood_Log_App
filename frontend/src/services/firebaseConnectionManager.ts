import { db } from './firebase';

/**
 * Gestor de conexiones Firebase para evitar errores 400 y problemas de conexión
 */
class FirebaseConnectionManager {
  private activeListeners: Map<string, () => void> = new Map();
  private connectionRetryCount: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 segundo

  /**
   * Registra un listener activo
   */
  registerListener(key: string, unsubscribe: () => void): void {
    // Si ya existe un listener con esta clave, lo desconectamos primero
    if (this.activeListeners.has(key)) {
      this.activeListeners.get(key)?.();
    }
    
    this.activeListeners.set(key, unsubscribe);
    this.connectionRetryCount.set(key, 0);
  }

  /**
   * Desregistra un listener
   */
  unregisterListener(key: string): void {
    const unsubscribe = this.activeListeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(key);
      this.connectionRetryCount.delete(key);
    }
  }

  /**
   * Desconecta todos los listeners activos
   */
  disconnectAll(): void {
    this.activeListeners.forEach((unsubscribe, key) => {
      unsubscribe();
    });
    this.activeListeners.clear();
    this.connectionRetryCount.clear();
  }

  /**
   * Maneja errores de conexión con retry automático
   */
  handleConnectionError(key: string, error: any, retryCallback: () => void): void {
    const retryCount = this.connectionRetryCount.get(key) || 0;
    
    console.error(`❌ Error de conexión en ${key} (intento ${retryCount + 1}/${this.MAX_RETRIES}):`, error);
    
    if (retryCount < this.MAX_RETRIES) {
      this.connectionRetryCount.set(key, retryCount + 1);
      
      // Esperar antes del siguiente intento
      setTimeout(() => {
        retryCallback();
      }, this.RETRY_DELAY * (retryCount + 1));
    } else {
      console.error(`❌ Máximo de reintentos alcanzado para ${key}`);
      this.unregisterListener(key);
    }
  }

  /**
   * Obtiene estadísticas de conexiones activas
   */
  getConnectionStats(): { activeListeners: number; retryCounts: Record<string, number> } {
    const retryCounts: Record<string, number> = {};
    this.connectionRetryCount.forEach((count, key) => {
      retryCounts[key] = count;
    });

    return {
      activeListeners: this.activeListeners.size,
      retryCounts
    };
  }

  /**
   * Limpia listeners inactivos
   */
  cleanup(): void {
    const stats = this.getConnectionStats();
    if (stats.activeListeners > 10) {
      console.warn(`⚠️ Muchos listeners activos (${stats.activeListeners}). Considera optimizar las conexiones.`);
    }
  }
}

export const firebaseConnectionManager = new FirebaseConnectionManager();

// Limpiar conexiones al cerrar la página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    firebaseConnectionManager.disconnectAll();
  });
}

export default firebaseConnectionManager;
