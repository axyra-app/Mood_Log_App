type ErrorLike = {
  name?: unknown;
  code?: unknown;
};

const safeLogValue = (value: unknown): string | undefined =>
  typeof value === 'string' && /^[A-Za-z0-9_./-]{1,80}$/.test(value)
    ? value
    : undefined;

/** Log only bounded error metadata. Do not emit messages, stacks, request bodies, or user data. */
export const logSanitizedClientError = (context: string, error: unknown): void => {
  const value = error && typeof error === 'object' ? error as ErrorLike : {};
  const safeContext = /^[A-Za-z0-9 _./:\[\]-]{1,120}$/.test(context)
    ? context
    : 'Client operation failed';
  const name = safeLogValue(value.name)
    ?? (error instanceof Error ? 'Error' : 'UnknownError');
  const code = safeLogValue(value.code);

  console.error(safeContext, code ? { name, code } : { name });
};
