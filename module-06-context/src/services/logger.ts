import { Logger } from '../types/index.js';

// Create a logger instance with request context
export const createLogger = (requestId: string): Logger => {
  const formatMessage = (
    level: string,
    message: string,
    meta?: Record<string, unknown>
  ): string => {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${requestId}] ${message}${metaStr}`;
  };

  return {
    info: (message: string, meta?: Record<string, unknown>) => {
      console.log(formatMessage('INFO', message, meta));
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      console.error(formatMessage('ERROR', message, meta));
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      console.warn(formatMessage('WARN', message, meta));
    },
  };
};
