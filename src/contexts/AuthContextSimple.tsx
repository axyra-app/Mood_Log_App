import React, { ReactNode, createContext, useContext, useState } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, additionalData?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, additionalData?: any) => {
    setLoading(true);
    try {
      // Simular registro exitoso
      const newUser: User = {
        uid: 'demo-user-id',
        email: email,
        displayName: additionalData?.displayName || null
      };
      setUser(newUser);
      console.log('✅ Usuario registrado (modo demo):', newUser);
    } catch (error: any) {
      throw new Error('Error en el registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simular login exitoso
      const loggedUser: User = {
        uid: 'demo-user-id',
        email: email,
        displayName: 'Usuario Demo'
      };
      setUser(loggedUser);
      console.log('✅ Usuario autenticado (modo demo):', loggedUser);
    } catch (error: any) {
      throw new Error('Error en el login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Simular login con Google
      const googleUser: User = {
        uid: 'demo-google-user-id',
        email: 'demo@google.com',
        displayName: 'Usuario Google Demo'
      };
      setUser(googleUser);
      console.log('✅ Usuario autenticado con Google (modo demo):', googleUser);
    } catch (error: any) {
      throw new Error('Error en el login con Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      console.log('✅ Usuario deslogueado (modo demo)');
    } catch (error: any) {
      throw new Error('Error en el logout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
