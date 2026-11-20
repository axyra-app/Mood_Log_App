import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { withApiCors } from './_lib/apiCors.ts';
import { getFirebaseAdminApp } from './_lib/firebaseAdmin.ts';
import { isInvalidFirebaseIdTokenError } from './_lib/requestUtils.ts';
import { deleteUserOwnedData } from './_lib/accountDataDeletion.ts';

const MAX_AUTH_AGE_SECONDS = 10 * 60;
const FUTURE_AUTH_SKEW_SECONDS = 60;

interface VerifiedAccountDeletionToken {
  uid: string;
  auth_time?: unknown;
}

interface AccountDeletionServices {
  auth: {
    verifyIdToken(token: string, checkRevoked?: boolean): Promise<VerifiedAccountDeletionToken>;
    deleteUser(uid: string): Promise<void>;
  };
  firestore: ReturnType<typeof getFirestore>;
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>;
}

interface DeleteAccountHandlerDependencies {
  getServices(): Promise<AccountDeletionServices>;
  deleteOwnedData(
    firestore: AccountDeletionServices['firestore'],
    bucket: AccountDeletionServices['bucket'],
    auth: AccountDeletionServices['auth'],
    uid: string
  ): Promise<void>;
  now?: () => number;
}

const jsonResponse = (status: number, body: unknown, headers: HeadersInit = {}): Response =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
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

export const isRecentAuthentication = (
  authTime: unknown,
  nowSeconds = Math.floor(Date.now() / 1000)
): authTime is number =>
  typeof authTime === 'number'
  && Number.isInteger(authTime)
  && authTime <= nowSeconds + FUTURE_AUTH_SKEW_SECONDS
  && nowSeconds - authTime <= MAX_AUTH_AGE_SECONDS;

const getAdminServices = async (): Promise<AccountDeletionServices> => {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  const clientBucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
  if (!projectId || !bucketName || !clientBucketName || bucketName !== clientBucketName) {
    throw Object.assign(
      new Error('Account deletion requires a Firebase project and matching server/client Storage buckets.'),
      { code: 'app/incomplete-firebase-deletion-config' },
    );
  }
  const app = getFirebaseAdminApp(bucketName);
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    bucket: getStorage(app).bucket(bucketName),
  };
};

export const createDeleteAccountHandler = (
  dependencies: DeleteAccountHandlerDependencies
) => async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido.' }, { Allow: 'POST' });
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';
  if (!token) {
    return jsonResponse(401, { error: 'Inicia sesión nuevamente para continuar.' });
  }

  try {
    const services = await dependencies.getServices();
    let decodedToken: VerifiedAccountDeletionToken;
    try {
      decodedToken = await services.auth.verifyIdToken(token, true);
    } catch (error) {
      const errorCode = getSafeErrorCode(error);
      if (isInvalidFirebaseIdTokenError(errorCode)) {
        return jsonResponse(401, { error: 'Tu sesión no es válida. Inicia sesión nuevamente.' });
      }
      console.error('Account deletion authentication failed:', errorCode);
      return jsonResponse(503, { error: 'No pudimos verificar tu sesión. Inténtalo de nuevo.' });
    }

    const nowSeconds = Math.floor((dependencies.now?.() ?? Date.now()) / 1000);
    if (!isRecentAuthentication(decodedToken.auth_time, nowSeconds)) {
      return jsonResponse(401, {
        error: 'Por seguridad, vuelve a autenticarte y confirma de nuevo la eliminación.',
        code: 'RECENT_LOGIN_REQUIRED',
      });
    }

    if (typeof decodedToken.uid !== 'string' || decodedToken.uid.length === 0) {
      return jsonResponse(401, { error: 'No se pudo verificar la cuenta autenticada.' });
    }

    await dependencies.deleteOwnedData(
      services.firestore,
      services.bucket,
      services.auth,
      decodedToken.uid,
    );

    return jsonResponse(200, { success: true });
  } catch (error) {
    const errorCode = getSafeErrorCode(error);
    console.error('Account deletion failed:', errorCode);
    if (errorCode === 'account/ai-request-in-progress') {
      return jsonResponse(409, {
        error: 'Hay una solicitud de IA en curso. Espera a que termine y vuelve a confirmar la eliminación.',
        code: 'AI_REQUEST_IN_PROGRESS',
      });
    }
    return jsonResponse(503, {
      error: 'No pudimos confirmar la eliminación. Si ya había comenzado, las escrituras de la cuenta pueden estar pausadas. Inténtalo de nuevo o contacta soporte.',
    });
  }
};

const deleteAccountHandler = createDeleteAccountHandler({
  getServices: getAdminServices,
  deleteOwnedData: deleteUserOwnedData,
});

export default {
  fetch: withApiCors(async (request: Request): Promise<Response> => {
    if (process.env.ACCOUNT_DELETION_ENABLED !== 'true') {
      return jsonResponse(503, {
        error: 'La eliminación de cuenta aún no está habilitada para este entorno.',
      });
    }
    return deleteAccountHandler(request);
  }),
};
