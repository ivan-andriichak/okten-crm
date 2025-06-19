import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

import { BaseOrderReqDto } from '../../../orders/dto/req/base-order.req.dto';
import { UserResDto } from '../../../users/dto/res/user.res.dto';

export class RegisterOrderDto extends PickType(BaseOrderReqDto, [
  'name',
  'surname',
  'email',
  'phone',
  'age',
  'course',
  'course_format',
  'course_type',
  'status',
  'sum',
  'alreadyPaid',
  'created_at',
  'manager',
  'group',
  'msg',
  'utm',
]) {
  @IsOptional()
  course_type?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  sum?: number;

  @IsOptional()
  alreadyPaid?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  created_at?: Date;

  @IsOptional()
  manager?: UserResDto;

  @IsOptional()
  group?: string;

  @IsOptional()
  msg?: string;

  @IsOptional()
  utm?: string;
}
