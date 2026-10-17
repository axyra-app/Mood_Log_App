import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { serializeFirestoreValue, type ExportJsonValue } from '../utils/dataExport';

const PAGE_SIZE = 500;
const USER_OWNED_COLLECTIONS = [
  'moodLogs',
  'journalEntries',
  'notifications',
  'advancedReports',
  'statistics',
  'reminders',
] as const;

type UserOwnedCollection = (typeof USER_OWNED_COLLECTIONS)[number];

export interface UserDataExport {
  format: 'mood-log-user-data';
  formatVersion: 1;
  exportedAt: string;
  account: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  data: {
    profile: ExportJsonValue | null;
    userSettings: ExportJsonValue | null;
  } & Record<UserOwnedCollection, ExportJsonValue[]>;
}

const getAllUserDocuments = async (
  collectionName: UserOwnedCollection,
  userId: string
): Promise<ExportJsonValue[]> => {
  const documents: ExportJsonValue[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | undefined;

  while (true) {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(documentId()),
      limit(PAGE_SIZE),
    ];
    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    const page = await getDocs(query(collection(db, collectionName), ...constraints));
    documents.push(...page.docs.map((snapshot) =>
      serializeFirestoreValue({ id: snapshot.id, ...snapshot.data() })
    ));

    if (page.size < PAGE_SIZE) {
      return documents;
    }
    cursor = page.docs[page.docs.length - 1];
  }
};

export const exportUserData = async (
  userId: string,
  email: string | null,
  displayName: string | null
): Promise<UserDataExport> => {
  const [profileSnapshot, settingsSnapshot, ...collectionData] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDoc(doc(db, 'userSettings', userId)),
    ...USER_OWNED_COLLECTIONS.map((collectionName) => getAllUserDocuments(collectionName, userId)),
  ]);

  const collections = Object.fromEntries(
    USER_OWNED_COLLECTIONS.map((collectionName, index) => [collectionName, collectionData[index]])
  ) as Record<UserOwnedCollection, ExportJsonValue[]>;

  return {
    format: 'mood-log-user-data',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    account: { uid: userId, email, displayName },
    data: {
      profile: profileSnapshot.exists()
        ? serializeFirestoreValue({ id: profileSnapshot.id, ...profileSnapshot.data() })
        : null,
      userSettings: settingsSnapshot.exists()
        ? serializeFirestoreValue({ id: settingsSnapshot.id, ...settingsSnapshot.data() })
        : null,
      ...collections,
    },
  };
};
