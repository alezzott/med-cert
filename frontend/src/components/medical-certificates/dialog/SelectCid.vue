<template>
  <div class="relative">
    <input
      class="w-full pl-3 pr-10 h-10 rounded-md border"
      :value="modelValue"
      placeholder="Digite para buscar CID (ex: resfriado, ansiedade)..."
      @input="onInput"
      :class="{ 'border-red-500': error }"
    />
    <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
      <div
        class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
      ></div>
    </div>

    <div
      v-if="options.length"
      class="absolute left-0 top-full mt-1 w-full max-h-60 overflow-y-auto border rounded-md bg-white shadow-lg z-50"
    >
      <div
        v-for="option in options"
        :key="option.code"
        @click="() => onSelect(option)"
        class="cursor-pointer hover:bg-gray-50 px-3 py-2 border-b last:border-b-0"
      >
        <div class="flex items-center justify-between w-full">
          <span class="text-sm">
            <strong class="text-primary">{{ option.code }}</strong>
            <span class="text-muted-foreground ml-2">{{ option.title }}</span>
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="
        modelValue &&
        modelValue.length >= 2 &&
        !loading &&
        options.length === 0 &&
        !selected
      "
      class="absolute overflow-x-scroll left-0 top-full mt-1 w-full rounded-md border bg-white p-3 text-center text-sm text-gray-500 shadow-lg z-50"
    >
      Nenhum CID encontrado para "{{ modelValue }}"
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  modelValue: string;
  error?: string;
  options: Array<any>;
  loading: boolean;
  selected: any;
}>();

const emit = defineEmits(['update:modelValue', 'select', 'search']);

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('search', value);
}

function onSelect(option: any) {
  emit('select', option);
}
</script>
