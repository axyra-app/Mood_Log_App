/**
 * Canonical root collections for user-owned Firestore data.
 * Keep export and account deletion on the same allowlist.
 */
export const USER_DATA_COLLECTIONS = [
  'moodLogs',
  'journalEntries',
  'notifications',
  'advancedReports',
  'statistics',
  'reminders',
  'aiConsentEvents',
  'legalAcceptanceEvents',
  'sensitiveDataConsentEvents',
  'crisisAssessments',
  'crisisAlerts',
  'chats',
  'messages',
  'chatSessions',
  'chatMessages',
  'typing',
] as const;

export const LEGACY_UID_OWNED_COLLECTIONS: ReadonlySet<string> = new Set([
  'chats',
  'messages',
  'chatSessions',
  'chatMessages',
  'typing',
]);

