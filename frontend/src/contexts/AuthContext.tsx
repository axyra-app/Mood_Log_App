import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { captureError, clearUserContext, setUserContext } from '../lib/sentry';

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
  loginWithGoogle: () => Promise<void>;
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      captureError(error as Error, { action: 'login', email });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('Starting user registration for:', userData.email);
      
      // Create user in Firebase Authentication
      const { user } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      console.log('User created in Auth with UID:', user.uid);

      // Create user profile in Firestore
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

      console.log('Creating user profile in Firestore:', profile);
      await setDoc(doc(db, 'users', user.uid), profile);
      console.log('User profile created successfully in Firestore');
      
    } catch (error) {
      console.error('Registration error:', error);
      captureError(error as Error, { action: 'register', email: userData.email });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google authentication...');
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Google authentication successful for:', user.email);
      console.log('User UID:', user.uid);
      
      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('User profile not found, creating basic profile...');
        
        // Create basic user profile from Google data (incomplete)
        const basicProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'Usuario',
          role: 'user', // Default role for Google sign-in
          phone: user.phoneNumber || '',
          birthDate: '',
          gender: '',
          createdAt: new Date(),
        };
        
        console.log('Creating basic user profile in Firestore:', basicProfile);
        await setDoc(userDocRef, basicProfile);
        console.log('Basic user profile created successfully in Firestore');
        
        // Don't set userProfile here - let the app redirect to complete profile
        setUserProfile(null);
      } else {
        console.log('User profile already exists in Firestore');
        const existingProfile = userDoc.data() as UserProfile;
        setUserProfile(existingProfile);
      }
      
    } catch (error) {
      console.error('Google authentication error:', error);
      captureError(error as Error, { action: 'google_login' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      clearUserContext();
    } catch (error) {
      captureError(error as Error, { action: 'logout' });
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
            setUserContext({
              id: user.uid,
              email: user.email || '',
              name: profile.name,
            });
          } else {
            console.warn('User document not found for uid:', user.uid);
            
            // Try to create a basic user profile for existing authenticated users
            try {
              console.log('Attempting to create user profile for existing auth user...');
              const basicProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                name: user.displayName || user.email?.split('@')[0] || 'Usuario',
                role: 'user', // Default role
                phone: user.phoneNumber || '',
                birthDate: '',
                gender: '',
                createdAt: new Date(),
              };
              
              await setDoc(userDocRef, basicProfile);
              console.log('Basic user profile created successfully');
              setUserProfile(basicProfile);
              setUserContext({
                id: user.uid,
                email: user.email || '',
                name: basicProfile.name,
              });
            } catch (createError) {
              console.error('Error creating basic user profile:', createError);
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          captureError(error as Error, { action: 'fetchUserProfile', uid: user.uid });
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        clearUserContext();
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
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
