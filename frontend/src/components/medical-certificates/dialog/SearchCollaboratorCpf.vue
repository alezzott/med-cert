<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { X, Search, Loader2 } from 'lucide-vue-next';

defineProps<{
  value: string;
  error?: string;
  collaborator?: any[];
  loading?: boolean;
}>();

const emit = defineEmits(['cpf', 'update:value', 'search', 'clear']);

function cpf(e: Event) {
  emit('cpf', e);
}

function onSearch() {
  emit('search');
}

function onClear() {
  emit('clear');
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium mb-1">
      Buscar colaborador por CPF *
    </label>
    <section class="flex flex-row gap-2">
      <input
        :value="value"
        @input="cpf"
        placeholder="Digite o CPF (ex: 123.456.789-01)"
        :class="{ 'border-red-500': error }"
        maxlength="14"
        class="w-full pl-3 pr-10 rounded-lg border"
        type="text"
        inputMode="numeric"
      />
      <Button
        size="icon"
        variant="outline"
        type="button"
        @click="onClear"
        v-if="value"
      >
        <X />
      </Button>
      <Button
        @click="onSearch"
        :disabled="value.replace(/\D/g, '').length < 11"
      >
        <template v-if="loading">
          Aguarde
          <Loader2 class="w-4 h-4 m-auto flex animate-spin" />
        </template>
        <template v-else>
          <Search />
        </template>
      </Button>
    </section>

    <ul
      v-if="error"
      class="text-xs text-red-500 mt-2 bg-red-50 p-2 border rounded-lg border-red-200 list-disc pl-5"
    >
      <li>{{ error }}</li>
    </ul>

    <div
      v-if="collaborator && collaborator.length"
      class="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg"
    >
      <h1 class="text-sm font-medium text-green-700">
        {{ collaborator[0].name }}
      </h1>
      <h1 class="text-xs font-medium text-green-700">
        CPF: {{ collaborator[0].cpf }}
      </h1>
    </div>
  </div>
</template>
