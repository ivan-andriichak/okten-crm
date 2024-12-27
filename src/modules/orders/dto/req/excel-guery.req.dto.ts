import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class ExcelQueryDto {
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  myOrdersOnly?: boolean; // Для фільтрації лише власних замовлень
}
