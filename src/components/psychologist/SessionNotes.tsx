import { Calendar, Clock, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  createSessionNote,
  deleteSessionNote,
  getSessionNotes,
  updateSessionNote,
} from '../../services/patientService';
import { Patient, SessionNote } from '../../types';

interface SessionNotesProps {
  patients: Patient[];
}

const SessionNotes: React.FC<SessionNotesProps> = ({ patients }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      loadSessionNotes();
    }
  }, [selectedPatient]);

  const loadSessionNotes = async () => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      const notes = await getSessionNotes(selectedPatient.id);
      setSessionNotes(notes);
    } catch (error) {
      console.error('Error cargando notas de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData: Partial<SessionNote>) => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      await createSessionNote({
        patientId: selectedPatient.id,
        psychologistId: selectedPatient.psychologistId,
        sessionDate: noteData.sessionDate || new Date(),
        sessionType: noteData.sessionType || 'individual',
        duration: noteData.duration || 50,
        notes: noteData.notes || '',
        observations: noteData.observations || '',
        interventions: noteData.interventions || [],
        homework: noteData.homework || '',
        nextSessionGoals: noteData.nextSessionGoals || [],
        moodBefore: noteData.moodBefore || 5,
        moodAfter: noteData.moodAfter || 5,
        progress: noteData.progress || 5,
        concerns: noteData.concerns || [],
        strengths: noteData.strengths || [],
        attachments: noteData.attachments || [],
        isConfidential: noteData.isConfidential || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      loadSessionNotes();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creando nota de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<SessionNote>) => {
    try {
      setLoading(true);
      await updateSessionNote(noteId, updates);
      loadSessionNotes();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error actualizando nota de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota de sesión?')) {
      try {
        setLoading(true);
        await deleteSessionNote(noteId);
        loadSessionNotes();
      } catch (error) {
        console.error('Error eliminando nota de sesión:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredNotes = sessionNotes.filter(
    (note) =>
      note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.observations.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'group':
        return 'bg-green-100 text-green-800';
      case 'family':
        return 'bg-purple-100 text-purple-800';
      case 'online':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Notas de Sesión</h2>
        {selectedPatient && (
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            <Plus className='h-4 w-4 mr-2' />
            Nueva Nota
          </button>
        )}
      </div>

      {/* Patient Selection */}
      <div className='bg-white p-4 rounded-lg shadow'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Seleccionar Paciente</label>
        <select
          value={selectedPatient?.id || ''}
          onChange={(e) => {
            const patient = patients.find((p) => p.id === e.target.value);
            setSelectedPatient(patient || null);
          }}
          className='block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
        >
          <option value=''>Selecciona un paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              Paciente {patient.id.slice(0, 8)} - {patient.status}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <>
          {/* Search */}
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='text'
                placeholder='Buscar en notas...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500'
              />
            </div>
          </div>

          {/* Session Notes List */}
          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            {loading ? (
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto'></div>
                <p className='mt-2 text-gray-600'>Cargando notas...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>No hay notas de sesión para este paciente</div>
            ) : (
              <ul className='divide-y divide-gray-200'>
                {filteredNotes.map((note) => (
                  <li key={note.id}>
                    <div className='px-4 py-4 hover:bg-gray-50'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-3'>
                            <div className='flex-shrink-0'>
                              <Calendar className='h-5 w-5 text-gray-400' />
                            </div>
                            <div>
                              <p className='text-sm font-medium text-gray-900'>
                                {new Date(note.sessionDate).toLocaleDateString()}
                              </p>
                              <div className='flex items-center space-x-2 mt-1'>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionTypeColor(
                                    note.sessionType
                                  )}`}
                                >
                                  {note.sessionType}
                                </span>
                                <span className='flex items-center text-xs text-gray-500'>
                                  <Clock className='h-3 w-3 mr-1' />
                                  {note.duration} min
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='mt-2'>
                            <p className='text-sm text-gray-600 line-clamp-2'>{note.notes}</p>
                          </div>
                          <div className='mt-2 flex items-center space-x-4'>
                            <div className='flex items-center space-x-1'>
                              <span className='text-sm text-gray-500'>Mood antes:</span>
                              <span className='text-lg'>{getMoodEmoji(note.moodBefore)}</span>
                              <span className='text-sm text-gray-500'>({note.moodBefore}/5)</span>
                            </div>
                            <div className='flex items-center space-x-1'>
                              <span className='text-sm text-gray-500'>Mood después:</span>
                              <span className='text-lg'>{getMoodEmoji(note.moodAfter)}</span>
                              <span className='text-sm text-gray-500'>({note.moodAfter}/5)</span>
                            </div>
                            <div className='flex items-center space-x-1'>
                              <span className='text-sm text-gray-500'>Progreso:</span>
                              <span className='text-sm font-medium text-green-600'>{note.progress}/10</span>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => {
                              setSelectedNote(note);
                              setShowDetailsModal(true);
                            }}
                            className='text-gray-400 hover:text-gray-600'
                            title='Ver detalles'
                          >
                            <Eye className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNote(note);
                              setShowEditModal(true);
                            }}
                            className='text-gray-400 hover:text-gray-600'
                            title='Editar'
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className='text-gray-400 hover:text-red-600'
                            title='Eliminar'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Create Note Modal */}
      {showCreateModal && selectedPatient && (
        <CreateSessionNoteModal
          patient={selectedPatient}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNote}
          loading={loading}
        />
      )}

      {/* Edit Note Modal */}
      {showEditModal && selectedNote && (
        <EditSessionNoteModal
          note={selectedNote}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updates) => handleUpdateNote(selectedNote.id, updates)}
          loading={loading}
        />
      )}

      {/* Note Details Modal */}
      {showDetailsModal && selectedNote && (
        <SessionNoteDetailsModal note={selectedNote} onClose={() => setShowDetailsModal(false)} />
      )}
    </div>
  );
};

// Modal Components
const CreateSessionNoteModal: React.FC<{
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: Partial<SessionNote>) => void;
  loading: boolean;
}> = ({ patient, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    sessionType: 'individual' as const,
    duration: 50,
    notes: '',
    observations: '',
    interventions: '',
    homework: '',
    nextSessionGoals: '',
    moodBefore: 5,
    moodAfter: 5,
    progress: 5,
    concerns: '',
    strengths: '',
    isConfidential: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sessionDate: new Date(formData.sessionDate),
      interventions: formData.interventions.split(',').map((i) => i.trim()),
      nextSessionGoals: formData.nextSessionGoals.split(',').map((g) => g.trim()),
      concerns: formData.concerns.split(',').map((c) => c.trim()),
      strengths: formData.strengths.split(',').map((s) => s.trim()),
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Nueva Nota de Sesión</h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Fecha de Sesión</label>
                <input
                  type='date'
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Tipo de Sesión</label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as any })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='individual'>Individual</option>
                  <option value='group'>Grupo</option>
                  <option value='family'>Familiar</option>
                  <option value='online'>Online</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Duración (minutos)</label>
                <input
                  type='number'
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  min='15'
                  max='120'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Mood Antes (1-5)</label>
                <input
                  type='number'
                  value={formData.moodBefore}
                  onChange={(e) => setFormData({ ...formData, moodBefore: parseInt(e.target.value) })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  min='1'
                  max='5'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Mood Después (1-5)</label>
                <input
                  type='number'
                  value={formData.moodAfter}
                  onChange={(e) => setFormData({ ...formData, moodAfter: parseInt(e.target.value) })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  min='1'
                  max='5'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Progreso (1-10)</label>
                <input
                  type='number'
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  min='1'
                  max='10'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Notas de la Sesión</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                rows={4}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Observaciones</label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                rows={3}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Intervenciones (separar con comas)</label>
              <input
                type='text'
                value={formData.interventions}
                onChange={(e) => setFormData({ ...formData, interventions: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                placeholder='Técnica de relajación, Terapia cognitiva, etc.'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Tarea para Casa</label>
              <textarea
                value={formData.homework}
                onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                rows={2}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Objetivos para Próxima Sesión (separar con comas)
              </label>
              <input
                type='text'
                value={formData.nextSessionGoals}
                onChange={(e) => setFormData({ ...formData, nextSessionGoals: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                placeholder='Continuar con técnicas de relajación, Trabajar en autoestima, etc.'
              />
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='isConfidential'
                checked={formData.isConfidential}
                onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
              />
              <label htmlFor='isConfidential' className='ml-2 block text-sm text-gray-900'>
                Información confidencial
              </label>
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
              >
                {loading ? 'Creando...' : 'Crear Nota'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditSessionNoteModal: React.FC<{
  note: SessionNote;
  onClose: () => void;
  onSubmit: (updates: Partial<SessionNote>) => void;
  loading: boolean;
}> = ({ note, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    sessionDate: note.sessionDate.toISOString().split('T')[0],
    sessionType: note.sessionType,
    duration: note.duration,
    notes: note.notes,
    observations: note.observations,
    interventions: note.interventions.join(', '),
    homework: note.homework || '',
    nextSessionGoals: note.nextSessionGoals.join(', '),
    moodBefore: note.moodBefore,
    moodAfter: note.moodAfter,
    progress: note.progress,
    concerns: note.concerns.join(', '),
    strengths: note.strengths.join(', '),
    isConfidential: note.isConfidential,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sessionDate: new Date(formData.sessionDate),
      interventions: formData.interventions.split(',').map((i) => i.trim()),
      nextSessionGoals: formData.nextSessionGoals.split(',').map((g) => g.trim()),
      concerns: formData.concerns.split(',').map((c) => c.trim()),
      strengths: formData.strengths.split(',').map((s) => s.trim()),
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Editar Nota de Sesión</h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Similar form fields as CreateSessionNoteModal */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Fecha de Sesión</label>
                <input
                  type='date'
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Tipo de Sesión</label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as any })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='individual'>Individual</option>
                  <option value='group'>Grupo</option>
                  <option value='family'>Familiar</option>
                  <option value='online'>Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Notas de la Sesión</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                rows={4}
                required
              />
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SessionNoteDetailsModal: React.FC<{
  note: SessionNote;
  onClose: () => void;
}> = ({ note, onClose }) => {
  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>Detalles de la Nota de Sesión</h3>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
              ✕
            </button>
          </div>

          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 p-4 rounded'>
                <h4 className='font-medium text-gray-900 mb-2'>Información Básica</h4>
                <div className='space-y-1 text-sm'>
                  <p>
                    <strong>Fecha:</strong> {new Date(note.sessionDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {note.sessionType}
                  </p>
                  <p>
                    <strong>Duración:</strong> {note.duration} minutos
                  </p>
                  <p>
                    <strong>Confidencial:</strong> {note.isConfidential ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded'>
                <h4 className='font-medium text-gray-900 mb-2'>Estado de Ánimo</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <span>Antes:</span>
                    <span className='text-lg'>{getMoodEmoji(note.moodBefore)}</span>
                    <span>({note.moodBefore}/5)</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span>Después:</span>
                    <span className='text-lg'>{getMoodEmoji(note.moodAfter)}</span>
                    <span>({note.moodAfter}/5)</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span>Progreso:</span>
                    <span className='font-medium text-green-600'>{note.progress}/10</span>
                  </div>
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded'>
                <h4 className='font-medium text-gray-900 mb-2'>Mejora</h4>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {note.moodAfter - note.moodBefore > 0 ? '+' : ''}
                    {note.moodAfter - note.moodBefore}
                  </div>
                  <div className='text-sm text-gray-600'>puntos de mejora</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Notas de la Sesión</h4>
              <div className='bg-gray-50 p-4 rounded text-sm'>{note.notes}</div>
            </div>

            {note.observations && (
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Observaciones</h4>
                <div className='bg-gray-50 p-4 rounded text-sm'>{note.observations}</div>
              </div>
            )}

            {note.interventions.length > 0 && (
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Intervenciones</h4>
                <div className='bg-gray-50 p-4 rounded'>
                  <ul className='list-disc list-inside text-sm space-y-1'>
                    {note.interventions.map((intervention, index) => (
                      <li key={index}>{intervention}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {note.homework && (
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Tarea para Casa</h4>
                <div className='bg-gray-50 p-4 rounded text-sm'>{note.homework}</div>
              </div>
            )}

            {note.nextSessionGoals.length > 0 && (
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Objetivos para Próxima Sesión</h4>
                <div className='bg-gray-50 p-4 rounded'>
                  <ul className='list-disc list-inside text-sm space-y-1'>
                    {note.nextSessionGoals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className='flex justify-end mt-6'>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionNotes;
