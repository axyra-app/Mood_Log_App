import { Calendar, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

interface WeeklyProgressProps {
  moodLogs: any[];
  className?: string;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ moodLogs, className = '' }) => {
  const getWeekData = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekLogs = moodLogs.filter((log) => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      return logDate >= weekAgo;
    });

    // Crear array de 7 días
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLogs = weekLogs.filter((log) => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return logDate.toDateString() === date.toDateString();
      });

      const avgMood = dayLogs.length > 0 ? dayLogs.reduce((sum, log) => sum + log.mood, 0) / dayLogs.length : 0;

      weekData.push({
        day: days[date.getDay()],
        date: date.getDate(),
        mood: Math.round(avgMood * 10) / 10,
        hasData: dayLogs.length > 0,
        isToday: date.toDateString() === now.toDateString(),
      });
    }

    return weekData;
  };

  const getTrend = () => {
    const weekData = getWeekData();
    const firstHalf = weekData.slice(0, 3).filter((day) => day.hasData);
    const secondHalf = weekData.slice(4).filter((day) => day.hasData);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 'stable';

    const firstAvg = firstHalf.reduce((sum, day) => sum + day.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.mood, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.3) return 'improving';
    if (secondAvg < firstAvg - 0.3) return 'declining';
    return 'stable';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'bg-green-500';
    if (mood >= 3) return 'bg-yellow-500';
    if (mood >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 4.5) return '😊';
    if (mood >= 3.5) return '🙂';
    if (mood >= 2.5) return '😐';
    if (mood >= 1.5) return '😕';
    return '😢';
  };

  const weekData = getWeekData();
  const trend = getTrend();
  const weekAvg =
    weekData.filter((day) => day.hasData).reduce((sum, day) => sum + day.mood, 0) /
      weekData.filter((day) => day.hasData).length || 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <Calendar className='w-5 h-5 text-purple-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Progreso Semanal</h3>
        </div>
        <div className='flex items-center space-x-2'>
          {trend === 'improving' && <TrendingUp className='w-4 h-4 text-green-500' />}
          {trend === 'declining' && <TrendingDown className='w-4 h-4 text-red-500' />}
          {trend === 'stable' && <Minus className='w-4 h-4 text-gray-500' />}
          <span className='text-sm text-gray-600'>
            {trend === 'improving' ? 'Mejorando' : trend === 'declining' ? 'Declinando' : 'Estable'}
          </span>
        </div>
      </div>

      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm text-gray-600'>Promedio semanal</span>
          <span className='text-lg font-bold text-gray-900'>
            {weekAvg > 0 ? `${Math.round(weekAvg * 10) / 10}/5` : 'N/A'}
          </span>
        </div>
        {weekAvg > 0 && (
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${getMoodColor(weekAvg)}`}
              style={{ width: `${(weekAvg / 5) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {weekData.map((day, index) => (
          <div key={index} className='text-center'>
            <div className='text-xs text-gray-500 mb-1'>{day.day}</div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium mb-1 ${
                day.hasData ? `${getMoodColor(day.mood)} text-white` : 'bg-gray-100 text-gray-400'
              } ${day.isToday ? 'ring-2 ring-purple-500' : ''}`}
            >
              {day.hasData ? getMoodEmoji(day.mood) : day.date}
            </div>
            {day.hasData && <div className='text-xs text-gray-600'>{day.mood}</div>}
          </div>
        ))}
      </div>

      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-600'>Días registrados:</span>
          <span className='font-medium text-gray-900'>{weekData.filter((day) => day.hasData).length}/7</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgress;
