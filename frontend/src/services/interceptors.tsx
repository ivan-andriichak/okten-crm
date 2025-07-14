import { AxiosError } from 'axios';
import {
  addNotification,
  clearNotifications,
  logout,
  refreshTokens,
  store,
} from '../store';
import { AxiosRequestConfigWithRetry } from './types';
import { ERROR_MESSAGES, NOTIFICATION_TYPES } from '../constants/error-messages';
import { api } from './api';

// Handles session-related errors such as expired tokens or banned/inactive users
const handleSessionError = async (
  message: string,
  notificationType: keyof typeof NOTIFICATION_TYPES = NOTIFICATION_TYPES.STANDARD,
  isBanned: boolean = false,
): Promise<never> => {
  store.dispatch(logout());
  store.dispatch(clearNotifications());
  store.dispatch(
    addNotification({
      message,
      type: 'error',
      duration: 6000,
      notificationType,
    }),
  );
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
    let message = ERROR_MESSAGES.LOGIN_FAILED;
    let notificationType: keyof typeof NOTIFICATION_TYPES = NOTIFICATION_TYPES.STANDARD;

    if (
      resData.message === 'User is banned' ||
      resData.messages?.includes('User is banned') ||
      resData.error === 'User is banned'
    ) {
      message = ERROR_MESSAGES.USER_BANNED;
      notificationType = NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL;
    } else if (
      resData.message === 'Invalid credentials or inactive user' ||
      resData.messages?.includes('Invalid credentials ')
    ) {
      message = ERROR_MESSAGES.INACTIVE_USER;
    }

    store.dispatch(clearNotifications());
    store.dispatch(
      addNotification({ message, type: 'error', duration: 6000, notificationType }),
    );
    return Promise.reject(error);
  }

  // Handle 400 Bad Request (validation errors)
  if (error.response?.status === 400) {
    const resData = error.response.data as
      | { message?: string; error?: string; messages?: string[]; statusCode?: number }
      | Array<{ property: string; constraints: Record<string, string> }>;

    let message = ERROR_MESSAGES.SERVER_ERROR;
    let notificationType: keyof typeof NOTIFICATION_TYPES = NOTIFICATION_TYPES.STANDARD;

    if (Array.isArray(resData)) {
      // Handle NestJS validation errors
      message = resData
        .map(err => {
          if (err.constraints) {
            return Object.values(err.constraints).join('; ');
          }
          return '';
        })
        .filter(Boolean)
        .join('; ');
    } else if (
      isSetPasswordRequest &&
      (resData.message?.includes('Password must be') ||
        resData.messages?.some(msg => msg.includes('Password must be')))
    ) {
      message = ERROR_MESSAGES.INVALID_PASSWORD;
    } else {
      message =
        resData.message ??
        resData.error ??
        resData.messages?.[0] ??
        ERROR_MESSAGES.SERVER_ERROR;
    }

    store.dispatch(clearNotifications());
    store.dispatch(
      addNotification({ message, type: 'error', duration: 6000, notificationType }),
    );
    return Promise.reject(error);
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
    const maxRetries = 1;

    while (retryCount < maxRetries) {
      try {
        const result = await store.dispatch(refreshTokens()).unwrap();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${result.accessToken}`;
        return api(config);
      } catch (refreshError: any) {
        retryCount++;
        if (retryCount >= maxRetries) {
          let message = ERROR_MESSAGES.TOKEN_REFRESH_FAILED;
          let notificationType: keyof typeof NOTIFICATION_TYPES = NOTIFICATION_TYPES.STANDARD;

          if (refreshError.message?.includes('Missing refresh token or deviceId')) {
            message = ERROR_MESSAGES.MISSING_TOKEN;
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message, NOTIFICATION_TYPES.STANDARD);
          } else if (refreshError.message?.includes('User has been banned')) {
            message = ERROR_MESSAGES.USER_BANNED;
            notificationType = NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL;
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message, notificationType, true);
          } else if (refreshError.message?.includes('Invalid refresh token')) {
            message = ERROR_MESSAGES.INVALID_REFRESH_TOKEN;
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message, NOTIFICATION_TYPES.STANDARD);
          } else {
            message = ERROR_MESSAGES.SESSION_EXPIRED;
            await handleSessionError(message, NOTIFICATION_TYPES.STANDARD);
          }
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    const resData = error.response.data as {
      message?: string;
      error?: string;
      messages?: string[];
      statusCode?: number;
    };
    let message = ERROR_MESSAGES.SERVER_ERROR;
    let notificationType: keyof typeof NOTIFICATION_TYPES = NOTIFICATION_TYPES.STANDARD;

    if (
      resData.message?.includes('You can only delete comments') ||
      resData.messages?.includes('You can only delete comments')
    ) {
      message = resData.message ?? resData.messages?.[0] ?? ERROR_MESSAGES.SERVER_ERROR;
    } else if (
      resData.message === 'User is banned' ||
      resData.error === 'User is banned' ||
      resData.messages?.includes('User is banned') ||
      resData.message === 'Forbidden' ||
      resData.error === 'Forbidden'
    ) {
      message = ERROR_MESSAGES.USER_BANNED;
      notificationType = NOTIFICATION_TYPES.WITH_SUPPORT_EMAIL;
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('deviceId');
      await handleSessionError(message, notificationType, true);
    } else {
      message = ERROR_MESSAGES.ACCESS_DENIED;
    }

    store.dispatch(clearNotifications());
    store.dispatch(
      addNotification({ message, type: 'error', duration: 6000, notificationType }),
    );
    return Promise.reject(error);
  }

  // Generic error handling
  let message = ERROR_MESSAGES.SERVER_ERROR;
  let notificationType: keyof typeof NOTIFICATION_TYPES = NOTIFICATION_TYPES.STANDARD;
  if (error.response) {
    const resData = error.response.data as {
      message?: string;
      error?: string;
      messages?: string[];
      statusCode?: number;
    };
    message =
      resData.message ??
      resData.error ??
      resData.messages?.[0] ??
      ERROR_MESSAGES.SERVER_ERROR;
  } else if (error.request) {
    message = ERROR_MESSAGES.SERVER_ERROR;
  }

  store.dispatch(clearNotifications());
  store.dispatch(
    addNotification({ message, type: 'error', duration: 6000, notificationType }),
  );
  return Promise.reject(error);
};