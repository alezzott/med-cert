export function applyTimeMask(value: string): string {
  const digits = value.replace(/\D/g, '');

  let hh = digits.slice(0, 2);
  let mm = digits.slice(2, 4);
  let ss = digits.slice(4, 6);

  if (hh) hh = String(Math.min(Number(hh), 23)).padStart(hh.length, '0');
  if (mm) mm = String(Math.min(Number(mm), 59)).padStart(mm.length, '0');
  if (ss) ss = String(Math.min(Number(ss), 59)).padStart(ss.length, '0');

  if (digits.length <= 2) {
    return hh;
  } else if (digits.length <= 4) {
    return `${hh}:${mm}`;
  } else {
    return `${hh}:${mm}:${ss}`;
  }
}
