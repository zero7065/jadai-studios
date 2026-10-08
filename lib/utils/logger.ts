/**
 * Safe structured logger that handles telemetry boundaries and audit trails.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    outputLog('info', message, context);
  },
  warn(message: string, context?: Record<string, any>) {
    outputLog('warn', message, context);
  },
  error(message: string, context?: Record<string, any>) {
    outputLog('error', message, context);
  },
  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      outputLog('debug', message, context);
    }
  },
};

function outputLog(level: LogLevel, message: string, context?: Record<string, any>) {
  const payload: LogPayload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  const line = `[JADAI-${level.toUpperCase()}] ${payload.timestamp} - ${message}`;
  if (level === 'error') {
    console.error(line, context || '');
  } else if (level === 'warn') {
    console.warn(line, context || '');
  } else {
    console.log(line, context || '');
  }
}
