import dayjs from 'dayjs';

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' - ');
  const formatted = `${datePart} ${timePart}`;
  const date = dayjs(formatted, 'DD/MM/YYYY HH:mm:ss');
  return date.isValid() ? date.toDate() : null;
}
