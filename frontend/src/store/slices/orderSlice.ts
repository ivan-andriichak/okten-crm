import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { EditForm } from '../../interfaces/editForm';
import { Order, OrderState } from '../../interfaces/order';

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

const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (page: number, { getState }) => {
    const state = getState() as {
      orders: OrderState;
      auth: {
        token: string | null;
        currentUserId: string | null;
        role: 'admin' | 'manager' | null;
        name: string | null;
        surname: string | null;
      };
    };
    const { limit, sort, order } = state.orders;
    // console.log('Fetching with:', { page, limit, sort, order });
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

const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (payload: { id: string; updates: Partial<Order> }, { getState }) => {
    const state = getState() as {
      orders: OrderState;
      auth: { token: string | null };
    };
    const { token } = state.auth;

    const response = await api.patch<Order>(
      `/orders/${payload.id}/edit`,
      payload.updates,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
);

const addComment = createAsyncThunk(
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
    await dispatch(fetchOrders(1));
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
      state.editForm = {
        name: action.payload.name,
        surname: action.payload.surname,
        email: action.payload.email,
        phone: action.payload.phone,
        age: action.payload.age?.toString() ?? null,
        course: action.payload.course,
        course_format: action.payload.course_format,
        course_type: action.payload.course_type,
        status: action.payload.status,
        sum: action.payload.sum?.toString() ?? null,
        alreadyPaid: action.payload.alreadyPaid?.toString() ?? null,
        group: action.payload.group,
        comments: action.payload.comments ?? null,
      };
    },
    closeEditModal: state => {
      state.editingOrder = null;
      state.editForm = {};
      state.error = null;
    },
    updateEditForm: (state, action: PayloadAction<Partial<EditForm>>) => {
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
        state.error = action.payload as string;
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

export { fetchOrders, updateOrder, addComment };

export const {
  setSort,
  toggleExpand,
  openEditModal,
  closeEditModal,
  updateEditForm,
  setCommentText,
} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;