import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

import { CourseEnum, CourseFormatEnum, CourseTypeEnum, StatusEnum } from '../../enums/order.enums';

export class EditOrderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsPhoneNumber('UA', { message: 'Invalid phone format' })
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsEnum(CourseEnum)
  course?: string;

  @IsOptional()
  @IsEnum(CourseFormatEnum)
  course_format?: string;

  @IsOptional()
  @IsEnum(CourseTypeEnum)
  course_type?: string;

  @IsOptional()
  @IsEnum(StatusEnum)
  status?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sum?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  alreadyPaid?: number;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  manager_id?: string;
}
