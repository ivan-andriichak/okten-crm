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
  comments?: Comment[];
  utm?: string | null;
  msg?: string | null;
}

export interface OrdersProps {
  token: string;
  role: 'admin' | 'manager';
  onLogout: () => void;
  currentUserId: string;
}

export interface OrderTableProps {
  orders: Order[];
  sort: string | null;
  sortOrder: 'ASC' | 'DESC' | null;
  expandedOrderId: string | null;
  currentUserId: string | null;
  commentText: string;
  token: string | null;
  onSortChange?: (sort: string, order: 'ASC' | 'DESC') => void;
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

export interface Comment {
  id: string
  text: string;
  author?: string;
  createdAt: string;
}