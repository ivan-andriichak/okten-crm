import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import oktenLogo from '../../images/okten.jpg';

import {
  AppDispatch,
  fetchOrders,
  logout,
  RootState,
  setSort,
} from '../../store';
import { OrdersProps } from '../../interfaces/order';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Додано useNavigate
import { Pagination } from '../Pagination/Pagination';
import { OrderTable } from '../OrderTable/OrderTable';
import css from './Orders.module.css';
import Button from '../Button/Button';
import { EditOrderModal } from '../EditOrderModal';

const Orders = ({ role }: OrdersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // Додано
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
    navigate('/login');
  };

  return (
    <>
      <div className={css.orders_container}>
       <div className={css.logo}>
            <img className={css.logoImage} src={oktenLogo} alt="okten-logo" />
          </div>
        <div className={css.user_info}>
          <p className={css.role}>{role}</p>
          <p className={css.name}>{name && surname ? `${name} ${surname}` : 'Not available'}</p>
          <Button
            style={{ margin: '10px' }}
            variant="primary"
            onClick={handleLogout}>
            Logout
          </Button>
        </div>
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
