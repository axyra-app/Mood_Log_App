export type HealthMetric = 'heart_rate' | 'hrv_rmssd';

export interface HealthObservation {
  id: string;
  metric: HealthMetric;
  value: number;
  unit: 'bpm' | 'ms';
  observedAt: string;
  source: 'health_connect' | 'synthetic';
  sourceLabel: string;
}

export interface SelfReportedMoodObservation {
  id: string;
  score: number;
  recordedAt: string;
}

export type HealthContextTimelineItem =
  | {
    type: 'health';
    id: string;
    metric: HealthMetric;
    value: number;
    unit: 'bpm' | 'ms';
    occurredAt: string;
    source: HealthObservation['source'];
    sourceLabel: string;
  }
  | {
    type: 'mood';
    id: string;
    score: number;
    occurredAt: string;
    source: 'self_report';
    sourceLabel: 'Ánimo autoinformado';
  };

export interface HealthContextDescriptiveSummary {
  id: string;
  title: string;
  sourceLabel: string;
  unit: string;
  count: number;
  median: number;
  minimum: number;
  maximum: number;
  firstObservedAt: string;
  lastObservedAt: string;
}

export interface HealthConnectHeartRateRecord {
  startTime: string;
  endTime: string;
  samples: Array<{ beatsPerMinute: number; time: string }>;
}

export interface HealthConnectHrvRecord {
  time: string;
  heartRateVariabilityMillis: number;
}

const isIsoDateTime = (value: unknown): value is string =>
  typeof value === 'string'
  && value.trim() !== ''
  && Number.isFinite(Date.parse(value));

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export const normalizeHealthConnectHeartRateRecords = (
  records: HealthConnectHeartRateRecord[],
): HealthObservation[] => records.flatMap((record, recordIndex) => {
  if (!isIsoDateTime(record.startTime) || !isIsoDateTime(record.endTime) || !Array.isArray(record.samples)) {
    return [];
  }
  return record.samples.flatMap((sample, sampleIndex) => {
    if (!isPositiveFiniteNumber(sample.beatsPerMinute) || !isIsoDateTime(sample.time)) return [];
    return [{
      id: 'health-connect-heart-rate-' + recordIndex + '-' + sampleIndex,
      metric: 'heart_rate' as const,
      value: sample.beatsPerMinute,
      unit: 'bpm' as const,
      observedAt: new Date(sample.time).toISOString(),
      source: 'health_connect' as const,
      sourceLabel: 'Health Connect',
    }];
  });
});

export const normalizeHealthConnectHrvRecords = (
  records: HealthConnectHrvRecord[],
): HealthObservation[] => records.flatMap((record, recordIndex) => {
  if (!isPositiveFiniteNumber(record.heartRateVariabilityMillis) || !isIsoDateTime(record.time)) return [];
  return [{
    id: 'health-connect-hrv-rmssd-' + recordIndex,
    metric: 'hrv_rmssd',
    value: record.heartRateVariabilityMillis,
    unit: 'ms',
    observedAt: new Date(record.time).toISOString(),
    source: 'health_connect',
    sourceLabel: 'Health Connect · RMSSD',
  }];
});

export const buildHealthContextTimeline = (
  healthObservations: HealthObservation[],
  moodObservations: SelfReportedMoodObservation[],
): HealthContextTimelineItem[] => {
  const healthItems: HealthContextTimelineItem[] = healthObservations
    .filter((item) => isPositiveFiniteNumber(item.value) && isIsoDateTime(item.observedAt))
    .map((item) => ({
      type: 'health',
      id: item.id,
      metric: item.metric,
      value: item.value,
      unit: item.unit,
      occurredAt: new Date(item.observedAt).toISOString(),
      source: item.source,
      sourceLabel: item.sourceLabel,
    }));

  const moodItems: HealthContextTimelineItem[] = moodObservations
    .filter((item) => Number.isInteger(item.score) && item.score >= 1 && item.score <= 10 && isIsoDateTime(item.recordedAt))
    .map((item) => ({
      type: 'mood',
      id: item.id,
      score: item.score,
      occurredAt: new Date(item.recordedAt).toISOString(),
      source: 'self_report',
      sourceLabel: 'Ánimo autoinformado',
    }));

  return [...healthItems, ...moodItems]
    .sort((first, second) => Date.parse(first.occurredAt) - Date.parse(second.occurredAt));
};

const medianOf = (values: number[]): number => {
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

/** Summarizes each source/metric separately; it does not correlate health data with mood. */
export const summarizeHealthContext = (
  timeline: HealthContextTimelineItem[],
): HealthContextDescriptiveSummary[] => {
  const groups = new Map<string, HealthContextTimelineItem[]>();

  timeline.forEach((item) => {
    const key = item.type === 'mood'
      ? 'mood:self_report'
      : 'health:' + item.metric + ':' + item.source;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });

  return [...groups.entries()].map(([id, items]) => {
    const ordered = [...items].sort((first, second) =>
      Date.parse(first.occurredAt) - Date.parse(second.occurredAt));
    const first = ordered[0];
    const values = ordered.map((item) => item.type === 'mood' ? item.score : item.value);
    const isMood = first.type === 'mood';
    const metricLabel = isMood
      ? 'Ánimo autoinformado'
      : first.metric === 'heart_rate' ? 'Frecuencia cardíaca' : 'HRV · RMSSD';

    return {
      id,
      title: metricLabel,
      sourceLabel: first.sourceLabel,
      unit: isMood ? '/10' : first.unit,
      count: values.length,
      median: medianOf(values),
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      firstObservedAt: first.occurredAt,
      lastObservedAt: ordered[ordered.length - 1].occurredAt,
    };
  });
};

export const syntheticHealthContext = (): HealthContextTimelineItem[] => {
  const exampleDays = [
    { date: '2026-11-14', morning: { heartRate: 68, mood: 7 }, evening: { heartRate: 82, mood: 4 } },
    { date: '2026-11-15', morning: { heartRate: 76, mood: 5 }, evening: { heartRate: 71, mood: 8 } },
    { date: '2026-11-16', morning: { heartRate: 64, mood: 6 }, evening: { heartRate: 89, mood: 3 } },
    { date: '2026-11-17', morning: { heartRate: 85, mood: 7 }, evening: { heartRate: 73, mood: 5 } },
    { date: '2026-11-18', morning: { heartRate: 72, mood: 8 }, evening: { heartRate: 80, mood: 4 } },
    { date: '2026-11-19', morning: { heartRate: 91, mood: 5 }, evening: { heartRate: 66, mood: 7 } },
    { date: '2026-11-20', morning: { heartRate: 75, mood: 6 }, evening: { heartRate: 84, mood: 5 } },
  ];

  const healthObservations: HealthObservation[] = [];
  const moodObservations: SelfReportedMoodObservation[] = [];

  exampleDays.forEach(({ date, morning, evening }) => {
    [
      { period: 'morning', clock: '08:20:00', sample: morning },
      { period: 'evening', clock: '19:40:00', sample: evening },
    ].forEach(({ period, clock, sample }) => {
      const timestamp = `${date}T${clock}-05:00`;
      const sampleId = `${date}-${period}`;
      healthObservations.push({
        id: `demo-heart-rate-${sampleId}`,
        metric: 'heart_rate',
        value: sample.heartRate,
        unit: 'bpm',
        observedAt: timestamp,
        source: 'synthetic',
        sourceLabel: 'Dato sintético · pulso',
      });
      moodObservations.push({
        id: `demo-self-report-${sampleId}`,
        score: sample.mood,
        recordedAt: `${date}T${period === 'morning' ? '08:25:00' : '19:45:00'}-05:00`,
      });
    });
  });

  return buildHealthContextTimeline(healthObservations, moodObservations);
};
