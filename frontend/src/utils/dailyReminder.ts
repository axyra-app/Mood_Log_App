export function downloadDailyReminder() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(19, 0, 0, 0);
  if (start <= now) start.setDate(start.getDate() + 1);
  const date = [start.getFullYear(), start.getMonth() + 1, start.getDate()]
    .map((value) => String(value).padStart(2, '0')).join('');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mood Log//Daily Reminder//ES',
    'BEGIN:VEVENT', 'UID:daily-mood-reminder@mood-log-app-main.vercel.app',
    `DTSTAMP:${stamp}`, `DTSTART:${date}T190000`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
    'SUMMARY:Mood Log · ¿Cómo va tu día?',
    'URL:https://mood-log-app-main.vercel.app/mood-flow',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M',
    'DESCRIPTION:¿Cómo va tu día? Tómate un momento para ti.',
    'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', '',
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'recordatorio-mood-log.ics';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
