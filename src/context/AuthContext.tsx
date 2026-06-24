import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppUser } from '../data/types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock user for local development — matches the "Bryce Parry" account from mock staff data
const MOCK_USER: AppUser = {
  id: 'st2',
  name: 'Bryce Parry',
  email: 'bparry@udel.edu',
  assignedSports: [
    "Basketball, Men's",
    "Basketball, Women's",
    'Baseball',
    "Tennis, Men's",
    "Tennis, Women's",
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading] = useState(false);

  function login() {
    setUser(MOCK_USER);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
