import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';

export class OrderListQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  limit?: number = 25;

  @IsOptional()
  @IsString()
  sort?: string = 'created_at';

  @Transform(TransformHelper.trim)
  @Transform(TransformHelper.toLowerCase)
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsUUID()
  @IsOptional()
  manager_id?: string;
}
