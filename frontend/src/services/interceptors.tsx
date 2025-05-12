import { AxiosError } from 'axios';
import { addNotification, logout, refreshTokens, store } from '../store';
import { AxiosRequestConfigWithRetry } from './types';
import SupportEmail from '../components/SupportEmail/SupportEmail';
import React from 'react';
import { api } from './api';

// Handles session-related errors such as expired tokens or banned users
const handleSessionError = async (
  message: React.ReactNode,
  isBanned: boolean = false,
): Promise<void> => {
  store.dispatch(logout());
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('deviceId');
  store.dispatch(addNotification({ message, type: 'error' }));

  // Delay redirect to allow the notification to be visible
  await new Promise(resolve => setTimeout(resolve, 3000));
  window.location.href = '/login';
  throw new Error(isBanned ? 'BannedError' : 'SessionError');
};

// Main function to handle API request errors
export const handleApiError = async (error: AxiosError): Promise<never> => {
  const config = error.config as AxiosRequestConfigWithRetry | undefined;
  const isLoginRequest = config?.url?.includes('/login');
  const isRefreshRequest = config?.url?.includes('/refresh');

  // Handle 401 Unauthorized errors that are not from login or refresh requests
  if (error.response?.status === 401 && !config?._retry && !isLoginRequest && !isRefreshRequest) {
    if (!config) return Promise.reject(error);
    config._retry = true;

    try {
      const result = await store.dispatch(refreshTokens());
      if (refreshTokens.fulfilled.match(result)) {
        const { accessToken } = result.payload;
        if (config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(config);
      }
      throw new Error('Failed to refresh tokens');
    } catch (refreshError: any) {
      const errorMessage = refreshError.message || 'Token refresh error';

      let message: React.ReactNode;
      if (errorMessage.includes('Missing refresh token or deviceId')) {
        message = 'Session error. Please log in again.';
      } else if (errorMessage.includes('User has been banned')) {
        message = (
          <>
            Your account has been banned. Please contact support: <SupportEmail />
          </>
        );
        await handleSessionError(message, true);
      } else {
        message = 'Session expired. Please log in again.';
      }

      await handleSessionError(message);
    }
  }

  let message: React.ReactNode = 'An unexpected error occurred';

  if (error.response) {
    const resData = error.response.data as {
      message?: string;
      messages?: string[];
    };

    if (
      error.response.status === 401 &&
      resData.message === 'User has been banned or is inactive'
    ) {
      message = (
        <>
          Your account has been banned or deactivated. Please contact support: <SupportEmail />
        </>
      );
      await handleSessionError(message, true);
    } else if (error.response.status === 403) {
      if (resData.message?.includes('You can only delete comments')) {
        message = resData.message;
      } else if (resData.message === 'User has been banned') {
        message = (
          <>
            Your account has been banned. Please contact support: <SupportEmail />
          </>
        );
        await handleSessionError(message, true);
      } else {
        message = 'You do not have permission to perform this action.';
      }
      store.dispatch(addNotification({ message, type: 'error' }));
      return Promise.reject(error);
    } else {
      message =
        resData.message ||
        resData.messages?.[0] ||
        `Error ${error.response.status}`;
    }
  } else if (error.request) {
    message = 'No response from the server.';
  } else {
    message = error.message || 'Request configuration error.';
  }

  store.dispatch(addNotification({ message, type: 'error' }));
  return Promise.reject(error);
};
