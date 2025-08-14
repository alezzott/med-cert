export function applyCpfMask(value: string): string {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);

  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  }
}

export function removeCpfMask(value: string): string {
  return value.replace(/\D/g, '');
}
