export class OrderDto {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  age: number;
  course: string;
  course_format: string;
  course_type: string;
  status: string;
  sum: number;
  alreadyPaid: number;
  created_at: Date;
  manager?: string;
  group?: string;
  message?: string;
  utm?: string;
}
