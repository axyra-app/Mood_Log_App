import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAverageMoodForDays,
  getAverageMoodInRange,
  getMoodStreak,
  getMoodTrend,
} from '../src/utils/moodMetrics.ts';

const record = (mood, date) => ({ mood, createdAt: date });
const localDate = (year, month, day, hour = 12) => new Date(year, month - 1, day, hour);

test('averages mood over calendar days and ignores older records', () => {
  const now = localDate(2025, 4, 15, 10);
  const records = [
    record(10, localDate(2025, 4, 15)),
    record(6, localDate(2025, 4, 10)),
    record(1, localDate(2025, 4, 8)),
  ];

  assert.equal(getAverageMoodForDays(records, 7, now), 8);
});

test('accepts Firestore-like timestamps and includes both range boundaries', () => {
  const start = localDate(2025, 4, 1);
  const end = localDate(2025, 4, 2, 23);
  const records = [
    record(2, { toDate: () => start }),
    record(8, { toDate: () => localDate(2025, 4, 2) }),
    record(10, localDate(2025, 4, 3)),
  ];

  assert.equal(getAverageMoodInRange(records, start, end), 5);
});

test('counts a daily streak across daylight-saving transitions and duplicate entries', () => {
  const now = localDate(2024, 3, 11, 9);
  const records = [
    record(4, localDate(2024, 3, 11)),
    record(5, localDate(2024, 3, 11, 18)),
    record(6, localDate(2024, 3, 10)),
    record(7, localDate(2024, 3, 9)),
  ];

  assert.equal(getMoodStreak(records, now), 3);
});

test('allows yesterday as the latest streak day, but expires older streaks', () => {
  const now = localDate(2025, 4, 15, 9);
  assert.equal(getMoodStreak([record(5, localDate(2025, 4, 14))], now), 1);
  assert.equal(getMoodStreak([record(5, localDate(2025, 4, 13))], now), 0);
});

test('compares the recent seven calendar days with the previous seven', () => {
  const now = localDate(2025, 4, 15, 10);
  const records = [
    record(8, localDate(2025, 4, 9)),
    record(8, localDate(2025, 4, 10)),
    record(8, localDate(2025, 4, 11)),
    record(8, localDate(2025, 4, 12)),
    record(8, localDate(2025, 4, 13)),
    record(8, localDate(2025, 4, 14)),
    record(8, localDate(2025, 4, 15)),
    record(4, localDate(2025, 4, 2)),
    record(4, localDate(2025, 4, 3)),
    record(4, localDate(2025, 4, 4)),
    record(4, localDate(2025, 4, 5)),
    record(4, localDate(2025, 4, 6)),
    record(4, localDate(2025, 4, 7)),
    record(4, localDate(2025, 4, 8)),
  ];

  assert.equal(getMoodTrend(records, now), 'improving');
});
