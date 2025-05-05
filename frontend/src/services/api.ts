import axios from 'axios';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationSlice';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.response.use(
  response => response,
  async error => {
    const isLoginRequest = error.config.url?.includes('/login');
    if (
      error.response?.status === 401 &&
      !error.config._retry &&
      !isLoginRequest
    ) {
      error.config._retry = true;
      const { auth } = store.getState();
      try {
        const response = await axios.post(
          'http://localhost:3001/refresh',
          {},
          {
            headers: { Authorization: `Bearer ${auth.refreshToken}` },
          },
        );
        store.dispatch({ type: 'auth/setTokens', payload: response.data });
        error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(error.config);
      } catch (refreshError) {
        store.dispatch({ type: 'auth/logout' });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    let message = 'An unexpected error occurred';
    if (error.response) {
      if (
        error.response.status === 403 &&
        error.response.data.message === 'User is banned'
      ) {
        message =
          'You have been banned. Please contact the administrator at admin@example.com';
      } else {
        switch (error.response.status) {
          case 400:
            message = error.response.data.message || 'Invalid request data';
            break;
          case 403:
            message = error.response.data.message || 'Access forbidden';
            break;
          case 404:
            message = error.response.data.message || 'Resource not found';
            break;
          case 500:
            message = error.response.data.message || 'Server error';
            break;
          default:
            message =
              error.response.data.message ||
              error.response.data.messages?.[0] ||
              `Error ${error.response.status}`;
        }
      }
    } else if (error.request) {
      message = 'No response received from server';
    } else {
      message = error.message || 'Request setup error';
    }

    store.dispatch(
      addNotification({
        message,
        type: 'error',
      }),
    );

    return Promise.reject(error);
  },
);

export { api };
