import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Función para crear psicólogos de prueba
export const createSamplePsychologists = async () => {
  try {
    const psychologistsRef = collection(db, 'psychologists');
    
    const samplePsychologists = [
      {
        userId: 'sample-psychologist-1',
        name: 'Dra. María González',
        email: 'maria.gonzalez@psicologia.com',
        phone: '+57 300 123 4567',
        license: 'PSI-001234',
        specialization: ['Ansiedad', 'Depresión', 'Terapia Cognitiva'],
        experience: 8,
        bio: 'Psicóloga clínica con más de 8 años de experiencia en el tratamiento de trastornos de ansiedad y depresión. Especializada en terapia cognitivo-conductual.',
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        workingHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'America/Bogota'
        },
        languages: ['Español', 'Inglés'],
        consultationFee: 150000,
        rating: 4.8,
        totalPatients: 156,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        userId: 'sample-psychologist-2',
        name: 'Dr. Carlos Rodríguez',
        email: 'carlos.rodriguez@psicologia.com',
        phone: '+57 300 234 5678',
        license: 'PSI-002345',
        specialization: ['Terapia Familiar', 'Adolescentes', 'Crisis'],
        experience: 12,
        bio: 'Psicólogo especializado en terapia familiar y atención a adolescentes. Con amplia experiencia en manejo de crisis y situaciones de emergencia.',
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        workingHours: {
          start: '08:00',
          end: '17:00',
          timezone: 'America/Bogota'
        },
        languages: ['Español'],
        consultationFee: 180000,
        rating: 4.9,
        totalPatients: 203,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        userId: 'sample-psychologist-3',
        name: 'Dra. Ana Martínez',
        email: 'ana.martinez@psicologia.com',
        phone: '+57 300 345 6789',
        license: 'PSI-003456',
        specialization: ['Psicología Organizacional', 'Estrés Laboral', 'Coaching'],
        experience: 6,
        bio: 'Psicóloga organizacional especializada en manejo del estrés laboral y coaching personal. Ayuda a profesionales a mejorar su bienestar en el trabajo.',
        profileImage: 'https://images.unsplash.com/photo-1594824388852-7b0a8b5b5b5b?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        workingHours: {
          start: '10:00',
          end: '19:00',
          timezone: 'America/Bogota'
        },
        languages: ['Español', 'Inglés'],
        consultationFee: 160000,
        rating: 4.7,
        totalPatients: 89,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        userId: 'sample-psychologist-4',
        name: 'Dr. Luis Herrera',
        email: 'luis.herrera@psicologia.com',
        phone: '+57 300 456 7890',
        license: 'PSI-004567',
        specialization: ['Terapia de Pareja', 'Sexualidad', 'Relaciones'],
        experience: 10,
        bio: 'Psicólogo especializado en terapia de pareja y sexualidad. Con experiencia en ayudar a parejas a mejorar su comunicación y relación.',
        profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        workingHours: {
          start: '14:00',
          end: '22:00',
          timezone: 'America/Bogota'
        },
        languages: ['Español'],
        consultationFee: 170000,
        rating: 4.6,
        totalPatients: 134,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        userId: 'sample-psychologist-5',
        name: 'Dra. Patricia Silva',
        email: 'patricia.silva@psicologia.com',
        phone: '+57 300 567 8901',
        license: 'PSI-005678',
        specialization: ['Trauma', 'EMDR', 'Psicología Forense'],
        experience: 15,
        bio: 'Psicóloga especializada en trauma y terapia EMDR. Con amplia experiencia en psicología forense y atención a víctimas de violencia.',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        workingHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'America/Bogota'
        },
        languages: ['Español', 'Inglés'],
        consultationFee: 200000,
        rating: 4.9,
        totalPatients: 278,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    ];

    const promises = samplePsychologists.map(psychologist => 
      addDoc(psychologistsRef, psychologist)
    );

    await Promise.all(promises);
    console.log('✅ Psicólogos de prueba creados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error creando psicólogos de prueba:', error);
    throw error;
  }
};

// Función para crear usuarios de prueba para los psicólogos
export const createSampleUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    
    const sampleUsers = [
      {
        uid: 'sample-psychologist-1',
        email: 'maria.gonzalez@psicologia.com',
        displayName: 'Dra. María González',
        role: 'psychologist',
        isComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        uid: 'sample-psychologist-2',
        email: 'carlos.rodriguez@psicologia.com',
        displayName: 'Dr. Carlos Rodríguez',
        role: 'psychologist',
        isComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        uid: 'sample-psychologist-3',
        email: 'ana.martinez@psicologia.com',
        displayName: 'Dra. Ana Martínez',
        role: 'psychologist',
        isComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        uid: 'sample-psychologist-4',
        email: 'luis.herrera@psicologia.com',
        displayName: 'Dr. Luis Herrera',
        role: 'psychologist',
        isComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        uid: 'sample-psychologist-5',
        email: 'patricia.silva@psicologia.com',
        displayName: 'Dra. Patricia Silva',
        role: 'psychologist',
        isComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    ];

    const promises = sampleUsers.map(user => 
      addDoc(usersRef, user)
    );

    await Promise.all(promises);
    console.log('✅ Usuarios de prueba creados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error);
    throw error;
  }
};
