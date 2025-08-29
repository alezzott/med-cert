<template>
  <form
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4"
    @submit.prevent="handleSearchInput"
    aria-label="Filtros de colaboradores"
  >
    <section class="flex items-center gap-2">
      <PageSizeSelector
        :model-value="pageSize.toString()"
        :options="pageSizeOptions"
        :onChange="handlePageSizeChange"
      />
    </section>

    <div class="flex items-center gap-2 w-full max-md:max-w-md">
      <input
        :value="searchValue"
        @input="onInput"
        type="text"
        placeholder="Buscar colaborador..."
        class="border px-2 py-2 text-sm flex-1 rounded-md bg-white"
        id="searchInput"
      />
      <Button
        v-if="searchValue"
        class="cursor-pointer whitespace-nowrap"
        aria-label="Limpar busca"
        size="icon"
        variant="outline"
        @click="clear"
      >
        <X />
      </Button>
      <Button
        class="cursor-pointer whitespace-nowrap"
        aria-label="Buscar colaborador"
      >
        Buscar
      </Button>
    </div>
    <slot name="add-certificates"></slot>
  </form>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import PageSizeSelector from './PageSizeSelector.vue';
import type { AcceptableValue } from 'reka-ui';

const props = defineProps<{
  searchValue: string;
  pageSize: number;
  pageSizeOptions: number[];
}>();

const emit = defineEmits<{
  (e: 'update:searchValue', value: string): void;
  (e: 'searchCollaborator', value: string): void;
  (e: 'fetchCollaborators'): void;
  (e: 'update:pageSize', value: number): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    emit('update:searchValue', target.value);
  }
}

function clear() {
  emit('update:searchValue', '');
  emit('fetchCollaborators');
}

function handleSearchInput() {
  if (props.searchValue && props.searchValue.trim()) {
    emit('searchCollaborator', props.searchValue);
  } else {
    emit('fetchCollaborators');
  }
}

function handlePageSizeChange(value: AcceptableValue) {
  const newSize = Number(value);
  if (!newSize) return;
  emit('update:pageSize', newSize);
}
</script>
