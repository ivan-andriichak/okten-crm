import axios from 'axios';
import { store } from '../store';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { auth } = store.getState();
      try {
        const response = await axios.post('http://localhost:3001/refresh', {}, {
          headers: { Authorization: `Bearer ${auth.refreshToken}` },
        });
        store.dispatch({ type: 'auth/setTokens', payload: response.data });
        error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(error.config);
      } catch (refreshError) {
        store.dispatch({ type: 'auth/logout' });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export { api };