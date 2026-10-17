import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDocs,
  collection,
  getDoc,
  setLogLevel,
  setDoc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";

const projectId = "demo-mood-log-rules";
const ownerId = "owner-a";
const otherUserId = "owner-b";
const validMoodLog = (userId, overrides = {}) => ({
  userId,
  mood: 4,
  energy: 5,
  stress: 3,
  sleep: 7,
  notes: "Test note",
  activities: ["reading"],
  emotions: ["calm"],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
const validJournalEntry = (userId, overrides = {}) => ({
  userId,
  title: "Test journal",
  content: "Private test entry",
  date: new Date(),
  tags: ["test"],
  activities: [],
  emotions: [],
  isPrivate: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
setLogLevel("silent");

const environment = await initializeTestEnvironment({
  projectId,
  firestore: {
    rules: await readFile(new URL("../../../firebase/firestore.rules", import.meta.url), "utf8"),
  },
  storage: {
    host: "127.0.0.1",
    port: 9199,
    rules: await readFile(new URL("../../../firebase/storage.rules", import.meta.url), "utf8"),
  },
});

const authenticatedDb = (uid) => environment.authenticatedContext(uid).firestore();
const anonymousDb = () => environment.unauthenticatedContext().firestore();
const authenticatedStorage = (uid) =>
  environment.authenticatedContext(uid).storage("gs://demo-mood-log-rules.appspot.com");
const anonymousStorage = () =>
  environment.unauthenticatedContext().storage("gs://demo-mood-log-rules.appspot.com");

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.clearStorage();
});

after(async () => {
  await environment.cleanup();
});

test("mood and journal documents are isolated to their owner", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "moodLogs/mood-a"), validMoodLog(ownerId));
    await setDoc(doc(db, "journalEntries/journal-a"), validJournalEntry(ownerId));
  });

  await assertSucceeds(getDoc(doc(authenticatedDb(ownerId), "moodLogs/mood-a")));
  await assertSucceeds(getDoc(doc(authenticatedDb(ownerId), "journalEntries/journal-a")));
  await assertSucceeds(getDocs(query(
    collection(authenticatedDb(ownerId), "moodLogs"),
    where("userId", "==", ownerId),
  )));
  await assertFails(getDoc(doc(authenticatedDb(otherUserId), "moodLogs/mood-a")));
  await assertFails(getDoc(doc(authenticatedDb(otherUserId), "journalEntries/journal-a")));
  await assertFails(getDoc(doc(anonymousDb(), "moodLogs/mood-a")));
  await assertFails(getDoc(doc(anonymousDb(), "journalEntries/journal-a")));
});

test("owners can create and update mood and journal documents without changing ownership", async () => {
  const ownerDb = authenticatedDb(ownerId);

  await assertSucceeds(setDoc(doc(ownerDb, "moodLogs/mood-a"), validMoodLog(ownerId)));
  await assertSucceeds(updateDoc(doc(ownerDb, "moodLogs/mood-a"), { mood: 5 }));
  await assertSucceeds(setDoc(doc(ownerDb, "journalEntries/journal-a"), validJournalEntry(ownerId)));
  await assertSucceeds(updateDoc(doc(ownerDb, "journalEntries/journal-a"), {
    content: "Updated private test entry",
  }));
  await assertSucceeds(deleteDoc(doc(ownerDb, "moodLogs/mood-a")));
  await assertSucceeds(deleteDoc(doc(ownerDb, "journalEntries/journal-a")));
});

test("a pending account deletion blocks new writes while preserving read access", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, `accountDeletionRequests/${ownerId}`), { requestedAt: new Date() });
    await setDoc(doc(db, `users/${ownerId}`), { role: "user", displayName: "Owner" });
    await setDoc(doc(db, `userSettings/${ownerId}`), { userId: ownerId, version: 1 });
    await setDoc(doc(db, "moodLogs/mood-a"), validMoodLog(ownerId));
    await setDoc(doc(db, "journalEntries/journal-a"), validJournalEntry(ownerId));
    await setDoc(doc(db, "notifications/notification-a"), {
      userId: ownerId,
      type: "general",
      title: "Test",
      message: "Test notification",
      isRead: false,
    });
    await setDoc(doc(db, "advancedReports/report-a"), { userId: ownerId, status: "ready" });
    await setDoc(doc(db, "statistics/stat-a"), { userId: ownerId, averageMood: 4 });
    await setDoc(doc(db, "reminders/reminder-a"), { userId: ownerId, title: "Test" });
  });

  const ownerDb = authenticatedDb(ownerId);
  await assertSucceeds(getDoc(doc(ownerDb, "moodLogs/mood-a")));
  await assertFails(updateDoc(doc(ownerDb, `users/${ownerId}`), { displayName: "Changed" }));
  await assertFails(updateDoc(doc(ownerDb, `userSettings/${ownerId}`), { version: 2 }));
  await assertFails(setDoc(doc(ownerDb, "moodLogs/mood-new"), validMoodLog(ownerId)));
  await assertFails(updateDoc(doc(ownerDb, "moodLogs/mood-a"), { mood: 6 }));
  await assertFails(setDoc(doc(ownerDb, "journalEntries/journal-new"), validJournalEntry(ownerId)));
  await assertFails(updateDoc(doc(ownerDb, "journalEntries/journal-a"), { content: "Changed" }));
  await assertFails(updateDoc(doc(ownerDb, "notifications/notification-a"), { isRead: true }));
  await assertFails(updateDoc(doc(ownerDb, "advancedReports/report-a"), { status: "changed" }));
  await assertFails(updateDoc(doc(ownerDb, "statistics/stat-a"), { averageMood: 5 }));
  await assertFails(updateDoc(doc(ownerDb, "reminders/reminder-a"), { title: "Changed" }));
  await assertFails(setDoc(doc(ownerDb, "accountDeletionRequests/another-marker"), { requestedAt: new Date() }));
});

test("mood logs reject scores outside 1 through 10", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "moodLogs/zero"), validMoodLog(ownerId, { mood: 0 })));
  await assertFails(setDoc(doc(ownerDb, "moodLogs/above-range"), validMoodLog(ownerId, { mood: 11 })));
});

test("mood logs reject non-integer and null scores", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "moodLogs/string"), validMoodLog(ownerId, { mood: "5" })));
  await assertFails(setDoc(doc(ownerDb, "moodLogs/null"), validMoodLog(ownerId, { mood: null })));
});

test("mood logs reject unexpected fields", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "moodLogs/unexpected-field"), validMoodLog(ownerId, {
    isAdmin: true,
  })));
});

test("mood logs reject oversized notes", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "moodLogs/oversized-notes"), validMoodLog(ownerId, {
    notes: "x".repeat(5001),
  })));
});

test("journal entries reject content above the configured limit", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "journalEntries/oversized"), validJournalEntry(ownerId, {
    content: "x".repeat(20001),
  })));
});

test("journal entries reject invalid optional scores", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "journalEntries/invalid-score"), validJournalEntry(ownerId, {
    mood: 0,
  })));
});

test("journal entries reject unexpected fields", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "journalEntries/unexpected-field"), validJournalEntry(ownerId, {
    isAdmin: true,
  })));
});

test("journal entries require a non-empty bounded title", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "journalEntries/empty-title"), validJournalEntry(ownerId, {
    title: "",
  })));
  await assertFails(setDoc(doc(ownerDb, "journalEntries/long-title"), validJournalEntry(ownerId, {
    title: "x".repeat(201),
  })));
});

test("journal entries require a Firestore timestamp for their date", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "journalEntries/string-date"), validJournalEntry(ownerId, {
    date: "2026-10-16",
  })));
});

test("journal entries require a boolean privacy flag", async () => {
  const ownerDb = authenticatedDb(ownerId);
  await assertFails(setDoc(doc(ownerDb, "journalEntries/string-privacy"), validJournalEntry(ownerId, {
    isPrivate: "true",
  })));
});

test("another account and anonymous users cannot write mood or journal data", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "moodLogs/mood-a"), validMoodLog(ownerId));
    await setDoc(doc(db, "journalEntries/journal-a"), validJournalEntry(ownerId));
  });

  const otherUserDb = authenticatedDb(otherUserId);
  const anonymous = anonymousDb();

  await assertFails(setDoc(doc(otherUserDb, "moodLogs/foreign-a"), validMoodLog(ownerId)));
  await assertSucceeds(setDoc(doc(otherUserDb, "moodLogs/own-a"), validMoodLog(otherUserId, { mood: 5 })));
  await assertFails(getDocs(query(
    collection(otherUserDb, "moodLogs"),
    where("userId", "==", ownerId),
  )));
  await assertFails(updateDoc(doc(otherUserDb, "moodLogs/mood-a"), { mood: 1 }));
  await assertFails(deleteDoc(doc(otherUserDb, "moodLogs/mood-a")));
  await assertFails(setDoc(doc(otherUserDb, "journalEntries/foreign-a"), validJournalEntry(ownerId)));
  await assertSucceeds(setDoc(doc(otherUserDb, "journalEntries/own-a"), validJournalEntry(otherUserId)));
  await assertFails(updateDoc(doc(otherUserDb, "journalEntries/journal-a"), { content: "Unauthorized" }));
  await assertFails(deleteDoc(doc(otherUserDb, "journalEntries/journal-a")));
  await assertFails(setDoc(doc(anonymous, "moodLogs/anonymous-a"), validMoodLog(ownerId, { mood: 5 })));
  await assertFails(setDoc(doc(anonymous, "journalEntries/anonymous-a"), validJournalEntry(ownerId)));
});

test("owners cannot transfer documents to another account", async () => {
  const ownedCollections = [
    "moodLogs",
    "journalEntries",
    "notifications",
    "advancedReports",
    "statistics",
    "reminders",
  ];

  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all(
      ownedCollections.map((collectionName) =>
        setDoc(doc(db, `${collectionName}/owned-document`), { userId: ownerId }),
      ),
    );
  });

  const ownerDb = authenticatedDb(ownerId);
  for (const collectionName of ownedCollections) {
    await assertFails(
      updateDoc(doc(ownerDb, `${collectionName}/owned-document`), { userId: otherUserId }),
    );
  }
});

test("legacy psychologist and persisted chat collections are denied", async () => {
  const ownerDb = authenticatedDb(ownerId);
  for (const collectionName of [
    "psychologists",
    "psychologistRatings",
    "patients",
    "appointments",
    "chatSessions",
    "chatMessages",
    "chats",
    "messages",
    "crisisAssessments",
    "crisisAlerts",
  ]) {
    await assertFails(setDoc(doc(ownerDb, `${collectionName}/legacy-document`), {
      userId: ownerId,
      role: "user",
    }));
  }
  await assertFails(setDoc(doc(ownerDb, "unknownCollection/document"), { userId: ownerId }));
});

test("users cannot assign or change their own privileged role", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);

  await assertSucceeds(setDoc(doc(ownerDb, `users/${ownerId}`), {
    displayName: "Owner",
    email: null,
    location: "Bogota",
    bio: "A short profile bio",
    role: "user",
  }));
  await assertSucceeds(updateDoc(doc(ownerDb, `users/${ownerId}`), {
    displayName: "Updated owner",
    settings: { theme: "dark" },
  }));
  await assertSucceeds(getDoc(doc(ownerDb, `users/${ownerId}`)));
  await assertFails(updateDoc(doc(ownerDb, `users/${ownerId}`), { role: "psychologist" }));
  await assertFails(updateDoc(doc(ownerDb, `users/${ownerId}`), { role: "admin" }));
  await assertFails(updateDoc(doc(ownerDb, `users/${ownerId}`), { unexpectedAdminFlag: true }));
  await assertFails(getDoc(doc(otherUserDb, `users/${ownerId}`)));
  await assertFails(getDoc(doc(anonymousDb(), `users/${ownerId}`)));
  await assertFails(setDoc(doc(otherUserDb, `users/${otherUserId}`), { role: "psychologist" }));
  await assertFails(setDoc(doc(otherUserDb, `users/${otherUserId}`), { displayName: "No role" }));
  await assertFails(setDoc(doc(anonymousDb(), `users/${ownerId}`), { role: "user" }));
  await assertFails(deleteDoc(doc(otherUserDb, `users/${ownerId}`)));
  await assertSucceeds(deleteDoc(doc(ownerDb, `users/${ownerId}`)));
});

test("notification documents are owner-scoped and only read status can be updated", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);
  const notification = {
    userId: ownerId,
    type: "general",
    title: "Test notification",
    message: "Private notification",
    isRead: false,
    createdAt: new Date(),
  };
  const notificationRef = doc(ownerDb, "notifications/notification-a");

  await assertSucceeds(setDoc(notificationRef, notification));
  await assertSucceeds(getDoc(notificationRef));
  await assertSucceeds(updateDoc(notificationRef, { isRead: true, readAt: new Date() }));
  await assertFails(getDoc(doc(otherUserDb, "notifications/notification-a")));
  await assertFails(getDoc(doc(anonymousDb(), "notifications/notification-a")));
  await assertFails(updateDoc(notificationRef, { userId: otherUserId }));
  await assertFails(updateDoc(notificationRef, { message: "Changed content" }));
  await assertFails(setDoc(doc(otherUserDb, "notifications/foreign"), {
    ...notification,
    userId: ownerId,
  }));
  await assertFails(setDoc(doc(anonymousDb(), "notifications/anonymous"), notification));
  await assertSucceeds(deleteDoc(notificationRef));
});

test("user settings are limited to the signed-in user's document and schema", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);
  const settings = {
    userId: ownerId,
    notifications: { email: true },
    privacy: { profileVisibility: "private" },
    app: { theme: "auto" },
    moodLogging: { defaultMoodScale: 10 },
    version: 1,
  };

  await assertSucceeds(setDoc(doc(ownerDb, `userSettings/${ownerId}`), settings));
  await assertSucceeds(updateDoc(doc(ownerDb, `userSettings/${ownerId}`), {
    notifications: { push: false },
  }));
  await assertSucceeds(setDoc(doc(ownerDb, `userSettings/${ownerId}`), {
    notifications: { email: true },
    privacy: { profileVisibility: "private" },
    app: { theme: "auto" },
    moodLogging: { defaultMoodScale: 10 },
    version: 1,
    updatedAt: new Date(),
  }));
  await assertSucceeds(getDoc(doc(ownerDb, `userSettings/${ownerId}`)));
  await assertFails(getDoc(doc(otherUserDb, `userSettings/${ownerId}`)));
  await assertFails(getDoc(doc(anonymousDb(), `userSettings/${ownerId}`)));
  await assertFails(setDoc(doc(ownerDb, `userSettings/${otherUserId}`), {
    ...settings,
    userId: otherUserId,
  }));
  await assertFails(updateDoc(doc(ownerDb, `userSettings/${ownerId}`), {
    isAdmin: true,
  }));
  await assertFails(setDoc(doc(anonymousDb(), `userSettings/${ownerId}`), settings));
  await assertSucceeds(deleteDoc(doc(ownerDb, `userSettings/${ownerId}`)));
});

test("statistics can be created by their owner and cannot be accessed by another user", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);
  const statisticsRef = doc(ownerDb, "statistics/stat-a");

  await assertSucceeds(setDoc(statisticsRef, { userId: ownerId, averageMood: 4 }));
  await assertSucceeds(getDoc(statisticsRef));
  await assertSucceeds(updateDoc(statisticsRef, { averageMood: 5 }));
  await assertFails(getDoc(doc(otherUserDb, "statistics/stat-a")));
  await assertFails(deleteDoc(doc(otherUserDb, "statistics/stat-a")));
  await assertFails(getDoc(doc(anonymousDb(), "statistics/stat-a")));
  await assertFails(setDoc(doc(anonymousDb(), "statistics/anonymous"), { userId: ownerId }));
  await assertSucceeds(deleteDoc(statisticsRef));
});

test("advanced reports and reminders support owner-only CRUD operations", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);

  for (const collectionName of ["advancedReports", "reminders"]) {
    const ownerRef = doc(ownerDb, `${collectionName}/owner-document`);
    const foreignRef = doc(otherUserDb, `${collectionName}/owner-document`);

    await assertSucceeds(setDoc(ownerRef, { userId: ownerId, title: "Owner data" }));
    await assertSucceeds(getDoc(ownerRef));
    await assertSucceeds(updateDoc(ownerRef, { title: "Updated owner data" }));
    await assertFails(getDoc(foreignRef));
    await assertFails(setDoc(doc(otherUserDb, `${collectionName}/foreign-document`), {
      userId: ownerId,
    }));
    await assertFails(updateDoc(foreignRef, { title: "Unauthorized" }));
    await assertFails(deleteDoc(foreignRef));
    await assertFails(getDoc(doc(anonymousDb(), `${collectionName}/owner-document`)));
    await assertFails(setDoc(doc(anonymousDb(), `${collectionName}/anonymous-document`), {
      userId: ownerId,
    }));
    await assertSucceeds(deleteDoc(ownerRef));
  }
});

test("journal templates and prompts are readable only by authenticated users", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "journalTemplates/template-a"), { title: "Template" });
    await setDoc(doc(db, "journalPrompts/prompt-a"), { title: "Prompt" });
  });

  for (const documentPath of [
    "journalTemplates/template-a",
    "journalPrompts/prompt-a",
  ]) {
    await assertSucceeds(getDoc(doc(authenticatedDb(ownerId), documentPath)));
    await assertFails(getDoc(doc(anonymousDb(), documentPath)));
    await assertFails(setDoc(doc(authenticatedDb(ownerId), documentPath), { title: "Changed" }));
  }
});

test("Storage access is owner-only and upload size/type are restricted", async () => {
  const ownerStorage = authenticatedStorage(ownerId);
  const otherStorage = authenticatedStorage(otherUserId);
  const anonymous = anonymousStorage();
  const ownerFile = ref(ownerStorage, `users/${ownerId}/attachments/test.png`);
  const foreignFile = ref(otherStorage, `users/${ownerId}/attachments/test.png`);

  await assertSucceeds(uploadBytes(ownerFile, new Uint8Array([1, 2, 3]), {
    contentType: "image/png",
  }));
  await assertSucceeds(uploadBytes(ownerFile, new Uint8Array([4, 5, 6]), {
    contentType: "image/jpeg",
  }));
  await assertSucceeds(getBytes(ownerFile));
  await assertFails(getBytes(foreignFile));
  await assertFails(uploadBytes(ownerFile, new Uint8Array([7, 8, 9]), {
    contentType: "text/plain",
  }));
  await assertFails(deleteObject(foreignFile));
  await assertSucceeds(deleteObject(ownerFile));
  await assertFails(uploadBytes(
    ref(ownerStorage, `users/${ownerId}/attachments/unsupported.txt`),
    new Uint8Array([1, 2, 3]),
    { contentType: "text/plain" },
  ));
  await assertFails(uploadBytes(
    ref(ownerStorage, `users/${ownerId}/attachments/oversized.pdf`),
    new Uint8Array(10 * 1024 * 1024 + 1),
    { contentType: "application/pdf" },
  ));
  await assertFails(getBytes(ref(anonymous, `users/${ownerId}/attachments/test.png`)));
});
