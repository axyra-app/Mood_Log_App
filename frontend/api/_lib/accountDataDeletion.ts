import type { Auth } from 'firebase-admin/auth';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const FIRESTORE_PAGE_SIZE = 400;
const STORAGE_PAGE_SIZE = 500;
const STORAGE_DELETE_CONCURRENCY = 20;
type StorageBucket = ReturnType<ReturnType<typeof getStorage>['bucket']>;

const USER_DATA_COLLECTIONS = [
  'moodLogs',
  'journalEntries',
  'notifications',
  'advancedReports',
  'statistics',
  'reminders',
  'crisisAssessments',
  'crisisAlerts',
  'chats',
  'messages',
  'chatSessions',
  'chatMessages',
  'typing',
] as const;

const LEGACY_UID_OWNED_COLLECTIONS = new Set([
  'chats',
  'messages',
  'chatSessions',
  'chatMessages',
  'typing',
]);
const COLLECTIONS_WITH_POSSIBLE_SUBCOLLECTIONS = new Set(['chats', 'chatSessions']);

const deleteOwnedDocuments = async (firestore: Firestore, collectionName: string, uid: string) => {
  const collection = firestore.collection(collectionName);
  const ownershipFields = LEGACY_UID_OWNED_COLLECTIONS.has(collectionName)
    ? ['userId', 'uid']
    : ['userId'];

  while (true) {
    const snapshots = await Promise.all(
      ownershipFields.map((field) =>
        collection.where(field, '==', uid).limit(FIRESTORE_PAGE_SIZE).get()
      )
    );
    const documents = new Map(snapshots.flatMap((snapshot) =>
      snapshot.docs.map((document) => [document.ref.path, document] as const)
    ));

    if (documents.size === 0) return;

    const page = [...documents.values()].slice(0, FIRESTORE_PAGE_SIZE);
    if (COLLECTIONS_WITH_POSSIBLE_SUBCOLLECTIONS.has(collectionName)) {
      for (let index = 0; index < page.length; index += STORAGE_DELETE_CONCURRENCY) {
        await Promise.all(
          page.slice(index, index + STORAGE_DELETE_CONCURRENCY)
            .map((document) => firestore.recursiveDelete(document.ref))
        );
      }
    } else {
      const batch = firestore.batch();
      page.forEach((document) => batch.delete(document.ref));
      await batch.commit();
    }
  }
};

const deleteUserStorageFiles = async (bucket: StorageBucket, uid: string) => {
  const prefix = `users/${uid}/`;
  let pageToken: string | undefined;

  do {
    const [files, , response] = await bucket.getFiles({
      prefix,
      autoPaginate: false,
      maxResults: STORAGE_PAGE_SIZE,
      ...(pageToken ? { pageToken } : {}),
    });

    for (let index = 0; index < files.length; index += STORAGE_DELETE_CONCURRENCY) {
      await Promise.all(
        files.slice(index, index + STORAGE_DELETE_CONCURRENCY)
          .map((file) => file.delete({ ignoreNotFound: true }))
      );
    }

    pageToken = response && typeof response === 'object'
      && 'nextPageToken' in response
      && typeof response.nextPageToken === 'string'
      ? response.nextPageToken
      : undefined;
  } while (pageToken);
};

export const deleteUserOwnedData = async (
  firestore: Firestore,
  bucket: StorageBucket,
  auth: Auth,
  uid: string,
): Promise<void> => {
  const deletionRequestRef = firestore.collection('accountDeletionRequests').doc(uid);
  await deletionRequestRef.set({ requestedAt: FieldValue.serverTimestamp() }, { merge: true });

  for (const collectionName of USER_DATA_COLLECTIONS) {
    await deleteOwnedDocuments(firestore, collectionName, uid);
  }

  await deleteUserStorageFiles(bucket, uid);

  const quotaRef = firestore.collection('aiUsage').doc(uid);
  await quotaRef.delete();

  const profileRef = firestore.collection('users').doc(uid);
  const settingsRef = firestore.collection('userSettings').doc(uid);
  const [profileSnapshot, settingsSnapshot] = await Promise.all([
    profileRef.get(),
    settingsRef.get(),
  ]);

  let authenticationDeleted = false;
  try {
    await firestore.recursiveDelete(settingsRef);
    await firestore.recursiveDelete(profileRef);
    await auth.deleteUser(uid);
    authenticationDeleted = true;
  } catch (error) {
    const errorCode = error && typeof error === 'object' && 'code' in error
      ? error.code
      : undefined;
    if (errorCode === 'auth/user-not-found') {
      authenticationDeleted = true;
    } else {
      try {
        await Promise.all([
          profileSnapshot.exists ? profileRef.set(profileSnapshot.data()!) : Promise.resolve(),
          settingsSnapshot.exists ? settingsRef.set(settingsSnapshot.data()!) : Promise.resolve(),
        ]);
      } catch (restoreError) {
        const restoreCode = restoreError && typeof restoreError === 'object' && 'code' in restoreError
          ? restoreError.code
          : 'UnknownError';
        console.error('Account deletion rollback failed:', restoreCode);
        throw new Error('Account deletion failed and profile recovery needs support.');
      }
      throw error;
    }
  }

  if (authenticationDeleted) {
    try {
      await deletionRequestRef.delete();
    } catch (error) {
      const errorCode = error && typeof error === 'object' && 'code' in error
        ? error.code
        : 'UnknownError';
      console.error('Account deletion marker cleanup failed:', errorCode);
    }
  }
};
