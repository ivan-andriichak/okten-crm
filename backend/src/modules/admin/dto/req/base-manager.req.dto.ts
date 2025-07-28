import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

import { regexConstant } from '../../../../common/constants/regex.constant';
import { Role } from '../../../../common/enums/role.enum';
import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { IsRoleBasedPasswordValid } from '../../../users/decorators/password-valid.decorator';

export class BaseManagerReqDto {
  @ApiProperty({
    description: 'The name of the user.',
    example: 'Clavdia',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  @Transform(TransformHelper.trim)
  @Type(() => String)
  name?: string;

  @ApiProperty({
    description: 'The surname of the user.',
    example: 'Petrivna',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  @Transform(TransformHelper.trim)
  @Type(() => String)
  surname?: string;

  @ApiProperty({
    description: 'The URL of the user’s profile image.',
    example: 'https://example.com/user-profile.jpg',
    maxLength: 3000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 3000)
  image?: string;

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The email address of the user.',
    maxLength: 300,
  })
  @IsString()
  @IsEmail()
  @Length(0, 300)
  @Matches(regexConstant.EMAIL)
  email: string;

  @ApiProperty({
    example: '123qwe!@#QWE',
    description: 'The password of the user.',
  })
  @IsRoleBasedPasswordValid()
  password: string;

  @ApiProperty({
    description: 'The unique device identifier.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  @IsString()
  readonly deviceId?: string;

  @ApiProperty({
    description: 'Indicates whether the user is active.',
    example: false,
  })
  is_active?: boolean;

  @ApiProperty({
    enum: Role,
    description: 'The role of the user.',
    example: 'manager',
  })
  @IsOptional()
  @IsString()
  role?: Role;

  @ApiProperty({
    description: 'Password reset token for the user.',
    example: 'reset-token-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiProperty({
    description: 'Expiration date for the password reset token.',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  passwordResetExpires?: Date;
}
