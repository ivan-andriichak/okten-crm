import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class OrderQueryDto {
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
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  course?: string;
}
