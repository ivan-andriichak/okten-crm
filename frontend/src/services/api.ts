import axios from 'axios';
import { handleApiError } from './interceptors';

const isProduction = import.meta.env.MODE === 'production';
const baseURL = isProduction ? '/api' : 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
});
// ________________________________________________________

// import axios from 'axios';
// import { handleApiError } from './interceptors';
//
// export const api = axios.create({
//   baseURL: '/api',
// });
//
// export const BASE_URL = '/api';

api.interceptors.response.use(response => response, handleApiError);