import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirebaseError } from '../lib/firebase';

// Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'psychologist' | 'admin';
  isVerified: boolean;
  createdAt: any;
  updatedAt: any;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    dailyReminder: boolean;
    reminderTime?: string;
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    bio?: string;
    phone?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: 'user' | 'psychologist') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData: any = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();

      try {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: displayName || additionalData.displayName || '',
          email,
          photoURL: photoURL || additionalData.photoURL || '',
          role: additionalData.role || 'user',
          isVerified: user.emailVerified,
          createdAt,
          updatedAt: createdAt,
          preferences: {
            notifications: true,
            theme: 'auto',
            language: 'es',
            dailyReminder: true,
            reminderTime: '20:00',
            ...additionalData.preferences
          },
          profile: {
            firstName: additionalData.firstName || '',
            lastName: additionalData.lastName || '',
            ...additionalData.profile
          }
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'user' | 'psychologist' = 'user'
  ) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      await createUserProfile(result.user, { 
        displayName, 
        role,
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' ')
      });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Refresh user profile
      await refreshUserProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Send verification email error:', error);
      throw new Error(handleFirebaseError(error));
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(handleFirebaseError(error));
    }
  };

  // Refresh user profile from Firestore
  const refreshUserProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const profileData = userSnap.data() as UserProfile;
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Refresh user profile error:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await refreshUserProfile();
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    updateUserProfile,
    sendVerificationEmail,
    resetPassword,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
