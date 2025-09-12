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
import { analyticsEvents } from '../services/analytics';
import { auth, db } from '../services/firebase';
import { getAuthErrorMessage, getGoogleSignInErrorMessage, getRegistrationErrorMessage } from '../utils/errorMessages';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'psychologist';
  username?: string;
  createdAt?: any;
  updatedAt?: any;
  // Campos profesionales para psicólogos
  professionalTitle?: string;
  specialization?: string;
  yearsOfExperience?: number;
  bio?: string;
  licenseNumber?: string;
  phone?: string;
  cvUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'psychologist', professionalData?: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
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
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!isMounted) return;

      try {
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
                // Campos profesionales para psicólogos
                professionalTitle: userData.professionalTitle,
                specialization: userData.specialization,
                yearsOfExperience: userData.yearsOfExperience,
                bio: userData.bio,
                licenseNumber: userData.licenseNumber,
                phone: userData.phone,
                cvUrl: userData.cvUrl,
              };

              // Verificar si es un usuario de Google que necesita completar perfil
              const isGoogleUser = firebaseUser.email && userData.username === firebaseUser.email.split('@')[0];
              if (isGoogleUser && (!userData.displayName || !userData.role)) {
                console.log('Google user needs to complete profile');
                // Establecer el usuario con datos básicos para evitar bucle infinito
                const basicUserData: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                  username: firebaseUser.email?.split('@')[0],
                  role: 'user', // Rol por defecto
                };
                if (isMounted) setUser(basicUserData);
              } else {
                if (isMounted) setUser(userDataWithAuth);
              }
            } else {
              // Si no existe el documento, crear uno básico para usuarios de Google
              const basicUserData = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                username: firebaseUser.email?.split('@')[0],
                role: 'user', // Por defecto, se completará en el formulario
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), basicUserData);
                console.log('Perfil básico creado para usuario de Google');
              } catch (error) {
                console.error('Error creando perfil básico:', error);
              }

              // Crear usuario básico para el estado
              const userDataWithAuth: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                username: firebaseUser.email?.split('@')[0],
                role: 'user',
              };
              console.log('Setting Google user state:', userDataWithAuth);
              if (isMounted) setUser(userDataWithAuth);
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
            if (isMounted) setUser(userData);
          }
        } else {
          // Usuario no autenticado
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Trackear login exitoso
      analyticsEvents.userLogin('email');
    } catch (error: any) {
      setLoading(false);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'user' | 'psychologist' = 'user',
    professionalData?: any
  ) => {
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
        // Agregar datos profesionales si existen
        ...(professionalData && {
          professionalTitle: professionalData.professionalTitle,
          specialization: professionalData.specialization,
          yearsOfExperience: professionalData.yearsOfExperience ? parseInt(professionalData.yearsOfExperience) : 0,
          bio: professionalData.bio,
          licenseNumber: professionalData.licenseNumber,
          phone: professionalData.phone,
          cvUrl: professionalData.cvUrl,
        }),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Trackear registro exitoso
      analyticsEvents.userSignUp('email');

      // Si es psicólogo, también crear en la colección de psicólogos
      if (role === 'psychologist') {
        try {
          console.log('Creando perfil de psicólogo...', professionalData);
          const psychologistData = {
            uid: userCredential.user.uid,
            email: email,
            displayName: email.split('@')[0],
            role: 'psychologist',
            licenseNumber: professionalData?.licenseNumber || '',
            specialization: professionalData?.specialization || '',
            yearsOfExperience: professionalData?.yearsOfExperience ? parseInt(professionalData.yearsOfExperience) : 0,
            bio: professionalData?.bio || '',
            phone: professionalData?.phone || '',
            cvUrl: professionalData?.cvUrl || '',
            rating: 0,
            patientsCount: 0,
            isAvailable: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'psychologists', userCredential.user.uid), psychologistData);
          console.log('Perfil de psicólogo creado exitosamente');
        } catch (psychologistError) {
          console.error('Error creando perfil de psicólogo:', psychologistError);
          // No lanzar error aquí para no interrumpir el registro del usuario
        }
      }
    } catch (error: any) {
      setLoading(false);
      // Manejar específicamente el error de email ya existente
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ya existe una cuenta con este email. ¿Quieres iniciar sesión?');
      }
      throw new Error(getRegistrationErrorMessage(error));
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // La lógica de verificación de perfil se maneja en onAuthStateChanged
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setLoading(false);
      throw new Error(getGoogleSignInErrorMessage(error));
    }
  };

  const signUpWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Para registro con Google, siempre crear perfil básico y redirigir a completar perfil
      const basicUserData = {
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0],
        username: result.user.email?.split('@')[0],
        role: 'user', // Por defecto, se completará en el formulario
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, 'users', result.user.uid), basicUserData);
        console.log('Perfil básico creado para registro con Google');
      } catch (error) {
        console.error('Error creando perfil básico:', error);
      }

      // Crear usuario básico para el estado
      const userDataWithAuth: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        username: result.user.email?.split('@')[0],
        role: 'user',
      };
      setUser(userDataWithAuth);
      analyticsEvents.userSignUp('google');
    } catch (error: any) {
      console.error('Google Sign-Up Error:', error);
      throw new Error(getGoogleSignInErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Trackear logout
      analyticsEvents.userLogout();
    } catch (error: any) {
      setLoading(false);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

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

      // Si es psicólogo, también actualizar en la colección de psicólogos
      if (updates.role === 'psychologist' || user.role === 'psychologist') {
        try {
          const psychologistData = {
            uid: user.uid,
            email: user.email,
            displayName: updates.displayName || user.displayName,
            role: 'psychologist',
            professionalTitle: updates.professionalTitle || '',
            specialization: updates.specialization || '',
            yearsOfExperience: updates.yearsOfExperience || 0,
            bio: updates.bio || '',
            licenseNumber: updates.licenseNumber || '',
            phone: updates.phone || '',
            cvUrl: updates.cvUrl || '',
            rating: 0,
            patientsCount: 0,
            isAvailable: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await setDoc(doc(db, 'psychologists', user.uid), psychologistData);
          console.log('Perfil de psicólogo actualizado exitosamente');
        } catch (psychologistError) {
          console.error('Error actualizando perfil de psicólogo:', psychologistError);
          // No lanzar error aquí para no interrumpir la actualización del usuario
        }
      }

      // Actualizar el estado local sin recargar
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
