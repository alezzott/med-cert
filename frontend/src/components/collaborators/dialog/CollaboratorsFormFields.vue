<script setup lang="ts">
import { applyCpfMask } from '@/utils/cpf-mask.utils';
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  type DateValue,
} from '@internationalized/date';
import { CalendarIcon } from 'lucide-vue-next';
import {
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormItem,
  FormDescription,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import CollaboratorTextField from './CollaboratorTextField.vue';

defineProps<{
  formatDateForDisplay: (dateString: string) => string;
  stringToCalendarDate: (dateString: string) => DateValue | undefined;
  calendarDateToString: (date: DateValue | undefined) => string;
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
    <CollaboratorTextField
      name="name"
      label="Nome completo"
      placeholder="Nome"
      description="Informe o nome completo do colaborador."
    />
    <CollaboratorTextField
      name="email"
      label="E-mail"
      type="email"
      placeholder="E-mail"
      description="E-mail do colaborador."
    />
    <CollaboratorTextField
      name="cpf"
      label="CPF"
      placeholder="Digite o CPF"
      :maxlength="14"
      inputMode="numeric"
      :maskFn="applyCpfMask"
      description="CPF do colaborador."
    />
    <FormField v-slot="{ value, setValue }" name="birthDate">
      <FormItem class="flex flex-col">
        <FormLabel>Data de nascimento</FormLabel>
        <Popover>
          <PopoverTrigger as-child>
            <FormControl>
              <Button
                variant="outline"
                :class="[
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                ]"
              >
                <span>{{ formatDateForDisplay(value) }}</span>
                <CalendarIcon class="ms-auto h-4 w-4" />
              </Button>
              <input hidden />
            </FormControl>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="stringToCalendarDate(value)"
              @update:model-value="
                (date) => setValue(calendarDateToString(date))
              "
              mode="single"
              initial-focus
              :max-value="today(getLocalTimeZone())"
              :min-value="new CalendarDate(1900, 1, 1)"
            />
          </PopoverContent>
        </Popover>
        <FormDescription> Data de nascimento do colaborador. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
