import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, toggleExpand } from '../../store';
import OrderDetails from '../OrderDetails/OrderDetails';
import { OrderTableProps } from '../../interfaces/order';
import { tableStyles, columns } from './constants';

const OrderTable: FC<OrderTableProps> = ({
                                           orders,
                                           sort,
                                           sortOrder,
                                           expandedOrderId,
                                           currentUserId,
                                           commentText,
                                           token,
                                           onSortChange,
                                         }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSort = (field: string) => {
    const newOrder = sort === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    if (onSortChange) {
      onSortChange(field, newOrder);
    }
  };

  const formatCell = (key: string, value: any) => {
    if (key === 'created_at' && value) {
      return new Date(value).toLocaleString('uk-UA', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (key === 'manager' && value) {
      // Обробка об’єкта manager
      return `${value.name || ''} ${value.surname || ''}`.trim() || 'None';
    }
    // Значення за замовчуванням для null/undefined
    return value ?? 'No group';
  };

  return (
    <table style={tableStyles.table}>
      <thead>
      <tr>
        {columns.map(({ key, label, width }) => (
          <th
            key={key}
            style={{ ...tableStyles.th, width }}
            onClick={() => handleSort(key)}
          >
            {label} {sort === key && (sortOrder === 'ASC' ? '↑' : '↓')}
          </th>
        ))}
      </tr>
      </thead>
      <tbody>
      {orders.map((order) => (
        <React.Fragment key={order.id}>
          <tr onClick={() => dispatch(toggleExpand(order.id))} style={{ cursor: 'pointer' }}>
            {columns.map(({ key, width }) => (
              <td key={key} style={{ ...tableStyles.td, width }}>
                {formatCell(key, order[key as keyof typeof order])}
              </td>
            ))}
          </tr>
          {expandedOrderId === order.id && (
            <tr>
              <td colSpan={columns.length} style={tableStyles.expandedTd}>
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