import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

import { Config, SentryConfig } from '../../config/config.type';

@Injectable()
export class LoggerService {
  private readonly isLocal: boolean;
  private readonly logger = new Logger();

  constructor(private readonly configService: ConfigService<Config>) {
    const sentryConfig = this.configService.get<SentryConfig>('sentry');
    this.isLocal = sentryConfig.env === 'local';
  }

  public log(message: string): void {
    if (this.isLocal) {
      this.logger.log(message);
    } else {
      Sentry.captureMessage(message, 'log');
    }
  }

  public info(message: string): void {
    if (this.isLocal) {
      this.logger.log(message);
    } else {
      Sentry.captureMessage(message, 'info');
    }
  }

  public warn(message: string): void {
    if (this.isLocal) {
      this.logger.warn(message);
    } else {
      Sentry.captureMessage(message, 'warning');
    }
  }

  public error(error: any, trace: string = ''): void {
    const finalTrace = trace || (error && error.stack ? error.stack : '');
    if (this.isLocal) {
      this.logger.error(error, finalTrace);
    } else {
      Sentry.captureException(error, { level: 'error' });
    }
  }
}
