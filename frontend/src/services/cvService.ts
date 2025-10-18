import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { storage, db } from './firebase';

export interface CVData {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  fileSize: number;
  fileType: string;
}

class CVService {
  private readonly CV_FOLDER = 'psychologist-cvs';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  /**
   * Subir hoja de vida
   */
  async uploadCV(userId: string, file: File): Promise<CVData> {
    try {
      // Validar archivo
      this.validateFile(file);

      // Crear referencia en Storage
      const fileName = `cv_${userId}_${Date.now()}.${this.getFileExtension(file.name)}`;
      const storageRef = ref(storage, `${this.CV_FOLDER}/${fileName}`);

      // Subir archivo
      const uploadResult = await uploadBytes(storageRef, file);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Crear datos del CV
      const cvData: CVData = {
        fileName: file.name,
        fileUrl: downloadURL,
        uploadedAt: new Date(),
        fileSize: file.size,
        fileType: file.type,
      };

      // Guardar información en Firestore
      await this.saveCVInfo(userId, cvData);

      return cvData;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw new Error('Error al subir la hoja de vida. Inténtalo de nuevo.');
    }
  }

  /**
   * Obtener hoja de vida del usuario
   */
  async getCV(userId: string): Promise<CVData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return userData.cv || null;
    } catch (error) {
      console.error('Error getting CV:', error);
      return null;
    }
  }

  /**
   * Eliminar hoja de vida
   */
  async deleteCV(userId: string): Promise<void> {
    try {
      const cvData = await this.getCV(userId);
      
      if (!cvData) {
        throw new Error('No se encontró hoja de vida para eliminar');
      }

      // Eliminar archivo de Storage
      const fileRef = ref(storage, cvData.fileUrl);
      await deleteObject(fileRef);

      // Eliminar información de Firestore
      await updateDoc(doc(db, 'users', userId), {
        cv: null,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw new Error('Error al eliminar la hoja de vida. Inténtalo de nuevo.');
    }
  }

  /**
   * Validar archivo
   */
  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB.');
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo PDF, DOC, DOCX y TXT.');
    }
  }

  /**
   * Obtener extensión del archivo
   */
  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || '';
  }

  /**
   * Guardar información del CV en Firestore
   */
  private async saveCVInfo(userId: string, cvData: CVData): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        cv: cvData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving CV info:', error);
      throw error;
    }
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Verificar si el usuario tiene CV
   */
  async hasCV(userId: string): Promise<boolean> {
    try {
      const cvData = await this.getCV(userId);
      return cvData !== null;
    } catch (error) {
      console.error('Error checking CV:', error);
      return false;
    }
  }
}

export const cvService = new CVService();
