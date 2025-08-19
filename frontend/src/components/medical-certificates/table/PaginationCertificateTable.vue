<template>
  <div class="flex items-center justify-center space-x-1 sm:space-x-2 w-full">
    <Button
      variant="outline"
      size="sm"
      :disabled="currentPage === 1"
      @click="goToFirstPage"
      class="px-2"
    >
      <ChevronsLeft class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="currentPage === 1"
      @click="goToPrevPage"
      class="px-2"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div class="flex items-center space-x-2 mx-4">
      <span class="text-sm whitespace-nowrap">Página</span>
      <div class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm">
        {{ currentPage }}
      </div>
      <span class="text-sm whitespace-nowrap">de {{ totalPages }}</span>
    </div>
    <Button
      variant="outline"
      size="sm"
      :disabled="currentPage >= totalPages"
      @click="goToNextPage"
      class="px-2"
    >
      <ChevronRight class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="currentPage >= totalPages"
      @click="goToLastPage"
      class="px-2"
    >
      <ChevronsRight class="h-4 w-4" />
    </Button>
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

defineProps<{
  currentPage: number;
  totalPages: number;
  goToFirstPage: () => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  goToLastPage: () => void;
}>();
</script>
