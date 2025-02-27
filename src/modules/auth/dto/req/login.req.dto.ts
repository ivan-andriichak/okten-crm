import { PickType } from '@nestjs/swagger';

import { BaseAuthReqDto } from './base-auth.req.dto';

export class LoginReqDto extends PickType(BaseAuthReqDto, [
  'email',
  'password',
  'role',
  'deviceId',
]) {}
