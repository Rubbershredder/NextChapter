import { User } from "@/types";

// Function to create Basic Auth token
export const createAuthToken = (email: string, password: string): string => {
  return btoa(`${email}:${password}`);
};

// Local storage keys
const USER_KEY = "nextchapter_user";
const TOKEN_KEY = "nextchapter_token";

// Save user data to local storage
export const saveUserData = (user: User, token: string): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

// Get user data from local storage
export const getUserData = (): { user: User | null; token: string | null } => {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  
  const userStr = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY);
  
  const user = userStr ? JSON.parse(userStr) : null;
  
  return { user, token };
};

// Clear user data (logout)
export const clearUserData = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { user, token } = getUserData();
  return !!user && !!token;
};

// Check if user is an owner
export const isOwner = (): boolean => {
  const { user } = getUserData();
  return !!user && user.role === "owner";
};