// Usar solo mocks para evitar errores de Firebase
import { auth, db } from './firebase-mock-only';

console.log('✅ Usando modo mock de Firebase para evitar errores de inicialización');

export { auth, db };
export default { auth, db };
