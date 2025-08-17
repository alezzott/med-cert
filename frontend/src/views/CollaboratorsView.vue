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
import { applyCpfMask } from '@/utils/cpf-mask.utils';

const { updateStatus } = useUpdateCollaboratorStatus();
const { collaborators, loading, error, total, fetchCollaborators } =
  useCollaborators();
const {
  searchValue,
  loading: searchLoading,
  collaborator,
  searchCollaborator,
} = useCollaboratorSearch();

const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [5, 10, 20, 50];

const paginatedCollaborator = computed(() => {
  if (collaborator.value?.length) {
    const start = (currentPage.value - 1) * pageSize.value;
    return collaborator.value.slice(start, start + pageSize.value);
  }
  return [];
});

const tableData = computed(() => {
  if (searchValue.value && collaborator.value?.length) {
    return paginatedCollaborator.value;
  }
  return collaborators.value;
});

const hasNextPage = computed(() => {
  const totalItems =
    searchValue.value && collaborator.value?.length
      ? collaborator.value.length
      : total.value;
  return currentPage.value * pageSize.value < totalItems;
});

watch([currentPage, pageSize], () => {
  if (!searchValue.value) {
    fetchCollaborators({ page: currentPage.value, limit: pageSize.value });
  }
});

function goToPage(page: number) {
  if (page >= 1) currentPage.value = page;
}

function goToFirstPage() {
  goToPage(1);
}

function goToNextPage() {
  if (hasNextPage.value) goToPage(currentPage.value + 1);
}

function goToPrevPage() {
  if (currentPage.value > 1) goToPage(currentPage.value - 1);
}

function goToLastPage() {
  const totalItems =
    searchValue.value && collaborator.value?.length
      ? collaborator.value.length
      : total.value;
  const lastPage = Math.ceil(totalItems / pageSize.value);
  goToPage(lastPage);
}

function changePageSize(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1;
}

function handleSearchInput() {
  currentPage.value = 1;

  if (searchValue.value && searchValue.value.trim()) {
    searchCollaborator(searchValue.value);
  } else {
    fetchCollaborators({ page: 1, limit: pageSize.value });
  }
}

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
    cell: ({ row }: any) => applyCpfMask(row.getValue('cpf')),
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
      const date = parseCustomDate(row.getValue('createdAt'));
      return date
        ? `${date.toLocaleDateString('pt-BR')} - ${date.toLocaleTimeString('pt-BR')}`
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as CollaboratorStatus;
      const collaborator = row.original;
      async function handleToggleStatus() {
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
        } catch {
          toast.error('Erro ao atualizar status do colaborador');
        }
      }
      return h(
        Button,
        {
          variant: status === 'ACTIVE' ? 'default' : 'outline',
          onClick: handleToggleStatus,
          class: 'cursor-pointer',
        },
        { default: () => (status === 'ACTIVE' ? 'Ativo' : 'Inativo') },
      );
    },
  },
];

const table = useVueTable({
  data: tableData,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

onMounted(() => {
  fetchCollaborators({ page: currentPage.value, limit: pageSize.value });
});
</script>

<template>
  <main class="p-4 md:p-8">
    <section aria-live="polite">
      <Spinner v-if="loading" />
      <div v-else-if="error" class="text-red-500 text-center p-4" role="alert">
        {{ error }}
      </div>

      <div v-else>
        <form
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4"
          @submit.prevent="handleSearchInput"
          aria-label="Filtros de colaboradores"
        >
          <div class="flex items-center">
            <label
              for="pageSize"
              class="text-sm text-muted-foreground whitespace-nowrap"
            >
              Itens por página:
            </label>
            <Select
              id="pageSize"
              :model-value="pageSize.toString()"
              @update:model-value="(value) => changePageSize(Number(value))"
              aria-label="Selecionar quantidade de itens por página"
            >
              <SelectTrigger class="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="size in pageSizeOptions"
                  :key="size"
                  :value="size.toString()"
                  :aria-label="`Exibir ${size} itens por página`"
                >
                  {{ size }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center gap-2 w-full max-md:max-w-md">
            <Input
              id="searchInput"
              v-model="searchValue"
              type="text"
              placeholder="Buscar por nome ou CPF..."
              class="border px-2 py-1 text-sm flex-1 rounded-md"
              aria-label="Buscar por nome ou CPF"
            />
            <Button
              v-if="searchValue"
              class="cursor-pointer whitespace-nowrap"
              variant="outline"
              aria-label="Limpar busca"
              @click="
                () => {
                  searchValue = '';
                  handleSearchInput();
                }
              "
            >
              Limpar
            </Button>
            <Button
              type="submit"
              class="whitespace-nowrap"
              aria-label="Buscar colaboradores"
              :disabled="!searchValue || !searchValue.trim()"
            >
              Buscar
            </Button>
          </div>
          <AddCollaboratorDialog @saved="fetchCollaborators" />
        </form>

        <div v-if="searchLoading">
          <Spinner />
        </div>

        <section
          class="rounded-md border overflow-hidden"
          aria-label="Tabela de colaboradores"
        >
          <div class="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow
                  v-for="headerGroup in table.getHeaderGroups()"
                  :key="headerGroup.id"
                >
                  <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                  >
                    <FlexRender
                      v-if="!header.isPlaceholder"
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="table.getRowModel().rows?.length">
                  <TableRow
                    v-for="row in table.getRowModel().rows"
                    :key="row.id"
                    :data-state="row.getIsSelected() && 'selected'"
                  >
                    <TableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                    >
                      <FlexRender
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <TableRow>
                    <TableCell
                      :colspan="columns.length"
                      class="h-24 text-center"
                      role="status"
                    >
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
          <div class="md:hidden">
            <Table>
              <TableBody>
                <template v-if="table.getRowModel().rows?.length">
                  <TableRow
                    v-for="row in table.getRowModel().rows"
                    :key="row.id"
                    :data-state="row.getIsSelected() && 'selected'"
                  >
                    <TableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                    >
                      <FlexRender
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <TableRow>
                    <TableCell
                      :colspan="columns.length"
                      class="h-24 text-center"
                      role="status"
                    >
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </section>

        <nav
          class="flex flex-col sm:flex-row gap-4 py-4"
          aria-label="Paginação"
        >
          <div
            class="flex items-center justify-center space-x-1 sm:space-x-2 w-full"
          >
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="goToFirstPage"
              class="px-2"
              aria-label="Primeira página"
            >
              <ChevronsLeft class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="goToPrevPage"
              class="px-2"
              aria-label="Página anterior"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <div class="flex items-center space-x-2 mx-4">
              <span class="text-sm whitespace-nowrap">Página</span>
              <div
                class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm"
                aria-live="polite"
              >
                {{ currentPage }}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              @click="goToNextPage"
              :disabled="!hasNextPage"
              class="px-2"
              aria-label="Próxima página"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="goToLastPage"
              :disabled="!hasNextPage"
              class="px-2"
              aria-label="Última página"
            >
              <ChevronsRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex justify-end">
            <h1 class="text-muted-foreground whitespace-nowrap">
              Total: {{ total }}
            </h1>
          </div>
        </nav>
      </div>
    </section>
  </main>
</template>
