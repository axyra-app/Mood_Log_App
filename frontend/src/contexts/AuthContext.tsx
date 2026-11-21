import {
  User as FirebaseUser,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveAdultEligibility } from '../services/ageEligibilityService';
import { analyticsEvents, hasCurrentAnalyticsConsent, setAnalyticsConsent } from '../services/analytics';
import { auth, db } from '../services/firebase';
import { recordCurrentLegalAcceptance } from '../services/legalAcceptanceService';
import { ADULT_ELIGIBILITY_VERSION } from '../utils/legalVersions';
import { hasCurrentLegalAcceptanceMarker } from '../utils/legalAcceptanceMarker';
import { hasCurrentAdultEligibilityMarker } from '../utils/adultEligibility';
import { logSanitizedClientError } from '../utils/safeClientLog';
import { getAuthErrorMessage, getGoogleSignInErrorMessage, getRegistrationErrorMessage } from '../utils/errorMessages';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user';
  username?: string;
  createdAt?: any;
  updatedAt?: any;
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoURL?: string;
  adultEligibility?: {
    isAdult: true;
    version: string;
    attestedAt: any;
  };
}

export const hasCurrentAdultEligibility = (user: User | null): boolean =>
  hasCurrentAdultEligibilityMarker(user?.adultEligibility);

type UserProfileUpdates = {
  displayName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoURL?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  bio?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileLoaded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    confirmedAdult: boolean,
    acceptedLegalDocuments: boolean,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: (confirmedAdult: boolean, acceptedLegalDocuments: boolean) => Promise<void>;
  retryLegalAcceptance: () => Promise<void>;
  confirmAdultEligibility: (confirmedAdult: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: UserProfileUpdates) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getSafeAuthErrorCode = (error: unknown): string => {
  if (!error || typeof error !== 'object' || !('code' in error)) return 'unknown';
  const code = error.code;
  return typeof code === 'string' && /^auth\/[a-z-]+$/.test(code) ? code : 'unknown';
};

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
    let authRevision = 0;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      const currentRevision = ++authRevision;
      // Never carry a previous account's choice across an auth transition.
      void setAnalyticsConsent(false);
      
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
              if (
                isMounted
                && currentRevision === authRevision
                && hasCurrentLegalAcceptanceMarker(userData.legalAcceptance)
                && hasCurrentAnalyticsConsent(userData.settings)
              ) {
                void setAnalyticsConsent(true);
              }
              const userDataWithAuth: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userData.displayName || firebaseUser.displayName || null,
                username: userData.username,
                role: 'user',
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
                phone: userData.phone,
                firstName: userData.firstName,
                lastName: userData.lastName,
                adultEligibility: userData.adultEligibility,
              };

              // Verificar si necesita completar perfil
              // Un usuario necesita completar perfil si:
              // 1. No tiene displayName o username (campos requeridos en CompleteProfile)
              // 2. O si es un usuario básico creado automáticamente
              const needsProfileCompletion = !userData.displayName || 
                                           !userData.username || 
                                           userData.displayName === firebaseUser.email?.split('@')[0];
              
              if (needsProfileCompletion) {
                // Establecer el usuario con datos básicos para redirigir a completar perfil
                const basicUserData: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
                  username: firebaseUser.email?.split('@')[0],
                  role: 'user',
                  adultEligibility: userData.adultEligibility,
                };
                if (isMounted) {
                  setUser(basicUserData);
                  setProfileLoaded(true);
                }
              } else {
                if (isMounted) {
                  setUser(userDataWithAuth);
                  setProfileLoaded(true);
                }
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
                await setDoc(doc(db, 'users', firebaseUser.uid), basicUserData, { merge: true });
                
              } catch (error) {
                console.error('Error creating basic profile:', getSafeAuthErrorCode(error));
              }

              // Crear usuario básico para el estado - siempre necesita completar perfil
              const userDataWithAuth: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
                username: firebaseUser.email?.split('@')[0],
                role: 'user',
              };
              if (isMounted) {
                setUser(userDataWithAuth);
                setProfileLoaded(true);
              }
            }
          } catch (error) {
            logSanitizedClientError('User profile load failed', error);
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
        logSanitizedClientError('Authentication state update failed', error);
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
    confirmedAdult: boolean,
    acceptedLegalDocuments: boolean,
  ) => {
    if (!confirmedAdult) {
      throw new Error('Confirma que tienes 18 años o más para crear una cuenta.');
    }
    if (!acceptedLegalDocuments) {
      throw new Error('Confirma la aceptación de los términos y el aviso de privacidad.');
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Crear perfil del usuario en Firestore
      const userData = {
        email: email,
        displayName: email.split('@')[0],
        username: email.split('@')[0],
        role: 'user',
        adultEligibility: {
          isAdult: true,
          version: ADULT_ELIGIBILITY_VERSION,
          attestedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData, { merge: true });
      await recordCurrentLegalAcceptance();
      const attestedAt = new Date();
      setUser((currentUser) => currentUser ? {
        ...currentUser,
        adultEligibility: {
          isAdult: true,
          version: ADULT_ELIGIBILITY_VERSION,
          attestedAt,
        },
      } : currentUser);

      // Trackear registro exitoso
      analyticsEvents.userSignUp('email');

      // El loading se manejará automáticamente por onAuthStateChanged
    } catch (error: any) {
      setLoading(false);
      // Manejar específicamente el error de email ya existente
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ya existe una cuenta con este email. ¿Quieres iniciar sesión?');
      }
      if (error instanceof Error && !('code' in error)) throw error;
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
      
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      
      // La lógica de verificación de perfil se maneja en onAuthStateChanged
    } catch (error: any) {
      console.error('Google sign-in failed:', getSafeAuthErrorCode(error));
      setLoading(false);
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('El popup fue bloqueado. Por favor, permite popups para este sitio y vuelve a intentar.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('El popup fue cerrado. Por favor, completa el proceso de autenticación.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Solicitud cancelada. Por favor, intenta de nuevo.');
      }

      if (error instanceof Error && !('code' in error)) throw error;
      
      throw new Error(getGoogleSignInErrorMessage(error));
    }
  };

  const signUpWithGoogle = async (confirmedAdult: boolean, acceptedLegalDocuments: boolean) => {
    if (!confirmedAdult) {
      throw new Error('Confirma que tienes 18 años o más para crear una cuenta.');
    }
    if (!acceptedLegalDocuments) {
      throw new Error('Confirma la aceptación de los términos y el aviso de privacidad.');
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      
      // Verificar si el popup está bloqueado
      const popup = window.open('', '_blank', 'width=500,height=600');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('Popup bloqueado. Por favor, permite popups para este sitio.');
      }
      popup.close();
      
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      
      const profileRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(profileRef);
      const existingAdultEligibility = userDoc.data()?.adultEligibility;

      if (!userDoc.exists()) {
        await setDoc(profileRef, {
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
          username: result.user.email?.split('@')[0],
          role: 'user',
          adultEligibility: {
            isAdult: true,
            version: ADULT_ELIGIBILITY_VERSION,
            attestedAt: serverTimestamp(),
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else if (!existingAdultEligibility) {
        await setDoc(profileRef, {
          adultEligibility: {
            isAdult: true,
            version: ADULT_ELIGIBILITY_VERSION,
            attestedAt: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      await recordCurrentLegalAcceptance();

      if (!existingAdultEligibility) {
        setUser((currentUser) => currentUser ? {
          ...currentUser,
          adultEligibility: {
            isAdult: true,
            version: ADULT_ELIGIBILITY_VERSION,
            attestedAt: new Date(),
          },
        } : currentUser);
      }
      
      // La lógica de verificación de perfil se maneja en onAuthStateChanged
    } catch (error: any) {
      console.error('Google sign-up failed:', getSafeAuthErrorCode(error));
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

  const retryLegalAcceptance = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Inicia sesión nuevamente para reintentar.');

    const profileRef = doc(db, 'users', currentUser.uid);
    const profileSnapshot = await getDoc(profileRef);
    const existingEligibility = profileSnapshot.data()?.adultEligibility;
    if (!profileSnapshot.exists() || existingEligibility?.version !== ADULT_ELIGIBILITY_VERSION) {
      await setDoc(profileRef, {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        username: currentUser.email?.split('@')[0],
        role: 'user',
        adultEligibility: {
          isAdult: true,
          version: ADULT_ELIGIBILITY_VERSION,
          attestedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    await recordCurrentLegalAcceptance();
  };

  const confirmAdultEligibility = async (confirmedAdult: boolean) => {
    if (!confirmedAdult) {
      throw new Error('Confirma que tienes 18 años o más para continuar.');
    }
    if (!user) {
      throw new Error('Inicia sesión para confirmar tu elegibilidad.');
    }
    if (hasCurrentAdultEligibility(user)) return;

    const attestedAt = new Date();
    await saveAdultEligibility();

    setUser((currentUser) => currentUser ? {
      ...currentUser,
      adultEligibility: {
        isAdult: true,
        version: ADULT_ELIGIBILITY_VERSION,
        attestedAt,
      },
    } : currentUser);
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

  const updateUserProfile = async (updates: UserProfileUpdates) => {
    try {
      if (!user) throw new Error('No user logged in');

      

      // Actualizar en Firestore
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      
      
      await setDoc(
        userRef,
        updateData,
        { merge: true }
      );

      

      // Actualizar el estado local del usuario
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      

      // Forzar una recarga del estado del usuario para actualizar las verificaciones
      await refreshUserState();

      // User profile updated
    } catch (error: any) {
      console.error('Updating user profile failed:', getSafeAuthErrorCode(error));
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const refreshUserState = async () => {
    try {
      if (!auth.currentUser) return;
      
      
      
      // Obtener datos actualizados de Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userDataWithAuth: User = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: userData.displayName || auth.currentUser.displayName || null,
          role: 'user',
          username: userData.username,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          adultEligibility: userData.adultEligibility,
        };
        
        
        setUser(userDataWithAuth);
        setProfileLoaded(true);
      }
    } catch (error) {
      console.error('Refreshing user state failed:', getSafeAuthErrorCode(error));
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
    retryLegalAcceptance,
    confirmAdultEligibility,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
