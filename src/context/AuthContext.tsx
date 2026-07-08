import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppUser } from '../data/types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  page: 'login' | 'signup';
  setPage: (p: 'login' | 'signup') => void;
  login: (role?: 'manager' | 'viewer') => void;
  logout: () => void;
  updateUser: (changes: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MANAGER_USER: AppUser = {
  id: 'st2',
  name: 'Bryce Parry',
  email: 'bparry@udel.edu',
  role: 'manager',
  isLead: false,
  assignedSports: ["Basketball, Men's", "Basketball, Women's", 'Baseball', "Tennis, Men's", "Tennis, Women's"],
};

const VIEWER_USER: AppUser = {
  id: 'viewer-1',
  name: 'Coach Demo',
  email: 'demo@udel.edu',
  role: 'viewer',
  isLead: false,
  assignedSports: ["Basketball, Men's", "Basketball, Women's", 'Baseball'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading] = useState(false);
  const [page, setPage] = useState<'login' | 'signup'>('login');

  function login(role: 'manager' | 'viewer' = 'manager') {
    setUser(role === 'manager' ? MANAGER_USER : VIEWER_USER);
    setPage('login');
  }

  function logout() {
    setUser(null);
    setPage('login');
  }

  function updateUser(changes: Partial<AppUser>) {
    setUser((prev) => (prev ? { ...prev, ...changes } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, page, setPage, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
