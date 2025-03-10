import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthResponse, LoginRequest } from '../../interfaces/auth';
import { api } from '../../services/api';

export interface AuthState {
  token: string | null;
  role: 'admin' | 'manager' | null;
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') as 'admin' | 'manager' | null,
  currentUserId: localStorage.getItem('currentUserId') || null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, deviceId }: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/login', {
        email,
        password,
        deviceId,
      });
      console.log('Login response:', response);

      return {
        token: response.data.tokens.accessToken,
        role: response.data.user.role,
        currentUserId: response.data.user.id,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.token = null;
      state.role = null;
      state.currentUserId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('currentUserId');
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.currentUserId = action.payload.currentUserId;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('role', action.payload.role);
        localStorage.setItem('currentUserId', action.payload.currentUserId);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        console.error('Error response:', action.payload);
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;