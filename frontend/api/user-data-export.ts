import { getAuth } from 'firebase-admin/auth';
import { FieldPath, getFirestore, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { withApiCors } from './_lib/apiCors.ts';
import { getFirebaseAdminApp } from './_lib/firebaseAdmin.ts';
import {
  LEGACY_UID_OWNED_COLLECTIONS,
  USER_DATA_COLLECTIONS,
  createDataExportCoverage,
  serializeAiUsageForExport,
  serializeFirestoreValue,
  type ExportJsonValue,
} from '../src/utils/dataExport.ts';

const PAGE_SIZE = 100;
const INVALID_TOKEN_CODES = new Set([
  'auth/argument-error',
  'auth/id-token-expired',
  'auth/invalid-id-token',
  'auth/id-token-revoked',
  'auth/user-disabled',
  'auth/user-not-found',
]);

interface VerifiedExportToken {
  uid: string;
}

interface ExportServices {
  auth: {
    verifyIdToken(token: string, checkRevoked?: boolean): Promise<VerifiedExportToken>;
    getUser(uid: string): Promise<{ email?: string; displayName?: string }>;
  };
  firestore: ReturnType<typeof getFirestore>;
}

interface ExportHandlerDependencies {
  getServices(): Promise<ExportServices>;
}

type ExportStreamRecord =
  | {
      type: 'metadata';
      format: 'mood-log-user-data';
      formatVersion: 8;
      exportedAt: string;
      account: { uid: string; email: string | null; displayName: string | null };
      coverage: ReturnType<typeof createDataExportCoverage>;
    }
  | { type: 'document'; path: string; data: ExportJsonValue }
  | { type: 'end'; documentCount: number }
  | { type: 'error'; code: 'EXPORT_FAILED' };

const jsonResponse = (status: number, body: unknown): Response => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

const getSafeErrorCode = (error: unknown): string => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error ? error.name : 'UnknownError';
  }
  const code = error.code;
  return typeof code === 'string' && /^[A-Za-z0-9/_-]{1,80}$/.test(code)
    ? code
    : error instanceof Error ? error.name : 'UnknownError';
};

const getExportStream = (
  firestore: ExportServices['firestore'],
  uid: string,
  account: { email: string | null; displayName: string | null },
): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (record: ExportStreamRecord) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(record)}\n`));
      };

      void (async () => {
        let documentCount = 0;
        try {
          send({
            type: 'metadata',
            format: 'mood-log-user-data',
            formatVersion: 8,
            exportedAt: new Date().toISOString(),
            account: { uid, ...account },
            coverage: createDataExportCoverage(),
          });

          const profileRef = firestore.collection('users').doc(uid);
          const settingsRef = firestore.collection('userSettings').doc(uid);
          const aiUsageRef = firestore.collection('aiUsage').doc(uid);
          const pushReminderRef = firestore.collection('dailyPushReminders').doc(uid);
          const [profile, settings, aiUsage, pushReminder] = await Promise.all([
            profileRef.get(),
            settingsRef.get(),
            aiUsageRef.get(),
            pushReminderRef.get(),
          ]);
          const reminder = pushReminder.data();
          if (typeof reminder?.time === 'string' && typeof reminder.timeZone === 'string') {
            send({ type: 'document', path: pushReminderRef.path, data: { time: reminder.time, timeZone: reminder.timeZone } });
          }

          if (profile.exists) {
            send({
              type: 'document',
              path: profileRef.path,
              data: serializeFirestoreValue({ id: profile.id, ...profile.data() }),
            });
            documentCount += 1;
            for await (const document of walkSubcollections(profileRef)) {
              send(document);
              documentCount += 1;
            }
          }

          if (settings.exists) {
            send({
              type: 'document',
              path: settingsRef.path,
              data: serializeFirestoreValue({ id: settings.id, ...settings.data() }),
            });
            documentCount += 1;
            for await (const document of walkSubcollections(settingsRef)) {
              send(document);
              documentCount += 1;
            }
          }

          if (aiUsage.exists) {
            send({ type: 'document', path: aiUsageRef.path, data: serializeAiUsageForExport(aiUsage.data()) });
            documentCount += 1;
          }

          for (const collectionName of USER_DATA_COLLECTIONS) {
            for await (const snapshot of walkOwnedCollection(firestore, collectionName, uid)) {
              send({
                type: 'document',
                path: snapshot.ref.path,
                data: serializeFirestoreValue({ id: snapshot.id, ...snapshot.data() }),
              });
              documentCount += 1;
              for await (const document of walkSubcollections(snapshot.ref)) {
                send(document);
                documentCount += 1;
              }
            }
          }

          const finalDeletionRequest = await firestore.collection('accountDeletionRequests').doc(uid).get();
          if (finalDeletionRequest.exists) throw new Error('account-deletion-started-during-export');
          send({ type: 'end', documentCount });
          controller.close();
        } catch (error) {
          console.error('User data export failed:', getSafeErrorCode(error));
          try {
            send({ type: 'error', code: 'EXPORT_FAILED' });
            controller.close();
          } catch {
            controller.error(new Error('La exportación se interrumpió.'));
          }
        }
      })();
    },
  });
};

async function* walkOwnedCollection(
  firestore: ExportServices['firestore'],
  collectionName: (typeof USER_DATA_COLLECTIONS)[number],
  uid: string,
): AsyncGenerator<QueryDocumentSnapshot> {
  const ownerFields = LEGACY_UID_OWNED_COLLECTIONS.has(collectionName)
    ? ['userId', 'uid']
    : ['userId'];
  const seenDocumentPaths = new Set<string>();

  for (const ownerField of ownerFields) {
    let cursor: QueryDocumentSnapshot | undefined;
    while (true) {
      let query = firestore.collection(collectionName)
        .where(ownerField, '==', uid)
        .orderBy(FieldPath.documentId())
        .limit(PAGE_SIZE);
      if (cursor) query = query.startAfter(cursor);
      const page = await query.get();
      for (const snapshot of page.docs) {
        cursor = snapshot;
        if (seenDocumentPaths.has(snapshot.ref.path)) continue;
        seenDocumentPaths.add(snapshot.ref.path);
        yield snapshot;
      }
      if (page.size < PAGE_SIZE) break;
    }
  }
}

async function* walkSubcollections(
  parentRef: ReturnType<ExportServices['firestore']['doc']>,
): AsyncGenerator<Extract<ExportStreamRecord, { type: 'document' }>> {
  const subcollections = await parentRef.listCollections();
  for (const subcollection of subcollections) {
    let cursor: QueryDocumentSnapshot | undefined;
    while (true) {
      let query = subcollection.orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
      if (cursor) query = query.startAfter(cursor);
      const page = await query.get();
      for (const snapshot of page.docs) {
        cursor = snapshot;
        yield {
          type: 'document',
          path: snapshot.ref.path,
          data: serializeFirestoreValue({ id: snapshot.id, ...snapshot.data() }),
        };
        yield* walkSubcollections(snapshot.ref);
      }
      if (page.size < PAGE_SIZE) break;
    }
  }
}

const getAdminServices = async (): Promise<ExportServices> => {
  const app = getFirebaseAdminApp();
  return { auth: getAuth(app), firestore: getFirestore(app) };
};

export const createUserDataExportHandler = (dependencies: ExportHandlerDependencies) =>
  async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'Método no permitido.' });
    }

    const authorization = request.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : '';
    if (!token) return jsonResponse(401, { error: 'Inicia sesión para exportar tus datos.' });

    try {
      const services = await dependencies.getServices();
      let decodedToken: VerifiedExportToken;
      try {
        decodedToken = await services.auth.verifyIdToken(token, true);
      } catch (error) {
        const errorCode = getSafeErrorCode(error);
        if (INVALID_TOKEN_CODES.has(errorCode)) {
          return jsonResponse(401, { error: 'Tu sesión no es válida. Inicia sesión nuevamente.' });
        }
        console.error('User data export authentication failed:', errorCode);
        return jsonResponse(503, { error: 'No pudimos verificar tu sesión. Inténtalo de nuevo.' });
      }

      if (typeof decodedToken.uid !== 'string' || !decodedToken.uid) {
        return jsonResponse(401, { error: 'No se pudo verificar la cuenta autenticada.' });
      }

      const deletionRequest = await services.firestore.collection('accountDeletionRequests')
        .doc(decodedToken.uid).get();
      if (deletionRequest.exists) {
        return jsonResponse(409, { error: 'La cuenta está en proceso de eliminación. Inténtalo de nuevo después.' });
      }

      const authUser = await services.auth.getUser(decodedToken.uid);
      const body = getExportStream(services.firestore, decodedToken.uid, {
        email: authUser.email ?? null,
        displayName: authUser.displayName ?? null,
      });
      return new Response(body, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Content-Disposition': 'attachment; filename="mood-log-datos.ndjson"',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      console.error('User data export setup failed:', getSafeErrorCode(error));
      return jsonResponse(503, { error: 'No fue posible preparar la exportación. Inténtalo de nuevo.' });
    }
  };

const userDataExportHandler = createUserDataExportHandler({ getServices: getAdminServices });
export default {
  fetch: withApiCors(userDataExportHandler),
};
