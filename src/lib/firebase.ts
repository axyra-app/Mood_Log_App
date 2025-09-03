// Temporary mock Firebase for testing
console.log('Using mock Firebase for testing');

// Mock Firebase services
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: (callback: any) => {
    // Simulate no user logged in
    callback(null);
    return () => {};
  }
};

export const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] })
    })
  })
};

export default { auth, db };
