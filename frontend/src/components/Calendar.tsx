import { ChevronLeft, ChevronRight, Clock, MapPin, Phone, Video } from 'lucide-react';
import React, { useState } from 'react';
import { Appointment } from '../types';

interface CalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
  isDarkMode?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  appointments,
  onAppointmentClick,
  onDateClick,
  selectedDate = new Date(),
  isDarkMode = false,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];

  // Previous month's trailing days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    calendarDays.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
    });
  }

  // Next month's leading days
  const totalCells = 42; // 6 weeks * 7 days
  const remainingDays = totalCells - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = appointment.startTime;
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Get appointments for current view
  const getAppointmentsForView = () => {
    if (view === 'day') {
      return getAppointmentsForDate(currentDate);
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return appointments.filter((appointment) => {
        const appointmentDate = appointment.startTime;
        return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
      });
    } else {
      return appointments.filter((appointment) => {
        const appointmentDate = appointment.startTime;
        return appointmentDate.getMonth() === month && appointmentDate.getFullYear() === year;
      });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'office':
        return <MapPin className='w-3 h-3' />;
      case 'online':
        return <Video className='w-3 h-3' />;
      case 'phone':
        return <Phone className='w-3 h-3' />;
      default:
        return <Clock className='w-3 h-3' />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className={`w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center space-x-4'>
          <h2 className='text-xl font-semibold'>
            {monthNames[month]} {year}
          </h2>
          <div className='flex space-x-1'>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'month'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'week'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'day'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Día
            </button>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={() => {
              if (view === 'month') navigateMonth('prev');
              else if (view === 'week') navigateWeek('prev');
              else navigateDay('prev');
            }}
            className='p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <button
            onClick={() => setCurrentDate(today)}
            className='px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600'
          >
            Hoy
          </button>
          <button
            onClick={() => {
              if (view === 'month') navigateMonth('next');
              else if (view === 'week') navigateWeek('next');
              else navigateDay('next');
            }}
            className='p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className='p-4'>
        {view === 'month' && (
          <div className='grid grid-cols-7 gap-1'>
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className='p-2 text-center text-sm font-medium text-gray-500'>
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day.date);
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                    day.isCurrentMonth
                      ? isDarkMode
                        ? 'bg-gray-800'
                        : 'bg-white'
                      : isDarkMode
                      ? 'bg-gray-900 text-gray-500'
                      : 'bg-gray-50 text-gray-400'
                  } ${day.isToday ? 'ring-2 ring-blue-500' : ''} ${
                    onDateClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                  }`}
                  onClick={() => onDateClick?.(day.date)}
                >
                  <div className={`text-sm font-medium ${day.isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {day.date.getDate()}
                  </div>

                  {/* Appointments for this day */}
                  <div className='mt-1 space-y-1'>
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(
                          appointment.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(appointment);
                        }}
                      >
                        <div className='flex items-center space-x-1'>
                          {getLocationIcon(appointment.location)}
                          <span className='truncate'>{formatTime(appointment.startTime)}</span>
                        </div>
                        <div className='truncate font-medium'>{appointment.title}</div>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className='text-xs text-gray-500'>+{dayAppointments.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className='space-y-4'>
            <div className='grid grid-cols-7 gap-4'>
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - currentDate.getDay() + i);
                const dayAppointments = getAppointmentsForDate(date);

                return (
                  <div key={i} className='text-center'>
                    <div
                      className={`text-sm font-medium ${
                        date.toDateString() === today.toDateString() ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {dayNames[i]}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        date.toDateString() === today.toDateString() ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className='mt-2 space-y-1'>
                      {dayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${getStatusColor(
                            appointment.status
                          )}`}
                          onClick={() => onAppointmentClick?.(appointment)}
                        >
                          <div className='flex items-center space-x-1'>
                            {getLocationIcon(appointment.location)}
                            <span>{formatTime(appointment.startTime)}</span>
                          </div>
                          <div className='truncate font-medium'>{appointment.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {currentDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className='space-y-2'>
              {getAppointmentsForDate(currentDate).map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(
                    appointment.status
                  )}`}
                  onClick={() => onAppointmentClick?.(appointment)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      {getLocationIcon(appointment.location)}
                      <div>
                        <div className='font-medium'>{appointment.title}</div>
                        <div className='text-sm opacity-75'>
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                      </div>
                    </div>
                    <div className='text-sm font-medium'>{appointment.status}</div>
                  </div>
                  {appointment.description && <div className='mt-2 text-sm opacity-75'>{appointment.description}</div>}
                </div>
              ))}

              {getAppointmentsForDate(currentDate).length === 0 && (
                <div className='text-center py-8 text-gray-500'>No hay citas programadas para este día</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
