import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class ExcelQueryDto {
  @ApiProperty({ description: 'Sort field', required: false, default: 'id' })
  @IsOptional()
  @IsString()
  sort?: string = 'id';

  @ApiProperty({ description: 'Sort order', required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'DESC';

  @ApiProperty({ description: 'Filter by name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filter by surname', required: false })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiProperty({ description: 'Filter by phone', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Filter by email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Filter by age', required: false })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiProperty({ description: 'Filter by course', required: false })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiProperty({ description: 'Filter by course format', required: false })
  @IsOptional()
  @IsString()
  course_format?: string;

  @ApiProperty({ description: 'Filter by course type', required: false })
  @IsOptional()
  @IsString()
  course_type?: string;

  @ApiProperty({ description: 'Filter by status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Filter by sum', required: false })
  @IsOptional()
  @IsString()
  sum?: string;

  @ApiProperty({ description: 'Filter by already paid', required: false })
  @IsOptional()
  @IsString()
  alreadyPaid?: string;

  @ApiProperty({ description: 'Filter by group', required: false })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ description: 'Filter by created at (e.g., 2021-11-01)', required: false })
  @IsOptional()
  created_at?: string;

  @ApiProperty({ description: 'Filter by manager name', required: false })
  @IsOptional()
  @IsString()
  manager?: string;

  @ApiProperty({ description: 'Filter by manager ID', required: false })
  @IsOptional()
  @IsString()
  manager_id?: string;

  @ApiProperty({ description: 'Filter only my orders', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  myOrders?: boolean;
}
