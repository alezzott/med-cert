// Value Object para CPF
export class CPF {
  private readonly value: string;

  constructor(value: string) {
    if (!CPF.isValid(value)) {
      throw new Error('CPF inválido');
    }
    this.value = value;
  }

  static isValid(value: string): boolean {
    return /^\d{11}$/.test(value);
  }

  toString() {
    return this.value;
  }
}
