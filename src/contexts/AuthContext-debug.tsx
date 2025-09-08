import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'psychologist';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'psychologist') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Simular login exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));
      const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUser({
        uid: uniqueId,
        email: email,
        displayName: email.split('@')[0],
        role: 'user'
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, role: 'user' | 'psychologist' = 'user') => {
    try {
      // Simular registro exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));
      const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUser({
        uid: uniqueId,
        email: email,
        displayName: email.split('@')[0],
        role: role
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Simular login con Google
      await new Promise(resolve => setTimeout(resolve, 1000));
      const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUser({
        uid: uniqueId,
        email: 'usuario@gmail.com',
        displayName: 'Usuario',
        role: 'user'
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
