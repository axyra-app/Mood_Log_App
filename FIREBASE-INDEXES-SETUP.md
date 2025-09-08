# Configuración de Índices de Firestore

Para solucionar el error "The query requires an index", necesitas crear los siguientes índices en la consola de Firebase:

## Pasos para crear los índices:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `mood-log-app-1`
3. Ve a **Firestore Database** > **Índices**
4. Haz clic en **Crear índice**

## Índices necesarios:

### 1. Índice para moodLogs
- **Colección**: `moodLogs`
- **Campos**:
  - `userId` (Ascendente)
  - `timestamp` (Descendente)

### 2. Índice para moodLogs (alternativo)
- **Colección**: `moodLogs`
- **Campos**:
  - `userId` (Ascendente)
  - `timestamp` (Ascendente)

### 3. Índice para notifications
- **Colección**: `notifications`
- **Campos**:
  - `userId` (Ascendente)
  - `createdAt` (Descendente)

### 4. Índice para chats
- **Colección**: `chats`
- **Campos**:
  - `userId` (Ascendente)
  - `updatedAt` (Descendente)

### 5. Índice para chats (psicólogo)
- **Colección**: `chats`
- **Campos**:
  - `psychologistId` (Ascendente)
  - `updatedAt` (Descendente)

## Nota importante:
Los índices pueden tardar varios minutos en crearse. Una vez creados, los errores de consulta deberían desaparecer.

## Alternativa temporal:
Si necesitas que la aplicación funcione inmediatamente, puedes modificar las consultas para que no requieran índices compuestos, pero esto puede afectar el rendimiento.
