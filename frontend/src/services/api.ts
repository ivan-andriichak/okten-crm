import axios from 'axios';
import { handleApiError } from './interceptors';

export const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.response.use(response => response, handleApiError);
