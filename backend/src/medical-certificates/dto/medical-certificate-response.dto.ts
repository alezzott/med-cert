export class MedicalCertificateResponseDto {
  id: string;
  collaboratorId: string;
  name: string;
  cidCode: string;
  issueDate: string;
  leaveDays: number;
  observations?: string;
}
