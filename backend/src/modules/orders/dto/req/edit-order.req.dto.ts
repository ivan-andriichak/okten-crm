import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { CourseEnum, CourseFormatEnum, CourseTypeEnum, StatusEnum } from '../../enums/order.enums';

export class EditOrderDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @Transform(TransformHelper.combine([TransformHelper.trim]))
  name?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @Transform(TransformHelper.combine([TransformHelper.trim]))
  surname?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @Transform(TransformHelper.combine([TransformHelper.trim, TransformHelper.toLowerCase]))
  email?: string;

  @ApiProperty({ example: '+380953456789', required: false })
  @IsOptional()
  @IsPhoneNumber('UA')
  @Transform(TransformHelper.combine([TransformHelper.trim]))
  phone?: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  age?: number;

  @ApiProperty({ example: 'FS', enum: CourseEnum, required: false })
  @IsOptional()
  @IsEnum(CourseEnum)
  course?: string;

  @ApiProperty({ example: 'online', enum: CourseFormatEnum, required: false })
  @IsOptional()
  @IsEnum(CourseFormatEnum)
  @Transform(TransformHelper.combine([TransformHelper.nullIfEmpty, TransformHelper.toLowerCase]))
  course_format?: string | null;

  @ApiProperty({ example: 'pro', enum: CourseTypeEnum, required: false })
  @IsOptional()
  @IsEnum(CourseTypeEnum)
  @Transform(TransformHelper.combine([TransformHelper.nullIfEmpty, TransformHelper.toLowerCase]))
  course_type?: string | null;

  @ApiProperty({ example: 'New', enum: StatusEnum, required: false })
  @IsOptional()
  @IsEnum(StatusEnum)
  @Transform(TransformHelper.combine([TransformHelper.nullIfEmpty, TransformHelper.toLowerCase]))
  status?: string | null;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sum?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  alreadyPaid?: number;

  @ApiProperty({ example: 'june-2025', required: false })
  @IsOptional()
  @IsString()
  @Transform(TransformHelper.combine([TransformHelper.nullIfEmpty, TransformHelper.trim]))
  group?: string | null;

  @IsOptional()
  @IsString()
  manager_id?: string;
}
