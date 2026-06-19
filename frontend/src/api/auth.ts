import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach the login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'employer' | 'employee';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Register a new user
export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// Login an existing user
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const updateProfile = async (fullName: string): Promise<{ message: string; user: AuthUser }> => {
  const response = await api.patch<{ message: string; user: AuthUser }>('/auth/profile', { fullName });
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.patch<{ message: string }>('/auth/password', data);
  return response.data;
};

export default api;