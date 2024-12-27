import { ApiProperty } from '@nestjs/swagger';

export class BaseUserResDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  last_login: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  role?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
