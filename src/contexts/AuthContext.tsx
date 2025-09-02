import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'psychologist';
  phone?: string;
  birthDate?: string;
  gender?: string;
  licenseNumber?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'psychologist';
  phone?: string;
  birthDate?: string;
  gender?: string;
  licenseNumber?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (userData: RegisterData) => {
    const { user } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

    const profile: UserProfile = {
      uid: user.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      birthDate: userData.birthDate,
      gender: userData.gender,
      licenseNumber: userData.licenseNumber,
      specialization: userData.specialization,
      experience: userData.experience,
      bio: userData.bio,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
