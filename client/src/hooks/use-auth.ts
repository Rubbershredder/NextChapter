import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LoginData, RegisterData } from "@/types";
import { login, register } from "@/lib/api";
import { saveUserData, getUserData, clearUserData, createAuthToken } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user data on initial render
  useEffect(() => {
    const { user, token } = getUserData();
    setUser(user);
    setToken(token);
    setLoading(false);
  }, []);

  // Login function
  const handleLogin = async (credentials: LoginData) => {
    setLoading(true);
    try {
      const authResponse = await login(credentials);
      const token = createAuthToken(credentials.email, credentials.password);
      
      saveUserData(authResponse.user, token);
      setUser(authResponse.user);
      setToken(token);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const handleRegister = async (userData: RegisterData) => {
    setLoading(true);
    try {
      await register(userData);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    clearUserData();
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isOwner: !!user && user.role === "owner",
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}