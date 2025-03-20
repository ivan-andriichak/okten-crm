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

// Завантаження списку замовлень
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

    console.log('Fetched orders:', response.data);
    return { orders: response.data.orders, total: response.data.total };
  },
);

// Створення нового замовлення
const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: Partial<Order>, { getState }) => {
    const state = getState() as {
      auth: { token: string | null };
    };
    const { token } = state.auth;

    const response = await api.post<Order>('/orders/public', orderData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
  },
);

// Оновлення замовлення
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
  async (
    { orderId, commentText }: { orderId: string; commentText: string },
    { getState},
  ) => {
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
    const { token } = state.auth;

    if (!token || !commentText) throw new Error('Token or comment text missing');

    const response = await api.post<Order>(
      `/orders/${orderId}/comment`,
      { text: commentText },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log('addComment response:', response.data);
    return response.data;
  },
);

const deleteComment = createAsyncThunk(
  'orders/deleteComment',
  async (commentId: string, { getState}) => {
    const state = getState() as {
      orders: OrderState;
      auth: { token: string | null };
    };
    const { token } = state.auth;

    await api.delete(`/orders/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return commentId;
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
    closeEditModal: (state) => {
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
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
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.total += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
        state.editingOrder = null;
        state.editForm = {};
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update order';
      })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.commentText = '';
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex((o) => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add comment';
        state.loading = false;
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const commentId = action.payload;
        state.orders = state.orders.map(order => ({
          ...order,
          comments: order.comments?.filter(comment => comment.id !== commentId) || [],
        }));
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete comment';
      });
  },
});

export { fetchOrders, createOrder, updateOrder, addComment, deleteComment };

export const {
  setSort,
  toggleExpand,
  openEditModal,
  closeEditModal,
  updateEditForm,
  setCommentText,
} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;