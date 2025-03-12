import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../interfaces/order';
import { api } from '../../services/api';

export interface OrderState {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  sort: string;
  order: 'ASC' | 'DESC';
  expandedOrderId: string | null;
  editingOrder: Order | null;
  editForm: Partial<Order>;
  commentText: string;
}

const initialState: OrderState = {
  orders: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 25,
  sort: 'id',
  order: 'ASC',
  expandedOrderId: null,
  editingOrder: null,
  editForm: {},
  commentText: '',
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { getState }) => {
    const state = getState() as {
      orders: OrderState;
      auth: {
        token: string | null;
        currentUserId: string | null;
        role: 'admin' | 'manager' | null;
      };
    };
    const { page, limit, sort, order } = state.orders;
    const { token, currentUserId, role } = state.auth;

    const params: any = {
      page,
      limit,
      sort,
      order,
      manager_id: role === 'manager' ? currentUserId : undefined,
    };

    const response = await api.get<{ orders: Order[]; total: number }>(
      '/orders',
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
      },
    );
    return { orders: response.data.orders, total: response.data.total };
  },
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (orderId: string, { getState }) => {
    const state = getState() as {
      orders: OrderState;
      auth: { token: string | null };
    };
    const { editForm } = state.orders;
    const { token } = state.auth;

    const allowedFields: Partial<Order> = {
      name: editForm.name,
      surname: editForm.surname,
      email: editForm.email,
      phone: editForm.phone,
      age: editForm.age,
      course: editForm.course,
      course_format: editForm.course_format,
      course_type: editForm.course_type,
      status: editForm.status,
      sum: editForm.sum,
      alreadyPaid: editForm.alreadyPaid,
      group: editForm.group,
    };

    const response = await api.patch<Order>(
      `/orders/${orderId}/edit`,
      allowedFields,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
);

export const addComment = createAsyncThunk(
  'orders/addComment',
  async (orderId: string, { getState, dispatch }) => {
    const state = getState() as {
      orders: OrderState;
      auth: { token: string | null };
    };
    const { commentText } = state.orders;
    const { token } = state.auth;

    const response = await api.post<{ comment: Order['comments'][] }>(
      `/orders/${orderId}/comment`,
      { text: commentText },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await dispatch(fetchOrders()); // Оновлюємо список після додавання коментаря
    return response.data.comment;
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSort: (
      state,
      action: PayloadAction<{ sort: string; order: 'ASC' | 'DESC' }>,
    ) => {
      state.sort = action.payload.sort;
      state.order = action.payload.order;
    },
    toggleExpand: (state, action: PayloadAction<string>) => {
      state.expandedOrderId =
        state.expandedOrderId === action.payload ? null : action.payload;
    },
    openEditModal: (state, action: PayloadAction<Order>) => {
      state.editingOrder = action.payload;
      state.editForm = { ...action.payload };
    },
    closeEditModal: state => {
      state.editingOrder = null;
      state.editForm = {};
      state.error = null;
    },
    updateEditForm: (state, action: PayloadAction<Partial<Order>>) => {
      state.editForm = { ...state.editForm, ...action.payload };
    },
    setCommentText: (state, action: PayloadAction<string>) => {
      state.commentText = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch orders';
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.orders = state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order,
        );
        state.editingOrder = null;
        state.editForm = {};
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update order';
      })
      .addCase(addComment.fulfilled, state => {
        state.commentText = '';
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to add comment';
      });
  },
});

export const {
  setSort,
  toggleExpand,
  openEditModal,
  closeEditModal,
  updateEditForm,
  setCommentText,
} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;