// src/lib/api.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Generic request function with error handling
const request = async <T>(
  method: string, 
  url: string, 
  data?: unknown, 
  params?: unknown
): Promise<T> => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract the error message from the response
      const errorMessage = error.response.data?.error || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// API methods
export const api = {
  get: <T>(url: string, params?: unknown): Promise<T> => 
    request<T>('GET', url, undefined, params),
  
  post: <T>(url: string, data?: unknown): Promise<T> => 
    request<T>('POST', url, data),
  
  put: <T>(url: string, data?: unknown): Promise<T> => 
    request<T>('PUT', url, data),
  
  patch: <T>(url: string, data?: unknown): Promise<T> => 
    request<T>('PATCH', url, data),
  
  delete: <T>(url: string): Promise<T> => 
    request<T>('DELETE', url),
};

export default api;