// src/types/index.ts

// User related types
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  address: string;
  role: "owner" | "seeker";
};

// Book related types
export type Book = {
  coverColor: string;
  id: string;
  title: string;
  author: string;
  genre: string;
  location: string;
  contactInfo: string;
  ownerId: string;
  status: "available" | "rented";
  imageUrl?: string;
};

// API response types
export type AuthResponse = {
  message: string;
  user: User;
};

export type BookResponse = {
  message: string;
  book: Book;
};

export type BooksResponse = {
  books: Book[];
};

export type ErrorResponse = {
  error: string;
};

// Form data types for different operations
export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "owner" | "seeker";
  mobileNumber?: string;
  address?: string;
};

export type BookFormData = {
  title: string;
  author: string;
  genre: string;
  location: string;
  contactInfo: string;
  status: "available" | "rented";
  imageUrl?: string;
};

export type ProfileUpdateFormData = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  mobileNumber?: string;
  address?: string;
};

// Search parameters
export type BookSearchParams = {
  q?: string;
  location?: string;
  genre?: string;
};