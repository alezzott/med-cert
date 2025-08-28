import { h } from 'vue';
import { CollaboratorStatus } from '@/enums/status.enums';
import { Button } from '@/components/ui/button';
import { applyCpfMask } from '@/utils/cpf-mask.utils';
import { getToggleStatusHandler } from '@/utils/table/collaborator-status.utils';
import { parseDate } from '@/utils/table/parse-date.utils';
import type { ColumnDef } from '@tanstack/vue-table';
import type { Collaborator } from '@/interfaces/collaborator';

export function getCollaboratorTableColumns(
  updateStatus: (id: string, status: CollaboratorStatus) => Promise<boolean>,
  fetchCollaborators: () => void,
): ColumnDef<Collaborator, string | CollaboratorStatus>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome do colaborador',
      cell: (ctx) => ctx.row.getValue('name') as string,
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: 'E-mail do colaborador',
      cell: (ctx) => ctx.row.getValue('email') as string,
      enableSorting: false,
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      cell: (ctx) => applyCpfMask(ctx.row.getValue('cpf')) as string,
      enableSorting: false,
    },
    {
      accessorKey: 'birthDate',
      header: 'Data de Nascimento',
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = parseDate(rowA.getValue('birthDate') as string);
        const dateB = parseDate(rowB.getValue('birthDate') as string);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      },
      cell: (ctx) => {
        const value = ctx.row.getValue('birthDate') as string;
        const date = parseDate(value);
        return date && !isNaN(date.getTime())
          ? date.toLocaleDateString('pt-BR')
          : 'Data inválida';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de Criação',
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = parseDate(rowA.getValue('createdAt') as string);
        const dateB = parseDate(rowB.getValue('createdAt') as string);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      },
      cell: (ctx) => {
        const date = parseDate(ctx.row.getValue('createdAt') as string);
        return date
          ? `${date.toLocaleDateString('pt-BR')} - ${date.toLocaleTimeString('pt-BR')}`
          : 'Data inválida';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (ctx) => {
        const status = ctx.row.getValue('status') as CollaboratorStatus;
        const collaborator = ctx.row.original;
        return h(
          Button,
          {
            variant: status === 'ACTIVE' ? 'default' : 'outline',
            onClick: getToggleStatusHandler(
              collaborator,
              status,
              updateStatus,
              fetchCollaborators,
            ),
            class: 'cursor-pointer',
          },
          { default: () => (status === 'ACTIVE' ? 'Ativo' : 'Inativo') },
        );
      },
    },
  ];
}
