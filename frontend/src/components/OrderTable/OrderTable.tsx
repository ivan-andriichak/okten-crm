import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, setSort, toggleExpand } from '../../store';
import { Order } from '../../interfaces/order';
import OrderDetails from '../OrderDetails/OrderDetails';

interface OrderTableProps {
  orders: Order[]; // Замініть на тип Order[]
  sort: string | null;
  sortOrder: 'ASC' | 'DESC' | null;
  expandedOrderId: string | null;
  currentUserId: string | null;
  commentText: string;
  token: string | null;
  onEditClick: (order: any) => void;
}

const OrderTable: FC<OrderTableProps> = ({
  orders,
  sort,
  sortOrder,
  expandedOrderId,
  currentUserId,
  commentText,
  token,
  onEditClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSort = (field: string) => {
    const sortableFields = [
      'id',
      'name',
      'surname',
      'email',
      'phone',
      'age',
      'status',
      'created_at',
    ];
    if (!sortableFields.includes(field)) return;
    const newOrder = sort === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    dispatch(setSort({ sort: field, order: newOrder }));
  };

  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '20px',
    },
    th: { border: '1px solid #ddd', padding: '8px', cursor: 'pointer' },
    td: { border: '1px solid #ddd', padding: '8px' },
    expandedTd: {
      border: '1px solid #ddd',
      padding: '8px',
      backgroundColor: '#f9f9f9',
    },
  };

  return (
    <table style={tableStyles.table}>
      <thead>
        <tr>
          <th style={tableStyles.th} onClick={() => handleSort('id')}>
            ID {sort === 'id' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('name')}>
            Name {sort === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('surname')}>
            Surname {sort === 'surname' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('email')}>
            Email {sort === 'email' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('phone')}>
            Phone {sort === 'phone' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('age')}>
            Age {sort === 'age' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('course')}>
            Course {sort === 'course' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th
            style={tableStyles.th}
            onClick={() => handleSort('course_format')}>
            Course Format{' '}
            {sort === 'course_format' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('course_type')}>
            Course Type{' '}
            {sort === 'course_type' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('status')}>
            Status {sort === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('sum')}>
            Sum {sort === 'sum' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('alreadyPaid')}>
            Already Paid{' '}
            {sort === 'alreadyPaid' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('group')}>
            Group {sort === 'group' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={tableStyles.th} onClick={() => handleSort('created_at')}>
            Created At{' '}
            {sort === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <React.Fragment key={order.id}>
            <tr
              onClick={() => dispatch(toggleExpand(order.id))}
              style={{ cursor: 'pointer' }}>
              <td style={tableStyles.td}>{order.id}</td>
              <td style={tableStyles.td}>{order.name}</td>
              <td style={tableStyles.td}>{order.surname}</td>
              <td style={tableStyles.td}>{order.email}</td>
              <td style={tableStyles.td}>{order.phone}</td>
              <td style={tableStyles.td}>{order.age}</td>
              <td style={tableStyles.td}>{order.course}</td>
              <td style={tableStyles.td}>{order.course_format}</td>
              <td style={tableStyles.td}>{order.course_type}</td>
              <td style={tableStyles.td}>{order.status}</td>
              <td style={tableStyles.td}>{order.sum}</td>
              <td style={tableStyles.td}>{order.alreadyPaid}</td>
              <td style={tableStyles.td}>{order.group || 'No group'}</td>
              <td style={tableStyles.td}>
                {new Date(order.created_at).toLocaleString()}
              </td>
              <td style={tableStyles.td}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEditClick(order);
                  }}>
                  Edit
                </button>
              </td>
            </tr>
            {expandedOrderId === order.id && (
              <tr>
                <td colSpan={15} style={tableStyles.expandedTd}>
                  <OrderDetails
                    order={order}
                    commentText={commentText}
                    currentUserId={currentUserId}
                    token={token}
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;