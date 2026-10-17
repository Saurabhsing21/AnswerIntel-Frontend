/** The API stores the weekly schedule as weekday (0 = Monday) and hour, both in UTC. */
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00 UTC`;

export function nextRun(dayOfWeek: number, hour: number, now = new Date()): Date {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour));
  const today = (date.getUTCDay() + 6) % 7; // JS counts Sunday as 0; the API counts Monday as 0
  date.setUTCDate(date.getUTCDate() + ((dayOfWeek - today + 7) % 7));
  if (date <= now) date.setUTCDate(date.getUTCDate() + 7);
  return date;
}

export function relativeDay(date: Date, now = new Date()): string {
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
}
