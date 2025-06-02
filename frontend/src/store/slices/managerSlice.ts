import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AppDispatch, RootState } from '../store';
import { CreateManagerParams, FetchManagersParams, Manager, ManagerState } from './interfaces/manager';
import { addNotification } from './notificationSlice';
import { ERROR_MESSAGES, NOTIFICATION_TYPES, SUCCESS_MESSAGES } from '../../constants/error-messages';

const initialState: ManagerState = {
  managers: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 15,
  overallStats: {
    Total: 0,
    New: 0,
    'In work': 0,
    Agree: 0,
    Disagree: 0,
    Dubbing: 0,
  },
};

export const fetchManagers = createAsyncThunk<
  { managers: Manager[]; total: number },
  FetchManagersParams,
  { state: RootState }
>(
  'managers/fetchManagers',
  async ({ page, limit, sort, order }, { getState }) => {
    const { token } = getState().auth;
    if (!token) {
      throw new Error('No token available');
    }
    const response = await api.get<{ managers: Manager[]; total: number }>(
      '/admin/managers',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page, limit, sort, order },
      },
    );
    return response.data;
  },
);

export const fetchOverallStats = createAsyncThunk<
  {
    Total: number;
    New: number;
    'In work': number;
    Agree: number;
    Disagree: number;
    Dubbing: number;
  },
  void,
  { state: RootState }
>('managers/fetchOverallStats', async (_, { getState }) => {
  const { token } = getState().auth;
  if (!token) {
    throw new Error('No token available');
  }
  const response = await api.get('/admin/orders/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});

export const createManager = createAsyncThunk<
  void,
  CreateManagerParams,
  { state: RootState; dispatch: AppDispatch }
>('managers/createManager', async (formData, { getState, dispatch }) => {
  const { token } = getState().auth;
  if (!token) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw new Error('No token available');
  }
  if (!formData.email || !formData.name || !formData.surname) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.REQUIRED_FIELDS,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.STANDARD,
      }),
    );
    throw new Error('Missing required fields');
  }
  if (!/\S+@\S+\.\S+/.test(formData.email)) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.INVALID_EMAIL,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.STANDARD,
      }),
    );
    throw new Error('Invalid email');
  }

  await api.post('/admin/managers', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  dispatch(
    fetchManagers({
      page: 1,
      limit: getState().managers.limit,
      sort: 'created_at',
      order: 'DESC',
    }),
  );
  dispatch(fetchOverallStats());
  dispatch(
    addNotification({
      message: SUCCESS_MESSAGES.CREATE_MANAGER_SUCCESS,
      type: 'success',
      duration: 5000,
      notificationType: NOTIFICATION_TYPES.STANDARD,
    }),
  );
});

export const activateManager = createAsyncThunk<
  { link: string },
  string,
  { state: RootState; dispatch: AppDispatch }
>('managers/activateManager', async (managerId, { getState, dispatch }) => {
  const { token } = getState().auth;
  if (!token) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw new Error('No token available');
  }
  const response = await api.post(
    `/admin/managers/${managerId}/activate`,
{},
{
  headers: { Authorization: `Bearer ${token}` },
},
);
dispatch(
  addNotification({
    message: SUCCESS_MESSAGES.ACTIVATE_MANAGER_SUCCESS,
    type: 'success',
    duration: 5000,
    notificationType: NOTIFICATION_TYPES.STANDARD,
  }),
);
dispatch(
  fetchManagers({
    page: getState().managers.page,
    limit: getState().managers.limit,
    sort: 'created_at',
    order: 'DESC',
  }),
);
dispatch(fetchOverallStats());
return response.data;
});

export const recoverPassword = createAsyncThunk<
  { link: string },
  string,
  { state: RootState; dispatch: AppDispatch }
>('managers/recoverPassword', async (managerId, { getState, dispatch }) => {
  const { token } = getState().auth;
  if (!token) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw new Error('No token available');
  }
  const response = await api.post(
    `/admin/managers/${managerId}/recover`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  dispatch(
    addNotification({
      message: SUCCESS_MESSAGES.RECOVER_PASSWORD_SUCCESS,
      type: 'success',
      duration: 5000,
      notificationType: NOTIFICATION_TYPES.STANDARD,
    }),
  );
  dispatch(
    fetchManagers({
      page: getState().managers.page,
      limit: getState().managers.limit,
      sort: 'created_at',
      order: 'DESC',
    }),
  );
  dispatch(fetchOverallStats());
  return response.data;
});

export const banManager = createAsyncThunk<
  void,
  string,
  { state: RootState; dispatch: AppDispatch }
>('managers/banManager', async (managerId, { getState, dispatch }) => {
  const { token } = getState().auth;
  if (!token) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw new Error('No token available');
  }
  await api.post(
    `/admin/managers/${managerId}/ban`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  dispatch(
    addNotification({
      message: SUCCESS_MESSAGES.BAN_MANAGER_SUCCESS,
      type: 'success',
      duration: 5000,
      notificationType: NOTIFICATION_TYPES.STANDARD,
    }),
  );
  dispatch(
    fetchManagers({
      page: getState().managers.page,
      limit: getState().managers.limit,
      sort: 'created_at',
      order: 'DESC',
    }),
  );
  dispatch(fetchOverallStats());
});

export const unbanManager = createAsyncThunk<
  void,
  string,
  { state: RootState; dispatch: AppDispatch }
>('managers/unbanManager', async (managerId, { getState, dispatch }) => {
  const { token } = getState().auth;
  if (!token) {
    dispatch(
      addNotification({
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        type: 'error',
        duration: 6000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw new Error('No token available');
  }
  await api.post(
    `/admin/managers/${managerId}/unban`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  dispatch(
    addNotification({
      message: SUCCESS_MESSAGES.UNBAN_MANAGER_SUCCESS,
      type: 'success',
      duration: 5000,
      notificationType: NOTIFICATION_TYPES.STANDARD,
    }),
  );
  dispatch(
    fetchManagers({
      page: getState().managers.page,
      limit: getState().managers.limit,
      sort: 'created_at',
      order: 'DESC',
    }),
  );
  dispatch(fetchOverallStats());
});

const managerSlice = createSlice({
  name: 'managers',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchManagers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = action.payload.managers;
        state.total = action.payload.total;
        state.page = action.meta.arg.page;
      })
      .addCase(fetchManagers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || ERROR_MESSAGES.FETCH_MANAGERS_FAILED;
      })
      .addCase(fetchOverallStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverallStats.fulfilled, (state, action) => {
        state.loading = false;
        state.overallStats = action.payload;
      })
      .addCase(fetchOverallStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || ERROR_MESSAGES.FETCH_STATS_FAILED;
      })
      .addCase(createManager.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManager.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createManager.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || ERROR_MESSAGES.CREATE_MANAGER_FAILED;
      })
      .addCase(activateManager.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateManager.fulfilled, state => {
        state.loading = false;
      })
      .addCase(activateManager.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || ERROR_MESSAGES.ACTIVATE_MANAGER_FAILED;
      })
      .addCase(recoverPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recoverPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(recoverPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || ERROR_MESSAGES.RECOVER_PASSWORD_FAILED;
      })
      .addCase(banManager.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banManager.fulfilled, state => {
        state.loading = false;
      })
      .addCase(banManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || ERROR_MESSAGES.BAN_MANAGER_FAILED;
      })
      .addCase(unbanManager.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unbanManager.fulfilled, state => {
        state.loading = false;
      })
      .addCase(unbanManager.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || ERROR_MESSAGES.UNBAN_MANAGER_FAILED;
      });
  },
});

export const managerReducer = managerSlice.reducer;