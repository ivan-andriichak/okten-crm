import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppDispatch,
  fetchOrders,
  logout,
  RootState,
  setSort,
} from '../../store';
import { OrdersProps } from '../../interfaces/order';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import EditOrderModal from '../EditOrderModal/EditOrderModal';
import Button from '../Button/Button';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../Pagination/Pagination';
import { OrderTable } from '../OrderTable/OrderTable';
import css from './Orders.module.css';

const Orders = ({ role }: OrdersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const {
    orders,
    total,
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

  const currentPage = Number(searchParams.get('page')) || 1;
  const urlSort = searchParams.get('sort') || 'id';
  const urlOrder = (searchParams.get('order') as 'ASC' | 'DESC') || 'ASC';

  useEffect(() => {
    if (token) {
      dispatch(setSort({ sort: urlSort, order: urlOrder }));
      dispatch(fetchOrders(currentPage));
    }
  }, [dispatch, token, currentPage, urlSort, urlOrder]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      sort: sort || 'id',
      order: sortOrder || 'ASC',
    });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <div className={css.orders_container}>
        <h2>LOGO</h2>
        <p>{role}</p>
        <p>{name && surname ? `${name} ${surname}` : 'Not available'}</p>
        <Button
          style={{ margin: '10px' }}
          variant="primary"
          onClick={handleLogout}>
          Logout
        </Button>
      </div>

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
          onSortChange={(newSort, newOrder) =>
            setSearchParams({
              page: currentPage.toString(),
              sort: newSort,
              order: newOrder,
            })
          }
        />
      ) : (
        !loading &&
        orders.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '2rem', color: 'tomato' }}>
            No orders found.
          </p>
        )
      )}
      {orders.length > 0 && (
        <div style={{ margin: '0 auto', width: 'fit-content' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={25}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {editingOrder && (
        <EditOrderModal
          editingOrder={editingOrder}
          editForm={editForm}
          token={token}
        />
      )}
    </>
  );
};

export { Orders };