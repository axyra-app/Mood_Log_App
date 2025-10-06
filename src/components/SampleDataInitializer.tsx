import React, { useState } from 'react';
import { createSamplePsychologists, createSampleUsers } from '../services/sampleDataService';

const SampleDataInitializer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initializeSampleData = async () => {
    setLoading(true);
    setMessage('Inicializando datos de prueba...');
    
    try {
      // Crear usuarios primero
      await createSampleUsers();
      setMessage('✅ Usuarios creados. Creando psicólogos...');
      
      // Luego crear psicólogos
      await createSamplePsychologists();
      setMessage('✅ Datos de prueba inicializados exitosamente!');
      
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-2">Datos de Prueba</h3>
      <p className="text-sm text-gray-600 mb-3">
        Inicializa psicólogos de prueba para probar el sistema de chat.
      </p>
      
      <button
        onClick={initializeSampleData}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Inicializando...' : 'Crear Datos de Prueba'}
      </button>
      
      {message && (
        <p className={`text-sm mt-2 ${message.includes('✅') ? 'text-green-600' : message.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default SampleDataInitializer;
