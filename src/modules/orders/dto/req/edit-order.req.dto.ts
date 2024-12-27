import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  sum?: number;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  message?: string;
  courseType: string;
  courseFormat: string;
  course: string;
}
