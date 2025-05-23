import { InternalAxiosRequestConfig } from 'axios';

export interface AxiosRequestConfigWithRetry
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
