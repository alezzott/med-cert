export class MedicalCertificateResponseDto {
  id: string;
  collaboratorId: string;
  cidCode: string;
  issueDate: Date;
  leaveDays: number;
  observations?: string;
}
