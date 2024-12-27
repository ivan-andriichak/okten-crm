import { OrderDto } from './order.res.dto';

export class OrderListDto {
  orders: OrderDto[];
  totalCount: number;
}
