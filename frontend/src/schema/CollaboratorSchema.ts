import { toTypedSchema } from '@vee-validate/zod';
import z from 'zod';

export const CollaboratorSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    cpf: z
      .string()
      .min(1, 'CPF obrigatório')
      .length(14, 'CPF deve ter exatamente 11 dígitos'),
    birthDate: z
      .string()
      .min(1, 'Data obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  }),
);
