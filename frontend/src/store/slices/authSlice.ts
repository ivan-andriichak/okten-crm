import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { AuthResponse, LoginRequest } from './interfaces/auth';
import { api } from '../../services/api';
import storage from '../../utils/storage';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../constants/error-messages';
import { addNotification } from './notificationSlice';
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
  async (
    { email, password, deviceId }: LoginRequest,
    { dispatch, rejectWithValue },
  ) => {
    try {
      const finalDeviceId = deviceId || uuidv4();
      const { data } = await api.post<AuthResponse>('/login', {
        email,
        password,
        deviceId: finalDeviceId,
      });

      localStorage.setItem('deviceId', finalDeviceId);
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
        error.response?.data?.message || ERROR_MESSAGES.LOGIN_FAILED;
      dispatch(
        addNotification({
          message: errorMessage,
          type: 'error',
          duration: 6000,
        }),
      );
      return rejectWithValue(errorMessage);
    }
  },
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const deviceId = localStorage.getItem('deviceId');
      const refreshToken = auth.refreshToken;
      if (!refreshToken || !deviceId) {
        dispatch(
          addNotification({
            message: ERROR_MESSAGES.MISSING_TOKEN,
            type: 'error',
            duration: 6000,
          }),
        );
        return rejectWithValue(ERROR_MESSAGES.MISSING_TOKEN);
      }

      const response = await api.post('/refresh', {
        refreshToken,
        deviceId,
      });

      dispatch(
        addNotification({
          message: SUCCESS_MESSAGES.TOKEN_REFRESH_SUCCESS,
          type: 'success',
          duration: 5000,
        }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || ERROR_MESSAGES.TOKEN_REFRESH_FAILED;
      dispatch(
        addNotification({
          message: errorMessage,
          type: 'error',
          duration: 6000,
        }),
      );
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
        state.error = payload ? String(payload) : ERROR_MESSAGES.LOGIN_FAILED;
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
        state.error = payload
          ? String(payload)
          : ERROR_MESSAGES.TOKEN_REFRESH_FAILED;
      });
  },
});

export { login };
export const { setTokens, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;