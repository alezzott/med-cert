<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { getCoreRowModel, useVueTable, FlexRender } from '@tanstack/vue-table';

import Table from '@/components/ui/table/Table.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import { CollaboratorStatus } from '@/enums/status.enums';
import { Button } from '@/components/ui/button';
import AddCollaboratorDialog from '@/components/collaborators/AddCollaboratorDialog.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next';
import { useUpdateCollaboratorStatus } from '@/composables/useUpdateCollaboratorStatus';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import { useCollaborators } from '@/composables/useFetchCollaborators';
import { toast } from 'vue-sonner';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import { Input } from '@/components/ui/input';

const { updateStatus } = useUpdateCollaboratorStatus();
const { collaborators, loading, error, fetchCollaborators } =
  useCollaborators();
const {
  searchValue,
  loading: searchLoading,
  collaborator,
  searchCollaborator,
} = useCollaboratorSearch();

const currentPage = ref(1);
const pageSize = ref(10);
const hasNextPage = computed(() => {
  return currentPage.value * pageSize.value;
});
const pageSizeOptions = [5, 10, 20, 50];

watch([currentPage, pageSize], () => {
  fetchCollaborators({
    page: currentPage.value,
    limit: pageSize.value,
  });
});

console.log(collaborators, 'collaborators');

const goToPage = (page: number) => {
  if (page >= 1) {
    currentPage.value = page;
  }
};

const goToFirstPage = () => goToPage(1);
const goToNextPage = () => goToPage(currentPage.value + 1);
const goToPrevPage = () => goToPage(currentPage.value - 1);
const goToLastPage = async () => {
  while (hasNextPage.value) {
    currentPage.value++;
    await fetchCollaborators();
  }
};

const changePageSize = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

function parseCustomDate(dateStr: string) {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' - ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }: any) => row.getValue('name'),
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
    cell: ({ row }: any) => row.getValue('email'),
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
    cell: ({ row }: any) => row.getValue('cpf'),
  },
  {
    accessorKey: 'birthDate',
    header: 'Data de Nascimento',
    cell: ({ row }: any) => {
      const value = row.getValue('birthDate');
      const date = parseCustomDate(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleDateString('pt-BR')
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Criação',
    cell: ({ row }: any) => {
      const value = row.getValue('createdAt');
      const date = parseCustomDate(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleString('pt-BR')
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as CollaboratorStatus;
      const collaborator = row.original;
      const handleToggleStatus = async () => {
        const newStatus =
          status === CollaboratorStatus.ACTIVE
            ? CollaboratorStatus.INACTIVE
            : CollaboratorStatus.ACTIVE;

        const statusText =
          newStatus === CollaboratorStatus.ACTIVE ? 'ativado' : 'desativado';

        try {
          const ok = await updateStatus(collaborator.id, newStatus);
          if (ok) {
            fetchCollaborators();
            toast.success(`Colaborador ${statusText} com sucesso!`);
          } else {
            toast.error('Erro ao atualizar status do colaborador');
          }
        } catch (error) {
          toast.error('Erro ao atualizar status do colaborador');
        }
      };

      return h(
        Button,
        {
          variant: status === 'ACTIVE' ? 'default' : 'outline',
          onClick: handleToggleStatus,
          class: 'cursor-pointer',
        },
        {
          default: () => (status === 'ACTIVE' ? 'Ativo' : 'Inativo'),
        },
      );
    },
  },
];

const table = useVueTable({
  data: collaborators,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

onMounted(() => {
  fetchCollaborators({
    page: currentPage.value,
    limit: pageSize.value,
  });
});

const handleSearchInput = () => {
  searchCollaborator(searchValue.value);
};
</script>

<template>
  <div class="p-8">
    <section class="flex justify-between mb-8">
      <h1 class="text-2xl font-bold">Colaboradores</h1>
      <AddCollaboratorDialog @saved="fetchCollaborators" />
    </section>

    <Spinner v-if="loading" />
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>

    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-muted-foreground">Itens por página:</span>
          <Select
            :model-value="pageSize.toString()"
            @update:model-value="(value) => changePageSize(Number(value))"
          >
            <SelectTrigger class="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="size in pageSizeOptions"
                :key="size"
                :value="size.toString()"
              >
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex items-center gap-4 w-full mb-4">
        <Input
          v-model="searchValue"
          type="text"
          placeholder="Buscar por nome ou CPF..."
          class="border px-2 py-1 text-sm w-full rounded-md"
        />
        <Button
          v-if="searchValue"
          class="cursor-pointer"
          size="default"
          variant="outline"
          @click="
            () => {
              searchValue = '';
              handleSearchInput();
            }
          "
        >
          Limpar
        </Button>
        <Button @click="handleSearchInput">Buscar</Button>
      </div>
      <div v-if="searchLoading">
        <Spinner />
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="collaborator">
              <TableRow>
                <TableCell v-for="col in columns" :key="col.accessorKey">
                  {{
                    Array.isArray(collaborator)
                      ? collaborator[0][col.accessorKey]
                      : collaborator[col.accessorKey]
                  }}
                </TableCell>
              </TableRow>
            </template>
            <template v-else-if="table.getRowModel().rows?.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() && 'selected'"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
            </template>
            <template v-else>
              <TableRow>
                <TableCell :colspan="columns.length" class="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <div class="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToFirstPage"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPrevPage"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div class="flex items-center space-x-2">
          <span class="text-sm">Página</span>
          <div
            class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm"
          >
            {{ currentPage }}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="!hasNextPage"
          @click="goToNextPage"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!hasNextPage"
          @click="goToLastPage"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
