import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

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
    console.log('AuthProvider: Setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthProvider: Auth state changed', firebaseUser);
      
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'user' // Default role
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: signIn called', email);
    // Placeholder - implement actual sign in
  };

  const signUp = async (email: string, password: string, role: 'user' | 'psychologist' = 'user') => {
    console.log('AuthProvider: signUp called', email, role);
    // Placeholder - implement actual sign up
  };

  const signInWithGoogle = async () => {
    console.log('AuthProvider: signInWithGoogle called');
    // Placeholder - implement actual Google sign in
  };

  const logout = async () => {
    console.log('AuthProvider: logout called');
    // Placeholder - implement actual logout
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  console.log('AuthProvider: Rendering with state', { user, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
