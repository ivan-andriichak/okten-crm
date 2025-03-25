import { Order } from '../../interfaces/order';

export interface OrderDetailsProps {
  order: Order;
  commentText: string;
  currentUserId: string | null;
  token: string | null;
}
