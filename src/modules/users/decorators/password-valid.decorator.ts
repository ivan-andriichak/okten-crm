import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Role } from '../../../common/enums/role.enum';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%_*#?&])[A-Za-z\d@$_!%*#?&]{8,}$/;

@ValidatorConstraint({ async: false })
export class IsRoleBasedPasswordValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const object = args.object as { role: Role };

    if (object.role === Role.ADMIN) {
      return true;
    }

    // Для інших ролей перевіряємо, чи відповідає пароль регулярному виразу
    return passwordRegex.test(value);
  }

  // Метод для визначення повідомлення про помилку
  defaultMessage(): string {
    return 'Password must be at least 8  (@$!%_*#?&).';
  }
}

export function IsRoleBasedPasswordValid(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: IsRoleBasedPasswordValidator,
    });
  };
}
