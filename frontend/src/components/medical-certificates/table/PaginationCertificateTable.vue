<template>
  <div class="flex items-center justify-center space-x-1 sm:space-x-2 w-full">
    <Button
      variant="outline"
      size="sm"
      :disabled="props.modelValue === 1"
      @click="goToFirstPage"
      class="px-2"
    >
      <ChevronsLeft class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="props.modelValue === 1"
      @click="goToPrevPage"
      class="px-2"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div class="flex items-center space-x-2 mx-4">
      <span class="text-sm whitespace-nowrap">Página</span>
      <div class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm">
        {{ props.modelValue }}
      </div>
      <span class="text-sm whitespace-nowrap">de {{ totalPages }}</span>
    </div>
    <Button
      variant="outline"
      size="sm"
      :disabled="props.modelValue >= totalPages"
      @click="goToNextPage"
      class="px-2"
    >
      <ChevronRight class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="props.modelValue >= totalPages"
      @click="goToLastPage"
      class="px-2"
    >
      <ChevronsRight class="h-4 w-4" />
    </Button>
  </div>
  <div class="flex justify-end">
    <h1 class="text-muted-foreground whitespace-nowrap">Total: {{ total }}</h1>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
  total: number;
  pageSize: number;
  modelValue: number;
}>();
const emit = defineEmits(['update:modelValue']);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize)),
);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.modelValue) {
    emit('update:modelValue', page);
  }
}

function goToFirstPage() {
  goToPage(1);
}

function goToPrevPage() {
  goToPage(props.modelValue - 1);
}

function goToNextPage() {
  goToPage(props.modelValue + 1);
}

function goToLastPage() {
  goToPage(totalPages.value);
}
</script>
