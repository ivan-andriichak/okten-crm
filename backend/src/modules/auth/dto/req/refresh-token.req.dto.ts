import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenReqDto {
  @ApiProperty({ description: 'refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ description: 'The unique device identifier.' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
