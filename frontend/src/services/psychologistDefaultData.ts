import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Psychologist } from '../types';

// Psicólogos por defecto para cuando no hay datos válidos
export const defaultPsychologists = [
  {
    userId: 'default-psychologist-1',
    name: 'Dra. María González',
    email: 'maria.gonzalez@moodlogapp.com',
    phone: '+57 300 123 4567',
    license: 'PSI-001234',
    specialization: ['Psicología Clínica', 'Terapia Cognitivo-Conductual'],
    experience: 8,
    bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 8 años de experiencia. Me enfoco en ayudar a las personas a desarrollar estrategias efectivas para manejar la ansiedad, depresión y estrés.',
    profileImage: '',
    isAvailable: true,
    workingHours: { start: '09:00', end: '17:00', timezone: 'America/Bogota' },
    languages: ['Español', 'Inglés'],
    consultationFee: 150000,
    rating: 4.8,
    totalPatients: 0,
    isVerified: true,
  },
  {
    userId: 'default-psychologist-2',
    name: 'Dr. Carlos Rodríguez',
    email: 'carlos.rodriguez@moodlogapp.com',
    phone: '+57 300 234 5678',
    license: 'PSI-002345',
    specialization: ['Psicología Organizacional', 'Coaching'],
    experience: 6,
    bio: 'Psicólogo organizacional y coach certificado. Especializado en desarrollo personal, manejo del estrés laboral y mejora del rendimiento profesional.',
    profileImage: '',
    isAvailable: true,
    workingHours: { start: '08:00', end: '18:00', timezone: 'America/Bogota' },
    languages: ['Español'],
    consultationFee: 120000,
    rating: 4.6,
    totalPatients: 0,
    isVerified: true,
  },
  {
    userId: 'default-psychologist-3',
    name: 'Dra. Ana Martínez',
    email: 'ana.martinez@moodlogapp.com',
    phone: '+57 300 345 6789',
    license: 'PSI-003456',
    specialization: ['Psicología Infantil', 'Terapia Familiar'],
    experience: 10,
    bio: 'Psicóloga infantil y familiar con amplia experiencia en terapia con niños, adolescentes y familias. Especializada en problemas de comportamiento y desarrollo emocional.',
    profileImage: '',
    isAvailable: true,
    workingHours: { start: '10:00', end: '19:00', timezone: 'America/Bogota' },
    languages: ['Español'],
    consultationFee: 180000,
    rating: 4.9,
    totalPatients: 0,
    isVerified: true,
  },
];

// Función para inicializar psicólogos por defecto
export const initializeDefaultPsychologists = async (): Promise<Psychologist[]> => {
  try {
    console.log('🔄 Inicializando psicólogos por defecto...');

    const psychologistsRef = collection(db, 'psychologists');
    const psychologists: Psychologist[] = [];

    for (const psychologistData of defaultPsychologists) {
      try {
        // Verificar si ya existe un psicólogo con este userId
        const existingQuery = query(psychologistsRef, where('userId', '==', psychologistData.userId));
        const existingSnapshot = await getDocs(existingQuery);

        if (existingSnapshot.empty) {
          // Crear el psicólogo si no existe
          const docRef = await addDoc(psychologistsRef, {
            ...psychologistData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          const psychologist: Psychologist = {
            id: docRef.id,
            ...psychologistData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          psychologists.push(psychologist);
          // Psicólogo creado exitosamente
        } else {
          // Si ya existe, agregarlo a la lista
          const doc = existingSnapshot.docs[0];
          const data = doc.data();
          const psychologist: Psychologist = {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            license: data.license,
            specialization: data.specialization || ['Psicología General'],
            experience: data.experience || 1,
            bio: data.bio || 'Psicólogo profesional disponible para consultas.',
            profileImage: data.profileImage || '',
            isAvailable: data.isAvailable !== false,
            workingHours: data.workingHours || { start: '09:00', end: '17:00', timezone: 'America/Bogota' },
            languages: data.languages || ['Español'],
            consultationFee: data.consultationFee || 0,
            rating: data.rating || 5.0,
            totalPatients: data.totalPatients || 0,
            isVerified: data.isVerified !== false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
          psychologists.push(psychologist);
          // Psicólogo encontrado exitosamente
        }
      } catch (error) {
        console.error(`❌ Error creando psicólogo ${psychologistData.name}:`, error);
      }
    }

    console.log(`🎉 Inicialización completada. ${psychologists.length} psicólogos disponibles.`);
    return psychologists;
  } catch (error) {
    console.error('❌ Error inicializando psicólogos por defecto:', error);
    throw error;
  }
};
