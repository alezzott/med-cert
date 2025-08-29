import { z } from 'zod';

export const certificateSchema = z.object({
  collaboratorId: z.string().min(1, 'Colaborador obrigatório'),
  issueDate: z.string().min(1, 'Data obrigatória'),
  leaveDays: z.coerce.number().min(1, 'Mínimo 1 dia').max(15, 'Máximo 15 dias'),
  cidCode: z.string().min(1, 'Selecione um CID'),
  cidDesc: z.string().min(1, 'Descrição do CID é obrigatória'),
  observations: z.string().optional(),
});

export type CertificateFormValues = z.infer<typeof certificateSchema>;
