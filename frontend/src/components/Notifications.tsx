import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Bell, Check, Clock, Heart, MessageCircle, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'mood_reminder' | 'achievement' | 'message' | 'system' | 'wellness';
  isRead: boolean;
  createdAt: any;
  actionUrl?: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
}

const Notifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchNotifications();
      createDefaultNotifications();
    }
  }, [userProfile?.uid]);

  const fetchNotifications = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n) => !n.isRead).length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const createDefaultNotifications = async () => {
    if (!userProfile?.uid) return;

    try {
      // Verificar si ya existen notificaciones
      const existingNotifications = await getDocs(
        query(collection(db, 'notifications'), where('userId', '==', userProfile.uid))
      );

      if (existingNotifications.empty) {
        // Crear notificaciones de bienvenida
        const welcomeNotifications = [
          {
            userId: userProfile.uid,
            title: '¡Bienvenido a Mood Log App!',
            message: 'Comienza registrando tu primer estado de ánimo para empezar tu viaje hacia el bienestar mental.',
            type: 'system',
            isRead: false,
            createdAt: serverTimestamp(),
            icon: '🎉',
            priority: 'high',
          },
          {
            userId: userProfile.uid,
            title: 'Recordatorio Diario',
            message: 'No olvides registrar cómo te sientes hoy. Tu bienestar mental es importante.',
            type: 'mood_reminder',
            isRead: false,
            createdAt: serverTimestamp(),
            icon: '💭',
            priority: 'medium',
          },
          {
            userId: userProfile.uid,
            title: 'Conecta con Psicólogos',
            message: 'Puedes chatear con psicólogos profesionales cuando lo necesites. Estamos aquí para ayudarte.',
            type: 'system',
            isRead: false,
            createdAt: serverTimestamp(),
            icon: '👩‍⚕️',
            priority: 'medium',
          },
        ];

        for (const notification of welcomeNotifications) {
          await addDoc(collection(db, 'notifications'), notification);
        }

        // Refrescar notificaciones
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error creating default notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
        });
      }

      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        deleted: true,
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => {
        const notification = notifications.find((n) => n.id === notificationId);
        return notification && !notification.isRead ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mood_reminder':
        return <Heart className='w-5 h-5 text-pink-500' />;
      case 'achievement':
        return <Star className='w-5 h-5 text-yellow-500' />;
      case 'message':
        return <MessageCircle className='w-5 h-5 text-blue-500' />;
      case 'wellness':
        return <Heart className='w-5 h-5 text-green-500' />;
      default:
        return <Bell className='w-5 h-5 text-gray-500' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-6'></div>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-20 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <Bell className='w-6 h-6 text-primary-600' />
          <h3 className='text-xl font-semibold text-gray-900'>Notificaciones</h3>
          {unreadCount > 0 && (
            <span className='bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center'>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <Bell className='w-16 h-16 mx-auto mb-4 text-gray-300' />
          <h4 className='text-lg font-medium text-gray-900 mb-2'>No hay notificaciones</h4>
          <p>Te notificaremos cuando tengas actualizaciones importantes</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                notification.isRead ? 'bg-gray-50 border-l-gray-300' : getPriorityColor(notification.priority)
              }`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3 flex-1'>
                  <div className='flex-shrink-0 mt-1'>{getTypeIcon(notification.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && <div className='w-2 h-2 bg-primary-500 rounded-full'></div>}
                    </div>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <div className='flex items-center gap-2 mt-2'>
                      <Clock className='w-3 h-3 text-gray-400' />
                      <span className='text-xs text-gray-400'>{formatTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4'>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className='p-1 text-gray-400 hover:text-green-600 transition-colors'
                      title='Marcar como leída'
                    >
                      <Check className='w-4 h-4' />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                    title='Eliminar'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acciones rápidas */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <div className='grid grid-cols-2 gap-3'>
          <button className='flex items-center justify-center gap-2 p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors'>
            <Heart className='w-4 h-4' />
            <span className='text-sm font-medium'>Registrar Estado de Ánimo</span>
          </button>
          <button className='flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors'>
            <MessageCircle className='w-4 h-4' />
            <span className='text-sm font-medium'>Chat con Psicólogos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
