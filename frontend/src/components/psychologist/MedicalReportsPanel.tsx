import { AlertTriangle, Calendar, CheckCircle, FileText, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useMedicalReports } from '../hooks/useMedicalReports';
import { MedicalReport } from '../types';

interface MedicalReportsPanelProps {
  psychologistId: string;
  isDarkMode: boolean;
}

const ReportCard: React.FC<{ report: MedicalReport; onEdit: (report: MedicalReport) => void }> = ({
  report,
  onEdit,
}) => {
  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'initial':
        return 'bg-blue-100 text-blue-800';
      case 'progress':
        return 'bg-green-100 text-green-800';
      case 'discharge':
        return 'bg-purple-100 text-purple-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'initial':
        return 'Evaluación Inicial';
      case 'progress':
        return 'Informe de Progreso';
      case 'discharge':
        return 'Informe de Alta';
      case 'emergency':
        return 'Informe de Emergencia';
      default:
        return type;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className='p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'
      onClick={() => onEdit(report)}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='flex-1'>
          <h4 className='font-medium text-gray-900 mb-1'>{report.title}</h4>
          <div className='flex items-center space-x-2 mb-2'>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
              {getReportTypeText(report.reportType)}
            </span>
            <span className={`text-xs font-medium ${getRiskColor(report.riskAssessment)}`}>
              Riesgo: {report.riskAssessment}
            </span>
          </div>
          <p className='text-sm text-gray-600 line-clamp-2'>{report.content.substring(0, 100)}...</p>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-500'>{report.createdAt.toLocaleDateString('es-ES')}</p>
          {report.isConfidential && (
            <div className='mt-1'>
              <span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded'>Confidencial</span>
            </div>
          )}
        </div>
      </div>

      {report.diagnosis && (
        <div className='mt-2'>
          <p className='text-xs text-gray-500'>
            <strong>Diagnóstico:</strong> {report.diagnosis}
          </p>
        </div>
      )}

      {report.nextAppointment && (
        <div className='mt-2 flex items-center text-xs text-gray-500'>
          <Calendar className='w-3 h-3 mr-1' />
          <span>Próxima cita: {report.nextAppointment.toLocaleDateString('es-ES')}</span>
        </div>
      )}
    </div>
  );
};

const MedicalReportsPanel: React.FC<MedicalReportsPanelProps> = ({ psychologistId, isDarkMode }) => {
  const { reports, templates, loading, createReport, deleteReport } = useMedicalReports(psychologistId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.reportType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateReport = async (templateId: string, patientId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    try {
      await createReport({
        patientId,
        psychologistId,
        reportType: template.reportType,
        title: template.title,
        content: template.content,
        diagnosis: '',
        treatmentPlan: '',
        recommendations: [],
        medications: [],
        riskAssessment: 'low',
        attachments: [],
        isConfidential: false,
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este informe?')) {
      try {
        await deleteReport(reportId);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-300 rounded mb-4'></div>
          <div className='space-y-3'>
            <div className='h-20 bg-gray-300 rounded'></div>
            <div className='h-20 bg-gray-300 rounded'></div>
            <div className='h-20 bg-gray-300 rounded'></div>
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
        <div className='flex items-center justify-between mb-6'>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📋 Informes Médicos</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
          >
            <Plus className='w-4 h-4' />
            <span>Nuevo Informe</span>
          </button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='relative flex-1'>
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type='text'
              placeholder='Buscar informes...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value='all'>Todos los tipos</option>
            <option value='initial'>Evaluación Inicial</option>
            <option value='progress'>Informe de Progreso</option>
            <option value='discharge'>Informe de Alta</option>
            <option value='emergency'>Informe de Emergencia</option>
          </select>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className='text-center py-8'>
            <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No hay informes médicos
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Crea tu primer informe médico para comenzar el seguimiento de tus pacientes
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} onEdit={setSelectedReport} />
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex items-center space-x-2'>
              <FileText className='w-4 h-4 text-blue-600' />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total</span>
            </div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reports.length}</div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex items-center space-x-2'>
              <AlertTriangle className='w-4 h-4 text-red-600' />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Alto Riesgo
              </span>
            </div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {reports.filter((r) => r.riskAssessment === 'high').length}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex items-center space-x-2'>
              <CheckCircle className='w-4 h-4 text-green-600' />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Completados
              </span>
            </div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {reports.filter((r) => r.reportType === 'discharge').length}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex items-center space-x-2'>
              <Calendar className='w-4 h-4 text-purple-600' />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Este Mes</span>
            </div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {
                reports.filter((r) => {
                  const reportDate = r.createdAt;
                  const now = new Date();
                  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                  return reportDate >= monthAgo;
                }).length
              }
            </div>
          </div>
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-xl max-w-md w-full'>
            <div className='p-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Crear Nuevo Informe</h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Seleccionar Plantilla</label>
                  <div className='space-y-2'>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          // For now, we'll use a placeholder patient ID
                          // In a real app, you'd select the patient first
                          handleCreateReport(template.id, 'placeholder-patient-id');
                        }}
                        className='w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <h4 className='font-medium text-gray-900'>{template.title}</h4>
                        <p className='text-sm text-gray-600'>{template.reportType}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='flex space-x-3 pt-6'>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalReportsPanel;
