import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'psychologist';
  username?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'psychologist') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Intentar cargar el perfil del usuario desde Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userDataWithAuth: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: userData.displayName || firebaseUser.displayName,
              username: userData.username,
              role: userData.role || 'user',
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            };
            setUser(userDataWithAuth);
          } else {
            // Si no existe el documento, crear uno básico
            const basicUserData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: 'user',
            };
            setUser(basicUserData);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // En caso de error, usar datos básicos de Firebase Auth
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: 'user',
          };
          setUser(userData);
        }
      } else {
        // Usuario no autenticado
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, role: 'user' | 'psychologist' = 'user') => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Crear perfil del usuario en Firestore
      const userData = {
        email: email,
        displayName: email.split('@')[0],
        username: email.split('@')[0],
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Si es psicólogo, también crear en la colección de psicólogos
      if (role === 'psychologist') {
        const psychologistData = {
          uid: userCredential.user.uid,
          email: email,
          displayName: email.split('@')[0],
          role: 'psychologist',
          licenseNumber: '',
          specialization: '',
          yearsOfExperience: 0,
          bio: '',
          rating: 0,
          patientsCount: 0,
          isAvailable: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'psychologists', userCredential.user.uid), psychologistData);
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);

      // Actualizar en Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Actualizar el estado local
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
