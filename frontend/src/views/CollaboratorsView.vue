<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  getCoreRowModel,
  useVueTable,
  getSortedRowModel,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';

import { CollaboratorStatus } from '@/enums/status.enums';
import AddCollaboratorDialog from '@/components/collaborators/AddCollaboratorDialog.vue';
import { useUpdateCollaboratorStatus } from '@/composables/useUpdateCollaboratorStatus';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import CollaboratorTable from '@/components/collaborators/CollaboratorTable.vue';
import CollaboratorFilter from '@/components/collaborators/CollaboratorFilter.vue';
import CollaboratorPagination from '@/components/collaborators/CollaboratorPagination.vue';
import type { Collaborator } from '@/interfaces/collaborator';
import { useCollaboratorsStore } from '@/stores/collaborator.store';
import { getCollaboratorTableColumns } from '@/config/collaborators.config';

const { updateStatus } = useUpdateCollaboratorStatus();
const store = useCollaboratorsStore();

onMounted(() => {
  store.setFilters({ page: 1, limit: 10, status: 'ALL' });
});

const {
  searchValue,
  loading: searchLoading,
  collaborator,
  searchCollaborator,
} = useCollaboratorSearch();

const pageSizeOptions = [5, 10, 20, 50];
const sorting = ref<SortingState>([]);

const tableData = computed<Collaborator[]>(() => {
  return searchValue.value && collaborator.value?.length
    ? (collaborator.value as Collaborator[])
    : store.collaborators;
});

const hasNextPage = computed(() => {
  if (searchValue.value && collaborator.value?.length) {
    return store.filters.page * store.filters.limit < collaborator.value.length;
  }
  return store.filters.page * store.filters.limit < store.total;
});

watch(
  () => [store.filters.page, store.filters.limit, store.filters.status],
  () => {
    if (!searchValue.value) {
      store.fetchCollaborators();
    }
  },
);

function handleSortingChange(updater: SortingState | Updater<SortingState>) {
  const newSorting =
    typeof updater === 'function' ? updater(sorting.value) : updater;
  sorting.value = newSorting;
}

const columns = getCollaboratorTableColumns(updateStatus, () => {
  store.invalidateCache();
  store.fetchCollaborators();
});

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
</script>

<template>
  <main class="md:p-8">
    <section>
      <Spinner v-if="store.loading" />
      <section
        v-else-if="store.error"
        class="text-red-500 text-center p-4"
        role="alert"
      >
        {{ store.error }}
      </section>
      <section v-else>
        <CollaboratorFilter
          v-model:searchValue="searchValue"
          v-model:statusValue="store.filters.status"
          :pageSize="store.filters.limit"
          :pageSizeOptions="pageSizeOptions"
          @update:pageSize="store.setLimit"
          @changePage="store.setPage"
          @fetchCollaborators="store.fetchCollaborators"
          @searchCollaborator="searchCollaborator"
        >
          <template #add-collaborator>
            <AddCollaboratorDialog @saved="store.fetchCollaborators" />
          </template>
        </CollaboratorFilter>
        <section v-if="searchLoading">
          <Spinner />
        </section>
        <section class="my-5">
          <CollaboratorTable :table="table" :columns="columns" />
          <CollaboratorPagination
            :currentPage="store.filters.page"
            :hasNextPage="hasNextPage"
            :total="store.total"
            @changePage="store.setPage"
            :pageSize="store.filters.limit"
          />
        </section>
      </section>
    </section>
  </main>
</template>
