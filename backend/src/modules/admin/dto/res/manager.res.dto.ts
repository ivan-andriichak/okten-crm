import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

import { Role } from '../../../../common/enums/role.enum';

export class ManagerStatisticsDto {
  @IsNumber()
  totalOrders: number;

  @IsNumber()
  activeOrders: number;
}

export class GetManagersResDto {
  @IsString()
  id: string;

  @IsString()
  @Transform(({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value))
  email: string;

  @IsString()
  @Transform(({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value))
  name: string;

  @IsString()
  @Transform(({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value))
  surname: string;

  @IsString()
  hasPassword?: boolean;

  @IsBoolean()
  is_active: boolean;

  @IsDate()
  last_login: Date;

  @IsString()
  role: Role;

  @IsDate()
  created_at: Date;

  @Transform(({ value }) => ({
    totalOrders: value?.totalOrders ?? 0,
    activeOrders: value?.activeOrders ?? 0,
  }))
  statistics: ManagerStatisticsDto;
}
