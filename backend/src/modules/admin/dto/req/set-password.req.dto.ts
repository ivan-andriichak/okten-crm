import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SetPasswordReqDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters, include uppercase, ' +
      'lowercase, numbers, and special characters (@$!%*?&)',
  })
  password: string;
}
