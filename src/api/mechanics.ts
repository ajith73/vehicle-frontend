import { apiClient } from './apiClient';
import type { Mechanic, UpdateRequest } from '../types';

export const getMechanics = () => apiClient<Mechanic[]>('/admin/mechanics');
export const getMechanicById = (id: number) => apiClient<Mechanic>(`/admin/mechanics/${id}`);
export const createMechanic = (data: any) => apiClient<Mechanic>('/admin/mechanics', { method: 'POST', data });
export const updateMechanic = (id: number, data: any) => apiClient<{ message: string }>((`/admin/mechanics/${id}`), { method: 'PUT', data });
export const bulkUpdateMechanicsStatus = (ids: number[], status: string) => apiClient<{ message: string }>('/admin/mechanics/bulk/status', { method: 'PUT', data: { ids, status } });
export const deleteMechanic = (id: number) => apiClient<{ message: string }>((`/admin/mechanics/${id}`), { method: 'DELETE' });
export const approveMechanic = (id: number) => apiClient<{ message: string }>((`/admin/mechanics/${id}/approve`), { method: 'POST' });

export const getUpdateRequests = () => apiClient<UpdateRequest[]>('/admin/update-requests');
export const deleteUpdateRequest = (id: number) => apiClient<{ message: string }>((`/admin/update-requests/${id}`), { method: 'DELETE' });
export const approveUpdateRequest = (id: number) => apiClient<{ message: string }>((`/admin/update-requests/${id}/approve`), { method: 'POST' });
export const rejectUpdateRequest = (id: number) => apiClient<{ message: string }>((`/admin/update-requests/${id}/reject`), { method: 'POST' });

// Public mechanics API
export const getPublicMechanics = (searchParams: URLSearchParams) => apiClient<Mechanic[]>(`/public/mechanics?${searchParams.toString()}`);
export const submitMechanicRegistration = (data: any) => apiClient<{ message: string }>('/public/mechanics/register', { method: 'POST', data });
