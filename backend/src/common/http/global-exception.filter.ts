import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
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
    let messages: string | string[];

    if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse() as any;
      messages = responseObj.message || 'Bad request';
    } else if (exception instanceof UnauthorizedException) {
      status = 401;
      messages = exception.message || 'Unauthorized';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse() as any;
      messages = responseObj.message || exception.message;
    } else if (exception instanceof QueryFailedError) {
      const error = DbQueryFailedFilter.filter(exception);
      status = error.status;
      messages = error.message;
    } else {
      status = 500;
      messages = 'Internal server error';
    }

    messages = Array.isArray(messages) ? messages : [messages];

    this.logger.error(
      `Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : '',
    );
    Sentry.captureException(exception);

    response.status(status).json({
      statusCode: status,
      messages,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
