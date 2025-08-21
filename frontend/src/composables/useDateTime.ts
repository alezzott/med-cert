import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ref } from 'vue';
import { parseDate, type DateValue } from '@internationalized/date';

type CertificateField =
  | 'collaboratorId'
  | 'cidCode'
  | 'issueDate'
  | 'leaveDays'
  | 'observations';
type CertificateFieldValue = string | number;

dayjs.extend(customParseFormat);

export function useDateTime() {
  const issueTime = ref(dayjs().format('HH:mm:ss'));

  function getCurrentDate(): string {
    return dayjs().format('YYYY-MM-DD');
  }

  function formatDateToData(date: string): string {
    return dayjs(date, ['YYYY-MM-DD', 'DD/MM/YYYY'], true).format('DD/MM/YYYY');
  }

  function formatDateToCalendar(date?: DateValue): string {
    if (!date) return '';
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

  function parseCalendarDate(dateString: string): DateValue | undefined {
    if (!dateString) return undefined;
    const onlyDate = dateString.split(' - ')[0];
    const date = dayjs(onlyDate, ['YYYY-MM-DD', 'DD/MM/YYYY'], true);
    if (!date.isValid()) return undefined;
    return parseDate(date.format('YYYY-MM-DD'));
  }

  function setIssueDate(
    dateStr: string,
    timeStr: string,
    setFieldValue: (
      field: CertificateField,
      value: CertificateFieldValue,
    ) => void,
  ) {
    if (!dateStr) return;
    const time = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    const formattedDate = dayjs(
      dateStr,
      ['YYYY-MM-DD', 'DD/MM/YYYY'],
      true,
    ).format('DD/MM/YYYY');
    setFieldValue('issueDate', `${formattedDate} - ${time}`);
  }

  return {
    issueTime,
    getCurrentDate,
    formatDateToData,
    formatDateToCalendar,
    parseCalendarDate,
    setIssueDate,
  };
}
