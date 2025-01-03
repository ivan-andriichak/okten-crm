import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { LoggerService } from '../../modules/logger/logger.service';
import { DbQueryFailedFilter } from './db-query-failed.filter';

// @Catch()
// export class GlobalExceptionFilter implements ExceptionFilter {
//   constructor(private readonly logger: LoggerService) {}
//   catch(exception: unknown, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     let status: number;
//     let messages: string[] | string;
//
//     if (exception instanceof BadRequestException) {
//       status = exception.getStatus();
//       messages = (exception.getResponse() as any).message;
//     } else if (exception instanceof HttpException) {
//       status = exception.getStatus();
//       messages = exception.message;
//     } else if (exception instanceof QueryFailedError) {
//       const error = DbQueryFailedFilter.filter(exception);
//       status = error.status;
//       messages = error.message;
//     } else {
//       status = 500;
//       messages = 'Internal server error';
//     }
//     this.logger.error(exception);
//     messages = Array.isArray(messages) ? messages : [messages];
//     response.status(status).json({
//       statusCode: status,
//       messages,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     });
//   }
// }

@Catch() // Декоратор, який дозволяє перехоплювати всі типи винятків. Це глобальний фільтр.
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // Основний метод обробки помилок.
    const ctx = host.switchToHttp(); // Отримуємо HTTP контекст.
    const response = ctx.getResponse<Response>(); // Отримуємо об'єкт відповіді.
    const request = ctx.getRequest<Request>(); // Отримуємо об'єкт запиту.

    let status: number; // Змінна для збереження статусу відповіді.
    let messages: string[] | string; // Змінна для збереження повідомлень про помилку.

    // Перевіряємо тип винятку та формуємо відповідний статус і повідомлення.
    if (exception instanceof BadRequestException) {
      status = exception.getStatus(); // Отримуємо статус 400, якщо виняток є BadRequestException.
      messages = (exception.getResponse() as any).message; // Отримуємо повідомлення з винятку.
    } else if (exception instanceof HttpException) {
      status = exception.getStatus(); // Для загальних HTTP винятків отримуємо статус.
      messages = exception.message; // Отримуємо повідомлення з винятку.
    } else if (exception instanceof QueryFailedError) {
      // Якщо виняток є QueryFailedError, обробляємо помилку з бази даних.
      const error = DbQueryFailedFilter.filter(exception); // Фільтруємо помилку через власний фільтр.
      status = error.status; // Отримуємо статус помилки з фільтра.
      messages = error.message; // Отримуємо повідомлення про помилку з фільтра.
    } else {
      // Якщо виняток невідомий, встановлюємо стандартний статус 500.
      status = 500;
      messages = 'Internal server error'; // Стандартне повідомлення про помилку сервера.
    }

    // Перетворюємо повідомлення в масив (якщо це не масив).
    messages = Array.isArray(messages) ? messages : [messages];

    // Відправляємо відповідь з відповідним статусом, повідомленням і метаданими.
    response.status(status).json({
      statusCode: status, // Статус відповіді.
      messages, // Повідомлення про помилку.
      timestamp: new Date().toISOString(), // Час, коли помилка сталася.
      path: request.url, // Шлях запиту, де виникла помилка.
    });
  }
}
