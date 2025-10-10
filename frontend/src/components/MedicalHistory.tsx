import React, { useState } from 'react';
import { FileText, User, Calendar, TrendingUp, TrendingDown, Minus, Plus, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMedicalReports } from '../hooks/useMedicalReports';
import { useAuth } from '../contexts/AuthContext';

interface MedicalHistoryProps {
  isDarkMode: boolean;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState<any>(null);

  const {
    reports,
    loading,
    createMedicalReport,
    getPatientHistory,
    getReportsByPatient,
  } = useMedicalReports(user?.uid || '');

  // Obtener lista única de pacientes
  const patients = Array.from(
    new Map(reports.map(report => [report.userId, report.userName])).entries()
  ).map(([userId, userName]) => ({ userId, userName }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProgressColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'group':
        return 'bg-green-100 text-green-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'follow-up':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeText = (type: string) => {
    switch (type) {
      case 'individual':
        return 'Individual';
      case 'group':
        return 'Grupal';
      case 'emergency':
        return 'Emergencia';
      case 'follow-up':
        return 'Seguimiento';
      default:
        return 'Desconocido';
    }
  };

  const handleCreateReport = async (reportData: any) => {
    try {
      await createMedicalReport(selectedPatient!, reportData);
      toast.success('Reporte médico creado exitosamente');
      setShowReportForm(false);
    } catch (error) {
      console.error('Error creating medical report:', error);
      toast.error('Error al crear el reporte médico');
    }
  };

  const exportReport = (report: any) => {
    const reportText = `
REPORTE MÉDICO
==============

Paciente: ${report.userName}
Fecha de Sesión: ${formatDate(report.sessionDate)}
Tipo de Sesión: ${getSessionTypeText(report.sessionType)}
Psicólogo: ${report.psychologistName}

DIAGNÓSTICO:
${report.diagnosis || 'No especificado'}

SÍNTOMAS:
${report.symptoms.join(', ')}

TRATAMIENTO:
${report.treatment}

PROGRESO:
${report.progress}

NOTAS:
${report.notes}

RECOMENDACIONES:
${report.recommendations.join('\n- ')}

Puntuación de Estado de Ánimo: ${report.moodScore || 'N/A'}
Nivel de Ansiedad: ${report.anxietyLevel || 'N/A'}
Nivel de Depresión: ${report.depressionLevel || 'N/A'}

Próxima Cita: ${report.nextAppointment || 'No programada'}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${report.userName}-${report.sessionDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className={`text-xl font-semibold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Historial Médico
          </h2>
        </div>
        
        <button
          onClick={() => setShowReportForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Reporte</span>
        </button>
      </div>

      {/* Patient Selection */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Seleccionar Paciente
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {patients.map((patient) => {
            const history = getPatientHistory(patient.userId);
            return (
              <button
                key={patient.userId}
                onClick={() => setSelectedPatient(patient.userId)}
                className={`p-4 rounded-lg border transition-colors duration-300 text-left ${
                  selectedPatient === patient.userId
                    ? isDarkMode
                      ? 'bg-purple-600 border-purple-500'
                      : 'bg-purple-50 border-purple-500'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium transition-colors duration-500 ${
                      selectedPatient === patient.userId
                        ? 'text-white'
                        : isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}>
                      {patient.userName}
                    </h3>
                    {history && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs transition-colors duration-500 ${
                          selectedPatient === patient.userId
                            ? 'text-purple-100'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}>
                          {history.totalSessions} sesiones
                        </span>
                        <div className={`flex items-center space-x-1 ${getProgressColor(history.progressTrend)}`}>
                          {getProgressIcon(history.progressTrend)}
                          <span className="text-xs">
                            {history.progressTrend === 'improving' ? 'Mejorando' : 
                             history.progressTrend === 'declining' ? 'Empeorando' : 'Estable'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient History */}
      {selectedPatient && (
        <div className="space-y-4">
          {(() => {
            const history = getPatientHistory(selectedPatient);
            const patientReports = getReportsByPatient(selectedPatient);
            
            if (!history) return null;

            return (
              <>
                {/* Patient Summary */}
                <div className={`p-4 rounded-lg border transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Resumen del Paciente
                      </h3>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {history.totalSessions} sesiones desde {formatDate(history.firstSession.toISOString().split('T')[0])}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Estado de Ánimo Promedio
                      </p>
                      <p className={`text-lg font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {history.averageMoodScore.toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                  <h4 className={`text-lg font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Reportes Médicos
                  </h4>
                  
                  {patientReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-lg border transition-colors duration-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          
                          <div>
                            <h5 className={`font-medium transition-colors duration-500 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatDate(report.sessionDate)}
                            </h5>
                            <p className={`text-sm transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {report.sessionType}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSessionTypeColor(report.sessionType)}`}>
                                {getSessionTypeText(report.sessionType)}
                              </span>
                              {report.moodScore && (
                                <span className={`text-xs transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  Estado: {report.moodScore}/10
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowReportDetails(report)}
                            className={`p-2 rounded-lg transition-colors duration-300 ${
                              isDarkMode
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportReport(report)}
                            className={`p-2 rounded-lg transition-colors duration-300 ${
                              isDarkMode
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {!selectedPatient && (
        <div className="text-center py-8">
          <FileText className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Selecciona un paciente para ver su historial médico
          </p>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-xl transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Detalles del Reporte Médico
              </h3>
              <button
                onClick={() => setShowReportDetails(null)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Paciente
                  </label>
                  <p className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {showReportDetails.userName}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fecha de Sesión
                  </label>
                  <p className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDate(showReportDetails.sessionDate)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Diagnóstico
                </label>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {showReportDetails.diagnosis || 'No especificado'}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Síntomas
                </label>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {showReportDetails.symptoms.join(', ')}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tratamiento
                </label>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {showReportDetails.treatment}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Notas
                </label>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {showReportDetails.notes}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Recomendaciones
                </label>
                <ul className={`list-disc list-inside transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {showReportDetails.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
