import { Order } from './order';

export interface EditForm {
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  phone?: string | null;
  age?: string | null;
  course?: string | null;
  course_format?: string;
  course_type?: string;
  status?: string;
  sum?: string | null;
  alreadyPaid?: string | null;
  group?: string | null;
  comments?: { text: string; utm?: string | null; author?: string; createdAt: string }[] | null;
}

export interface EditOrderModalProps {
  editingOrder: Order;
  editForm: EditForm;
  token: string | null;
}