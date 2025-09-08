// Mock completo de Firebase para evitar errores de inicialización
export const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock: signInWithEmailAndPassword', { email });
    return {
      user: {
        uid: 'mock-user-id',
        email,
        displayName: 'Mock User',
        emailVerified: true
      }
    };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock: createUserWithEmailAndPassword', { email });
    return {
      user: {
        uid: 'mock-user-id',
        email,
        displayName: 'Mock User',
        emailVerified: true
      }
    };
  },
  signInWithPopup: async (provider: any) => {
    console.log('Mock: signInWithPopup', { provider });
    return {
      user: {
        uid: 'mock-google-user-id',
        email: 'mock@google.com',
        displayName: 'Mock Google User',
        emailVerified: true
      }
    };
  },
  signOut: async () => {
    console.log('Mock: signOut');
    return Promise.resolve();
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    console.log('Mock: onAuthStateChanged');
    // Simular usuario no autenticado inicialmente
    callback(null);
    return () => {}; // unsubscribe function
  },
  sendPasswordResetEmail: async (email: string) => {
    console.log('Mock: sendPasswordResetEmail', { email });
    return Promise.resolve();
  }
};

export const mockDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => {
        console.log('Mock: set document', { collection: name, id, data });
        return Promise.resolve();
      },
      get: async () => {
        console.log('Mock: get document', { collection: name, id });
        return {
          exists: () => false,
          data: () => null
        };
      },
      update: async (data: any) => {
        console.log('Mock: update document', { collection: name, id, data });
        return Promise.resolve();
      },
      delete: async () => {
        console.log('Mock: delete document', { collection: name, id });
        return Promise.resolve();
      }
    }),
    add: async (data: any) => {
      console.log('Mock: add document', { collection: name, data });
      return {
        id: 'mock-doc-id'
      };
    },
    where: (field: string, operator: string, value: any) => ({
      get: async () => {
        console.log('Mock: query documents', { collection: name, field, operator, value });
        return {
          docs: [],
          empty: true
        };
      }
    })
  })
};

// Exportar como auth y db para compatibilidad
export const auth = mockAuth;
export const db = mockDb;
