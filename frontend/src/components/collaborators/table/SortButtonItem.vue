<template>
  <Button
    variant="ghost"
    size="sm"
    class="p-1 h-auto hover:bg-gray-100"
    @click="column.getToggleSortingHandler()?.($event)"
    :aria-label="getSortAriaLabel(column)"
  >
    <ArrowUp
      v-if="!column.getIsSorted() || column.getIsSorted() === 'desc'"
      class="h-4 w-4"
      :color="getSortIconColor(column, 'asc')"
    />
    <ArrowDown
      v-else
      class="h-4 w-4"
      :color="getSortIconColor(column, 'desc')"
    />
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { Certificate } from '@/interfaces/certificates';
import type { Collaborator } from '@/interfaces/collaborator';
import type { Column } from '@tanstack/vue-table';
import { ArrowDown, ArrowUp } from 'lucide-vue-next';

type SortButtonItemProps<T> = {
  column: Column<T, unknown>;
};

defineProps<SortButtonItemProps<any>>();

function getSortAriaLabel(column: Column<Collaborator | Certificate, unknown>) {
  const columnName = column.columnDef.header;
  const sortState = column.getIsSorted();

  if (!sortState) {
    return `Ordenar por ${columnName}`;
  }
  return sortState === 'asc'
    ? `Ordenar ${columnName} decrescente`
    : `Ordenar ${columnName} crescente`;
}

function getSortIconColor(
  column: Column<Collaborator | Certificate, unknown>,
  direction: 'asc' | 'desc',
): string {
  const sortState = column.getIsSorted();
  return sortState === direction ? '#009A93' : '#9CA3AF';
}
</script>
