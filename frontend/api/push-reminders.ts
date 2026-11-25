import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { timingSafeEqual } from 'node:crypto';
import type { PushSubscription } from 'web-push';
import { getFirebaseAdminApp } from './_lib/firebaseAdmin.ts';
import { readRequestBodyWithinLimit } from './_lib/requestUtils.ts';

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const collection = 'dailyPushReminders';

function validSubscription(value: unknown): value is PushSubscription {
  const candidate = value as PushSubscription | null;
  try {
    if (!candidate || typeof candidate.endpoint !== 'string' || candidate.endpoint.length > 2048) return false;
    const url = new URL(candidate.endpoint);
    return url.protocol === 'https:' && !url.port && !url.username && !url.password && !url.hash
      && (url.hostname === 'fcm.googleapis.com' || url.hostname === 'updates.push.services.mozilla.com'
        || url.hostname === 'web.push.apple.com' || /^[a-z0-9-]+\.push\.apple\.com$/.test(url.hostname))
      && /^[\w-]{87}$/.test(candidate.keys?.p256dh ?? '')
      && /^[\w-]{22}$/.test(candidate.keys?.auth ?? '');
  } catch {
    return false;
  }
}

function localClock(timeZone: string, now = new Date()) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  return { day: values.year + '-' + values.month + '-' + values.day, time: values.hour + ':' + values.minute };
}

const minuteOfDay = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

function dueDay(timeZone: string, scheduledTime: string, now: Date): string | null {
  const current = localClock(timeZone, now);
  const scheduled = minuteOfDay(scheduledTime);
  const elapsed = minuteOfDay(current.time) - scheduled;
  if (elapsed >= 0 && elapsed <= 29) return current.day;
  if (elapsed + 1440 <= 29 && elapsed < 0) {
    const earlier = localClock(timeZone, new Date(now.getTime() - 29 * 60_000));
    if (earlier.day !== current.day && minuteOfDay(earlier.time) <= scheduled) return earlier.day;
  }
  return null;
}

export default {
  async fetch(request: Request) {
    const publicKey = process.env.PUSH_PUBLIC_KEY;
    const privateKey = process.env.PUSH_PRIVATE_KEY;
    const schedulerSecret = process.env.PUSH_SCHEDULER_SECRET;
    if (!publicKey || !privateKey || !schedulerSecret) return json({ error: 'Recordatorios push aún no disponibles.' }, 503);
    const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return json({}, 401);
    const supplied = Buffer.from(token);
    const expected = Buffer.from(schedulerSecret);
    const scheduler = supplied.length === expected.length && timingSafeEqual(supplied, expected);

    try {
      const app = getFirebaseAdminApp();
      const db = getFirestore(app);
      const reminders = db.collection(collection);
      if (scheduler && request.method === 'POST') {
        const { sendNotification } = await import('web-push');
        const batch = await reminders.get();
        const now = new Date();
        const dispatch = async ({ ref }: (typeof batch.docs)[number]) => {
          const due = await db.runTransaction(async (tx) => {
            const snapshot = await tx.get(ref);
            const value = snapshot.data();
            if (!value || !validSubscription(value.subscription)) return null;
            const day = dueDay(value.timeZone, value.time, now);
            if (!day || (value.lastDay && value.lastDay >= day)) return null;
            const deletion = await tx.get(db.collection('accountDeletionRequests').doc(ref.id));
            const profile = await tx.get(db.collection('users').doc(ref.id));
            if (deletion.exists || !profile.exists) return null;
            tx.update(ref, { lastDay: day });
            return value.subscription;
          });
          if (!due) return;
          try {
            await sendNotification(due, null, {
              TTL: 900, timeout: 4000,
              vapidDetails: { subject: 'https://mood-log-app-main.vercel.app', publicKey, privateKey },
            });
          } catch (error) {
            const status = (error as { statusCode?: number } | null)?.statusCode;
            if (status !== 404 && status !== 410) {
              console.warn('Push delivery failed', status || 'unknown');
              return;
            }
            await db.runTransaction(async (tx) => {
              const current = (await tx.get(ref)).data();
              if (current?.subscription?.endpoint === due.endpoint) tx.delete(ref);
            });
          }
        };
        for (let offset = 0; offset < batch.docs.length; offset += 10) {
          await Promise.all(batch.docs.slice(offset, offset + 10).map(dispatch));
        }
        return json({ ok: true });
      }

      let uid: string;
      try { ({ uid } = await getAuth(app).verifyIdToken(token, true)); }
      catch { return json({}, 401); }
      const reminder = reminders.doc(uid);
      if (request.method === 'GET') {
        const record = (await reminder.get()).data();
        return json({ publicKey, time: record?.time ?? null, timeZone: record?.timeZone ?? null });
      }
      if (request.method === 'DELETE') {
        await reminder.delete();
        return json({ ok: true });
      }
      if (request.method !== 'PUT') return json({}, 405);
      const raw = await readRequestBodyWithinLimit(request, 4096);
      if (raw === null) return json({}, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({}, 400); }
      const { subscription, time, timeZone } = body ?? {};
      if (!validSubscription(subscription) || typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
        || typeof timeZone !== 'string' || timeZone.length > 80) return json({}, 400);
      try { localClock(timeZone); } catch { return json({}, 400); }
      const saved = await db.runTransaction(async (tx) => {
        const deletion = await tx.get(db.collection('accountDeletionRequests').doc(uid));
        const profile = await tx.get(db.collection('users').doc(uid));
        if (deletion.exists || !profile.exists) return false;
        const previous = await tx.get(reminder);
        tx.set(reminder, {
          subscription: { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } },
          time, timeZone, lastDay: previous.data()?.lastDay ?? null,
        });
        return true;
      });
      return json({ ok: saved }, saved ? 200 : 403);
    } catch {
      return json({ error: 'No pudimos procesar el recordatorio.' }, 503);
    }
  },
};
