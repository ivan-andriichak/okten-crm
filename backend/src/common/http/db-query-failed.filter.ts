import { HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

// export class DbQueryFailedFilter {
//   static filter(exception: QueryFailedError) {
//     let status = HttpStatus.UNPROCESSABLE_ENTITY;
//     let message = (exception as QueryFailedError).message;
//     const code = (exception as any).code;
//
//     if ((exception as any).code === '23505') {
//       const detail = (exception as any).detail;
//       const key = detail
//         .match(/(?<=\().+?(?=\)=)/g)[0]
//         .split(',')[0]
//         .replace(/[^a-z ]/gim, '');
//       const value = detail.match(/(?<==\().+?(?=\))/g)[0].split(',')[0];
//
//       status = HttpStatus.CONFLICT;
//       message = `${key} ${value} already exists`;
//     }
//
//     return { status, message, code };
//   }
// }

export class DbQueryFailedFilter {
  static filter(exception: QueryFailedError) {
    let status = HttpStatus.UNPROCESSABLE_ENTITY; // За замовчуванням встановлюємо статус 422 (необроблений запит).
    let message = (exception as QueryFailedError).message; // Отримуємо стандартне повідомлення з помилки.
    const code = (exception as any).code; // Отримуємо код помилки з бази даних (наприклад, код помилки SQL).

    // Перевіряємо код помилки. Якщо код є '1062', це означає, що сталася помилка унікальності (у MySQL).
    if ((exception as any).code === '1062') {
      const detail = (exception as any).message; // Для MySQL деталі містяться в повідомленні.

      // Використовуємо регулярний вираз для отримання імені стовпця та значення, яке спричинило помилку.
      // Помилка MySQL зазвичай виглядає так: "Duplicate entry 'value' for key 'column_name'"
      const match = detail.match(/Duplicate entry '(.+?)' for key '(.+?)'/);
      if (match) {
        const value = match[1]; // Значення, яке спричинило порушення унікальності.
        const key = match[2]; // Назва стовпця (ключа), який спричинив помилку.

        status = HttpStatus.CONFLICT; // Встановлюємо статус 409 (конфлікт).
        message = `${key} '${value}' already exists`; // Формуємо повідомлення про конфлікт з унікальністю.
      }
    }

    // Повертаємо об'єкт з кодом статусу, повідомленням і кодом помилки.
    return { status, message, code };
  }
}
