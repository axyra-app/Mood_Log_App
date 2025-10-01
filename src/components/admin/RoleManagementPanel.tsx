import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { ROLE_CONFIGS, UserRole, useRoleAudit, useRoleManagement, useUserManagement } from '../hooks/useRoleManagement';

interface RoleManagementPanelProps {
  isDarkMode: boolean;
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const { userRole, permissions, updateUserRole, hasPermission, getRoleInfo } = useRoleManagement(user?.uid);

  const { users, loading: usersLoading, getAllUsers, getUsersByRole, searchUsers } = useUserManagement();

  const { auditLogs, getAuditLogs, logRoleChange } = useRoleAudit();

  const { showSuccess, showError } = useNotifications();

  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');

  useEffect(() => {
    if (hasPermission('canManageUsers')) {
      getAllUsers();
      getAuditLogs();
    }
  }, [hasPermission, getAllUsers, getAuditLogs]);

  const handleRoleChange = async () => {
    if (!selectedUser || !user) return;

    try {
      const success = await updateUserRole(selectedUser.id, newRole);

      if (success) {
        await logRoleChange(selectedUser.id, selectedUser.role, newRole, user.uid, reason);

        showSuccess(
          'Rol actualizado',
          `El rol de ${selectedUser.displayName} ha sido cambiado a ${ROLE_CONFIGS[newRole].name}`
        );

        // Actualizar lista de usuarios
        getAllUsers();
        getAuditLogs();

        // Limpiar formulario
        setSelectedUser(null);
        setReason('');
      } else {
        showError('Error', 'No se pudo actualizar el rol del usuario');
      }
    } catch (error: any) {
      showError('Error', error.message);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchUsers(searchTerm, selectedRole);
    } else {
      await getUsersByRole(selectedRole);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (selectedRole !== 'all' && user.role !== selectedRole) return false;
    if (
      searchTerm &&
      !user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  if (!hasPermission('canManageUsers')) {
    return (
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🚫</div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Acceso Denegado</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No tienes permisos para acceder a la gestión de usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className='mb-6'>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          👑 Gestión de Roles y Usuarios
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Administra roles y permisos de usuarios del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className={`mb-6 rounded-xl p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className='flex space-x-1'>
          {[
            { id: 'users', label: 'Usuarios', icon: '👥' },
            { id: 'roles', label: 'Roles', icon: '🎭' },
            { id: 'audit', label: 'Auditoría', icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-600 shadow-sm'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className='mr-2'>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div className='space-y-6'>
          {/* Search and Filter */}
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <input
                type='text'
                placeholder='Buscar usuarios...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div className='md:w-48'>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value='all'>Todos los roles</option>
                {Object.entries(ROLE_CONFIGS).map(([role, config]) => (
                  <option key={role} value={role}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className='px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium'
            >
              🔍 Buscar
            </button>
          </div>

          {/* Users List */}
          <div className='space-y-3'>
            {usersLoading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando usuarios...</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-xl border transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold'>
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.displayName || 'Sin nombre'}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-center'>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            ROLE_CONFIGS[user.role]?.color === 'blue'
                              ? 'bg-blue-100 text-blue-800'
                              : ROLE_CONFIGS[user.role]?.color === 'purple'
                              ? 'bg-purple-100 text-purple-800'
                              : ROLE_CONFIGS[user.role]?.color === 'orange'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ROLE_CONFIGS[user.role]?.icon} {ROLE_CONFIGS[user.role]?.name}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium'
                      >
                        Cambiar Rol
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Object.entries(ROLE_CONFIGS).map(([role, config]) => (
            <div
              key={role}
              className={`p-6 rounded-xl border transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className='text-center'>
                <div className='text-4xl mb-3'>{config.icon}</div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {config.name}
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{config.description}</p>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    config.color === 'blue'
                      ? 'bg-blue-100 text-blue-800'
                      : config.color === 'purple'
                      ? 'bg-purple-100 text-purple-800'
                      : config.color === 'orange'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Nivel {config.level}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className='space-y-4'>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📋 Historial de Cambios de Rol
          </h3>
          <div className='space-y-3'>
            {auditLogs.map((log, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Cambio de rol: {ROLE_CONFIGS[log.oldRole]?.name} → {ROLE_CONFIGS[log.newRole]?.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Usuario: {log.userId} | Razón: {log.reason}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {log.timestamp?.toDate?.()?.toLocaleString() || 'Fecha no disponible'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Por: {log.changedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className={`p-6 rounded-xl max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cambiar Rol de Usuario
            </h3>

            <div className='mb-4'>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Usuario: <strong>{selectedUser.displayName}</strong>
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Rol actual: {ROLE_CONFIGS[selectedUser.role]?.name}
              </p>
            </div>

            <div className='mb-4'>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nuevo Rol
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {Object.entries(ROLE_CONFIGS).map(([role, config]) => (
                  <option key={role} value={role}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='mb-6'>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Razón del cambio
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='Explica por qué se cambia el rol...'
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 resize-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={3}
              />
            </div>

            <div className='flex space-x-3'>
              <button
                onClick={() => setSelectedUser(null)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleRoleChange}
                className='flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium'
              >
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPanel;
