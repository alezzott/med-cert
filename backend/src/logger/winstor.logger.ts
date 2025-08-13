/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

winston.addColors({
  error: 'bold red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey',
});

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context }) => {
      const nestPrefix = '[Nest]';
      const ctx = context ? `[${context}]` : '';
      return `${nestPrefix} ${timestamp}   ${level} ${ctx} ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export class WinstonLoggerService implements LoggerService {
  log(message: string, context?: string) {
    winstonLogger.info(message, { context });
  }
  error(message: string, trace?: string, context?: string) {
    winstonLogger.error(message, { trace, context });
  }
  warn(message: string, context?: string) {
    winstonLogger.warn(message, { context });
  }
  debug(message: string, context?: string) {
    winstonLogger.debug(message, { context });
  }
  verbose(message: string, context?: string) {
    winstonLogger.verbose(message, { context });
  }
}

export const LoggerProvider = {
  provide: 'Logger',
  useClass: WinstonLoggerService,
};
