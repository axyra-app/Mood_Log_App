export interface MoodRecord {
  mood: number;
  createdAt: unknown;
}

export type MoodTrend = 'improving' | 'declining' | 'stable';

export const toDate = (value: unknown): Date | null => {
  const date =
    value instanceof Date
      ? value
      : value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
        ? value.toDate()
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : null;

  return date instanceof Date && Number.isFinite(date.getTime()) ? date : null;
};

const startOfLocalDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getAverage = (records: MoodRecord[]): number | null => {
  const values = records.map((record) => record.mood).filter(Number.isFinite);
  if (values.length === 0) return null;
  return values.reduce((sum, mood) => sum + mood, 0) / values.length;
};

export const getAverageMoodInRange = (
  records: MoodRecord[],
  startDate: Date,
  endDate: Date,
): number | null => {
  const start = startOfLocalDay(startDate).getTime();
  const end = endDate.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;

  return getAverage(
    records.filter((record) => {
      const date = toDate(record.createdAt);
      return date !== null && date.getTime() >= start && date.getTime() <= end;
    }),
  );
};

export const getAverageMoodForDays = (
  records: MoodRecord[],
  days: number,
  now: Date = new Date(),
): number | null => {
  if (!Number.isInteger(days) || days < 1) return null;
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = startOfLocalDay(now);
  start.setDate(start.getDate() - days + 1);
  return getAverageMoodInRange(records, start, end);
};

export const getMoodTrend = (records: MoodRecord[], now: Date = new Date()): MoodTrend => {
  const today = startOfLocalDay(now);
  const recentStart = new Date(today);
  recentStart.setDate(today.getDate() - 6);
  const previousEnd = new Date(recentStart.getTime() - 1);
  const previousStart = new Date(recentStart);
  previousStart.setDate(recentStart.getDate() - 7);

  const recentAverage = getAverageMoodInRange(records, recentStart, now);
  const previousAverage = getAverageMoodInRange(records, previousStart, previousEnd);
  if (recentAverage === null || previousAverage === null) return 'stable';

  const difference = recentAverage - previousAverage;
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
};

export const getMoodStreak = (records: MoodRecord[], now: Date = new Date()): number => {
  const today = startOfLocalDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const recordedDays = new Set(
    records
      .map((record) => toDate(record.createdAt))
      .filter((date): date is Date => date !== null)
      .map((date) => startOfLocalDay(date).getTime()),
  );

  let currentDay: Date | undefined = [today, yesterday].find((day) => recordedDays.has(day.getTime()));
  if (!currentDay) return 0;

  let streak = 0;
  while (recordedDays.has(currentDay.getTime())) {
    streak += 1;
    currentDay = new Date(currentDay);
    currentDay.setDate(currentDay.getDate() - 1);
  }
  return streak;
};
