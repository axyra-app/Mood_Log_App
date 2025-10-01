import { Activity, AlertTriangle, Brain, Heart, Shield, Users } from 'lucide-react';
import React, { useState } from 'react';
import { CrisisAssessment } from '../services/crisisDetection';

interface CrisisAlertProps {
  assessment: CrisisAssessment;
  onDismiss: () => void;
  onContactPsychologist: () => void;
  onEmergencyContact: () => void;
}

const CrisisAlert: React.FC<CrisisAlertProps> = ({
  assessment,
  onDismiss,
  onContactPsychologist,
  onEmergencyContact,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <AlertTriangle className='w-6 h-6' />;
      case 'high':
        return <Shield className='w-6 h-6' />;
      case 'medium':
        return <Heart className='w-6 h-6' />;
      case 'low':
        return <Brain className='w-6 h-6' />;
      default:
        return <Activity className='w-6 h-6' />;
    }
  };

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'mood':
        return <Heart className='w-4 h-4' />;
      case 'behavioral':
        return <Brain className='w-4 h-4' />;
      case 'social':
        return <Users className='w-4 h-4' />;
      case 'physical':
        return <Activity className='w-4 h-4' />;
      case 'verbal':
        return <AlertTriangle className='w-4 h-4' />;
      default:
        return <Activity className='w-4 h-4' />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className={`p-6 rounded-t-lg ${getRiskColor(assessment.overallRisk)}`}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              {getRiskIcon(assessment.overallRisk)}
              <div>
                <h2 className='text-xl font-bold'>
                  {assessment.overallRisk === 'critical'
                    ? '🚨 ALERTA CRÍTICA'
                    : assessment.overallRisk === 'high'
                    ? '⚠️ ALERTA ALTA'
                    : assessment.overallRisk === 'medium'
                    ? '⚠️ ALERTA MEDIA'
                    : '✅ ESTADO ESTABLE'}
                </h2>
                <p className='text-sm opacity-90'>Evaluación de Crisis - Confianza: {assessment.confidence}%</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className='text-white hover:text-gray-200 transition-colors'
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Señales detectadas */}
          {assessment.signals.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold mb-3 text-gray-800'>
                Señales Detectadas ({assessment.signals.length})
              </h3>
              <div className='space-y-2'>
                {assessment.signals.map((signal, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      signal.severity === 'critical'
                        ? 'border-red-500 bg-red-50'
                        : signal.severity === 'high'
                        ? 'border-orange-500 bg-orange-50'
                        : signal.severity === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className='flex items-start space-x-2'>
                      {getSignalIcon(signal.signalType)}
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-1'>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              signal.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : signal.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : signal.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {signal.severity.toUpperCase()}
                          </span>
                          <span className='text-sm text-gray-600 capitalize'>{signal.signalType}</span>
                        </div>
                        <p className='text-sm text-gray-700'>{signal.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {assessment.recommendations.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold mb-3 text-gray-800'>Recomendaciones</h3>
              <ul className='space-y-2'>
                {assessment.recommendations.map((recommendation, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span className='text-sm text-gray-700'>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acciones inmediatas */}
          {assessment.immediateActions.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold mb-3 text-gray-800'>Acciones Inmediatas</h3>
              <ul className='space-y-2'>
                {assessment.immediateActions.map((action, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span className='text-sm text-gray-700'>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Información adicional */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-sm font-semibold mb-2 text-gray-700'>Información de la Evaluación</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium text-gray-600'>Puntuación:</span>
                <span className='ml-2 text-gray-800'>{assessment.assessmentScore}</span>
              </div>
              <div>
                <span className='font-medium text-gray-600'>Confianza:</span>
                <span className='ml-2 text-gray-800'>{assessment.confidence}%</span>
              </div>
              <div>
                <span className='font-medium text-gray-600'>Seguimiento:</span>
                <span className='ml-2 text-gray-800'>{assessment.followUpRequired ? 'Requerido' : 'No requerido'}</span>
              </div>
              <div>
                <span className='font-medium text-gray-600'>Notificación:</span>
                <span className='ml-2 text-gray-800'>
                  {assessment.psychologistNotification ? 'Enviada' : 'No enviada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='p-6 bg-gray-50 rounded-b-lg'>
          <div className='flex flex-col sm:flex-row gap-3'>
            {assessment.overallRisk === 'critical' && (
              <button
                onClick={onEmergencyContact}
                className='flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium'
              >
                🚨 Contacto de Emergencia
              </button>
            )}

            {assessment.psychologistNotification && (
              <button
                onClick={onContactPsychologist}
                className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                👨‍⚕️ Contactar Psicólogo
              </button>
            )}

            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className='flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium'
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisAlert;
