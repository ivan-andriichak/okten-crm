
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

// Handles session-related errors such as expired tokens or banned users
const handleSessionError = async (
  message: React.ReactNode,
  isBanned: boolean = false,
): Promise<void> => {
  store.dispatch(logout());
  store.dispatch(clearNotifications());
  store.dispatch(addNotification({ message, type: 'error', duration: 6000 }));

  await new Promise(resolve => setTimeout(resolve, 8000));
  window.location.href = '/login';
  throw new Error(isBanned ? 'BannedError' : 'SessionError');
};

// Main function to handle API request errors
export const handleApiError = async (error: AxiosError): Promise<never> => {
  const config = error.config as AxiosRequestConfigWithRetry | undefined;
  const isLoginRequest = config?.url?.includes('/login');
  const isRefreshRequest = config?.url?.includes('/refresh');
  const isSetPasswordRequest = config?.url?.includes('/set-password');

  // Логування відповіді сервера для діагностики
  console.log('API Error Response:', error.response?.data);

  // Handle 401 Unauthorized errors that are not from login or refresh requests
  if (
    error.response?.status === 401 &&
    !config?._retry &&
    !isLoginRequest &&
    !isRefreshRequest
  ) {
    if (!config) return Promise.reject(error);
    config._retry = true;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
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
        retryCount++;
        if (retryCount >= maxRetries) {
          const errorMessage = refreshError.message || 'Token refresh error';

          let message: React.ReactNode;
          if (errorMessage.includes('Missing refresh token or deviceId')) {
            message = 'Помилка сесії. Будь ласка, увійдіть знову.';
            await handleSessionError(message);
          } else if (errorMessage.includes('User has been banned')) {
            message = (
              <>
                Ваш акаунт заблоковано. Зверніться до підтримки:{' '}
                <SupportEmail />
              </>
            );
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message, true);
          } else if (errorMessage.includes('Invalid refresh token')) {
            message = 'Сесія закінчилася. Будь ласка, увійдіть знову.';
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('deviceId');
            await handleSessionError(message);
          } else {
            message = 'Не вдалося підключитися до сервера. Спробуйте ще раз.';
            store.dispatch(clearNotifications());
            store.dispatch(
              addNotification({ message, type: 'error', duration: 5000 }),
            );
            return Promise.reject(error);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  let message: React.ReactNode = 'Виникла неочікувана помилка';

  if (error.response) {
    const resData = error.response.data as {
      message?: string;
      error?: string;
      messages?: string[];
      statusCode?: number;
    };

    // Handle 400 Bad Request from /admin/set-password
    if (
      error.response.status === 400 &&
      isSetPasswordRequest &&
      (resData.message?.includes('Password must be') ||
        resData.messages?.some(msg => msg.includes('Password must be')))
    ) {
      message = 'Невалідний пароль. Спробуйте ще раз або увійдіть.';
      store.dispatch(clearNotifications());
      store.dispatch(
        addNotification({ message, type: 'error', duration: 6000 }),
      );
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized for banned or inactive users
    if (
      error.response.status === 401 &&
      (resData.message === 'User has been banned or is inactive' ||
        resData.messages?.includes('User has been banned or is inactive'))
    ) {
      message = (
        <>
          Ваш акаунт заблоковано або деактивовано. Зверніться до підтримки:{' '}
          <SupportEmail />
        </>
      );
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('deviceId');
      await handleSessionError(message, true);
    } else if (error.response.status === 403) {
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
            Ваш акаунт заблоковано. Зверніться до підтримки:{' '}
            <SupportEmail />
          </>
        );
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('deviceId');
        await handleSessionError(message, true);
      } else {
        message = 'У вас немає прав для виконання цієї дії.';
      }
      store.dispatch(clearNotifications());
      store.dispatch(
        addNotification({ message, type: 'error', duration: 6000 }),
      );
      return Promise.reject(error);
    } else {
      message =
        resData.message ||
        resData.error ||
        resData.messages?.[0] ||
        `Помилка ${error.response.status}`;
    }
  } else if (error.request) {
    message = 'Немає відповіді від сервера.';
  } else {
    message = error.message || 'Помилка конфігурації запиту.';
  }

  store.dispatch(clearNotifications());
  store.dispatch(addNotification({ message, type: 'error', duration: 6000 }));
  return Promise.reject(error);
};