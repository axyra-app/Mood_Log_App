rules_version = '2';

// Reglas de Storage para Mood Log App
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir subida de archivos para usuarios autenticados
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir subida de archivos para psicólogos
    match /psychologists/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir lectura pública de archivos subidos
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
