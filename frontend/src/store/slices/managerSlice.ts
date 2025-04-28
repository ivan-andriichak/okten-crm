import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { RootState } from '../store';

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
}

const initialState: ManagerState = {
  managers: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 2,
};

interface FetchManagersParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export const fetchManagers = createAsyncThunk<
  { managers: Manager[]; total: number },
  FetchManagersParams,
  { state: RootState }
>(
  'managers/fetchManagers',
  async ({ page, limit, sort, order }, { getState }) => {
    const { token } = getState().auth;
    const response = await api.get<{ managers: Manager[]; total: number }>(
      '/admin/managers',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, sort, order },
      },
    );
    return response.data;
  },
);

export const activateManager = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('managers/activateManager', async (managerId, { getState }) => {
  const { token } = getState().auth;
  await api.post(
    `/admin/managers/${managerId}/activate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
});

export const recoverPassword = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('managers/recoverPassword', async (managerId, { getState }) => {
  const { token } = getState().auth;
  await api.post(
    `/admin/managers/${managerId}/recover`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
});

export const banManager = createAsyncThunk<void, string, { state: RootState }>(
  'managers/banManager',
  async (managerId, { getState }) => {
    const { token } = getState().auth;
    await api.post(
      `/admin/managers/${managerId}/ban`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
);

export const unbanManager = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('managers/unbanManager', async (managerId, { getState }) => {
  const { token } = getState().auth;
  await api.post(
    `/admin/managers/${managerId}/unban`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
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
      .addCase(activateManager.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateManager.fulfilled, (state, action) => {
        state.loading = false;
        const managerId = action.meta.arg;
        state.managers = state.managers.map(manager =>
          manager.id === managerId ? { ...manager, is_active: true } : manager,
        );
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
      .addCase(banManager.fulfilled, (state, action) => {
        state.loading = false;
        const managerId = action.meta.arg;
        state.managers = state.managers.map(manager =>
          manager.id === managerId ? { ...manager, is_active: false } : manager,
        );
      })
      .addCase(banManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to ban manager';
      })
      .addCase(unbanManager.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unbanManager.fulfilled, (state, action) => {
        state.loading = false;
        const managerId = action.meta.arg;
        state.managers = state.managers.map(manager =>
          manager.id === managerId ? { ...manager, is_active: true } : manager,
        );
      })
      .addCase(unbanManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unban manager';
      });
  },
});

export const managerReducer = managerSlice.reducer;
