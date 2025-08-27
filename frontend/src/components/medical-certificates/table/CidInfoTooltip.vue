<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-vue-next';
defineProps<{ cidCode: string; cidDesc?: string }>();
</script>

<template>
  <Tooltip>
    <section class="flex flex-row gap-3">
      <h1 class="cursor-auto">{{ cidCode }}</h1>
      <TooltipTrigger>
        <Info class="w-4 h-4 text-primary cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent>
        <h1 class="font-semibold">{{ cidDesc }}</h1>
      </TooltipContent>
    </section>
  </Tooltip>
</template>
