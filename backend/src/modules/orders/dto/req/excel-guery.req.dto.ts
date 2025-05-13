import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ExcelQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  course_format?: string;

  @IsOptional()
  @IsString()
  course_type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sum?: string;

  @IsOptional()
  @IsString()
  alreadyPaid?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsBoolean()
  myOrders?: boolean;
}
