import { parseDate, type DateValue } from '@internationalized/date';

export function stringToCalendarDate(dateString: string) {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return undefined;
  }
  try {
    return parseDate(dateString);
  } catch {
    return undefined;
  }
}

export function calendarDateToString(date: DateValue | undefined) {
  if (!date || typeof date.toString !== 'function') {
    return '';
  }
  return date.toString();
}

export function formatDateForDisplay(dateString: string) {
  if (!dateString) return 'Selecione a data';
  try {
    const date = parseDate(dateString);
    return new Date(date.year, date.month - 1, date.day).toLocaleDateString(
      'pt-BR',
    );
  } catch {
    return 'Selecione a data';
  }
}
