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
import { getBytes, ref, uploadBytes } from "firebase/storage";

const projectId = "demo-mood-log-rules";
const ownerId = "owner-a";
const otherUserId = "owner-b";
setLogLevel("silent");

const environment = await initializeTestEnvironment({
  projectId,
  firestore: {
    rules: await readFile(new URL("../../../firestore.rules", import.meta.url), "utf8"),
  },
  storage: {
    host: "127.0.0.1",
    port: 9199,
    rules: await readFile(new URL("../../../storage.rules", import.meta.url), "utf8"),
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
    await setDoc(doc(db, "moodLogs/mood-a"), { userId: ownerId, mood: 4 });
    await setDoc(doc(db, "journalEntries/journal-a"), {
      userId: ownerId,
      content: "Private test entry",
    });
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

  await assertSucceeds(setDoc(doc(ownerDb, "moodLogs/mood-a"), { userId: ownerId, mood: 4 }));
  await assertSucceeds(updateDoc(doc(ownerDb, "moodLogs/mood-a"), { mood: 5 }));
  await assertSucceeds(setDoc(doc(ownerDb, "journalEntries/journal-a"), {
    userId: ownerId,
    content: "Private test entry",
  }));
  await assertSucceeds(updateDoc(doc(ownerDb, "journalEntries/journal-a"), {
    content: "Updated private test entry",
  }));
  await assertSucceeds(deleteDoc(doc(ownerDb, "moodLogs/mood-a")));
  await assertSucceeds(deleteDoc(doc(ownerDb, "journalEntries/journal-a")));
});

test("another account and anonymous users cannot write mood or journal data", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "moodLogs/mood-a"), { userId: ownerId, mood: 4 });
    await setDoc(doc(db, "journalEntries/journal-a"), {
      userId: ownerId,
      content: "Private test entry",
    });
  });

  const otherUserDb = authenticatedDb(otherUserId);
  const anonymous = anonymousDb();

  await assertFails(setDoc(doc(otherUserDb, "moodLogs/foreign-a"), { userId: ownerId, mood: 5 }));
  await assertSucceeds(setDoc(doc(otherUserDb, "moodLogs/own-a"), { userId: otherUserId, mood: 5 }));
  await assertFails(getDocs(query(
    collection(otherUserDb, "moodLogs"),
    where("userId", "==", ownerId),
  )));
  await assertFails(updateDoc(doc(otherUserDb, "moodLogs/mood-a"), { mood: 1 }));
  await assertFails(deleteDoc(doc(otherUserDb, "moodLogs/mood-a")));
  await assertFails(setDoc(doc(otherUserDb, "journalEntries/foreign-a"), {
    userId: ownerId,
    content: "Unauthorized",
  }));
  await assertSucceeds(setDoc(doc(otherUserDb, "journalEntries/own-a"), {
    userId: otherUserId,
    content: "Private test entry",
  }));
  await assertFails(updateDoc(doc(otherUserDb, "journalEntries/journal-a"), { content: "Unauthorized" }));
  await assertFails(deleteDoc(doc(otherUserDb, "journalEntries/journal-a")));
  await assertFails(setDoc(doc(anonymous, "moodLogs/anonymous-a"), { userId: ownerId, mood: 5 }));
  await assertFails(setDoc(doc(anonymous, "journalEntries/anonymous-a"), {
    userId: ownerId,
    content: "Anonymous write",
  }));
});

test("owners cannot transfer documents to another account", async () => {
  const ownedCollections = [
    "moodLogs",
    "journalEntries",
    "chatSessions",
    "chatMessages",
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

test("users cannot assign or change their own privileged role", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);

  await assertSucceeds(setDoc(doc(ownerDb, `users/${ownerId}`), {
    displayName: "Owner",
    role: "user",
  }));
  await assertSucceeds(updateDoc(doc(ownerDb, `users/${ownerId}`), {
    displayName: "Updated owner",
  }));
  await assertFails(updateDoc(doc(ownerDb, `users/${ownerId}`), { role: "psychologist" }));
  await assertFails(setDoc(doc(otherUserDb, `users/${otherUserId}`), { role: "psychologist" }));
});

test("statistics can be created by their owner and cannot be accessed by another user", async () => {
  const ownerDb = authenticatedDb(ownerId);
  const otherUserDb = authenticatedDb(otherUserId);
  const statisticsRef = doc(ownerDb, "statistics/stat-a");

  await assertSucceeds(setDoc(statisticsRef, { userId: ownerId, averageMood: 4 }));
  await assertSucceeds(getDoc(statisticsRef));
  await assertFails(getDoc(doc(otherUserDb, "statistics/stat-a")));
  await assertFails(deleteDoc(doc(otherUserDb, "statistics/stat-a")));
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
  await assertSucceeds(getBytes(ownerFile));
  await assertFails(getBytes(foreignFile));
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
