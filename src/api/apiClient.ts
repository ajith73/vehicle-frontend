import axios, { type AxiosRequestConfig } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }
  
  const errorMsg = error.response?.data?.error || error.message || 'An error occurred';
  error.message = errorMsg;
  
  return Promise.reject(error);
});

interface FetchOptions {
  method?: string;
  data?: any;
  headers?: any;
  params?: any;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const config: AxiosRequestConfig = {
    url: endpoint,
    method: options.method || 'GET',
    data: options.data,
    headers: options.headers,
    params: options.params,
  };
  
  const response = await axiosInstance(config);
  return response.data;
}
