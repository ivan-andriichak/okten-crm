import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AppDispatch, RootState } from '../store';

export interface Manager {
  id: string;
  email: string;
  name: string;
  surname: string;
  is_active: boolean;
  statistics?: {
    totalOrders: number;
    activeOrders: number;
  };
}

export interface ManagerState {
  managers: Manager[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  overallStats: {
    New: number;
    InWork: number;
    Agree: number;
    Disagree: number;
    Dubbing: number;
  };
}

const initialState: ManagerState = {
  managers: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 5,
  overallStats: {
    New: 0,
    InWork: 0,
    Agree: 0,
    Disagree: 0,
    Dubbing: 0,
  },
};

interface FetchManagersParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

interface CreateManagerParams {
  email: string;
  name: string;
  surname: string;
}

export const fetchManagers = createAsyncThunk<
  { managers: Manager[]; total: number },
  FetchManagersParams,
  { state: RootState }
>('managers/fetchManagers', async ({ page, limit, sort, order }, { getState }) => {
  const { token } = getState().auth;
  console.log('fetchManagers: Token:', token);
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
});

export const fetchOverallStats = createAsyncThunk<
  { New: number; InWork: number; Agree: number; Disagree: number; Dubbing: number },
  void,
  { state: RootState }
>('managers/fetchOverallStats', async (_, { getState }) => {
  const { token } = getState().auth;
  console.log('fetchOverallStats: Token:', token);
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
  console.log('createManager: Token:', token);
  if (!token) {
    throw new Error('No token available');
  }
  await api.post('/admin/managers', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  dispatch(fetchManagers({ page: 1, limit: getState().managers.limit, sort: 'created_at', order: 'DESC' }));
  dispatch(fetchOverallStats());
});

export const activateManager = createAsyncThunk<
  { link: string },
  string,
  { state: RootState; dispatch: AppDispatch }
>('managers/activateManager', async (managerId, { getState, dispatch }) => {
  const { token } = getState().auth;
  console.log('activateManager: Token:', token);
  if (!token) {
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
  console.log('recoverPassword: Token:', token);
  if (!token) {
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
  console.log('banManager: Token:', token);
  if (!token) {
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
  console.log('unbanManager: Token:', token);
  if (!token) {
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
        state.error = action.error.message || 'Failed to fetch managers';
      })
      .addCase(fetchOverallStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverallStats.fulfilled, (state, action) => {
        state.loading = false;
        state.overallStats = action.payload;
        console.log('fetchOverallStats fulfilled:', action.payload);
      })
      .addCase(fetchOverallStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch overall stats';
        console.log('fetchOverallStats rejected:', action.error);
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
        state.error = action.error.message || 'Failed to create manager';
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
        state.error = action.error.message || 'Failed to activate manager';
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
        state.error = action.error.message || 'Failed to recover password';
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
        state.error = action.error.message || 'Failed to ban manager';
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
        state.error = action.error.message || 'Failed to unban manager';
      });
  },
});

export const managerReducer = managerSlice.reducer;