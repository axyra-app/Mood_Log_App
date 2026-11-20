/**
 * Logger utility for Mood Log App
 * Provides content-free client logging with different levels
 */
import { logSanitizedClientError } from './safeClientLog';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = import.meta.env.DEV;

  constructor() {
    // In production, only show WARN and ERROR
    if (!this.isDevelopment) {
      this.currentLevel = LogLevel.WARN;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    const safeMessage = /^[A-Za-z0-9 _./:-]{1,120}$/.test(message) ? message : 'Log event';
    return `${prefix} ${safeMessage}`;
  }

  debug(message: string, _data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message));
    }
  }

  info(message: string, _data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message));
    }
  }

  warn(message: string, _data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      logSanitizedClientError(this.formatMessage('ERROR', message), error);
    }
  }

  // Set log level dynamically
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = (message: string, data?: any) => logger.debug(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logError = (message: string, error?: Error | any) => logger.error(message, error);
