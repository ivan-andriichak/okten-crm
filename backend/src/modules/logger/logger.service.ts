import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

import { Config, SentryConfig } from '../../config/config.type';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger();

  constructor(private readonly configService: ConfigService<Config>) {
    const sentryConfig = this.configService.get<SentryConfig>('sentry');

    if (sentryConfig?.dsn) {
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.env,
        debug: sentryConfig.debug === true,
      });
    }
  }

  public log(message: string): void {
    this.logger.log(message);
    Sentry.captureMessage(message, 'log');
  }

  public info(message: string): void {
    this.logger.log(message);
    Sentry.captureMessage(message, 'info');
  }

  public warn(message: string): void {
    this.logger.warn(message);
    Sentry.captureMessage(message, 'warning');
  }

  public error(error: any, trace: string = ''): void {
    const finalTrace = trace || (error && error.stack ? error.stack : '');
    this.logger.error(error, finalTrace);
    Sentry.captureException(error, { level: 'error' });
  }
}
