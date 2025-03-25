import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import debounce from 'lodash/debounce';
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
import { Pagination } from '../Pagination/Pagination';
import { OrderTable } from '../OrderTable/OrderTable';
import css from './Orders.module.css';
import Button from '../Button/Button';
import { EditOrderModal } from '../EditOrderModal';
import { Filters } from '../Filters';

const Orders = ({ role }: OrdersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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

  // Стан для фільтрів
  const [filters, setFilters] = useState<Record<string, string>>({
    name: searchParams.get('name') || '',
    surname: searchParams.get('surname') || '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    age: searchParams.get('age') || '',
    course: searchParams.get('course') || '',
    course_format: searchParams.get('course_format') || '',
    course_type: searchParams.get('course_type') || '',
    status: searchParams.get('status') || '',
    sum: searchParams.get('sum') || '',
    alreadyPaid: searchParams.get('alreadyPaid') || '',
    group: searchParams.get('group') || '',
    created_at: searchParams.get('created_at') || '',
    manager: searchParams.get('manager') || '',
  });
  const [myOrdersOnly, setMyOrdersOnly] = useState(
    searchParams.get('myOrders') === 'true',
  );

  const currentPage = Number(searchParams.get('page')) || 1;
  const urlSort = searchParams.get('sort') || 'id';
  const urlOrder = (searchParams.get('order') as 'ASC' | 'DESC') || 'ASC';

  // Debounce для запитів
  const debouncedFetchOrders = debounce((page: number) => {
    const params = {
      page,
      filters: {
        ...filters,
        ...(myOrdersOnly && { myOrders: 'true' }),
        sort: urlSort,
        order: urlOrder,
      },
    };
    dispatch(fetchOrders(params));
  }, 500);

  // Оновлення параметрів і запит
  useEffect(() => {
    if (token) {
      dispatch(setSort({ sort: urlSort, order: urlOrder }));
      debouncedFetchOrders(currentPage);
    }
  }, [dispatch, token, currentPage, urlSort, urlOrder, filters, myOrdersOnly]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      sort: sort || 'id',
      order: sortOrder || 'ASC',
      ...filters,
      ...(myOrdersOnly && { myOrders: 'true' }),
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      surname: '',
      email: '',
      phone: '',
      age: '',
      course: '',
      course_format: '',
      course_type: '',
      status: '',
      sum: '',
      alreadyPaid: '',
      group: '',
      created_at: '',
      manager: '',
    });
    setMyOrdersOnly(false);
    setSearchParams({
      page: '1',
      sort: 'id',
      order: 'ASC',
    });
  };

  return (
    <>
      <div className={css.orders_container}>
        <div className={css.logo}>
          <img className={css.logoImage} src={oktenLogo} alt="okten-logo" />
        </div>
        <div className={css.user_info}>
          <p className={css.role}>{role}</p>
          <p className={css.name}>
            {name && surname ? `${name} ${surname}` : 'Not available'}
          </p>
          <Button
            style={{ margin: '10px' }}
            variant="primary"
            onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        myOrdersOnly={myOrdersOnly}
        setMyOrdersOnly={setMyOrdersOnly}
        resetFilters={resetFilters}
      />

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
              ...filters,
              ...(myOrdersOnly && { myOrders: 'true' }),
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
