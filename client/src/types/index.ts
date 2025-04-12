export type User = {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    role: "owner" | "seeker";
  };
  
  export type Book = {
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
  
  export type AuthResponse = {
    message: string;
    user: User;
  };
  
  export type RegisterData = {
    name: string;
    email: string;
    password: string;
    mobileNumber: string;
    role: "owner" | "seeker";
  };
  
  export type LoginData = {
    email: string;
    password: string;
  };