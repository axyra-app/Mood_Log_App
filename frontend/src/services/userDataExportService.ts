import { auth } from './firebase';
import { apiUrl } from './apiUrl';
import {
  USER_DATA_COLLECTIONS,
  type DataExportCoverage,
  type ExportJsonValue,
} from '../utils/dataExport';

export interface UserDataExport {
  format: 'mood-log-user-data';
  formatVersion: 8;
  exportedAt: string;
  account: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  coverage: DataExportCoverage;
  data: {
    profile: ExportJsonValue | null;
    userSettings: ExportJsonValue | null;
    aiUsage: ExportJsonValue | null;
    collections: Record<string, ExportJsonValue[]>;
    nestedDocuments: Array<{ path: string; data: ExportJsonValue }>;
    additionalRootDocuments: Array<{ path: string; data: ExportJsonValue }>;
  };
}

type ExportStreamRecord =
  | {
      type: 'metadata';
      format: 'mood-log-user-data';
      formatVersion: 8;
      exportedAt: string;
      account: UserDataExport['account'];
      coverage: DataExportCoverage;
    }
  | { type: 'document'; path: string; data: ExportJsonValue }
  | { type: 'end'; documentCount: number }
  | { type: 'error'; code: 'EXPORT_FAILED' };

const createEmptyCollections = (): Record<string, ExportJsonValue[]> =>
  Object.fromEntries(USER_DATA_COLLECTIONS.map((name) => [name, []]));

const parseExportStreamRecord = (line: string): ExportStreamRecord => {
  const record: unknown = JSON.parse(line);
  if (!record || typeof record !== 'object' || !('type' in record)) {
    throw new Error('El archivo de exportación está incompleto. Inténtalo de nuevo.');
  }
  return record as ExportStreamRecord;
};

export const exportUserData = async (
  userId: string,
  _email: string | null,
  _displayName: string | null,
): Promise<UserDataExport> => {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('La sesión cambió. Inicia sesión nuevamente antes de exportar.');
  }

  const token = await currentUser.getIdToken();
  const response = await fetch(apiUrl('/api/user-data-export'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const errorMessage = errorBody && typeof errorBody === 'object' && 'error' in errorBody
      && typeof errorBody.error === 'string'
      ? errorBody.error
      : 'No se pudo preparar la exportación. Inténtalo de nuevo.';
    throw new Error(errorMessage);
  }
  if (!response.body) throw new Error('El navegador no pudo abrir la exportación. Inténtalo de nuevo.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const result: UserDataExport = {
    format: 'mood-log-user-data',
    formatVersion: 8,
    exportedAt: '',
    account: { uid: userId, email: null, displayName: null },
    coverage: {
      status: 'partial',
      includedFirestorePaths: [],
      notes: [],
      excluded: [],
    },
    data: {
      profile: null,
      userSettings: null,
      aiUsage: null,
      collections: createEmptyCollections(),
      nestedDocuments: [],
      additionalRootDocuments: [],
    },
  };
  let bufferedText = '';
  let documentCount = 0;
  let receivedMetadata = false;
  let receivedEnd = false;

  const processLine = (line: string) => {
    if (!line.trim()) return;
    const record = parseExportStreamRecord(line);
    if (record.type === 'error') {
      throw new Error('La exportación se interrumpió. Vuelve a intentarlo.');
    }
    if (record.type === 'metadata') {
      if (receivedMetadata || record.account.uid !== userId) {
        throw new Error('La exportación no coincide con la cuenta activa. Inicia sesión nuevamente.');
      }
      receivedMetadata = true;
      result.exportedAt = record.exportedAt;
      result.account = record.account;
      result.coverage = record.coverage;
      return;
    }
    if (record.type === 'document') {
      if (!receivedMetadata || receivedEnd) {
        throw new Error('El archivo de exportación está incompleto. Inténtalo de nuevo.');
      }
      documentCount += 1;
      const [collectionName, documentId, ...nestedPath] = record.path.split('/');
      if (!documentId || !collectionName) {
        throw new Error('El archivo contiene una ruta de documento no válida.');
      }
      if (collectionName === 'users' && documentId === userId && nestedPath.length === 0) {
        result.data.profile = record.data;
      } else if (collectionName === 'userSettings' && documentId === userId && nestedPath.length === 0) {
        result.data.userSettings = record.data;
      } else if (collectionName === 'aiUsage' && documentId === userId && nestedPath.length === 0) {
        result.data.aiUsage = record.data;
      } else if (nestedPath.length > 0) {
        result.data.nestedDocuments.push({ path: record.path, data: record.data });
      } else if (USER_DATA_COLLECTIONS.includes(collectionName as (typeof USER_DATA_COLLECTIONS)[number])) {
        result.data.collections[collectionName].push(record.data);
      } else {
        result.data.additionalRootDocuments.push({ path: record.path, data: record.data });
      }
      return;
    }
    if (record.type === 'end') {
      if (!receivedMetadata || receivedEnd || record.documentCount !== documentCount) {
        throw new Error('La exportación no terminó correctamente. Descarga una nueva copia.');
      }
      receivedEnd = true;
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bufferedText += decoder.decode(value, { stream: true });
      let newlineIndex = bufferedText.indexOf('\n');
      while (newlineIndex >= 0) {
        processLine(bufferedText.slice(0, newlineIndex));
        bufferedText = bufferedText.slice(newlineIndex + 1);
        newlineIndex = bufferedText.indexOf('\n');
      }
    }
    bufferedText += decoder.decode();
    if (bufferedText.trim()) processLine(bufferedText);
  } finally {
    reader.releaseLock();
  }

  if (!receivedMetadata || !receivedEnd) {
    throw new Error('La exportación se interrumpió antes de completarse. Vuelve a intentarlo.');
  }
  return result;
};
