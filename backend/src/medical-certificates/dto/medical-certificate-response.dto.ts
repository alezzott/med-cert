export class MedicalCertificateResponseDto {
  id: string;
  collaboratorId: string;
  cidCode: string;
  issueDate: string;
  leaveDays: number;
  observations?: string;
}
