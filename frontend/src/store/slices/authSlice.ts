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
        role: data.user.role,
        currentUserId: data.user.id,
        name: data.user.name,
        surname: data.user.surname,
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Помилка входу до системи. Перевірте дані та спробуйте ще раз.';
      return rejectWithValue(errorMessage);
    }
  },
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState }) => {
    const { auth } = getState() as RootState;
    const response = await api.post(
      '/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${auth.refreshToken}` },
      },
    );
    return response.data;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
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
        state.role = payload.role;
        state.currentUserId = payload.currentUserId;
        state.name = payload.name;
        state.surname = payload.surname;

        storage.set('token', payload.token);
        storage.set('role', payload.role);
        storage.set('currentUserId', payload.currentUserId);
        storage.set('name', payload.name);
        storage.set('surname', payload.surname);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ? String(payload) : 'Login failed.';
      });
  },
});

export { login };
export const { setTokens, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
