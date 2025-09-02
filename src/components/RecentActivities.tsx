import { Award, Calendar, Heart, TrendingUp } from 'lucide-react';

const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      type: 'mood',
      title: 'Estado de ánimo registrado',
      description: 'Te sentiste muy bien hoy',
      time: 'Hace 2 horas',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Nueva medalla desbloqueada',
      description: '7 días consecutivos registrando',
      time: 'Ayer',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 3,
      type: 'chat',
      title: 'Mensaje de tu psicólogo',
      description: 'Dr. García te envió un mensaje',
      time: 'Hace 1 día',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 4,
      type: 'progress',
      title: 'Progreso semanal',
      description: 'Tu estado de ánimo mejoró 15%',
      time: 'Hace 3 días',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <Calendar className='w-5 h-5 text-primary-600 mr-2' />
        Actividades Recientes
      </h3>

      <div className='space-y-4'>
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <div
                className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900'>{activity.title}</p>
                <p className='text-sm text-gray-600'>{activity.description}</p>
                <p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-6 pt-4 border-t border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Award className='w-5 h-5 text-yellow-600' />
            <span className='text-sm font-medium text-gray-900'>Logros</span>
          </div>
          <div className='flex space-x-1'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i <= 3 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <p className='text-xs text-gray-600 mt-2'>3 de 5 logros completados</p>
      </div>
    </div>
  );
};

export default RecentActivities;
