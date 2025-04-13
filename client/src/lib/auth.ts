// src/lib/auth.ts
import { api } from './api';
import { User, AuthResponse } from '../types';

// Current user state
let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Auth service functions
export const authService = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: "owner" | "seeker";
    mobileNumber?: string;
    address?: string;
  }): Promise<User> => {
    const response = await api.post<AuthResponse>('/register', userData);
    setCurrentUser(response.user);
    return response.user;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<User> => {
    const response = await api.post<AuthResponse>('/login', credentials);
    setCurrentUser(response.user);
    return response.user;
  },

  logout: async (): Promise<void> => {
    await api.post<{ message: string }>('/logout', {});
    setCurrentUser(null);
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<{ user: User }>('/me');
      setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setCurrentUser(null);
      return null;
    }
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<{ message: string, user: User }>('/me', userData);
    setCurrentUser(response.user);
    return response.user;
  },
};

export default authService;