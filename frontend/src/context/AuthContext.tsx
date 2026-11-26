import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from '../api/client';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loginAsGuest: () => void;
  setUserProfile: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('cineforge_guest_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
        return;
      }
      const response = await apiClient.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      const savedUser = localStorage.getItem('cineforge_guest_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-director-1',
      googleId: 'guest-id',
      email: 'director@cineforge.io',
      name: 'Guest Director',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=director',
      role: 'user',
    };
    localStorage.setItem('cineforge_guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const setUserProfile = (u: User) => {
    localStorage.setItem('cineforge_guest_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    localStorage.removeItem('cineforge_guest_user');
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth, loginAsGuest, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
