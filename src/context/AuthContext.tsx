'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from './ToastContext';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    role: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const fetchSessionUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionUser();
  }, [fetchSessionUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Login failed', 'error');
        return false;
      }

      setUser(json.data.user);
      showToast(`Welcome back, ${json.data.user.name}!`, 'success');
      router.push(json.data.redirectTo || '/dashboard');
      return true;
    } catch (e) {
      showToast('Network error during authentication attempt', 'error');
      return false;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    role: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Registration failed', 'error');
        return false;
      }

      setUser(json.data.user);
      showToast('Account registered successfully!', 'success');
      router.push(json.data.redirectTo || '/dashboard');
      return true;
    } catch (e) {
      showToast('Network error during registration', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      setUser(null);
      showToast('Logged out of session', 'info');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
