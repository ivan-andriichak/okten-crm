export interface OrderDetailsProps {
  orderId: number;
  commentText: string;
  currentUserId: string | null;
  token: string | null;
}