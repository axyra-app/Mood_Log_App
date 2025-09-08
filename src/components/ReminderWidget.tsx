import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Reminder {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'mood' | 'meditation' | 'exercise' | 'sleep';
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ReminderWidgetProps {
  className?: string;
}

const ReminderWidget: React.FC<ReminderWidgetProps> = ({ className = '' }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Actualizar la hora cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Generar recordatorios de ejemplo
    const generateReminders = () => {
      const now = new Date();
      const reminders: Reminder[] = [];

      // Recordatorio de mood (cada 4 horas)
      const nextMoodTime = new Date(now);
      nextMoodTime.setHours(now.getHours() + 4, 0, 0, 0);

      reminders.push({
        id: 'mood-1',
        title: 'Registra tu estado de ánimo',
        message: 'Es hora de registrar cómo te sientes',
        time: nextMoodTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        type: 'mood',
        isCompleted: false,
        priority: 'high',
      });

      // Recordatorio de meditación (mañana)
      const meditationTime = new Date(now);
      meditationTime.setHours(8, 0, 0, 0);
      if (meditationTime <= now) {
        meditationTime.setDate(meditationTime.getDate() + 1);
      }

      reminders.push({
        id: 'meditation-1',
        title: 'Sesión de meditación',
        message: 'Dedica 10 minutos a la meditación',
        time: meditationTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        type: 'meditation',
        isCompleted: false,
        priority: 'medium',
      });

      // Recordatorio de ejercicio (tarde)
      const exerciseTime = new Date(now);
      exerciseTime.setHours(18, 0, 0, 0);
      if (exerciseTime <= now) {
        exerciseTime.setDate(exerciseTime.getDate() + 1);
      }

      reminders.push({
        id: 'exercise-1',
        title: 'Ejercicio físico',
        message: 'Hora de moverte y hacer ejercicio',
        time: exerciseTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        type: 'exercise',
        isCompleted: false,
        priority: 'medium',
      });

      // Recordatorio de sueño (noche)
      const sleepTime = new Date(now);
      sleepTime.setHours(22, 0, 0, 0);
      if (sleepTime <= now) {
        sleepTime.setDate(sleepTime.getDate() + 1);
      }

      reminders.push({
        id: 'sleep-1',
        title: 'Hora de dormir',
        message: 'Prepárate para una buena noche de sueño',
        time: sleepTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        type: 'sleep',
        isCompleted: false,
        priority: 'high',
      });

      return reminders;
    };

    setReminders(generateReminders());

    return () => clearInterval(timer);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mood':
        return '😊';
      case 'meditation':
        return '🧘‍♀️';
      case 'exercise':
        return '🏃‍♂️';
      case 'sleep':
        return '😴';
      default:
        return '⏰';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mood':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'meditation':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'exercise':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'sleep':
        return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleCompleteReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === id ? { ...reminder, isCompleted: !reminder.isCompleted } : reminder))
    );
  };

  const upcomingReminders = reminders
    .filter((reminder) => !reminder.isCompleted)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className='flex items-center space-x-2 mb-4'>
        <Clock className='w-5 h-5 text-purple-600' />
        <h3 className='text-lg font-semibold text-gray-900'>Recordatorios</h3>
      </div>

      {upcomingReminders.length === 0 ? (
        <div className='text-center py-6'>
          <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-2' />
          <p className='text-gray-500'>¡Todos los recordatorios completados!</p>
          <p className='text-gray-400 text-sm'>Buen trabajo hoy</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {upcomingReminders.map((reminder) => (
            <div key={reminder.id} className={`p-3 rounded-lg border ${getTypeColor(reminder.type)}`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='text-lg'>{getTypeIcon(reminder.type)}</div>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <h4 className='font-medium text-sm'>{reminder.title}</h4>
                      <AlertCircle className={`w-3 h-3 ${getPriorityColor(reminder.priority)}`} />
                    </div>
                    <p className='text-xs opacity-75 mt-1'>{reminder.message}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium'>{reminder.time}</p>
                  <button
                    onClick={() => handleCompleteReminder(reminder.id)}
                    className='text-xs text-gray-500 hover:text-gray-700 mt-1'
                  >
                    Completar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-600'>Completados hoy:</span>
          <span className='font-medium text-gray-900'>
            {reminders.filter((r) => r.isCompleted).length}/{reminders.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReminderWidget;
