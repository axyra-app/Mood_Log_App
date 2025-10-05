import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { AlertTriangle, CheckCircle, Clock, MessageCircle, Phone, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';

interface CrisisAlert {
  id: string;
  patientId: string;
  psychologistId: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  signals: string[];
  createdAt: Date;
  resolved: boolean;
  patientName?: string;
  patientPhone?: string;
  assessment?: any;
}

interface CrisisAlertsPanelProps {
  psychologistId: string;
  isDarkMode: boolean;
}

const CrisisAlertsPanel: React.FC<CrisisAlertsPanelProps> = ({ psychologistId, isDarkMode }) => {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);

  useEffect(() => {
    if (!psychologistId) return;

    const q = query(
      collection(db, 'crisisAlerts'),
      where('psychologistId', '==', psychologistId),
      where('resolved', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alertsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as CrisisAlert[];

      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [psychologistId]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle className='w-5 h-5' />;
      case 'high':
        return <AlertTriangle className='w-5 h-5' />;
      case 'medium':
        return <Clock className='w-5 h-5' />;
      case 'low':
        return <CheckCircle className='w-5 h-5' />;
      default:
        return <Clock className='w-5 h-5' />;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'crisisAlerts', alertId), {
        resolved: true,
        resolvedAt: new Date(),
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  if (loading) {
    return (
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-300 rounded mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-300 rounded'></div>
            <div className='h-4 bg-gray-300 rounded'></div>
            <div className='h-4 bg-gray-300 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='flex items-center justify-between mb-4'>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🚨 Alertas de Crisis</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              alerts.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {alerts.length} activas
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className='text-center py-8'>
            <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-3' />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No hay alertas de crisis activas
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Todos tus pacientes están estables
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  alert.urgency === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : alert.urgency === 'high'
                    ? 'border-orange-500 bg-orange-50'
                    : alert.urgency === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-3'>
                    {getUrgencyIcon(alert.urgency)}
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-1'>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(alert.urgency)}`}>
                          {alert.urgency.toUpperCase()}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatTimeAgo(alert.createdAt)}
                        </span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {alert.patientName || `Paciente ${alert.patientId}`}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {alert.signals.length} señal(es) detectada(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resolveAlert(alert.id);
                    }}
                    className='p-1 hover:bg-gray-200 rounded transition-colors'
                  >
                    <X className='w-4 h-4 text-gray-500' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle de Alerta */}
      {selectedAlert && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className={`p-6 rounded-t-lg ${getUrgencyColor(selectedAlert.urgency)}`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {getUrgencyIcon(selectedAlert.urgency)}
                  <div>
                    <h2 className='text-xl font-bold'>Alerta de Crisis - {selectedAlert.urgency.toUpperCase()}</h2>
                    <p className='text-sm opacity-90'>{formatTimeAgo(selectedAlert.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className='text-white hover:text-gray-200 transition-colors'
                >
                  ✕
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              {/* Información del Paciente */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Información del Paciente
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nombre:</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedAlert.patientName || `Paciente ${selectedAlert.patientId}`}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono:</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedAlert.patientPhone || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Señales Detectadas */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Señales Detectadas
                </h3>
                <ul className='space-y-2'>
                  {selectedAlert.signals.map((signal, index) => (
                    <li key={index} className='flex items-start space-x-2'>
                      <span className='text-red-500 mt-1'>•</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acciones */}
              <div className='flex flex-col sm:flex-row gap-3'>
                <button
                  onClick={() => {
                    // Implementar lógica para contactar paciente
                    console.log('Contactando paciente:', selectedAlert.patientId);
                  }}
                  className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2'
                >
                  <Phone className='w-4 h-4' />
                  <span>Llamar Paciente</span>
                </button>

                <button
                  onClick={() => {
                    // Implementar lógica para enviar mensaje
                    console.log('Enviando mensaje a:', selectedAlert.patientId);
                  }}
                  className='flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2'
                >
                  <MessageCircle className='w-4 h-4' />
                  <span>Enviar Mensaje</span>
                </button>

                <button
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className='flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2'
                >
                  <CheckCircle className='w-4 h-4' />
                  <span>Marcar Resuelto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrisisAlertsPanel;

