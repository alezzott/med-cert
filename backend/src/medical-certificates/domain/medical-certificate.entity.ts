export class MedicalCertificate {
  constructor(
    public readonly id: string,
    public readonly collaboratorId: string,
    public readonly issueDate: Date,
    public readonly leaveDays: number,
    public readonly cidCode: string,
    public readonly name: string,
    public readonly observations?: string,
  ) {}
}
