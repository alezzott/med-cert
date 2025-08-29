<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import {
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';
import AddCertificateDialog from '@/components/medical-certificates/AddCertificateDialog.vue';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import MedicalCertificationFilter from '@/components/medical-certificates/table/MedicalCertificationFilter.vue';
import CertificatesTable from '@/components/medical-certificates/table/CertificatesTable.vue';
import PaginationCertificateTable from '@/components/medical-certificates/table/PaginationCertificateTable.vue';
import type { Collaborator } from '@/interfaces/collaborator';
import { getCertificateColumns } from '@/config/certificates.config';
import { useCertificatesStore } from '@/stores/certificates.store';
import type { AcceptableValue } from 'reka-ui';

const store = useCertificatesStore();

onMounted(() => {
  store.setFilters({ page: 1, limit: 10 });
  store.fetchCertificates();
});

const pageSizeOptions = [5, 10, 20];
const sorting = ref<SortingState>([]);
const addCertificateDialogOpen = ref(false);
const selectedCollaborator = ref<Collaborator | undefined>(undefined);
const searchLoading = computed(() => store.loading);

function handlePageChange(newPage: number) {
  store.setFilters({ page: newPage });
  store.fetchCertificates();
}

function handlePageSizeChange(value: AcceptableValue) {
  const newSize = Number(value);
  if (!newSize) return;
  store.setFilters({ limit: newSize, page: 1 });
  store.fetchCertificates();
}

const columns = getCertificateColumns();

function handleSortingChange(updater: SortingState | Updater<SortingState>) {
  const newSorting =
    typeof updater === 'function' ? updater(sorting.value) : updater;
  sorting.value = newSorting;
}

const tableData = computed(() => store.certificates);

const table = useVueTable({
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

function handleUpdateSearchValue(value: string) {
  store.setFilters({ name: value, page: 1 });
  if (!value) {
    store.fetchCertificates();
  }
}

async function handleSearchCollaborator(name: string) {
  store.setFilters({ name, page: 1 });
  await store.fetchCertificates({ name });
}

async function handleFetchCollaborators() {
  store.setFilters({ name: '', page: 1 });
  await nextTick();
  store.fetchCertificates();
}
</script>

<template>
  <main class="md:p-8">
    <Spinner v-if="store.loading" />
    <div v-else-if="store.error" class="text-red-500 text-center p-4">
      {{ store.error }}
    </div>
    <div v-else>
      <div>
        <MedicalCertificationFilter
          :searchValue="store.filters.name"
          :pageSize="store.filters.limit"
          :pageSizeOptions="pageSizeOptions"
          @update:searchValue="handleUpdateSearchValue"
          @searchCollaborator="handleSearchCollaborator"
          @fetchCollaborators="handleFetchCollaborators"
          @update:pageSize="handlePageSizeChange"
        >
          <template #add-certificates>
            <AddCertificateDialog
              v-model:open="addCertificateDialogOpen"
              :collaborator="selectedCollaborator"
            />
          </template>
        </MedicalCertificationFilter>
        <section v-if="searchLoading">
          <Spinner />
        </section>
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
          :total="store.total"
          :pageSize="store.filters.limit"
          :model-value="store.filters.page"
          @update:modelValue="handlePageChange"
        />
      </div>
    </div>
  </main>
</template>
