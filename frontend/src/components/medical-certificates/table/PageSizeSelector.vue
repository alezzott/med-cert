<template>
  <section>
    <div class="flex items-center space-x-2">
      <span class="text-sm text-muted-foreground whitespace-nowrap"
        >Itens por página:</span
      >
      <Select :model-value="modelValue" @update:model-value="onChange">
        <SelectTrigger class="w-20 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="size in options"
            :key="size"
            :value="size.toString()"
          >
            {{ size }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AcceptableValue } from 'reka-ui';

defineProps<{
  modelValue: string | number;
  options: number[];
  onChange: (value: AcceptableValue) => void;
}>();
</script>
