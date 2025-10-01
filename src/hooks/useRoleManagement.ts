import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/firebase';

// Tipos para el sistema de roles
export type UserRole = 'user' | 'psychologist' | 'admin' | 'moderator';

export interface RolePermissions {
  canViewMoodLogs: boolean;
  canCreateMoodLogs: boolean;
  canEditMoodLogs: boolean;
  canDeleteMoodLogs: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canManagePsychologists: boolean;
  canAccessAdminPanel: boolean;
  canModerateContent: boolean;
  canViewReports: boolean;
  canCreateReports: boolean;
  canManageAppointments: boolean;
  canViewCrisisAlerts: boolean;
  canManageCrisisAlerts: boolean;
  canAccessChat: boolean;
  canManageSettings: boolean;
}

export interface RoleConfig {
  name: string;
  description: string;
  permissions: RolePermissions;
  level: number; // 1 = user, 2 = psychologist, 3 = moderator, 4 = admin
  color: string;
  icon: string;
}

// Configuración de roles
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  user: {
    name: 'Usuario',
    description: 'Usuario regular que puede registrar su mood y acceder a análisis básicos',
    level: 1,
    color: 'blue',
    icon: '👤',
    permissions: {
      canViewMoodLogs: true,
      canCreateMoodLogs: true,
      canEditMoodLogs: true,
      canDeleteMoodLogs: false,
      canViewAnalytics: true,
      canManageUsers: false,
      canManagePsychologists: false,
      canAccessAdminPanel: false,
      canModerateContent: false,
      canViewReports: false,
      canCreateReports: false,
      canManageAppointments: false,
      canViewCrisisAlerts: false,
      canManageCrisisAlerts: false,
      canAccessChat: true,
      canManageSettings: true,
    },
  },
  psychologist: {
    name: 'Psicólogo',
    description: 'Profesional de la salud mental con acceso a pacientes y herramientas especializadas',
    level: 2,
    color: 'purple',
    icon: '🧠',
    permissions: {
      canViewMoodLogs: true,
      canCreateMoodLogs: false,
      canEditMoodLogs: false,
      canDeleteMoodLogs: false,
      canViewAnalytics: true,
      canManageUsers: false,
      canManagePsychologists: false,
      canAccessAdminPanel: false,
      canModerateContent: false,
      canViewReports: true,
      canCreateReports: true,
      canManageAppointments: true,
      canViewCrisisAlerts: true,
      canManageCrisisAlerts: true,
      canAccessChat: true,
      canManageSettings: true,
    },
  },
  moderator: {
    name: 'Moderador',
    description: 'Usuario con permisos especiales para moderar contenido y usuarios',
    level: 3,
    color: 'orange',
    icon: '🛡️',
    permissions: {
      canViewMoodLogs: true,
      canCreateMoodLogs: true,
      canEditMoodLogs: true,
      canDeleteMoodLogs: true,
      canViewAnalytics: true,
      canManageUsers: true,
      canManagePsychologists: false,
      canAccessAdminPanel: false,
      canModerateContent: true,
      canViewReports: true,
      canCreateReports: true,
      canManageAppointments: true,
      canViewCrisisAlerts: true,
      canManageCrisisAlerts: true,
      canAccessChat: true,
      canManageSettings: true,
    },
  },
  admin: {
    name: 'Administrador',
    description: 'Acceso completo al sistema con todos los permisos',
    level: 4,
    color: 'red',
    icon: '👑',
    permissions: {
      canViewMoodLogs: true,
      canCreateMoodLogs: true,
      canEditMoodLogs: true,
      canDeleteMoodLogs: true,
      canViewAnalytics: true,
      canManageUsers: true,
      canManagePsychologists: true,
      canAccessAdminPanel: true,
      canModerateContent: true,
      canViewReports: true,
      canCreateReports: true,
      canManageAppointments: true,
      canViewCrisisAlerts: true,
      canManageCrisisAlerts: true,
      canAccessChat: true,
      canManageSettings: true,
    },
  },
};

// Hook principal para manejo de roles
export const useRoleManagement = (userId?: string) => {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [permissions, setPermissions] = useState<RolePermissions>(ROLE_CONFIGS.user.permissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar rol del usuario
  const loadUserRole = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = (userData.role as UserRole) || 'user';

        setUserRole(role);
        setPermissions(ROLE_CONFIGS[role].permissions);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading user role:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar rol del usuario
  const updateUserRole = useCallback(async (uid: string, newRole: UserRole) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        updatedAt: new Date(),
      });

      setUserRole(newRole);
      setPermissions(ROLE_CONFIGS[newRole].permissions);

      // Si es psicólogo, también actualizar en la colección de psicólogos
      if (newRole === 'psychologist') {
        const psychologistDoc = await getDoc(doc(db, 'psychologists', uid));
        if (!psychologistDoc.exists()) {
          // Crear documento de psicólogo si no existe
          await setDoc(doc(db, 'psychologists', uid), {
            uid,
            role: 'psychologist',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating user role:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      return permissions[permission];
    },
    [permissions]
  );

  // Verificar si el usuario tiene al menos un nivel de rol
  const hasRoleLevel = useCallback(
    (minLevel: number): boolean => {
      return ROLE_CONFIGS[userRole].level >= minLevel;
    },
    [userRole]
  );

  // Verificar si el usuario puede realizar una acción en otro usuario
  const canManageUser = useCallback(
    (targetUserId: string, targetUserRole: UserRole): boolean => {
      const currentLevel = ROLE_CONFIGS[userRole].level;
      const targetLevel = ROLE_CONFIGS[targetUserRole].level;

      // Solo puede gestionar usuarios de nivel inferior
      return currentLevel > targetLevel;
    },
    [userRole]
  );

  // Obtener información del rol actual
  const getRoleInfo = useCallback(() => {
    return ROLE_CONFIGS[userRole];
  }, [userRole]);

  // Cargar rol cuando cambia el userId
  useEffect(() => {
    if (userId) {
      loadUserRole(userId);
    }
  }, [userId, loadUserRole]);

  return {
    userRole,
    permissions,
    loading,
    error,
    loadUserRole,
    updateUserRole,
    hasPermission,
    hasRoleLevel,
    canManageUser,
    getRoleInfo,
  };
};

// Hook para gestión de usuarios por rol
export const useUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener usuarios por rol
  const getUsersByRole = useCallback(async (role: UserRole) => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, 'users'), where('role', '==', role));
      const snapshot = await getDocs(q);

      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
      return usersData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting users by role:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener todos los usuarios
  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const snapshot = await getDocs(collection(db, 'users'));

      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
      return usersData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting all users:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar usuarios
  const searchUsers = useCallback(async (searchTerm: string, role?: UserRole) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, 'users'));

      if (role) {
        q = query(collection(db, 'users'), where('role', '==', role));
      }

      const snapshot = await getDocs(q);

      const usersData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (user) =>
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setUsers(usersData);
      return usersData;
    } catch (err: any) {
      setError(err.message);
      console.error('Error searching users:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    getUsersByRole,
    getAllUsers,
    searchUsers,
  };
};

// Hook para auditoría de roles
export const useRoleAudit = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registrar cambio de rol
  const logRoleChange = useCallback(
    async (userId: string, oldRole: UserRole, newRole: UserRole, changedBy: string, reason?: string) => {
      try {
        const auditEntry = {
          userId,
          oldRole,
          newRole,
          changedBy,
          reason: reason || 'Role change',
          timestamp: new Date(),
          type: 'role_change',
        };

        await setDoc(doc(collection(db, 'auditLogs')), auditEntry);
      } catch (err: any) {
        console.error('Error logging role change:', err);
      }
    },
    []
  );

  // Obtener logs de auditoría
  const getAuditLogs = useCallback(async (userId?: string, limit: number = 50) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, 'auditLogs'));

      if (userId) {
        q = query(collection(db, 'auditLogs'), where('userId', '==', userId));
      }

      const snapshot = await getDocs(q);

      const logs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate())
        .slice(0, limit);

      setAuditLogs(logs);
      return logs;
    } catch (err: any) {
      setError(err.message);
      console.error('Error getting audit logs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    auditLogs,
    loading,
    error,
    logRoleChange,
    getAuditLogs,
  };
};

// Utilidades para roles
export const roleUtils = {
  // Obtener todos los roles disponibles
  getAllRoles: (): UserRole[] => {
    return Object.keys(ROLE_CONFIGS) as UserRole[];
  },

  // Obtener roles por nivel mínimo
  getRolesByMinLevel: (minLevel: number): UserRole[] => {
    return Object.entries(ROLE_CONFIGS)
      .filter(([_, config]) => config.level >= minLevel)
      .map(([role, _]) => role as UserRole);
  },

  // Comparar niveles de rol
  compareRoleLevels: (role1: UserRole, role2: UserRole): number => {
    return ROLE_CONFIGS[role1].level - ROLE_CONFIGS[role2].level;
  },

  // Verificar si un rol puede gestionar otro
  canRoleManageRole: (managerRole: UserRole, targetRole: UserRole): boolean => {
    return ROLE_CONFIGS[managerRole].level > ROLE_CONFIGS[targetRole].level;
  },

  // Obtener permisos específicos de un rol
  getRolePermissions: (role: UserRole): RolePermissions => {
    return ROLE_CONFIGS[role].permissions;
  },

  // Verificar si un permiso está disponible en un rol
  hasRolePermission: (role: UserRole, permission: keyof RolePermissions): boolean => {
    return ROLE_CONFIGS[role].permissions[permission];
  },

  // Obtener estadísticas de roles
  getRoleStats: async (): Promise<Record<UserRole, number>> => {
    try {
      const stats: Record<UserRole, number> = {
        user: 0,
        psychologist: 0,
        admin: 0,
        moderator: 0,
      };

      for (const role of Object.keys(ROLE_CONFIGS) as UserRole[]) {
        const q = query(collection(db, 'users'), where('role', '==', role));
        const snapshot = await getDocs(q);
        stats[role] = snapshot.size;
      }

      return stats;
    } catch (error) {
      console.error('Error getting role stats:', error);
      return {
        user: 0,
        psychologist: 0,
        admin: 0,
        moderator: 0,
      };
    }
  },
};

export default roleUtils;
