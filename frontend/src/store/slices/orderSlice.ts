import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { EditForm } from '../../interfaces/editForm';
import { GroupEntity, Order, OrderState } from '../../interfaces/order';
import { AppDispatch, RootState } from '../store';

const initialState: OrderState = {
  orders: [],
  total: 0,
  loading: true,
  error: null,
  page: 1,
  limit: 25,
  sort: 'id',
  order: 'ASC',
  expandedOrderId: null,
  editingOrder: null,
  editForm: {},
  commentText: '',
  groups: [],
};

interface ThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
  extra?: Record<string, string>;
}

interface FetchOrdersParams {
  page: number;
  filters: Record<string, string | undefined>;
}

const fetchOrders = createAsyncThunk<
  { orders: Order[]; total: number },
  FetchOrdersParams,
  ThunkConfig
>('orders/fetchOrders', async ({ page, filters }, { getState }) => {
  const state = getState();
  const { limit, sort, order } = state.orders;
  const { token} = state.auth;

  const params: any = {
    page,
    limit,
    sort,
    order,
    ...(filters?.myOrders && { myOrders: filters.myOrders }),
    ...(filters?.name && { name: filters.name }),
    ...(filters?.surname && { surname: filters.surname }),
    ...(filters?.email && { email: filters.email }),
    ...(filters?.phone && { phone: filters.phone }),
    ...(filters?.age && { age: filters.age }),
    ...(filters?.course && { course: filters.course }),
    ...(filters?.course_format && { course_format: filters.course_format }),
    ...(filters?.course_type && { course_type: filters.course_type }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.sum && { sum: filters.sum }),
    ...(filters?.alreadyPaid && { alreadyPaid: filters.alreadyPaid }),
    ...(filters?.group && { group: filters.group }),
    ...(filters?.created_at && { created_at: filters.created_at }),
    ...(filters?.manager && { manager: filters.manager }),
  };

  const response = await api.get<{ orders: Order[]; total: number }>('/orders', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  console.log('Fetched orders:', response.data);
  return { orders: response.data.orders, total: response.data.total };
});

const fetchGroups = createAsyncThunk<string[], void, ThunkConfig>(
  'orders/fetchGroups',
  async (_, { getState }) => {
    const { token } = getState().auth;
    const response = await api.get<GroupEntity[]>('/groups', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.map(group => group.name);
  },
);

const addGroup = createAsyncThunk<string, string, ThunkConfig>(
  'orders/addGroup',
  async (groupName, { getState }) => {
    const { token } = getState().auth;
    const response = await api.post<GroupEntity>('/groups', { name: groupName }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.name;
  },
);

const createOrder = createAsyncThunk<Order, Partial<Order>, ThunkConfig>(
  'orders/createOrder',
  async (orderData, { getState }) => {
    const { token } = getState().auth;
    const response = await api.post<Order>('/orders/public', orderData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },
);

const updateOrder = createAsyncThunk<Order, { id: string; updates: Partial<Order> }, ThunkConfig>(
  'orders/updateOrder',
  async (payload, { getState }) => {
    const { token } = getState().auth;
    const response = await api.patch<Order>(`/orders/${payload.id}/edit`, payload.updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
);

const addComment = createAsyncThunk<Order, { orderId: string; commentText: string }, ThunkConfig>(
  'orders/addComment',
  async ({ orderId, commentText }, { getState }) => {
    const { token } = getState().auth;
    if (!token || !commentText) throw new Error('Token or comment text missing');
    const response = await api.post<Order>(`/orders/${orderId}/comment`, { text: commentText }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('addComment response:', response.data);
    return response.data;
  },
);

const deleteComment = createAsyncThunk<string, string, ThunkConfig>(
  'orders/deleteComment',
  async (commentId, { getState }) => {
    const { token } = getState().auth;
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
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(fetchGroups.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      })
      .addCase(addGroup.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add group';
      })
      .addCase(createOrder.pending, state => {
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
        state.orders = state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order,
        );
        state.editingOrder = null;
        state.editForm = {};
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update order';
      })
      .addCase(addComment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.commentText = '';
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add comment';
        state.loading = false;
      })
      .addCase(deleteComment.pending, state => {
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
        state.error = action.error.message || 'Failed to delete comment';
      });
  },
});

export {
  fetchOrders,
  fetchGroups,
  addGroup,
  createOrder,
  updateOrder,
  addComment,
  deleteComment,
};

export const {
  setSort,
  toggleExpand,
  openEditModal,
  closeEditModal,
  updateEditForm,
  setCommentText,
} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;