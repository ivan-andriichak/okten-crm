import { AxiosError } from 'axios';
import { addNotification, store } from '../store';
import { AxiosRequestConfigWithRetry } from './types';
import SupportEmail from '../components/SupportEmail/SupportEmail';

export const handleApiError = async (error: AxiosError): Promise<never> => {
  const config = error.config as AxiosRequestConfigWithRetry | undefined;
  const isLoginRequest = config?.url?.includes('/login');

  if (error.response?.status === 401 && !config?._retry && !isLoginRequest) {
    if (!config) return Promise.reject(error); // safety check
    config._retry = true;

    const { auth } = store.getState();

    try {
      const response = await fetch('http://localhost:3001/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.refreshToken}`,
        },
      });

      if (!response.ok) throw new Error('Token refresh failed');
      const data = await response.json();

      store.dispatch({ type: 'auth/setTokens', payload: data });

      if (config.headers) {
        config.headers.Authorization = `Bearer ${data.accessToken}`;
      }

      const { api } = await import('./api');
      return api(config);
    } catch (refreshError) {
      store.dispatch({ type: 'auth/logout' });
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }

  let message: React.ReactNode = 'An unexpected error occurred';

  if (error.response) {
    const resData = error.response.data as {
      message?: string;
      messages?: string[];
    };

    if (error.response.status === 403 && resData.message === 'User is banned') {
      message = (
        <>
          You have been banned. Please contact support: <SupportEmail />
        </>
      );
    } else {
      message =
        resData.message ||
        resData.messages?.[0] ||
        `Error ${error.response.status}`;
    }
  } else if (error.request) {
    message = 'No response received from server';
  } else {
    message = error.message || 'Request setup error';
  }

  store.dispatch(addNotification({ message, type: 'error' }));
  return Promise.reject(error);
};