export interface Certificate {
  collaboratorId: string;
  name: string;
  leaveDays: number;
  cidCode: string;
  observations?: string;
}

export interface MedicalCertificate {
  collaboratorId: string;
  collaboratorName?: string;
  cidCode: string;
  issueDate: string;
  leaveDays: number;
  observations: string;
}
