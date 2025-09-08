// Mock de Firebase para evitar errores de inicialización
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simular que no hay usuario autenticado
    callback(null);
    return () => {}; // unsubscribe function
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    throw new Error('Firebase no configurado - modo demo');
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    throw new Error('Firebase no configurado - modo demo');
  },
  signInWithPopup: async (provider: any) => {
    throw new Error('Firebase no configurado - modo demo');
  },
  signOut: async () => {
    throw new Error('Firebase no configurado - modo demo');
  }
};

export const db = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async (data: any) => ({ id }),
      update: async (data: any) => ({ id }),
      delete: async () => ({ id })
    }),
    add: async (data: any) => ({ id: 'demo-id' }),
    where: (field: string, operator: string, value: any) => ({
      get: async () => ({ docs: [], empty: true }),
      onSnapshot: (callback: (snapshot: any) => void) => {
        callback({ docs: [], empty: true });
        return () => {}; // unsubscribe function
      }
    }),
    onSnapshot: (callback: (snapshot: any) => void) => {
      callback({ docs: [], empty: true });
      return () => {}; // unsubscribe function
    }
  })
};

export default { auth, db };
