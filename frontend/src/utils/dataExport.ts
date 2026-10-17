export type ExportJsonValue =
  | null
  | boolean
  | number
  | string
  | ExportJsonValue[]
  | { [key: string]: ExportJsonValue };

export const serializeFirestoreValue = (value: unknown): ExportJsonValue => {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreValue(item));
  }

  if (typeof value === 'object') {
    const toDate = Reflect.get(value, 'toDate');
    if (typeof toDate === 'function') {
      const date: unknown = Reflect.apply(toDate, value, []);
      if (!(date instanceof Date)) {
        throw new Error('Se encontró una fecha de Firestore no válida durante la exportación.');
      }
      return date.toISOString();
    }

    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, serializeFirestoreValue(item)])
    );
  }

  throw new Error('Se encontró un valor no compatible durante la exportación.');
};
