import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  type: 'profile_incomplete' | 'general';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map((snapshotDoc) => {
      const data = snapshotDoc.data();
      const type: Notification['type'] =
        data.type === 'profile_incomplete' ? 'profile_incomplete' : 'general';
      return {
        id: snapshotDoc.id,
        type,
        title: typeof data.title === 'string' ? data.title : '',
        message: typeof data.message === 'string' ? data.message : '',
        userId: data.userId,
        isRead: data.isRead === true,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      };
    });
    callback(notifications);
  });
};
