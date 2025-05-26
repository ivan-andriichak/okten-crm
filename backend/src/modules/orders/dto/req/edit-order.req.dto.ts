import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

import { CourseEnum, CourseFormatEnum, CourseTypeEnum, StatusEnum } from '../../enums/order.enums';

export class EditOrderDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the customer.',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Surname of the customer.',
    required: false,
  })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the customer.',
    required: false,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+380953456789',
    description: 'Phone number of the customer (UA format).',
    required: false,
  })
  @IsPhoneNumber('UA', { message: 'Invalid phone format' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 30,
    description: 'Age of the customer.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  age?: number;

  @ApiProperty({
    example: 'FS',
    description: 'Course name.',
    enum: CourseEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseEnum)
  course?: string;

  @ApiProperty({
    example: 'online',
    description: 'Course format.',
    enum: CourseFormatEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseFormatEnum)
  course_format?: string;

  @ApiProperty({
    example: 'pro',
    description: 'Course type.',
    enum: CourseTypeEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseTypeEnum)
  course_type?: string;

  @ApiProperty({
    example: 'New',
    description: 'Status of the order.',
    enum: StatusEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: string;

  @ApiProperty({
    example: 1000,
    description: 'Total sum of the order.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sum?: number;

  @ApiProperty({
    example: 500,
    description: 'Amount already paid.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  alreadyPaid?: number;

  @ApiProperty({
    example: 'june-2025',
    description: 'Group associated with the order.',
    required: false,
  })
  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  manager_id?: string;
}
