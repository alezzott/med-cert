<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import FormDescription from '@/components/ui/form/FormDescription.vue';
import { CalendarIcon } from 'lucide-vue-next';
import {
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormItem,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-vue-next';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import { useCreateCertificate } from '@/composables/useCreateCertificate';
import { useCidSearch } from '@/composables/useSearchCid';
import { applyCpfMask, removeCpfMask } from '@/utils/cpf-mask.utils';
import { useMedicalCertificates } from '@/composables/useFetchCertificates';
import SelectCid from './dialog/SelectCid.vue';
import SearchCollaboratorCpf from './dialog/SearchCollaboratorCpf.vue';

const props = defineProps<{
  open: boolean;
  collaborator?: any;
}>();
const emit = defineEmits(['update:open', 'saved']);

const dialogOpen = ref(props.open);

const {
  searchValue: cpfSearch,
  loading: cpfLoading,
  error: cpfError,
  collaborator: cpfCollaborator,
  searchCollaborator,
} = useCollaboratorSearch();

const {
  createCertificate,
  isLoading: isCreating,
  clearError,
  canSubmit,
} = useCreateCertificate();

const { cidOptions, cidLoading, searchCid, clearCidSearch } = useCidSearch();
const { fetchCertificates } = useMedicalCertificates();

const schema = toTypedSchema(
  z.object({
    collaboratorId: z.string().min(1, 'Colaborador obrigatório'),
    issueDate: z.string().min(1, 'Data obrigatória'),
    leaveDays: z.coerce
      .number()
      .min(1, 'Mínimo 1 dia')
      .max(365, 'Máximo 365 dias'),
    cidCode: z.string().min(1, 'Selecione um CID'),
    observations: z.string().optional(),
  }),
);

watch(
  () => props.open,
  (val) => (dialogOpen.value = val),
);

function getCurrentDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localTime = new Date(now.getTime() - offset);
  return localTime.toISOString().slice(0, 16);
}

const {
  handleSubmit,
  setFieldValue,
  values,
  errors,
  resetForm,
  setFieldError,
} = useForm({
  validationSchema: schema,
  initialValues: {
    collaboratorId: '',
    issueDate: getCurrentDateTime(),
    leaveDays: 1,
    cidCode: '',
    observations: '',
  },
});

watch(cpfCollaborator, (val) => {
  if (val && val.length > 0) {
    setFieldValue('collaboratorId', val[0].id);
  } else {
    setFieldValue('collaboratorId', '');
    if (cpfSearch.value && (!val || val.length === 0)) {
      setFieldError('collaboratorId', 'Colaborador não encontrado');
    }
  }
});

const cidSearchTerm = ref('');
const selectedCid = ref<any>(null);
const cidSearchTimeout = ref<number | undefined>(undefined);
const cpfDisplay = ref('');

function handleCidInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  cidSearchTerm.value = value;

  if (selectedCid.value && !value.includes(selectedCid.value.code)) {
    selectedCid.value = null;
    setFieldValue('cidCode', '');
  }

  if (!value || value.length < 2) {
    clearCidSearch();
    return;
  }

  if (cidSearchTimeout.value) {
    clearTimeout(cidSearchTimeout.value);
  }

  cidSearchTimeout.value = window.setTimeout(() => {
    searchCid(value);
  }, 800);
}

function handleCpfInput() {
  const cleanCpf = removeCpfMask(cpfDisplay.value);
  cpfSearch.value = cleanCpf;
  if (cleanCpf.length >= 3) {
    searchCollaborator(cleanCpf);
  }
}

watch(cpfSearch, (val) => {
  if (!val) {
    cpfDisplay.value = '';
  }
});

const onSubmit = handleSubmit(async (formValues: any) => {
  clearError();

  if (!cpfCollaborator.value) {
    setFieldError(
      'collaboratorId',
      'Busque e selecione um colaborador válido pelo CPF',
    );
    return;
  }

  if (!selectedCid.value) {
    setFieldError('cidCode', 'Selecione um CID da lista');
    return;
  }

  const payload = {
    collaboratorId: formValues.collaboratorId,
    issueDate: formValues.issueDate,
    leaveDays: formValues.leaveDays,
    cidCode: formValues.cidCode,
    observations: formValues.observations,
  };

  await createCertificate(payload, {
    onSuccess: async () => {
      await fetchCertificates();
      resetForm();
      cpfSearch.value = '';
      cidSearchTerm.value = '';
      selectedCid.value = null;
      clearCidSearch();
      dialogOpen.value = false;
      emit('saved');
    },
    onError: (error) => {
      if (error.response?.data?.field) {
        setFieldError(error.response.data.field, error.response.data.message);
      }
    },
  });
});

function selectCid(option: any) {
  setFieldValue('cidCode', option.code);
  selectedCid.value = option;
  cidSearchTerm.value = `${option.code} - ${option.title}`;
  clearCidSearch();

  if (errors.value.cidCode) {
    setFieldError('cidCode', undefined);
  }

  if (cidSearchTimeout.value) {
    clearTimeout(cidSearchTimeout.value);
  }
}

watch(dialogOpen, (val) => {
  if (!val) {
    resetForm();
    cpfSearch.value = '';
    cidSearchTerm.value = '';
    selectedCid.value = null;
    clearCidSearch();

    if (cidSearchTimeout.value) {
      clearTimeout(cidSearchTimeout.value);
      cidSearchTimeout.value = undefined;
    }
  }
  emit('update:open', val);
});

onUnmounted(() => {
  if (cidSearchTimeout.value) {
    clearTimeout(cidSearchTimeout.value);
  }
});

function onCpfInput(e: Event) {
  const rawValue = (e.target as HTMLInputElement).value;
  const maskedValue = applyCpfMask(rawValue);
  cpfDisplay.value = maskedValue;
  cpfSearch.value = removeCpfMask(maskedValue);
}

function clearCpfInput() {
  cpfDisplay.value = '';
  cpfSearch.value = '';
  cpfCollaborator.value = [];
  setFieldValue('collaboratorId', '');
  setFieldError('collaboratorId', undefined);
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent
      class="w-full max-w-[95vw] sm:max-w-[800px] mx-auto my-4 p-4 rounded-lg bg-white shadow-lg max-h-[90vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>Adicionar novo atestado</DialogTitle>
      </DialogHeader>

      <SearchCollaboratorCpf
        :value="cpfDisplay"
        :error="cpfError || errors.collaboratorId"
        :collaborator="cpfCollaborator"
        :loading="cpfLoading"
        @update:value="cpfDisplay = $event"
        @search="handleCpfInput"
        @clear="clearCpfInput"
        @cpf="onCpfInput"
      />

      <form @submit.prevent="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="collaboratorId">
          <input type="hidden" v-bind="componentField" />
        </FormField>

        <section class="flex flex-col md:flex-row gap-2 items-center">
          <div class="w-full">
            <FormField v-slot="{ componentField }" name="issueDate">
              <FormItem>
                <FormLabel>Data de emissão *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    v-bind="componentField"
                    :class="{ 'border-red-500': errors.issueDate }"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormControl>
                <FormDescription>
                  Data e hora da emissão do atestado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <div class="w-full">
            <FormField v-slot="{ componentField }" name="leaveDays">
              <FormItem>
                <FormLabel>Dias de afastamento *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    v-bind="componentField"
                    class="w-full"
                    :class="{ 'border-red-500': errors.leaveDays }"
                  />
                </FormControl>
                <FormDescription>
                  Quantidade de dias de afastamento (1 a 365).
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </section>

        <FormField name="cidCode">
          <FormItem>
            <FormLabel>CID *</FormLabel>
            <FormControl>
              <SelectCid
                v-model="cidSearchTerm"
                :error="errors.cidCode"
                :options="cidOptions"
                :loading="cidLoading"
                :selected="selectedCid"
                @input="handleCidInput"
                @select="selectCid"
              />
            </FormControl>
            <FormDescription>
              Código CID. Digite pelo menos 2 caracteres para buscar.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="observations">
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <textarea
                v-bind="componentField"
                class="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring focus:ring-gray-300"
                :class="{ 'border-red-500': errors.observations }"
                rows="3"
                placeholder="Observações adicionais sobre o atestado..."
              />
            </FormControl>
            <FormDescription>
              Observações adicionais do atestado (opcional).
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter class="gap-2">
          <Button
            type="button"
            variant="outline"
            @click="dialogOpen = false"
            class="cursor-pointer"
          >
            cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            class="cursor-pointer"
            :disabled="!canSubmit(values) || isCreating"
          >
            {{ isCreating ? 'Salvando' : 'Salvar' }}
            <Loader2
              v-if="isCreating"
              class="w-4 h-4 m-auto flex animate-spin"
            />
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
