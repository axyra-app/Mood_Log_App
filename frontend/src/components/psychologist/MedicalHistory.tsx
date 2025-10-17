import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, Plus, Edit, Trash2, Eye, Download, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useMedicalReports } from '../../hooks/useMedicalReports';
import { usePatients } from '../../hooks/usePatients';
import { MedicalReport, Patient } from '../../types';

interface MedicalHistoryProps {
  psychologistId: string;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ psychologistId }) => {
  const { user } = useAuth();
  const { medicalReports, loading: reportsLoading, createMedicalReport, updateMedicalReport, deleteMedicalReport } = useMedicalReports();
  const { patients } = usePatients(psychologistId);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    reportType: 'initial' as 'initial' | 'progress' | 'discharge' | 'emergency',
    title: '',
    content: '',
    diagnosis: '',
    treatment: '',
    recommendations: '',
    nextAppointment: ''
  });

  // Filtrar reportes por paciente seleccionado
  const filteredReports = medicalReports.filter(report => {
    const matchesPatient = selectedPatient === '' || report.patientId === selectedPatient;
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPatient && matchesSearch;
  });

  // Obtener reportes del psicólogo
  const psychologistReports = filteredReports.filter(
    report => report.psychologistId === psychologistId
  );

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.title || !formData.content) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      await createMedicalReport(formData.patientId, {
        userId: formData.patientId,
        psychologistId: psychologistId,
        reportType: formData.reportType,
        title: formData.title,
        content: formData.content,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        recommendations: formData.recommendations,
        nextAppointment: formData.nextAppointment ? new Date(formData.nextAppointment) : undefined,
        sessionDate: new Date().toISOString().split('T')[0],
        sessionType: 'individual',
        symptoms: [],
        progress: 'new',
        notes: formData.content,
        moodScore: 0,
        anxietyLevel: 0,
        depressionLevel: 0,
      });

      toast.success('Historia médica creada exitosamente');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating medical report:', error);
      toast.error('Error al crear la historia médica');
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReport) return;

    try {
      await updateMedicalReport(selectedReport.id, {
        reportType: formData.reportType,
        title: formData.title,
        content: formData.content,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        recommendations: formData.recommendations,
        nextAppointment: formData.nextAppointment ? new Date(formData.nextAppointment) : undefined
      });

      toast.success('Historia médica actualizada exitosamente');
      setShowEditModal(false);
      setSelectedReport(null);
      resetForm();
    } catch (error) {
      console.error('Error updating medical report:', error);
      toast.error('Error al actualizar la historia médica');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta historia médica?')) return;

    try {
      await deleteMedicalReport(reportId);
      toast.success('Historia médica eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting medical report:', error);
      toast.error('Error al eliminar la historia médica');
    }
  };

  const handleEditReport = (report: MedicalReport) => {
    setSelectedReport(report);
    setFormData({
      patientId: report.patientId,
      reportType: report.reportType,
      title: report.title,
      content: report.content,
      diagnosis: report.diagnosis || '',
      treatment: report.treatment || '',
      recommendations: report.recommendations || '',
      nextAppointment: report.nextAppointment ? report.nextAppointment.toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleViewReport = (report: MedicalReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      reportType: 'initial',
      title: '',
      content: '',
      diagnosis: '',
      treatment: '',
      recommendations: '',
      nextAppointment: ''
    });
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-green-100 text-green-800';
      case 'discharge': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'initial': return 'Inicial';
      case 'progress': return 'Seguimiento';
      case 'discharge': return 'Alta';
      case 'emergency': return 'Emergencia';
      default: return type;
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.displayName : 'Paciente no encontrado';
  };

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historias Médicas</h2>
          <p className="text-gray-600">Gestiona el historial médico de tus pacientes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              
              setShowHistoryModal(true);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver Historial
          </button>
          <button
            onClick={() => {
              
              setShowCreateModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Historia
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar en historias médicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="w-64">
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todos los pacientes</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Historias Médicas */}
      <div className="bg-white rounded-lg shadow-sm border">
        {psychologistReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay historias médicas registradas</p>
            <p className="text-sm">Crea una nueva historia médica para comenzar</p>
          </div>
        ) : (
          <div className="divide-y">
            {psychologistReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                        {getReportTypeLabel(report.reportType)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{getPatientName(report.patientId)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{report.createdAt.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          {report.content.length > 100 ? '...' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {report.content.length > 200 
                          ? `${report.content.substring(0, 200)}...` 
                          : report.content}
                      </p>
                    </div>
                    
                    {report.diagnosis && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500">Diagnóstico: </span>
                        <span className="text-sm text-gray-700">{report.diagnosis}</span>
                      </div>
                    )}
                    
                    {report.treatment && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500">Tratamiento: </span>
                        <span className="text-sm text-gray-700">{report.treatment}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditReport(report)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Historia Médica */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nueva Historia Médica</h3>
            
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                  <select
                    value={formData.reportType}
                    onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="initial">Consulta Inicial</option>
                    <option value="progress">Seguimiento</option>
                    <option value="discharge">Alta Médica</option>
                    <option value="emergency">Emergencia</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Consulta inicial - Ansiedad"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={6}
                  placeholder="Describe la consulta, síntomas, observaciones..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Diagnóstico clínico..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Plan de tratamiento recomendado..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recomendaciones</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Recomendaciones para el paciente..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Cita</label>
                <input
                  type="date"
                  value={formData.nextAppointment}
                  onChange={(e) => setFormData({ ...formData, nextAppointment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Crear Historia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Historia Médica */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedReport.title}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Paciente:</span>
                  <span className="ml-2">{getPatientName(selectedReport.patientId)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <span className="ml-2">{selectedReport.createdAt.toLocaleDateString('es-ES')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getReportTypeColor(selectedReport.reportType)}`}>
                    {getReportTypeLabel(selectedReport.reportType)}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Contenido:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              </div>
              
              {selectedReport.diagnosis && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Diagnóstico:</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedReport.diagnosis}</p>
                  </div>
                </div>
              )}
              
              {selectedReport.treatment && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Tratamiento:</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedReport.treatment}</p>
                  </div>
                </div>
              )}
              
              {selectedReport.recommendations && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recomendaciones:</h4>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedReport.recommendations}</p>
                  </div>
                </div>
              )}
              
              {selectedReport.nextAppointment && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Próxima Cita:</h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      {selectedReport.nextAppointment.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Historia Médica */}
      {showEditModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Historia Médica</h3>
            
            <form onSubmit={handleUpdateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="initial">Consulta Inicial</option>
                  <option value="progress">Seguimiento</option>
                  <option value="discharge">Alta Médica</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recomendaciones</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Cita</label>
                <input
                  type="date"
                  value={formData.nextAppointment}
                  onChange={(e) => setFormData({ ...formData, nextAppointment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Actualizar Historia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Historial Completo */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Historial Completo de Reportes Médicos</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {psychologistReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay reportes médicos registrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {psychologistReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{report.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                              {getReportTypeLabel(report.reportType)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{getPatientName(report.patientId)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{report.createdAt.toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {report.content.length > 200 
                                ? `${report.content.substring(0, 200)}...` 
                                : report.content}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditReport(report)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
