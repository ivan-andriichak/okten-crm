import { OrderListItemResDto } from './order-list-item.res.dto';

export class OrderListDto {
  orders: OrderListItemResDto[];
  total: number;
}
