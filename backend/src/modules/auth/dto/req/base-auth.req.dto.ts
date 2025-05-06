import { PickType } from '@nestjs/swagger';

import { BaseUserReqDto } from '../../../users/dto/req/base-user.req.dto';

export class BaseAuthReqDto extends PickType(BaseUserReqDto, [
  'email',
  'password',
  'name',
  'surname',
  'image',
  'deviceId',
  'is_active',
  'role',
]) {}
