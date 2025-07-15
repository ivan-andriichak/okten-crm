import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class LoginReqDto {
  @ApiProperty({
    example: 'Example1!',
    description: 'The email address of the user.',
    maxLength: 300,
  })
  @IsString()
  @Length(0, 300)
  email: string;

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
