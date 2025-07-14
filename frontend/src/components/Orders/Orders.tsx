import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { AppDispatch, fetchOrders, RootState, setSort } from '../../store';
import { OrdersProps } from '../../store/slices/interfaces/order';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Pagination } from '../Pagination/Pagination';
import { OrderTable } from '../OrderTable/OrderTable';
import css from './Orders.module.css';
import { EditOrderModal } from '../EditOrderModal';
import { Filters } from '../Filters';
import Header from '../Header/Header';
import { cleanQueryParams } from '../../utils/queryUtils';

const Orders = ({}: OrdersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const {
    orders,
    total,
    loading,
    sort,
    order: sortOrder,
    expandedOrderId,
    editingOrder,
    editForm,
    commentText,
  } = useSelector((state: RootState) => state.orders);
  const { currentUserId, token } = useSelector(
    (state: RootState) => state.auth,
  );

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
  const urlOrder = (searchParams.get('order') as 'ASC' | 'DESC') || 'DESC';

  useEffect(() => {
    if (token) {
      if (urlSort !== sort || urlOrder !== sortOrder) {
        dispatch(setSort({ sort: urlSort, order: urlOrder }));
      }
      dispatch(
        fetchOrders({
          page: currentPage,
          filters: {
            ...filters,
            myOrders: myOrdersOnly ? 'true' : undefined,
            managerId: myOrdersOnly ? currentUserId || undefined : undefined,
          },
        }),
      );
    }
  }, [dispatch, token, currentPage, urlSort, urlOrder, filters, myOrdersOnly, sort, sortOrder]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(
      cleanQueryParams({
        page: newPage.toString(),
        sort: sort || 'id',
        order: sortOrder || 'DESC',
        ...filters,
        ...(myOrdersOnly && { myOrders: 'true' }),
      }),
      { replace: true },
    );
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
    setSearchParams(
      cleanQueryParams({
        page: '1',
        sort: 'id',
        order: 'DESC',
      }),
      { replace: true },
    );
  };

  return (
    <div className={css.container}>
      <Header />
      <Filters
        filters={filters}
        setFilters={(newFilters) => {
          setFilters(newFilters);
          setSearchParams(
            cleanQueryParams({
              page: '1', // Скидаємо на першу сторінку при зміні фільтрів
              sort: sort || 'id',
              order: sortOrder || 'DESC',
              ...newFilters,
              ...(myOrdersOnly && { myOrders: 'true' }),
            }),
            { replace: true },
          );
        }}
        myOrdersOnly={myOrdersOnly}
        setMyOrdersOnly={(value) => {
          setMyOrdersOnly(value);
          setSearchParams(
            cleanQueryParams({
              page: '1', // Скидаємо на першу сторінку при зміні myOrdersOnly
              sort: sort || 'id',
              order: sortOrder || 'DESC',
              ...filters,
              ...(value && { myOrders: 'true' }),
            }),
            { replace: true },
          );
        }}
        resetFilters={resetFilters}
      />

      {loading && <LoadingSpinner />}
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
            setSearchParams(
              cleanQueryParams({
                page: '1', // Скидаємо на першу сторінку при зміні сортування
                sort: newSort,
                order: newOrder,
                ...filters,
                ...(myOrdersOnly && { myOrders: 'true' }),
              }),
              { replace: true },
            )
          }
        />
      ) : (
        !loading &&
        orders.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              color: '#555',
              marginTop: '20px',
            }}>
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
    </div>
  );
};

export { Orders };