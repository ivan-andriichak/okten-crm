import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthResponse, AuthState, LoginRequest } from '../../interfaces/auth';
import { api } from '../../services/api';
import storage from '../utils/storage';

const initialState: AuthState = {
  token: storage.get('token') || null,
  role: storage.get('role') as 'admin' | 'manager' | null,
  currentUserId: storage.get('currentUserId') || null,
  name: storage.get('name') || null,
  surname: storage.get('surname') || null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
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
      const errorMessage = error.response?.data?.message || 'Помилка входу до системи. Перевірте дані та спробуйте ще раз.';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      storage.clearAuth();
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
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

        // Зберігаємо в localStorage
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

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;