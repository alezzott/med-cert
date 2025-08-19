<template>
  <div class="flex items-center gap-2 w-full max-md:max-w-md">
    <input
      :value="inputValue"
      @input="onInput"
      type="text"
      placeholder="Buscar colaborador..."
      class="border px-2 py-2 text-sm flex-1 rounded-md bg-white"
    />
    <Button
      v-if="inputValue"
      class="cursor-pointer whitespace-nowrap"
      size="icon"
      variant="outline"
      @click="clear"
    >
      <X />
    </Button>
    <Button
      class="cursor-pointer whitespace-nowrap"
      @click="search"
      :disabled="!inputValue"
    >
      Buscar
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits(['update:modelValue', 'search']);

const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = val;
  },
);

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  inputValue.value = value;
  emit('update:modelValue', value);
}

function clear() {
  inputValue.value = '';
  emit('update:modelValue', '');
  emit('search');
}
function search() {
  emit('search');
}
</script>
