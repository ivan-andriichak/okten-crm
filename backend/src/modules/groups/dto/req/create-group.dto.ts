import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Назва групи',
    example: 'october-2024',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
