export const createDevApiEmulatorHandlers = async () => {
  const aiHandler = (await import('../api/ai.ts')).default;
  return new Map([
    ['/api/ai', (request) => aiHandler.fetch(request)],
    ['/api/delete-account', (await import('../api/delete-account.ts')).default.fetch],
    ['/api/legal-acceptance', (await import('../api/legal-acceptance.ts')).default.fetch],
    ['/api/sensitive-data-consent', (await import('../api/sensitive-data-consent.ts')).default.fetch],
    ['/api/user-data-export', (await import('../api/user-data-export.ts')).default.fetch],
  ]);
};
