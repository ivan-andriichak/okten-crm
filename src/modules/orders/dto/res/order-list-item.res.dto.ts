import { PickType } from '@nestjs/swagger';

import { BaseOrderResDto } from './base-order.res.dto';

export class OrderListItemResDto extends PickType(BaseOrderResDto, [
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
]) {}
