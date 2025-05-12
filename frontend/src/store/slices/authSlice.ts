import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthResponse, LoginRequest } from '../../interfaces/auth';
import { api } from '../../services/api';
import storage from '../utils/storage';
import { RootState } from '../store';

const initialState: {
  token: string | null;
  refreshToken: string | null;
  role: 'admin' | 'manager' | null;
  currentUserId: string | null;
  name: string | null;
  surname: string | null;
  loading: boolean;
  error: string | null;
} = {
  token: storage.get('token') || null,
  refreshToken: storage.get('refreshToken') || null,
  role: storage.get('role') as 'admin' | 'manager' | null,
  currentUserId: storage.get('currentUserId') || null,
  name: storage.get('name') || null,
  surname: storage.get('surname') || null,
  loading: false,
  error: null,
};

const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, deviceId }: LoginRequest, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/login', {
        email,
        password,
        deviceId,
      });

      return {
        token: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        role: data.user.role,
        currentUserId: data.user.id,
        name: data.user.name,
        surname: data.user.surname,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';
      return rejectWithValue(errorMessage);
    }
  },
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const deviceId =
        localStorage.getItem('deviceId') ||
        '550e8400-e29b-41d4-a716-446655440001';
      const refreshToken = auth.refreshToken;


      if (!refreshToken || !deviceId) {
        return rejectWithValue('Missing refresh token or deviceId');
      }

      const response = await api.post('/refresh', {
        refreshToken,
        deviceId,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to refresh tokens.';
      return rejectWithValue(errorMessage);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      storage.set('token', action.payload.accessToken);
      storage.set('refreshToken', action.payload.refreshToken);
    },
    logout: state => {
      storage.clearAuth();
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.token = payload.token;
        state.refreshToken = payload.refreshToken;
        state.role = payload.role;
        state.currentUserId = payload.currentUserId;
        state.name = payload.name;
        state.surname = payload.surname;

        storage.set('token', payload.token);
        storage.set('refreshToken', payload.refreshToken);
        storage.set('role', payload.role);
        storage.set('currentUserId', payload.currentUserId);
        storage.set('name', payload.name);
        storage.set('surname', payload.surname);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ? String(payload) : 'Login error.';
      })
      .addCase(refreshTokens.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.token = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        storage.set('token', payload.accessToken);
        storage.set('refreshToken', payload.refreshToken);
      })
      .addCase(refreshTokens.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ? String(payload) : 'Token refresh error.';
        state.token = null;
        state.refreshToken = null;
        storage.clearAuth();
      });
  },
});

export { login };
export const { setTokens, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
