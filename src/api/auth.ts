import { apiClient } from './apiClient';
import type { User } from '../types';

export const login = (data: any) => apiClient<{ token: string, user: User }>('/auth/login', { method: 'POST', data });

export const getProfile = () => apiClient<User>('/admin/profile');
export const updateProfile = (data: any) => apiClient<{ message: string }>('/admin/profile', { method: 'PUT', data });

export const getUsers = () => apiClient<User[]>('/admin/users');
export const createUser = (data: any) => apiClient<{ message: string, user: User }>('/admin/users', { method: 'POST', data });
export const updateUser = (id: number, data: any) => apiClient<{ message: string }>((`/admin/users/${id}`), { method: 'PUT', data });
export const deleteUser = (id: number) => apiClient<{ message: string }>((`/admin/users/${id}`), { method: 'DELETE' });

export const getDashboardStats = () => apiClient<any>('/admin/dashboard');
export const getActivityLogs = () => apiClient<any[]>('/admin/activity-logs');
