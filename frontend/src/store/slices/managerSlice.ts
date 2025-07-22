import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AppDispatch, RootState } from '../store';
import {
  CreateManagerParams,
  FetchManagersParams,
  Manager,
  ManagerState,
} from './interfaces/manager';
import { addNotification } from './notificationSlice';
import {
  ERROR_MESSAGES,
  NOTIFICATION_TYPES,
  SUCCESS_MESSAGES,
} from '../../constants/error-messages';

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
    NULL: 0,
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
  async (
    { page, limit, sort = 'created_at', order = 'DESC' },
    { getState },
  ) => {
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
    NULL: number;
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
  console.log('fetchOverallStats response:', response.data);
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

const handleManagerResponse = (
  responseData: { link: string; email: string; emailSent: boolean },
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  const { link, email, emailSent } = responseData;
  dispatch(
    addNotification({
      message: emailSent
        ? `Link sent to ${email} and copied.`
        : `Link copied, but failed to send email to ${email}.`,
      type: emailSent ? 'success' : 'info',
      duration: 4000,
      notificationType: emailSent
        ? NOTIFICATION_TYPES.STANDARD
        : NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
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
  return { link, email, emailSent };
};

export const activateManager = createAsyncThunk<
  { link: string; email: string; emailSent: boolean },
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
  try {
    const response = await api.post(
      `/admin/managers/${managerId}/activate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return handleManagerResponse(response.data, dispatch, getState);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.ACTIVATE_MANAGER_FAILED;
    dispatch(
      addNotification({
        message: `${errorMessage}. Contact support.`,
        type: 'error',
        duration: 4000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw error;
  }
});

export const recoverPassword = createAsyncThunk<
  { link: string; email: string; emailSent: boolean },
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
  try {
    const response = await api.post(
      `/admin/managers/${managerId}/recover`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return handleManagerResponse(response.data, dispatch, getState);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.RECOVER_PASSWORD_FAILED;
    dispatch(
      addNotification({
        message: `${errorMessage}. Contact support.`,
        type: 'error',
        duration: 4000,
        notificationType: NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL,
      }),
    );
    throw error;
  }
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

export const verifyToken = createAsyncThunk<
  { email: string },
  string,
  { state: RootState; dispatch: AppDispatch }
>('managers/verifyToken', async (token, { dispatch }) => {
  try {
    const response = await api.get<{ email: string }>(
      `/admin/verify-token/${token}`,
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Недійсний або прострочений токен';
    dispatch(
      addNotification({
        message: errorMessage,
        type: 'error',
        notificationType: 'system',
      }),
    );
    throw error;
  }
});

export const setPassword = createAsyncThunk<
  void,
  { token: string; password: string },
  { state: RootState; dispatch: AppDispatch }
>('managers/setPassword', async ({ token, password }, { dispatch }) => {
  try {
    await api.post('/admin/set-password', { token, password });
    dispatch(
      addNotification({
        message: 'Password successfully set.',
        type: 'success',
        notificationType: 'system',
      }),
    );
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to set password';
    dispatch(
      addNotification({
        message: errorMessage,
        type: 'error',
        notificationType: 'system',
      }),
    );
    throw error;
  }
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
      })
      .addCase(verifyToken.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, state => {
        state.loading = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to verify token';
      })
      .addCase(setPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(setPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to set password';
      });
  },
});

export const managerReducer = managerSlice.reducer;