import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { BaseAuthReqDto } from './base-auth.req.dto';

export class LoginReqDto extends PickType(BaseAuthReqDto, ['email', 'password', 'deviceId']) {
  @ApiProperty({
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
