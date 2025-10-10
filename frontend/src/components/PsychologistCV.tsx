import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Download, Eye, FileText, Trash2, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { db, uploadFile } from '../services/firebase';

interface PsychologistCVProps {
  isDarkMode: boolean;
  psychologistId?: string;
}

const PsychologistCV: React.FC<PsychologistCVProps> = ({ isDarkMode, psychologistId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvData, setCvData] = useState({
    cvUrl: '',
    cvFileName: '',
    cvFileSize: 0,
    cvUploadDate: null as Date | null,
  });
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = psychologistId || user?.uid;

  React.useEffect(() => {
    if (currentUserId) {
      loadCVData();
    }
  }, [currentUserId]);

  const loadCVData = async () => {
    try {
      const psychologistDoc = doc(db, 'psychologists', currentUserId);
      const docSnapshot = await getDoc(psychologistDoc);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setCvData({
          cvUrl: data.cvUrl || '',
          cvFileName: data.cvFileName || '',
          cvFileSize: data.cvFileSize || 0,
          cvUploadDate: data.cvUploadDate?.toDate() || null,
        });
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessor',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PDF y Word (.pdf, .doc, .docx)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    try {
      setUploading(true);

      // Subir archivo
      const cvUrl = await uploadFile(file, `psychologists/${currentUserId}/cv`);

      // Actualizar datos en Firestore
      const psychologistDoc = doc(db, 'psychologists', currentUserId);
      await updateDoc(psychologistDoc, {
        cvUrl: cvUrl,
        cvFileName: file.name,
        cvFileSize: file.size,
        cvUploadDate: new Date(),
        updatedAt: new Date(),
      });

      setCvData({
        cvUrl: cvUrl,
        cvFileName: file.name,
        cvFileSize: file.size,
        cvUploadDate: new Date(),
      });

      toast.success('CV subido exitosamente');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Error al subir el CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCV = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar el CV?')) return;

    try {
      setLoading(true);

      const psychologistDoc = doc(db, 'psychologists', currentUserId);
      await updateDoc(psychologistDoc, {
        cvUrl: '',
        cvFileName: '',
        cvFileSize: 0,
        cvUploadDate: null,
        updatedAt: new Date(),
      });

      setCvData({
        cvUrl: '',
        cvFileName: '',
        cvFileSize: 0,
        cvUploadDate: null,
      });

      toast.success('CV eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Error al eliminar el CV');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border mb-8`}
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <div
            className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}
          >
            <FileText className='w-6 h-6' />
          </div>
          <div>
            <h2
              className={`text-xl font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Hoja de Vida (CV)
            </h2>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona tu currículum profesional
            </p>
          </div>
        </div>
      </div>

      {!cvData.cvUrl ? (
        <div
          className={`p-8 rounded-lg border-2 border-dashed text-center ${
            isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Subir Hoja de Vida
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sube tu CV en formato PDF o Word (máximo 10MB)
          </p>
          <input
            ref={fileInputRef}
            type='file'
            accept='.pdf,.doc,.docx'
            onChange={handleFileUpload}
            className='hidden'
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
              uploading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {uploading ? (
              <div className='flex items-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Subiendo...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Upload className='w-4 h-4' />
                <span>Seleccionar Archivo</span>
              </div>
            )}
          </button>
        </div>
      ) : (
        <div
          className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              <span className='text-2xl'>{getFileIcon(cvData.cvFileName)}</span>
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cvData.cvFileName}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatFileSize(cvData.cvFileSize)} • Subido el {cvData.cvUploadDate?.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setShowPreview(true)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title='Ver CV'
              >
                <Eye className='w-4 h-4' />
              </button>
              <a
                href={cvData.cvUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title='Descargar CV'
              >
                <Download className='w-4 h-4' />
              </a>
              <button
                onClick={handleDeleteCV}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title='Eliminar CV'
              >
                {loading ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                ) : (
                  <Trash2 className='w-4 h-4' />
                )}
              </button>
            </div>
          </div>

          <div className='flex space-x-3'>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                uploading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {uploading ? 'Subiendo...' : 'Reemplazar CV'}
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.pdf,.doc,.docx'
              onChange={handleFileUpload}
              className='hidden'
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border flex flex-col`}
          >
            <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
              <h3
                className={`text-lg font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Vista Previa del CV
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <X className='w-4 h-4' />
              </button>
            </div>
            <div className='flex-1 overflow-hidden'>
              <iframe src={cvData.cvUrl} className='w-full h-full' title='CV Preview' />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychologistCV;
