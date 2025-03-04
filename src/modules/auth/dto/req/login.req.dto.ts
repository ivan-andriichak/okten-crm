import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { BaseAuthReqDto } from './base-auth.req.dto';

export class LoginReqDto extends PickType(BaseAuthReqDto, [
  'email',
  'password',
  'role',
  'deviceId',
]) {
  @ApiProperty({
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}
