import { apiRequest } from './api';
import { User } from '../types';

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function loginApi(email: string, password: string): Promise<AuthResponseData> {
  const res = await apiRequest<{ success: boolean; data: AuthResponseData }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true
  });
  return res.data;
}

export async function demoLoginApi(): Promise<AuthResponseData> {
  const res = await apiRequest<{ success: boolean; data: AuthResponseData }>('/api/auth/demo-login', {
    method: 'POST',
    skipAuth: true
  });
  return res.data;
}

export async function registerApi(email: string, password: string, name?: string): Promise<AuthResponseData> {
  const res = await apiRequest<{ success: boolean; data: AuthResponseData }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
    skipAuth: true
  });
  return res.data;
}

export async function logoutApi(refreshToken?: string): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  } catch (err) {
    // Ignore network error on logout
  }
}

export async function getProfileApi(): Promise<User> {
  const res = await apiRequest<{ success: boolean; data: User }>('/api/auth/me');
  return res.data;
}
