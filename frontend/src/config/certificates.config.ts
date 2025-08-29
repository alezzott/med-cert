import { h } from 'vue';
import CidInfoTooltip from '@/components/medical-certificates/table/CidInfoTooltip.vue';
import { parseDate } from '@/utils/table/parse-date.utils';
import type { ColumnDef } from '@tanstack/vue-table';
import type { Certificate } from '@/interfaces/certificates';

function parseCustomDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' - ');
  if (!datePart || !timePart) return null;
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  if (!day || !month || !year || !hour || !minute || !second) return null;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
}

export function getCertificateColumns(): ColumnDef<Certificate, any>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome do Colaborador',
      cell: ({ row }: any) => row.getValue('name') || '-',
      enableSorting: false,
    },
    {
      id: 'cid',
      header: 'CID',
      enableSorting: false,
      accessorFn: (row: any) => row.cid ?? [],
      cell: ({ getValue }: any) => {
        const cidArray = getValue() as { cidCode: string; cidDesc: string }[];
        if (!cidArray || cidArray.length === 0) return h('span', '-');
        return h(
          'div',
          {},
          cidArray.map((c) =>
            h(CidInfoTooltip, { cidCode: c.cidCode, cidDesc: c.cidDesc }),
          ),
        );
      },
    },
    {
      accessorKey: 'issueDate',
      header: 'Data de Emissão',
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = parseDate(rowA.getValue('issueDate') as string);
        const dateB = parseDate(rowB.getValue('issueDate') as string);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      },
      cell: (ctx) => {
        const date = parseCustomDate(ctx.row.getValue('issueDate') as string);
        return date
          ? `${date.toLocaleDateString('pt-BR')} - ${date.toLocaleTimeString('pt-BR')}`
          : 'Data inválida';
      },
    },
    {
      accessorKey: 'leaveDays',
      header: 'Dias de Afastamento',
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue('leaveDays') as number;
        const b = rowB.getValue('leaveDays') as number;
        return a - b;
      },
      cell: ({ row }: any) => row.getValue('leaveDays'),
    },
    {
      accessorKey: 'observations',
      header: 'Observações',
      cell: ({ row }: any) => row.getValue('observations') || '-',
      enableSorting: false,
    },
  ];
}
