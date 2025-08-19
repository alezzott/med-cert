<script setup lang="ts">
import Input from '@/components/ui/input/Input.vue';
import {
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormItem,
  FormDescription,
} from '@/components/ui/form';

defineProps<{
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  description?: string;
  maxlength?: number;
  inputMode?: string;
  maskFn?: (val: string) => string;
}>();
</script>

<template>
  <FormField v-slot="{ componentField, value, setValue }" :name="name">
    <FormItem>
      <FormLabel>{{ label }}</FormLabel>
      <FormControl>
        <template v-if="maskFn">
          <Input
            :type="type || 'text'"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :inputMode="inputMode"
            :model-value="maskFn(value || '')"
            @update:modelValue="
              (val: string | number) =>
                setValue(maskFn ? maskFn(String(val)) : String(val))
            "
          />
        </template>
        <template v-else>
          <Input
            :type="type || 'text'"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :inputMode="inputMode"
            v-bind="componentField"
          />
        </template>
      </FormControl>
      <FormDescription v-if="description">{{ description }}</FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
