// backend/src/modules/orders/dto/req/base-order.req.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { UserResDto } from '../../../users/dto/res/user.res.dto';

export class BaseOrderReqDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the customer.',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Surname of the customer.',
  })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the customer.',
  })
  @IsString() // Змінено з @IsEmail() для гнучкості, якщо потрібна валідація — поверніть @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the customer.',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 30,
    description: 'Age of the customer.',
  })
  @IsNumber({}, { message: 'age must be a number' }) // Додано повідомлення для ясності
  @IsOptional()
  age?: number;

  @ApiProperty({
    example: 'FS',
    description: 'Course name.',
    enum: ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'],
  })
  @IsEnum(['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'])
  @IsOptional()
  course?: string;

  @ApiProperty({
    example: 'online',
    description: 'Course format.',
    enum: ['static', 'online'],
  })
  @IsEnum(['static', 'online'])
  @IsOptional()
  course_format?: string;

  @ApiProperty({
    example: 'pro',
    description: 'Course type.',
    enum: ['pro', 'minimal', 'premium', 'incubator', 'vip'],
  })
  @IsEnum(['pro', 'minimal', 'premium', 'incubator', 'vip'])
  @IsOptional()
  course_type?: string;

  @ApiProperty({
    example: 'New',
    description: 'Status of the order.',
    enum: ['New', 'In Work', 'Aggre', 'Disaggre', 'Dubbing'],
  })
  @IsEnum(['New', 'In Work', 'Aggre', 'Disaggre', 'Dubbing'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 1000,
    description: 'Total sum of the order.',
  })
  @IsNumber()
  @IsOptional()
  sum?: number;

  @ApiProperty({
    example: 500,
    description: 'Amount already paid.',
  })
  @IsNumber()
  @IsOptional()
  alreadyPaid?: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation date of the order.',
  })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiProperty({
    example: 'Manager Name',
    description: 'Name of the manager handling the order.',
    required: false,
  })
  @IsOptional()
  manager?: UserResDto;

  @ApiProperty({
    example: 'Group A',
    description: 'Group associated with the order.',
    required: false,
  })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiProperty({
    example: 'This is a message.',
    description: 'Additional message related to the order.',
    required: false,
  })
  @IsString()
  @IsOptional()
  msg?: string;

  @ApiProperty({
    example: 'utm_source=google',
    description: 'UTM parameters for tracking.',
    required: false,
  })
  @IsString()
  @IsOptional()
  utm?: string;
}
