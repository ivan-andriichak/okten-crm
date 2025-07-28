import { PickType } from '@nestjs/swagger';

import { BaseUserResDto } from './base-user.res';

export class UserResDto extends PickType(BaseUserResDto, [
  'id',
  'email',
  'name',
  'surname',
  'is_active',
  'last_login',
  'image',
  'role',
]) {}
