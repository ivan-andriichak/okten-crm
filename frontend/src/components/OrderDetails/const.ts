import { Order } from '../../interfaces/order';

export interface OrderDetailsProps {
  order: Order;
  commentText: string;
  currentUserId: string | null;
  token: string | null;
}

export const getOrderFields = (order: Order) => [
  { label: 'ID', value: order.id },
  { label: 'Name', value: order.name },
  { label: 'Surname', value: order.surname },
  { label: 'Email', value: order.email },
  { label: 'Phone', value: order.phone },
  { label: 'Age', value: order.age },
  { label: 'Course', value: order.course },
  { label: 'Course Format', value: order.course_format },
  { label: 'Course Type', value: order.course_type },
  { label: 'Status', value: order.status },
  { label: 'Sum', value: order.sum },
  { label: 'Already Paid', value: order.alreadyPaid },
  { label: 'Group', value: order.group || 'No group' },
  { label: 'Created At', value: new Date(order.created_at).toLocaleString() },
  {
    label: 'Manager',
    value: order.manager ? `${order.manager.name} ${order.manager.surname}` : 'None',
  },
  {
    label: 'Message',
    value: order.comments && order.comments.length > 0 ? order.comments[0]?.text : 'N/A',
  },
  {
    label: 'UTM',
    value: order.comments && order.comments.length > 0 ? order.comments[0]?.utm : 'N/A',
  },
  { label: 'Group (Text)', value: order.group || 'No group' },
  { label: 'Group Entity', value: order.groupEntity?.name || 'No group entity' },
];