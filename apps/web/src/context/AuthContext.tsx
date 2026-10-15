import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local session
    const stored = localStorage.getItem('researchsphere_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    } else {
      // Default initial researcher profile
      const defaultUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'researcher@researchsphere.ai',
        displayName: 'Lead AI Researcher',
        role: 'researcher'
      };
      setUser(defaultUser);
      localStorage.setItem('researchsphere_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    const loggedUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email,
      displayName: email.split('@')[0],
      role: 'researcher'
    };
    setUser(loggedUser);
    localStorage.setItem('researchsphere_user', JSON.stringify(loggedUser));
  };

  const signup = async (email: string, _password?: string, displayName?: string) => {
    const newUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email,
      displayName: displayName || email.split('@')[0],
      role: 'researcher'
    };
    setUser(newUser);
    localStorage.setItem('researchsphere_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('researchsphere_user');
    localStorage.removeItem('researchsphere_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
