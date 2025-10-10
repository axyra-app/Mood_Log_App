import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';

const PsychologistRegistrationTest: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    displayName: 'Dr. Test Psicólogo',
    professionalTitle: 'Psicólogo Clínico',
    specialization: 'Terapia Cognitivo-Conductual',
    yearsOfExperience: '5',
    bio: 'Psicólogo especializado en terapia cognitivo-conductual con 5 años de experiencia.',
    licenseNumber: 'PSI-12345',
    phone: '+57 300 123 4567',
  });

  const testPsychologistRegistration = async () => {
    if (!user) {
      toast.error('No hay usuario autenticado');
      return;
    }

    try {
      setLoading(true);

      const psychologistData = {
        userId: user.uid,
        displayName: testData.displayName,
        email: user.email,
        professionalTitle: testData.professionalTitle,
        specialization: testData.specialization,
        yearsOfExperience: parseInt(testData.yearsOfExperience),
        bio: testData.bio,
        licenseNumber: testData.licenseNumber,
        phone: testData.phone,
        cvUrl: '',
        isActive: true,
        rating: 0,
        patientsCount: 0,
        isAvailable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('Intentando crear psicólogo con datos:', psychologistData);

      await setDoc(doc(db, 'psychologists', user.uid), psychologistData);

      toast.success('¡Psicólogo registrado exitosamente!');
      console.log('Psicólogo creado exitosamente');
    } catch (error) {
      console.error('Error registrando psicólogo:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkPsychologistExists = async () => {
    if (!user) {
      toast.error('No hay usuario autenticado');
      return;
    }

    try {
      const { getDoc } = await import('firebase/firestore');
      const psychologistDoc = await getDoc(doc(db, 'psychologists', user.uid));

      if (psychologistDoc.exists()) {
        toast.success('El psicólogo ya existe en la base de datos');
        console.log('Datos del psicólogo:', psychologistDoc.data());
      } else {
        toast.error('El psicólogo NO existe en la base de datos');
      }
    } catch (error) {
      console.error('Error verificando psicólogo:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Prueba de Registro de Psicólogo</h2>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-2'>Usuario actual:</label>
          <p className='text-sm text-gray-600'>{user ? `${user.displayName} (${user.email})` : 'No autenticado'}</p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Nombre:</label>
            <input
              type='text'
              value={testData.displayName}
              onChange={(e) => setTestData((prev) => ({ ...prev, displayName: e.target.value }))}
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Título Profesional:</label>
            <input
              type='text'
              value={testData.professionalTitle}
              onChange={(e) => setTestData((prev) => ({ ...prev, professionalTitle: e.target.value }))}
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Especialización:</label>
            <input
              type='text'
              value={testData.specialization}
              onChange={(e) => setTestData((prev) => ({ ...prev, specialization: e.target.value }))}
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Años de Experiencia:</label>
            <input
              type='number'
              value={testData.yearsOfExperience}
              onChange={(e) => setTestData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))}
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Biografía:</label>
          <textarea
            value={testData.bio}
            onChange={(e) => setTestData((prev) => ({ ...prev, bio: e.target.value }))}
            className='w-full px-3 py-2 border rounded-lg'
            rows={3}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Número de Licencia:</label>
            <input
              type='text'
              value={testData.licenseNumber}
              onChange={(e) => setTestData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Teléfono:</label>
            <input
              type='text'
              value={testData.phone}
              onChange={(e) => setTestData((prev) => ({ ...prev, phone: e.target.value }))}
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>
        </div>

        <div className='flex space-x-4'>
          <button
            onClick={testPsychologistRegistration}
            disabled={loading}
            className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50'
          >
            {loading ? 'Registrando...' : 'Registrar Psicólogo'}
          </button>

          <button
            onClick={checkPsychologistExists}
            className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600'
          >
            Verificar Existencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default PsychologistRegistrationTest;
