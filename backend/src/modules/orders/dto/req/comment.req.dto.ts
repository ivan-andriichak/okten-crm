import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @ApiProperty({
    description: 'Order comment text',
    example: 'text": "Good student',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
