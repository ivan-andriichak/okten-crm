import { Fragment, useState } from 'react';
    import { useDispatch } from 'react-redux';
    import { AppDispatch, toggleExpand } from '../../store';
    import { OrderTableProps } from '../../store/slices/interfaces/order';
    import { columns, tableStyles } from './constants';
    import { formatCell } from '../../utils/timeUtils';
    import { OrderDetails } from '../OrderDetails';

    const OrderTable = ({
      orders,
      sort,
      sortOrder,
      expandedOrderId,
      currentUserId,
      commentText,
      token,
      onSortChange,
    }: OrderTableProps) => {
      const dispatch = useDispatch<AppDispatch>();
      const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

      const handleSort = (field: string) => {
        const newOrder = sort === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
        if (onSortChange) {
          onSortChange(field, newOrder);
        }
      };

      const getRowStyle = (orderId: string) => {
        let style = {
          ...tableStyles.tr,
          cursor: 'pointer',
        };
        if (hoveredRowId === orderId) {
          style = { ...style, ...tableStyles.trHover };
        }
        if (expandedOrderId === orderId) {
          style = { ...style, backgroundColor: '#f0ffe8' };
        }
        return style;
      };

      const getCellStyle = (
        orderId: string,
        width: string,
        key: string,
        value: any,
      ) => {
        const baseStyle =
          expandedOrderId === orderId ? tableStyles.expandedCell : tableStyles.td;
        const backgroundColor = key === 'manager' && value ? '#f0ffe8' : 'inherit';
        return {
          ...baseStyle,
          width,
          backgroundColor,
        };
      };

      return (
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {columns.map(({ key, label, width }) => (
                <th
                  key={key}
                  style={{ ...tableStyles.th, width }}
                  onClick={() => handleSort(key)}>
                  {label} {sort === key && (sortOrder === 'ASC' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <Fragment key={order.id}>
                <tr
                  onClick={() => dispatch(toggleExpand(order.id))}
                  onMouseEnter={() => setHoveredRowId(order.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  style={getRowStyle(order.id)}>
                  {expandedOrderId === order.id ? (
                    <td colSpan={columns.length} style={{ padding: 0 }}>
                      <div style={tableStyles.expandedRowContainer}>
                        <div style={tableStyles.expandedRow}>
                          {columns.map(({ key, width }) => (
                            <div
                              key={key}
                              style={getCellStyle(
                                order.id,
                                width,
                                key,
                                order[key as keyof typeof order],
                              )}>
                              {formatCell(key, order[key as keyof typeof order])}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  ) : (
                    columns.map(({ key, width }) => (
                      <td
                        key={key}
                        style={getCellStyle(
                          order.id,
                          width,
                          key,
                          order[key as keyof typeof order],
                        )}>
                        {formatCell(key, order[key as keyof typeof order])}
                      </td>
                    ))
                  )}
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan={columns.length} style={tableStyles.expandedTd}>
                      <OrderDetails
                        orderId={parseInt(order.id)}
                        commentText={commentText}
                        currentUserId={currentUserId}
                        token={token}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      );
    };

    export { OrderTable };