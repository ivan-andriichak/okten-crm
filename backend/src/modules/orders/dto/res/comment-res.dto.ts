import { ApiProperty } from '@nestjs/swagger';

export class CommentResDto {
  @ApiProperty({
    example: 'Good student',
    description: 'Text of the comment.',
  })
  text: string;

  @ApiProperty({
    example: 'Default',
    description: 'Surname of the comment author.',
  })
  author: string;

  @ApiProperty({
    example: '2025-02-28T16:40:00.000Z',
    description: 'Date when the comment was created.',
  })
  createdAt: Date;
}