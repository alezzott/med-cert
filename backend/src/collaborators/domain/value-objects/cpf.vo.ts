export class CPF {
  private readonly value: string;

  constructor(value: string) {
    if (!CPF.isValid(value)) {
      throw new Error('CPF inválido');
    }
    this.value = value;
  }

  static isValid(value: string): boolean {
    if (!value) return false;
    const onlyDigits = value.replace(/\D/g, '');
    return onlyDigits.length === 11;
  }

  toString() {
    return this.value;
  }
}

export function sanitizeCpf(cpf: string): string {
  return cpf ? cpf.replace(/\D/g, '') : '';
}
