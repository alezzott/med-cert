<template>
  <nav class="flex flex-col sm:flex-row gap-4 py-4" aria-label="Paginação">
    <div class="flex items-center justify-center space-x-1 sm:space-x-2 w-full">
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1"
        @click="goToFirstPage"
        class="px-2"
        aria-label="Primeira página"
        title="Primeira página"
      >
        <ChevronsLeft class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1"
        @click="goToPrevPage"
        class="px-2"
        aria-label="Página anterior"
        title="Página anterior"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <div class="flex items-center space-x-2 mx-4">
        <span class="text-sm whitespace-nowrap">Página</span>
        <div
          class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm"
          aria-live="polite"
        >
          {{ currentPage }}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        @click="goToNextPage"
        :disabled="!hasNextPage"
        class="px-2"
        aria-label="Próxima página"
        title="Próxima página"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="goToLastPage"
        :disabled="!hasNextPage"
        class="px-2"
        aria-label="Última página"
        title="Última página"
      >
        <ChevronsRight class="h-4 w-4" />
      </Button>
    </div>
    <div class="flex justify-end">
      <h1 class="text-muted-foreground whitespace-nowrap">
        Total: {{ total }}
      </h1>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next';

const props = defineProps<{
  currentPage: number;
  hasNextPage: boolean;
  total: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  (e: 'changePage', page: number): void;
}>();

function goToPage(page: number) {
  if (page >= 1) emit('changePage', page);
}

function goToFirstPage() {
  goToPage(1);
}

function goToNextPage() {
  if (props.hasNextPage) goToPage(props.currentPage + 1);
}

function goToPrevPage() {
  if (props.currentPage > 1) goToPage(props.currentPage - 1);
}

function goToLastPage() {
  const lastPage = Math.max(1, Math.ceil(props.total / props.pageSize));
  goToPage(lastPage);
}
</script>
