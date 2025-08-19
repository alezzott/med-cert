<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import {
  getCoreRowModel,
  useVueTable,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';

import { CollaboratorStatus } from '@/enums/status.enums';
import { Button } from '@/components/ui/button';
import AddCollaboratorDialog from '@/components/collaborators/AddCollaboratorDialog.vue';
import { useUpdateCollaboratorStatus } from '@/composables/useUpdateCollaboratorStatus';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import { useCollaborators } from '@/composables/useFetchCollaborators';
import { toast } from 'vue-sonner';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import CollaboratorTable from '@/components/collaborators/CollaboratorTable.vue';
import CollaboratorFilter from '@/components/collaborators/CollaboratorFilter.vue';
import CollaboratorPagination from '@/components/collaborators/CollaboratorPagination.vue';
import type { Collaborator } from '@/interfaces/collaborator';
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
const sorting = ref<SortingState>([]);

const paginatedCollaborator = computed(() => {
  if (collaborator.value?.length) {
    const start = (currentPage.value - 1) * pageSize.value;
    return collaborator.value.slice(start, start + pageSize.value);
  }
  return [];
});

const tableData = computed<Collaborator[]>(() => {
  if (
    searchValue.value &&
    collaborator.value?.length &&
    collaborator.value.every(
      (c) =>
        'id' in c &&
        'name' in c &&
        'cpf' in c &&
        'email' in c &&
        'status' in c &&
        'birthDate' in c &&
        'createdAt' in c,
    )
  ) {
    return paginatedCollaborator.value as Collaborator[];
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

function handleSortingChange(updater: SortingState | Updater<SortingState>) {
  const newSorting =
    typeof updater === 'function' ? updater(sorting.value) : updater;
  sorting.value = newSorting;
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

const columns: ColumnDef<Collaborator, string | CollaboratorStatus>[] = [
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
      const dateA = parseCustomDate(rowA.getValue('birthDate') as string);
      const dateB = parseCustomDate(rowB.getValue('birthDate') as string);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    },
    cell: (ctx) => {
      const value = ctx.row.getValue('birthDate') as string;
      const date = parseCustomDate(value);
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
      const dateA = parseCustomDate(rowA.getValue('createdAt') as string);
      const dateB = parseCustomDate(rowB.getValue('createdAt') as string);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    },
    cell: (ctx) => {
      const date = parseCustomDate(ctx.row.getValue('createdAt') as string);
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

const table = useVueTable<Collaborator>({
  data: tableData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get sorting() {
      return sorting.value;
    },
  },
  onSortingChange: handleSortingChange,
  manualSorting: false,
});

onMounted(() => {
  fetchCollaborators({ page: currentPage.value, limit: pageSize.value });
});
</script>

<template>
  <main class="md:p-8">
    <section>
      <Spinner v-if="loading" />
      <section
        v-else-if="error"
        class="text-red-500 text-center p-4"
        role="alert"
      >
        {{ error }}
      </section>
      <section v-else>
        <CollaboratorFilter
          v-model:searchValue="searchValue"
          :pageSize="pageSize"
          :pageSizeOptions="pageSizeOptions"
          :onSearch="handleSearchInput"
          :onChangePageSize="changePageSize"
          :onClearSearch="
            () => {
              searchValue = '';
              handleSearchInput();
            }
          "
        >
          <template #add-collaborator>
            <AddCollaboratorDialog @saved="fetchCollaborators" />
          </template>
        </CollaboratorFilter>
        <section v-if="searchLoading">
          <Spinner />
        </section>
        <section class="my-5">
          <CollaboratorTable :table="table" :columns="columns" />
          <CollaboratorPagination
            :currentPage="currentPage"
            :hasNextPage="hasNextPage"
            :total="total"
            :goToFirstPage="goToFirstPage"
            :goToPrevPage="goToPrevPage"
            :goToNextPage="goToNextPage"
            :goToLastPage="goToLastPage"
          />
        </section>
      </section>
    </section>
  </main>
</template>
