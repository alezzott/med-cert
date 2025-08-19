<template>
  <form
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4"
    @submit.prevent="onSearch"
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
        @update:model-value="(value) => onChangePageSize(Number(value))"
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
          $emit('update:searchValue', '');
          onClearSearch();
        "
        size="icon"
      >
        <X />
      </Button>
      <Button
        title="limpar botão"
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

defineProps<{
  searchValue: string;
  pageSize: number;
  pageSizeOptions: number[];
  onSearch: () => void;
  onChangePageSize: (size: number) => void;
  onClearSearch: () => void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    emit('update:searchValue', target.value);
  }
}

const emit = defineEmits<{
  (e: 'update:searchValue', value: string): void;
}>();
</script>
