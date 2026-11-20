export const isInvalidFirebaseIdTokenError = (errorCode: string): boolean =>
  /^auth\/(argument-error|id-token-expired|invalid-id-token|id-token-revoked|user-disabled|user-not-found)$/.test(errorCode);

export const readRequestBodyWithinLimit = async (
  request: Request,
  maxBytes: number,
): Promise<string | null> => {
  const reader = request.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bodyBytes);
};
