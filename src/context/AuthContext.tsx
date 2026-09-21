import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppUser, Sport } from '../data/types';
import { usePersistentState } from '../hooks/usePersistentState';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball', 'Football',
];

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  page: 'login' | 'signup';
  setPage: (p: 'login' | 'signup') => void;
  login: (role?: 'manager' | 'student_manager' | 'viewer') => void;
  logout: () => void;
  updateUser: (changes: Partial<AppUser>) => void;
  /** Demo-only: swap the signed-in identity between the head manager and student
   *  manager personas without logging out, so a presenter can flip views live. */
  switchDemoRole: (role: 'manager' | 'student_manager') => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MANAGER_USER: AppUser = {
  id: 'st2',
  name: 'Peter Stevens',
  email: 'pstevens@udel.edu',
  role: 'manager',
  isLead: true,
  assignedSports: ALL_SPORTS,
};

const STUDENT_MANAGER_USER: AppUser = {
  id: 'st6',
  name: 'Taylor Reed',
  email: 'treed@udel.edu',
  role: 'student_manager',
  isLead: true,
  assignedSports: ALL_SPORTS,
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
  // Public demo link (for now): anyone opening the app lands signed in as the
  // head manager with full access, instead of hitting the login screen first.
  // Revert this default to `null` to restore normal gated login.
  const [user, setUser] = usePersistentState<AppUser | null>('session', () => MANAGER_USER);
  const [isLoading] = useState(false);
  const [page, setPage] = useState<'login' | 'signup'>('login');

  function login(role: 'manager' | 'student_manager' | 'viewer' = 'manager') {
    setUser(role === 'manager' ? MANAGER_USER : role === 'student_manager' ? STUDENT_MANAGER_USER : VIEWER_USER);
    setPage('login');
  }

  function logout() {
    setUser(null);
    setPage('login');
  }

  function updateUser(changes: Partial<AppUser>) {
    setUser((prev) => (prev ? { ...prev, ...changes } : prev));
  }

  function switchDemoRole(role: 'manager' | 'student_manager') {
    setUser(role === 'manager' ? MANAGER_USER : STUDENT_MANAGER_USER);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, page, setPage, login, logout, updateUser, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
