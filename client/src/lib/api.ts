import { Book, LoginData, RegisterData, User, AuthResponse } from "@/types";

const API_URL = "http://localhost:8080/api";

// Helper for handling responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  
  return data;
};

// Authentication functions
export const register = async (userData: RegisterData): Promise<{ message: string, userId: string }> => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  
  return handleResponse(response);
};

// Books API
export const getAllBooks = async (filters?: { title?: string; location?: string; genre?: string }): Promise<Book[]> => {
  let url = `${API_URL}/books`;
  
  if (filters) {
    const params = new URLSearchParams();
    if (filters.title) params.append("title", filters.title);
    if (filters.location) params.append("location", filters.location);
    if (filters.genre) params.append("genre", filters.genre);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await fetch(url);
  return handleResponse(response);
};

export const getBookById = async (id: string): Promise<Book> => {
  const response = await fetch(`${API_URL}/books/${id}`);
  return handleResponse(response);
};

export const createBook = async (bookData: Omit<Book, "id" | "ownerId" | "status">, email: string, password: string): Promise<Book> => {
  const token = btoa(`${email}:${password}`); 
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${token}`, 
    },
    body: JSON.stringify(bookData),
  });
  return handleResponse(response);
};
export const updateBook = async (id: string, bookData: Partial<Book>, token: string): Promise<Book> => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${token}`,
    },
    body: JSON.stringify(bookData),
  });
  
  return handleResponse(response);
};

export const deleteBook = async (id: string, token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Basic ${token}`,
    },
  });
  
  return handleResponse(response);
};

// User API
export const getUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      "Authorization": `Basic ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const updateUserProfile = async (userData: { name?: string; mobileNumber?: string }, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${token}`,
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};