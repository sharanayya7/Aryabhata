import { createContext, useState, ReactNode, useMemo } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  streakDays?: number;
  totalStudyMinutes?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const authValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login: (userData: User) => setUser(userData),
    logout: () => setUser(null),
  }), [user]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
