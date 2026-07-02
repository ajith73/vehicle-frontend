import { apiClient } from './apiClient';
import type { Feedback, Donation } from '../types';

export const getFeedback = () => apiClient<Feedback[]>('/admin/feedback');

// IMPORTANT: Fix for the PUT 404 Bug
// The route expects PUT /api/admin/feedback/:id, the payload requires { status }
export const updateFeedbackStatus = (id: number, status: string) => 
  apiClient<{ message: string }>(`/admin/feedback/${id}`, { method: 'PUT', data: { status } });

export const deleteFeedback = (id: number) => 
  apiClient<{ message: string }>(`/admin/feedback/${id}`, { method: 'DELETE' });

export const getDonations = () => apiClient<Donation[]>('/admin/donations');

// Public endpoints
export const submitFeedback = (data: any) => apiClient<{ message: string }>('/public/feedback', { method: 'POST', data });
export const submitDonation = (data: any) => apiClient<{ message: string }>('/public/donations', { method: 'POST', data });
