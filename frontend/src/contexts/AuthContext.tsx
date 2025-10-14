import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  firstName?: string;
  lastName?: string;
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
  profileLoaded: boolean;
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [forceLoadingFalse, setForceLoadingFalse] = useState(false);

  // Timeout de seguridad para forzar loading = false
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceLoadingFalse(true);
    }, 8000); // 8 segundos

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      
      if (!isMounted) {
        return;
      }

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
                role: userData.role,
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

              // Verificar si necesita completar perfil
              // Un usuario necesita completar perfil si:
              // 1. No tiene displayName o username (campos requeridos en CompleteProfile)
              // 2. O si es un usuario básico creado automáticamente
              const needsProfileCompletion = !userData.displayName || 
                                           !userData.username || 
                                           userData.displayName === firebaseUser.email?.split('@')[0];
              
              if (needsProfileCompletion) {
                console.log('⚠️ Usuario necesita completar perfil');
                // Establecer el usuario con datos básicos para redirigir a completar perfil
                const basicUserData: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                  username: firebaseUser.email?.split('@')[0],
                  role: userData.role || 'user',
                };
                if (isMounted) {
                  setUser(basicUserData);
                  setProfileLoaded(true);
                }
              } else {
                console.log('✅ Usuario con perfil completo');
                if (isMounted) {
                  setUser(userDataWithAuth);
                  setProfileLoaded(true);
                }
              }
            } else {
              // Si no existe el documento, crear uno básico para usuarios de Google
              console.log('✅ Usuario nuevo detectado, creando perfil básico');
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
                console.log('✅ Perfil básico creado exitosamente');
              } catch (error) {
                console.error('❌ Error creando perfil básico:', error);
              }

              // Crear usuario básico para el estado - siempre necesita completar perfil
              const userDataWithAuth: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                username: firebaseUser.email?.split('@')[0],
                role: 'user',
              };
              if (isMounted) {
                setUser(userDataWithAuth);
                setProfileLoaded(true);
              }
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
            if (isMounted) {
              setUser(userData);
              setProfileLoaded(true);
            }
          }
        } else {
          // Usuario no autenticado
          if (isMounted) {
            setUser(null);
            setProfileLoaded(false);
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Cerrar sesión automáticamente cuando se cierra la ventana/pestaña
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (auth.currentUser) {
        signOut(auth).catch(console.error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && auth.currentUser) {
        // Opcional: cerrar sesión cuando la pestaña se oculta
        // signOut(auth).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        } catch (psychologistError) {
          console.error('Error creando perfil de psicólogo:', psychologistError);
          // No lanzar error aquí para no interrumpir el registro del usuario
        }
      }

      // El loading se manejará automáticamente por onAuthStateChanged
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
      
      
      // Verificar si el popup está bloqueado
      const popup = window.open('', '_blank', 'width=500,height=600');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('Popup bloqueado. Por favor, permite popups para este sitio.');
      }
      popup.close();
      
      const result = await signInWithPopup(auth, provider);
      
      // La lógica de verificación de perfil se maneja en onAuthStateChanged
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setLoading(false);
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('El popup fue bloqueado. Por favor, permite popups para este sitio y vuelve a intentar.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('El popup fue cerrado. Por favor, completa el proceso de autenticación.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Solicitud cancelada. Por favor, intenta de nuevo.');
      }
      
      throw new Error(getGoogleSignInErrorMessage(error));
    }
  };

  const signUpWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      
      // Verificar si el popup está bloqueado
      const popup = window.open('', '_blank', 'width=500,height=600');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('Popup bloqueado. Por favor, permite popups para este sitio.');
      }
      popup.close();
      
      const result = await signInWithPopup(auth, provider);
      
      // Verificar si es un usuario nuevo
      const isNewUser = result.additionalUserInfo?.isNewUser;
      
      if (isNewUser) {
        console.log('✅ Usuario nuevo registrado con Google');
        // El perfil se creará automáticamente en onAuthStateChanged
      } else {
        console.log('✅ Usuario existente inició sesión con Google');
        // Verificar si realmente existe en Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          if (!userDoc.exists()) {
            console.log('⚠️ Usuario de Firebase Auth existe pero no en Firestore, creando perfil básico');
            // Crear perfil básico para usuario que existe en Auth pero no en Firestore
            const basicUserData = {
              email: result.user.email,
              displayName: result.user.displayName || result.user.email?.split('@')[0],
              username: result.user.email?.split('@')[0],
              role: 'user',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', result.user.uid), basicUserData);
            console.log('✅ Perfil básico creado para usuario existente');
          }
        } catch (error) {
          console.error('Error verificando usuario existente:', error);
        }
      }
      
      // La lógica de verificación de perfil se maneja en onAuthStateChanged
    } catch (error: any) {
      console.error('❌ Google Sign-Up Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setLoading(false);
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('El popup fue bloqueado. Por favor, permite popups para este sitio y vuelve a intentar.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('El popup fue cerrado. Por favor, completa el proceso de autenticación.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Solicitud cancelada. Por favor, intenta de nuevo.');
      }
      
      throw new Error(getGoogleSignInErrorMessage(error));
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

      console.log('🔍 Actualizando perfil con datos:', updates);

      // Actualizar en Firestore
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      console.log('🔍 Datos a guardar en Firestore:', updateData);
      
      await setDoc(
        userRef,
        updateData,
        { merge: true }
      );

      console.log('✅ Perfil actualizado en Firestore');

      // Actualizar el estado local del usuario
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      console.log('✅ Estado local del usuario actualizado:', updatedUser);

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
        } catch (psychologistError) {
          console.error('Error actualizando perfil de psicólogo:', psychologistError);
          // No lanzar error aquí para no interrumpir la actualización del usuario
        }
      }

      // Forzar una recarga del estado del usuario para actualizar las verificaciones
      await refreshUserState();

      // User profile updated
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const refreshUserState = async () => {
    try {
      if (!auth.currentUser) return;
      
      console.log('🔄 Refrescando estado del usuario...');
      
      // Obtener datos actualizados de Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userDataWithAuth: User = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: userData.displayName || auth.currentUser.displayName,
          role: userData.role || 'user',
          username: userData.username,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          firstName: userData.firstName,
          lastName: userData.lastName,
          professionalTitle: userData.professionalTitle,
          specialization: userData.specialization,
          yearsOfExperience: userData.yearsOfExperience,
          bio: userData.bio,
          licenseNumber: userData.licenseNumber,
          phone: userData.phone,
          cvUrl: userData.cvUrl,
        };
        
        console.log('✅ Estado del usuario refrescado:', userDataWithAuth);
        setUser(userDataWithAuth);
        setProfileLoaded(true);
      }
    } catch (error) {
      console.error('❌ Error refreshing user state:', error);
    }
  };

  // Usar el timeout forzado si es necesario
  const effectiveLoading = forceLoadingFalse ? false : loading;

  const value: AuthContextType = {
    user,
    loading: effectiveLoading,
    profileLoaded,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
