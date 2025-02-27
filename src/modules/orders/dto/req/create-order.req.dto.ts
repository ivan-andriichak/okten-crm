import { PickType } from '@nestjs/swagger';

import { BaseOrderReqDto } from './base-order.req.dto';

export class CreateOrderReqDto extends PickType(BaseOrderReqDto, [
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
