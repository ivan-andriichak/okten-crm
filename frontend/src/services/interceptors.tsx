import { AxiosError } from 'axios';
import {
  addNotification,
  clearNotifications,
  logout,
  refreshTokens,
  store,
} from '../store';
import { AxiosRequestConfigWithRetry } from './types';
import SupportEmail from '../components/SupportEmail/SupportEmail';
import React from 'react';
import { api } from './api';
import { ERROR_MESSAGES } from '../constants/error-messages';

// Handles session-related errors such as expired tokens or banned users
const handleSessionError = async (
  message: React.ReactNode,
  isBanned: boolean = false,
): Promise<never> => {
  store.dispatch(logout());
  store.dispatch(clearNotifications());
  store.dispatch(addNotification({ message, type: 'error', duration: 6000 }));
  setTimeout(() => {
    window.location.href = '/login';
  }, 6000);
  throw new Error(isBanned ? 'BannedError' : 'SessionError');
};

// Main function to handle API request errors
export const handleApiError = async (error: AxiosError): Promise<never> => {
  const config = error.config as AxiosRequestConfigWithRetry | undefined;
  const isLoginRequest = config?.url?.includes('/login');
  const isRefreshRequest = config?.url?.includes('/refresh');
  const isSetPasswordRequest = config?.url?.includes('/set-password');

  // Handle login-specific errors
  if (isLoginRequest && error.response?.status === 401) {
    const resData = error.response.data as {
      message?: string;
      error?: string;
      messages?: string[];
      statusCode?: number;
    };
    let message: React.ReactNode = ERROR_MESSAGES.LOGIN_FAILED;

    if (
      resData.message === 'User is banned' ||
      resData.messages?.includes('User is banned') ||
      resData.error === 'User is banned'
    ) {
      message = (
        <>
          {ERROR_MESSAGES.USER_BANNED} <SupportEmail />
        </>
      );
      store.dispatch(clearNotifications());
      store.dispatch(addNotification({ message, type: 'error', duration: 6000 }));
      return Promise.reject(error);
    }
  }

  // Handle 401 Unauthorized errors for non-login/refresh requests
  if (
    error.response?.status === 401 &&
    !config?._retry &&
    !isLoginRequest &&
    !isRefreshRequest &&
    config
  ) {
    config._retry = true;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const result = await store.dispatch(refreshTokens()).unwrap();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${result.accessToken}`;
        return api(config);
      } catch (refreshError: any) {
        retryCount++;
        if (retryCount >= maxRetries) {
          let message: React.ReactNode;
          const errorMessage = refreshError.message || ERROR_MESSAGES.TOKEN_REFRESH_FAILED;

          if (errorMessage.includes('Missing refresh token or deviceId')) {
            message = ERROR_MESSAGES.MISSING_TOKEN;
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message);
          } else if (errorMessage.includes('User has been banned')) {
            message = (
              <>
                {ERROR_MESSAGES.USER_BANNED} <SupportEmail />
              </>
            );
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message, true);
          } else if (errorMessage.includes('Invalid refresh token')) {
            message = ERROR_MESSAGES.INVALID_REFRESH_TOKEN;
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message);
          } else {
            message = ERROR_MESSAGES.SESSION_EXPIRED;
            await handleSessionError(message);
          }
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }
  }

  let message: React.ReactNode = ERROR_MESSAGES.SERVER_ERROR;

  if (error.response) {
    const resData = error.response.data as {
      message?: string;
      error?: string;
      messages?: string[];
      statusCode?: number;
    };

    // Handle 400 Bad Request for set-password
    if (
      error.response.status === 400 &&
      isSetPasswordRequest &&
      (resData.message?.includes('Password must be') ||
        resData.messages?.some(msg => msg.includes('Password must be')))
    ) {
      message = ERROR_MESSAGES.INVALID_PASSWORD;
    }
    // Handle 401 for banned/inactive users
    else if (
      error.response.status === 401 &&
      (resData.message === 'User has been banned or is inactive' ||
        resData.messages?.includes('User has been banned or is inactive'))
    ) {
      message = (
        <>
          {ERROR_MESSAGES.USER_BANNED} <SupportEmail />
        </>
      );
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('deviceId');
      await handleSessionError(message, true);
    }
    // Handle 403 Forbidden
    else if (error.response.status === 403) {
      if (
        resData.message?.includes('You can only delete comments') ||
        resData.messages?.includes('You can only delete comments')
      ) {
        message = resData.message || resData.messages?.[0];
      } else if (
        resData.message === 'User is banned' ||
        resData.error === 'User is banned' ||
        resData.messages?.includes('User is banned') ||
        resData.message === 'Forbidden' ||
        resData.error === 'Forbidden'
      ) {
        message = (
          <>
            {ERROR_MESSAGES.USER_BANNED} <SupportEmail />
          </>
        );
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('deviceId');
        await handleSessionError(message, true);
      } else {
        message = ERROR_MESSAGES.ACCESS_DENIED;
      }
    }
    // Generic error handling
    else {
      message =
        resData.message ||
        resData.error ||
        resData.messages?.[0] ||
        ERROR_MESSAGES.SERVER_ERROR;
    }
  } else if (error.request) {
    message = ERROR_MESSAGES.SERVER_ERROR;
  }

  store.dispatch(clearNotifications());
  store.dispatch(addNotification({ message, type: 'error', duration: 6000 }));
  return Promise.reject(error);
};