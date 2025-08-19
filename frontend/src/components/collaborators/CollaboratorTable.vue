<template>
  <section
    class="rounded-md border overflow-hidden"
    aria-label="Tabela de colaboradores"
  >
    <div v-if="!table" class="p-4 text-center">
      <Spinner />
    </div>

    <!-- Desktop -->
    <CollaboratorTableItem
      v-else
      :table="table"
      :columns="columns"
      :is-mobile="false"
    />

    <!-- Mobile -->
    <CollaboratorTableItem
      v-if="table"
      :table="table"
      :columns="columns"
      :is-mobile="true"
      class="md:hidden"
    />
  </section>
</template>

<script setup lang="ts">
import type { ColumnDef, Table } from '@tanstack/vue-table';
import Spinner from '../ui/spinner/Spinner.vue';
import CollaboratorTableItem from './table/CollaboratorTableItem.vue';
import type { Collaborator } from '@/interfaces/collaborator';
import type { CollaboratorStatus } from '@/enums/status.enums';

defineProps<{
  table: Table<Collaborator>;
  columns: ColumnDef<Collaborator, string | CollaboratorStatus>[];
}>();
</script>
