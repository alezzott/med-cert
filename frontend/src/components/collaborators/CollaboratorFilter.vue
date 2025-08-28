<template>
  <form
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4"
    @submit.prevent="handleSearchInput"
    aria-label="Filtros de colaboradores"
  >
    <div class="flex items-center gap-2">
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

    <div class="flex items-center gap-2">
      <label
        for="statusSelect"
        class="text-sm text-muted-foreground whitespace-nowrap"
      >
        Status:
      </label>
      <Select
        id="statusSelect"
        :model-value="statusValue"
        @update:model-value="
          (value) => handleChangeStatus(value as CollaboratorStatus)
        "
        aria-label="Filtrar por status"
      >
        <SelectTrigger class="w-24">
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex items-center gap-2 w-full max-md:max-w-md">
      <input
        id="searchInput"
        :value="searchValue"
        type="text"
        placeholder="Buscar por nome ou CPF do colaborador ..."
        class="border px-2 py-2 text-sm flex-1 rounded-md"
        aria-label="Buscar por nome ou CPF"
        @input="onInput"
      />
      <Button
        v-if="searchValue"
        class="cursor-pointer whitespace-nowrap"
        variant="outline"
        aria-label="Limpar busca"
        @click="
          emit('update:searchValue', '');
          emit('fetchCollaborators');
        "
        size="icon"
      >
        <X />
      </Button>
      <Button
        title="Buscar"
        type="submit"
        class="whitespace-nowrap"
        aria-label="Buscar colaboradores"
      >
        Buscar
      </Button>
    </div>
    <slot name="add-collaborator"></slot>
  </form>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { CollaboratorStatus, translateStatus } from '@/enums/status.enums';

const props = defineProps<{
  searchValue: string;
  statusValue: string;
  pageSize: number;
  pageSizeOptions: number[];
}>();

const emit = defineEmits<{
  (e: 'update:pageSize', value: number): void;
  (e: 'changePage', value: number): void;
  (e: 'fetchCollaborators'): void;
  (e: 'searchCollaborator', value: string): void;
  (e: 'update:searchValue', value: string): void;
  (e: 'update:statusValue', value: string): void;
}>();

function changePageSize(newSize: number) {
  emit('update:pageSize', newSize);
  emit('changePage', 1);
}

function handleSearchInput() {
  emit('changePage', 1);
  if (props.searchValue && props.searchValue.trim()) {
    emit('searchCollaborator', props.searchValue);
  } else {
    emit('fetchCollaborators');
  }
}

function handleChangeStatus(status: CollaboratorStatus | '') {
  emit('update:statusValue', status || 'ALL');
  emit('changePage', 1);
  emit('fetchCollaborators');
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    emit('update:searchValue', target.value);
  }
}

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  ...Object.values(CollaboratorStatus).map((status) => ({
    value: status,
    label: translateStatus(status),
  })),
];
</script>
