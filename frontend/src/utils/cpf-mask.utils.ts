export function applyCpfMask(value: string): string {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '').slice(0, 11);

  let masked = numbers;
  if (numbers.length > 3 && numbers.length <= 6) {
    masked = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length > 6 && numbers.length <= 9) {
    masked = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else if (numbers.length > 9) {
    masked = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  return masked;
}

export function removeCpfMask(value: string): string {
  return value.replace(/\D/g, '');
}
