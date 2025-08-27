<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FormDescription from '@/components/ui/form/FormDescription.vue';
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

import { useDateTime } from '@/composables/useDateTime';
import type { Collaborator } from '@/interfaces/collaborator';
import {
  certificateSchema,
  type CertificateFormValues,
} from '@/schema/CertificateSchema';
import SelectDateTime from './dialog/SelectDateTime.vue';

interface CidOption {
  code: string;
  title: string;
}

const props = defineProps<{
  open: boolean;
  collaborator?: Collaborator;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'saved'): void;
}>();

const dialogOpen = ref(props.open);

const {
  searchValue: cpfSearch,
  loading: cpfLoading,
  error: cpfError,
  collaborator: cpfCollaborator,
  searchCollaborator,
} = useCollaboratorSearch();
const {
  issueTime,
  formatDateToCalendar,
  parseCalendarDate,
  setIssueDate,
  getCurrentDate,
} = useDateTime();

const {
  createCertificate,
  isLoading: isCreating,
  clearError,
  canSubmit,
} = useCreateCertificate();

const { cidOptions, cidLoading, searchCid, clearCidSearch } = useCidSearch();
const { fetchCertificates } = useMedicalCertificates();

const schema = toTypedSchema(certificateSchema);

watch(
  () => props.open,
  (val) => (dialogOpen.value = val),
);

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
    issueDate: getCurrentDate(),
    leaveDays: 1,
    cidCode: '',
    cidDesc: '',
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
const selectedCid = ref<CidOption | null>(null);
const cidSearchTimeout = ref<number | undefined>(undefined);
const cpfDisplay = ref('');

function handleCidInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  cidSearchTerm.value = value;

  if (selectedCid.value && !value.includes(selectedCid.value.code)) {
    selectedCid.value = null;
    setFieldValue('cidCode', '');
    setFieldValue('cidDesc', '');
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

const onSubmit = handleSubmit(async (formValues: CertificateFormValues) => {
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
    cidDesc: selectedCid.value?.title,
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
    onError: (error: unknown) => {
      if ((error as any).response?.data?.field) {
        setFieldError(
          (error as any).response.data.field,
          (error as any).response.data.message,
        );
      }
    },
  });
});

function selectCid(option: CidOption) {
  setFieldValue('cidCode', option.code);
  setFieldValue('cidDesc', option.title);
  selectedCid.value = option;
  cidSearchTerm.value = `${option.code} - ${option.title}`;
  clearCidSearch();

  if (errors.value.cidCode) {
    setFieldError('cidCode', undefined);
    setFieldError('cidDesc', undefined);
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

        <SelectDateTime
          :issueDate="values.issueDate ?? ''"
          :issueTime="issueTime ?? ''"
          :leaveDays="values.leaveDays ?? 1"
          :errors="errors"
          :setFieldValue="setFieldValue"
          :setIssueDate="setIssueDate"
          :formatDateToCalendar="formatDateToCalendar"
          :parseCalendarDate="parseCalendarDate"
        />

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
