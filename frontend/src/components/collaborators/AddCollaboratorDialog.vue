<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Input from '@/components/ui/input/Input.vue';
import {
  FormField,
  FormLabel,
  FormMessage,
  Form,
  FormControl,
  FormItem,
} from '@/components/ui/form';
import FormDescription from '../ui/form/FormDescription.vue';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-vue-next';
import {
  CalendarDate,
  parseDate,
  today,
  getLocalTimeZone,
} from '@internationalized/date';

const openDialog = ref(false);
const saving = ref(false);
const error = ref('');

const schema = toTypedSchema(
  z.object({
    name: z.string().nonempty('Nome obrigatório').min(3, 'Nome obrigatório'),
    email: z.string().nonempty('E-mail obrigatório').email('E-mail inválido'),
    cpf: z.string().nonempty('CPF obrigatório').min(11, 'CPF inválido'),
    birthDate: z
      .string()
      .nonempty('Data obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  }),
);

const { resetForm, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
  },
  validateOnMount: true,
});

const emit = defineEmits<{
  saved: [];
}>();

watch(openDialog, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

const onSubmit = async (formValues: any) => {
  saving.value = true;
  try {
    const payload = {
      ...formValues,
      birthDate: formValues.birthDate,
      role: 'COLLABORATOR',
    };

    console.log(payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/collaborators`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error('Erro ao salvar colaborador');
    }

    resetForm();
    setValues({
      name: '',
      email: '',
      cpf: '',
      birthDate: '',
    });
    openDialog.value = false;
    emit('saved');
  } catch (e: any) {
    error.value = e.message || 'Erro ao salvar colaborador';
    return false;
  } finally {
    saving.value = false;
  }
};

const stringToCalendarDate = (dateString: string) => {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return undefined;
  }
  try {
    return parseDate(dateString);
  } catch {
    return undefined;
  }
};

const calendarDateToString = (date: any) => {
  if (!date || typeof date.toString !== 'function') {
    return '';
  }
  return date.toString();
};

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return 'Selecione a data';
  try {
    const date = parseDate(dateString);
    return new Date(date.year, date.month - 1, date.day).toLocaleDateString(
      'pt-BR',
    );
  } catch {
    return 'Selecione a data';
  }
};
</script>

<template>
  <Form v-slot="{ handleSubmit }" as="" keep-values :validation-schema="schema">
    <Dialog v-model:open="openDialog">
      <DialogTrigger as-child>
        <Button>Adicionar novo colaborador</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Adicionar colaborador</DialogTitle>
        </DialogHeader>
        <form id="collaboratorForm" @submit.prevent="handleSubmit(onSubmit)">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Nome"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormDescription>
                  Informe o nome completo do colaborador.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="E-mail"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormDescription>
                  E-mail institucional do colaborador.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="cpf">
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="CPF"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormDescription> CPF válido do colaborador. </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
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
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        <span>{{ formatDateForDisplay(value) }}</span>
                      </Button>
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
                <FormDescription>
                  Data de nascimento do colaborador.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              form="collaboratorForm"
              :disabled="saving"
              class="w-full mt-4"
            >
              <span v-if="saving">Salvando...</span>
              <span v-else>Salvar</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </Form>
</template>
