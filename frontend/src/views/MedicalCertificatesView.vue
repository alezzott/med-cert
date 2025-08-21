<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';
import { Button } from '@/components/ui/button';
import AddCertificateDialog from '@/components/medical-certificates/AddCertificateDialog.vue';
import { useMedicalCertificates } from '@/composables/useFetchCertificates';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import PageSizeSelector from '@/components/medical-certificates/table/PageSizeSelector.vue';
import MedialCertificationFilter from '@/components/medical-certificates/table/MedialCertificationFilter.vue';
import CertificatesTable from '@/components/medical-certificates/table/CertificatesTable.vue';
import PaginationCertificateTable from '@/components/medical-certificates/table/PaginationCertificateTable.vue';
import type { Collaborator } from '@/interfaces/collaborator';

const { certificates, loading, error, total, fetchCertificates } =
  useMedicalCertificates();

const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [5, 10, 20];
const searchInput = ref('');
const sorting = ref<SortingState>([]);

watch([currentPage, pageSize], () => {
  fetchCertificates({
    page: currentPage.value,
    limit: pageSize.value,
    name: searchInput.value,
  });
});

const handleSearchInput = () => {
  currentPage.value = 1;
  fetchCertificates({
    page: currentPage.value,
    limit: pageSize.value,
    name: searchInput.value,
  });
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= Math.ceil(total.value / pageSize.value)) {
    currentPage.value = page;
  }
};
const goToFirstPage = () => goToPage(1);
const goToNextPage = () => goToPage(currentPage.value + 1);
const goToPrevPage = () => goToPage(currentPage.value - 1);
const goToLastPage = () => goToPage(Math.ceil(total.value / pageSize.value));
const changePageSize = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

function parseCustomDate(dateStr: string) {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' - ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart ? timePart.split(':') : [0, 0, 0];
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
    header: 'Nome do Colaborador',
    cell: ({ row }: any) => row.getValue('name') || '-',
    enableSorting: false,
  },
  {
    accessorKey: 'cidCode',
    header: 'CID',
    cell: ({ row }: any) => row.getValue('cidCode'),
    enableSorting: false,
  },
  {
    accessorKey: 'issueDate',
    header: 'Data de Emissão',
    enableSorting: true,
    cell: ({ row }: any) => {
      const value = row.getValue('issueDate');
      const date = parseCustomDate(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleString('pt-BR')
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'leaveDays',
    header: 'Dias de Afastamento',
    cell: ({ row }: any) => row.getValue('leaveDays'),
    enableSorting: true,
  },
  {
    accessorKey: 'observations',
    header: 'Observações',
    cell: ({ row }: any) => row.getValue('observations') || '-',
    enableSorting: false,
  },
];

function handleSortingChange(updater: SortingState | Updater<SortingState>) {
  const newSorting =
    typeof updater === 'function' ? updater(sorting.value) : updater;
  sorting.value = newSorting;
}

const table = useVueTable({
  data: certificates,
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
  fetchCertificates({
    page: currentPage.value,
    limit: pageSize.value,
    name: searchInput.value,
  });
});

const addCertificateDialogOpen = ref(false);
const selectedCollaborator = ref<Collaborator | undefined>(undefined);

function openAddCertificateDialog(collaborator: Collaborator | undefined) {
  selectedCollaborator.value = collaborator;
  addCertificateDialogOpen.value = true;
}
</script>

<template>
  <div class="md:p-8">
    <Spinner v-if="loading" />
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>

    <div v-else>
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6"
      >
        <PageSizeSelector
          :model-value="pageSize.toString()"
          :options="pageSizeOptions"
          :onChange="(value) => changePageSize(Number(value))"
        />

        <MedialCertificationFilter
          :model-value="searchInput"
          @update:modelValue="(val) => (searchInput = val)"
          @search="handleSearchInput"
        />

        <Button
          variant="default"
          @click="openAddCertificateDialog(undefined)"
          class="cursor-pointer whitespace-nowrap"
        >
          Adicionar Atestado
        </Button>
      </div>

      <div class="rounded-md border overflow-hidden">
        <CertificatesTable
          :table="table"
          :columns="columns"
          :sorting="sorting"
          :onSortingChange="handleSortingChange"
        />
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4 py-4">
        <PaginationCertificateTable
          :currentPage="currentPage"
          :totalPages="Math.ceil(total / pageSize)"
          :goToFirstPage="goToFirstPage"
          :goToPrevPage="goToPrevPage"
          :goToNextPage="goToNextPage"
          :goToLastPage="goToLastPage"
        />
        <div class="flex justify-end">
          <h1 class="text-muted-foreground whitespace-nowrap">
            Total: {{ total }}
          </h1>
        </div>
      </div>
    </div>

    <AddCertificateDialog
      v-model:open="addCertificateDialogOpen"
      :collaborator="selectedCollaborator"
    />
  </div>
</template>
