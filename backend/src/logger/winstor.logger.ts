import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const WinstonLoggerModule = WinstonModule.forRoot({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
      ),
    }),
  ],
});

export const LoggerProvider = {
  provide: 'Logger',
  useValue: WinstonLoggerModule,
};
