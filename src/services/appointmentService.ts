import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Appointment, Psychologist } from '../types';
import { db } from './firebase';

// Appointment Management Functions
export const createAppointment = async (
  appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Check for conflicts before creating
    const conflicts = await checkAppointmentConflicts(
      appointmentData.psychologistId,
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (conflicts.length > 0) {
      throw new Error('Conflicto de horario: Ya existe una cita en ese horario');
    }

    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Send notification
    await sendAppointmentNotification(appointmentData.patientId, appointmentData, 'created');

    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointment = async (appointmentId: string): Promise<Appointment | null> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);

    if (appointmentSnap.exists()) {
      return { id: appointmentSnap.id, ...appointmentSnap.data() } as Appointment;
    }
    return null;
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

export const getAppointmentsByPsychologist = async (
  psychologistId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    let q = query(appointmentsRef, where('psychologistId', '==', psychologistId), orderBy('startTime', 'asc'));

    if (startDate) {
      q = query(q, where('startTime', '>=', startDate));
    }

    if (endDate) {
      q = query(q, where('startTime', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments by psychologist:', error);
    throw error;
  }
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('patientId', '==', patientId), orderBy('startTime', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments by patient:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Send notification if status changed
    if (updates.status) {
      const appointment = await getAppointment(appointmentId);
      if (appointment) {
        await sendAppointmentNotification(appointment.patientId, appointment, 'updated');
      }
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId: string, reason?: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      updatedAt: serverTimestamp(),
    });

    // Send cancellation notification
    const appointment = await getAppointment(appointmentId);
    if (appointment) {
      await sendAppointmentNotification(appointment.patientId, appointment, 'cancelled');
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// Availability Management
export const getPsychologistAvailability = async (
  psychologistId: string,
  date: Date
): Promise<{ time: string; available: boolean }[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await getAppointmentsByPsychologist(psychologistId, startOfDay, endOfDay);

    // Get psychologist working hours
    const psychologistRef = doc(db, 'psychologists', psychologistId);
    const psychologistSnap = await getDoc(psychologistRef);

    let workingHours = {
      start: 9,
      end: 17,
      breakStart: 12,
      breakEnd: 13,
    };

    if (psychologistSnap.exists()) {
      const data = psychologistSnap.data() as Psychologist;
      if (data.workingHours) {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayHours = data.workingHours[dayOfWeek as keyof typeof data.workingHours];
        if (dayHours && dayHours.available) {
          workingHours.start = parseInt(dayHours.start.split(':')[0]);
          workingHours.end = parseInt(dayHours.end.split(':')[0]);
        }
      }
    }

    // Generate time slots
    const timeSlots: { time: string; available: boolean }[] = [];
    const slotDuration = 60; // 60 minutes

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      // Skip break time
      if (hour >= workingHours.breakStart && hour < workingHours.breakEnd) {
        continue;
      }

      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this slot conflicts with existing appointments
      const hasConflict = appointments.some(
        (apt) => apt.status !== 'cancelled' && apt.startTime < slotEnd && apt.endTime > slotStart
      );

      timeSlots.push({
        time: timeString,
        available: !hasConflict,
      });
    }

    return timeSlots;
  } catch (error) {
    console.error('Error getting psychologist availability:', error);
    throw error;
  }
};

export const checkAppointmentConflicts = async (
  psychologistId: string,
  startTime: Date,
  endTime: Date
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('psychologistId', '==', psychologistId),
      where('status', 'in', ['scheduled', 'confirmed', 'in-progress'])
    );

    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];

    return appointments.filter((apt) => apt.startTime < endTime && apt.endTime > startTime);
  } catch (error) {
    console.error('Error checking appointment conflicts:', error);
    throw error;
  }
};

// Real-time subscriptions
export const subscribeToAppointments = (psychologistId: string, callback: (appointments: Appointment[]) => void) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(appointmentsRef, where('psychologistId', '==', psychologistId), orderBy('startTime', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
    callback(appointments);
  });
};

export const subscribeToPatientAppointments = (patientId: string, callback: (appointments: Appointment[]) => void) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(appointmentsRef, where('patientId', '==', patientId), orderBy('startTime', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
    callback(appointments);
  });
};

// Appointment search and filtering
export const searchAppointments = async (
  psychologistId: string,
  searchTerm: string,
  status?: string,
  type?: string,
  startDate?: Date,
  endDate?: Date
): Promise<Appointment[]> => {
  try {
    let q = query(collection(db, 'appointments'), where('psychologistId', '==', psychologistId));

    if (status) {
      q = query(q, where('status', '==', status));
    }

    if (type) {
      q = query(q, where('type', '==', type));
    }

    if (startDate) {
      q = query(q, where('startTime', '>=', startDate));
    }

    if (endDate) {
      q = query(q, where('startTime', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    let appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];

    // Client-side search filtering
    if (searchTerm) {
      appointments = appointments.filter(
        (apt) =>
          apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw error;
  }
};

// Appointment statistics
export const getAppointmentStats = async (psychologistId: string, period: 'week' | 'month' | 'year' = 'month') => {
  try {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const appointments = await getAppointmentsByPsychologist(psychologistId, startDate, now);

    const total = appointments.length;
    const completed = appointments.filter((apt) => apt.status === 'completed').length;
    const cancelled = appointments.filter((apt) => apt.status === 'cancelled').length;
    const noShow = appointments.filter((apt) => apt.status === 'no-show').length;
    const upcoming = appointments.filter((apt) => apt.status === 'scheduled' || apt.status === 'confirmed').length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
    const noShowRate = total > 0 ? (noShow / total) * 100 : 0;

    // Group by type
    const byType = appointments.reduce((acc, apt) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by location
    const byLocation = appointments.reduce((acc, apt) => {
      acc[apt.location] = (acc[apt.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      cancelled,
      noShow,
      upcoming,
      completionRate: Math.round(completionRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      noShowRate: Math.round(noShowRate * 100) / 100,
      byType,
      byLocation,
    };
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    throw error;
  }
};

// Notification functions
const sendAppointmentNotification = async (
  patientId: string,
  appointment: Appointment,
  action: 'created' | 'updated' | 'cancelled'
) => {
  try {
    const { createNotification } = await import('./notificationService');

    let title = '';
    let body = '';

    switch (action) {
      case 'created':
        title = 'Cita Programada';
        body = `Tu cita "${appointment.title}" ha sido programada para ${appointment.startTime.toLocaleDateString()}`;
        break;
      case 'updated':
        title = 'Cita Actualizada';
        body = `Tu cita "${appointment.title}" ha sido actualizada`;
        break;
      case 'cancelled':
        title = 'Cita Cancelada';
        body = `Tu cita "${appointment.title}" ha sido cancelada`;
        break;
    }

    await createNotification({
      userId: patientId,
      title,
      body,
      type: 'appointment',
      data: { appointmentId: appointment.id },
      read: false,
    });
  } catch (error) {
    console.error('Error sending appointment notification:', error);
  }
};

// Recurring appointments
export const createRecurringAppointments = async (
  baseAppointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
  recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate: Date;
  }
): Promise<string[]> => {
  try {
    const appointmentIds: string[] = [];
    const appointments: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    let currentDate = new Date(baseAppointment.startTime);
    const endDate = new Date(recurrence.endDate);

    while (currentDate <= endDate) {
      const appointmentStart = new Date(currentDate);
      appointmentStart.setHours(
        baseAppointment.startTime.getHours(),
        baseAppointment.startTime.getMinutes(),
        baseAppointment.startTime.getSeconds()
      );

      const appointmentEnd = new Date(currentDate);
      appointmentEnd.setHours(
        baseAppointment.endTime.getHours(),
        baseAppointment.endTime.getMinutes(),
        baseAppointment.endTime.getSeconds()
      );

      appointments.push({
        ...baseAppointment,
        startTime: appointmentStart,
        endTime: appointmentEnd,
        title: `${baseAppointment.title} (Recurrente)`,
      });

      // Calculate next occurrence
      switch (recurrence.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurrence.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7 * recurrence.interval);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
          break;
      }
    }

    // Create all appointments in batch
    const batch = writeBatch(db);
    const appointmentsRef = collection(db, 'appointments');

    for (const appointment of appointments) {
      const docRef = doc(appointmentsRef);
      batch.set(docRef, {
        ...appointment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      appointmentIds.push(docRef.id);
    }

    await batch.commit();
    return appointmentIds;
  } catch (error) {
    console.error('Error creating recurring appointments:', error);
    throw error;
  }
};
