import { EditForm } from './editForm';

export interface Order {
  id: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  course: string | null;
  course_format: string;
  course_type: string;
  status: string;
  sum: number | null;
  alreadyPaid: number | null;
  created_at: string;
  group: string | null;
  groupEntity: { id: string; name: string } | null;
  manager: { id: string; name: string; surname: string } | null;
  comments?: {
    text: string;
    utm?: string | null;
    author?: string;
    createdAt: string;
  }[];
}

export interface OrdersProps {
  token: string;
  role: 'admin' | 'manager';
  onLogout: () => void;
  currentUserId: string;
}

export interface OrderState {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  sort: string;
  order: 'ASC' | 'DESC';
  expandedOrderId: string | null;
  editingOrder: Order | null;
  editForm: EditForm;
  commentText: string;
}