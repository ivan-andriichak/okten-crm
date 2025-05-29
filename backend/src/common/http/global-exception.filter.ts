import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { LoggerService } from '../../modules/logger/logger.service';
import { DbQueryFailedFilter } from './db-query-failed.filter';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();
      if (
        status === 409 &&
        typeof responseObj === 'object' &&
        'message' in responseObj &&
        (responseObj as any).message === 'Email already exists'
      ) {
        response.status(status).json(responseObj);
        return;
      }
      message = typeof responseObj === 'string' ? responseObj : (responseObj as any).message || exception.message;
    } else if (exception instanceof QueryFailedError) {
      const error = DbQueryFailedFilter.filter(exception);
      status = error.status;
      message = error.message;
    } else {
      status = 500;
      message = 'Internal server error';
    }

    this.logger.error(
      `Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : '',
    );
    Sentry.captureException(exception);

    response.status(status).json({
      statusCode: status,
      message,
      error: exception instanceof HttpException ? exception.name : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
