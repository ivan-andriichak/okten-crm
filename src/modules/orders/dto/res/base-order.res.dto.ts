import { ApiProperty } from '@nestjs/swagger';

import { UserResDto } from '../../../users/dto/res/user.res.dto';

export class CommentResDto {
  @ApiProperty({
    example: 'Good student',
    description: 'Text of the comment.',
  })
  text: string;

  @ApiProperty({
    example: 'utm_source=google',
    description: 'UTM parameters for the comment.',
    required: false,
  })
  utm: string | null;

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

export class BaseOrderResDto {
  @ApiProperty({
    example: '796cea24-a328-4463-a5e1-85a779e4780f',
    description: 'Unique identifier for the order.',
  })
  id: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the customer.',
  })
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Surname of the customer.',
  })
  surname: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the customer.',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the customer.',
  })
  phone: string;

  @ApiProperty({
    example: 30,
    description: 'Age of the customer.',
  })
  age: number;

  @ApiProperty({
    example: 'JavaScript',
    description: 'Course name.',
  })
  course: string;

  @ApiProperty({
    example: 'Online',
    description: 'Course format.',
  })
  course_format: string;

  @ApiProperty({
    example: 'Part-time',
    description: 'Course type.',
  })
  course_type: string;

  @ApiProperty({
    example: 'Active',
    description: 'Status of the order.',
  })
  status: string;

  @ApiProperty({
    example: 1000,
    description: 'Total sum of the order.',
  })
  sum: number;

  @ApiProperty({
    example: 500,
    description: 'Amount already paid.',
  })
  alreadyPaid: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation date of the order.',
  })
  created_at: Date;

  @ApiProperty({
    example: 'Manager Name',
    description: 'Name of the manager handling the order.',
    required: false,
  })
  manager?: UserResDto;

  @ApiProperty({
    example: 'Group A',
    description: 'Group associated with the order.',
    required: false,
  })
  group?: string;

  @ApiProperty({
    type: [CommentResDto],
    description: 'List of comments associated with the order.',
    required: false,
  })
  comments?: CommentResDto[];
}
