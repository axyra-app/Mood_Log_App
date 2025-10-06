/**
 * Utility functions for handling Firebase authentication errors
 * and converting them to user-friendly messages in Spanish
 */

export interface FirebaseError {
  code: string;
  message: string;
}

/**
 * Converts Firebase error codes to user-friendly Spanish messages
 */
export const getFirebaseErrorMessage = (error: any): string => {
  // Extract error code from Firebase error
  const errorCode = error?.code || error?.message || '';
  
  // Common Firebase Auth error codes and their Spanish translations
  const errorMessages: { [key: string]: string } = {
    // Authentication errors
    'auth/invalid-email': 'El formato del email no es válido. Por favor, verifica tu dirección de correo.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta al soporte para más información.',
    'auth/user-not-found': 'No existe una cuenta con este email. Verifica tu dirección o regístrate.',
    'auth/wrong-password': 'La contraseña es incorrecta. Inténtalo de nuevo.',
    'auth/invalid-credential': 'Las credenciales son incorrectas. Verifica tu email y contraseña.',
    'auth/invalid-verification-code': 'El código de verificación no es válido.',
    'auth/invalid-verification-id': 'El ID de verificación no es válido.',
    'auth/code-expired': 'El código de verificación ha expirado. Solicita uno nuevo.',
    'auth/email-already-in-use': 'Ya existe una cuenta con este email. Intenta iniciar sesión o usa otro email.',
    'auth/weak-password': 'La contraseña es muy débil. Debe tener al menos 6 caracteres.',
    'auth/operation-not-allowed': 'Esta operación no está permitida. Contacta al soporte.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos antes de intentar de nuevo.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet e inténtalo de nuevo.',
    'auth/requires-recent-login': 'Por seguridad, necesitas iniciar sesión nuevamente.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de inicio de sesión.',
    'auth/credential-already-in-use': 'Estas credenciales ya están en uso por otra cuenta.',
    'auth/invalid-action-code': 'El código de acción no es válido o ha expirado.',
    'auth/expired-action-code': 'El código de acción ha expirado. Solicita uno nuevo.',
    'auth/user-mismatch': 'Las credenciales no coinciden con el usuario actual.',
    'auth/missing-verification-code': 'Falta el código de verificación.',
    'auth/missing-verification-id': 'Falta el ID de verificación.',
    'auth/quota-exceeded': 'Se ha excedido la cuota. Inténtalo más tarde.',
    'auth/captcha-check-failed': 'Verificación de seguridad fallida. Inténtalo de nuevo.',
    'auth/invalid-phone-number': 'Número de teléfono inválido.',
    'auth/missing-phone-number': 'Falta el número de teléfono.',
    
    // Generic errors
    'auth/internal-error': 'Error interno del servidor. Inténtalo más tarde.',
    'auth/unauthorized-domain': 'Dominio no autorizado para esta operación.',
    'auth/unsupported-persistence-type': 'Tipo de persistencia no soportado.',
  };

  // Check if we have a specific message for this error code
  if (errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // If it's a generic Firebase error, try to extract a more user-friendly message
  if (errorCode.includes('auth/')) {
    return 'Error de autenticación. Verifica tus credenciales e inténtalo de nuevo.';
  }

  // If it's a network error
  if (errorCode.includes('network') || errorCode.includes('Network')) {
    return 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
  }

  // If it's a Firebase error but we don't have a specific message
  if (errorCode.includes('Firebase')) {
    return 'Error del servidor. Inténtalo de nuevo en unos momentos.';
  }

  // Default fallback message
  return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
};

/**
 * Gets a user-friendly error message for authentication errors
 */
export const getAuthErrorMessage = (error: any): string => {
  // If it's already a user-friendly message, return it
  if (typeof error === 'string' && !error.includes('Firebase') && !error.includes('auth/')) {
    return error;
  }

  return getFirebaseErrorMessage(error);
};

/**
 * Gets a user-friendly error message for registration errors
 */
export const getRegistrationErrorMessage = (error: any): string => {
  return getFirebaseErrorMessage(error);
};

/**
 * Gets a user-friendly error message for password reset errors
 */
export const getPasswordResetErrorMessage = (error: any): string => {
  return getFirebaseErrorMessage(error);
};

/**
 * Gets a user-friendly error message for Google sign-in errors
 */
export const getGoogleSignInErrorMessage = (error: any): string => {
  const errorCode = error?.code || error?.message || '';
  
  // Specific Google sign-in errors
  if (errorCode.includes('popup-closed-by-user')) {
    return 'Inicio de sesión cancelado. Inténtalo de nuevo.';
  }
  
  if (errorCode.includes('popup-blocked')) {
    return 'El popup fue bloqueado. Permite popups para este sitio e inténtalo de nuevo.';
  }
  
  if (errorCode.includes('cancelled-popup-request')) {
    return 'Solicitud cancelada. Inténtalo de nuevo.';
  }
  
  return getFirebaseErrorMessage(error);
};
