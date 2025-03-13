import { Order } from './order';

export interface EditForm {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  age?: string;
  course?: string;
  course_format?: string;
  course_type?: string;
  status?: string;
  sum?: string;
  alreadyPaid?: string;
  group?: string;
}

export interface EditOrderModalProps {
  editingOrder: Order;
  editForm: EditForm;
  token: string | null;
}