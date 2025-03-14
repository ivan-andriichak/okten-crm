import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppDispatch,
  fetchOrders,
  logout,
  openEditModal,
  RootState,
  updateEditForm,
} from '../../store';
import { OrdersProps, Order } from '../../interfaces/order';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import OrderTable from '../OrderTable/OrderTable';
import Pagination from '../Pagination/Pagination';
import EditOrderModal from '../EditOrderModal/EditOrderModal';

const Orders: FC<OrdersProps> = ({ role }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const {
    orders,
    loading,
    error,
    sort,
    order: sortOrder,
    expandedOrderId,
    editingOrder,
    editForm,
    commentText,
  } = useSelector((state: RootState) => state.orders);
  const { currentUserId, token, name, surname } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchOrders(currentPage));
    }
  }, [dispatch, token, sort, sortOrder, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleEditClick = (order: Order) => {
    const canEdit = !order.manager || order.manager?.id === currentUserId;
    if (!canEdit) {
      dispatch(updateEditForm({ comments: [], course_format: '' }));
      return;
    }
    dispatch(openEditModal(order));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Orders Page</h2>
      <p>Role: {role}</p>
      <p>User: {name && surname ? `${name} ${surname}` : 'Not available'}</p>
      <button onClick={handleLogout}>Logout</button>
      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {orders.length > 0 ? (
        <OrderTable
          orders={orders}
          sort={sort}
          sortOrder={sortOrder}
          expandedOrderId={expandedOrderId}
          currentUserId={currentUserId}
          commentText={commentText}
          token={token}
          onEditClick={handleEditClick}
        />
      ) : (
        <p>No orders found.</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={orders.length}
        onPageChange={handlePageChange}
      />
      {editingOrder && (
        <EditOrderModal editingOrder={editingOrder} editForm={editForm} token={token} />
      )}
    </div>
  );
};

export default Orders;