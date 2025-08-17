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
import {
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormItem,
} from '@/components/ui/form';
import { Check } from 'lucide-vue-next';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import { useCreateCertificate } from '@/composables/useCreateCertificate';
import { useCidSearch } from '@/composables/useSearchCid';
import { applyCpfMask, removeCpfMask } from '@/utils/cpf-mask.utils';
import { useMedicalCertificates } from '@/composables/useFetchCertificates';

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
  }, 400);
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

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">
          Buscar colaborador por CPF *
        </label>
        <section class="flex flex-row gap-3">
          <input
            :value="cpfDisplay"
            @input="onCpfInput"
            placeholder="Digite o CPF (ex: 123.456.789-01)"
            :class="{ 'border-red-500': errors.collaboratorId }"
            maxlength="14"
            class="w-full pl-3 pr-10 h-10 rounded-md border"
            type="text"
            inputMode="numeric"
          />
          <Button
            size="lg"
            variant="outline"
            type="button"
            @click="clearCpfInput"
            v-if="cpfDisplay"
          >
            Limpar
          </Button>
          <Button
            size="lg"
            @click="handleCpfInput"
            :disabled="removeCpfMask(cpfDisplay).length < 11"
            >Buscar</Button
          >
        </section>

        <div v-if="cpfLoading" class="text-xs text-blue-500 mt-1">
          Buscando colaborador...
        </div>
        <div v-if="cpfError" class="text-xs text-red-500 mt-1">
          {{ cpfError }}
        </div>
        <div v-if="errors.collaboratorId" class="text-xs text-red-500 mt-1">
          {{ errors.collaboratorId }}
        </div>

        <div
          v-if="cpfCollaborator.length"
          class="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg"
        >
          <h1 class="text-sm font-medium text-green-700">
            {{ cpfCollaborator[0].name }}
          </h1>
          <h1 class="text-xs text-green-700">
            CPF: {{ cpfCollaborator[0].cpf }}
          </h1>
        </div>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="collaboratorId">
          <input type="hidden" v-bind="componentField" />
        </FormField>

        <FormField v-slot="{ componentField }" name="issueDate">
          <FormItem>
            <FormLabel>Data de emissão *</FormLabel>
            <FormControl>
              <input
                type="datetime-local"
                v-bind="componentField"
                :class="{ 'border-red-500': errors.issueDate }"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </FormControl>
            <FormDescription>
              Data e hora da emissão do atestado.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="leaveDays">
          <FormItem>
            <FormLabel>Dias de afastamento *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                max="365"
                v-bind="componentField"
                :class="{ 'border-red-500': errors.leaveDays }"
              />
            </FormControl>
            <FormDescription>
              Quantidade de dias de afastamento (1 a 365).
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value }" name="cidCode">
          <FormItem>
            <FormLabel>CID *</FormLabel>
            <FormControl>
              <div class="relative">
                <input
                  class="w-full pl-3 pr-10 h-10 rounded-md border"
                  :value="cidSearchTerm"
                  placeholder="Digite para buscar CID (ex: F32)..."
                  @input="handleCidInput"
                  :class="{ 'border-red-500': errors.cidCode }"
                />
                <div
                  v-if="cidLoading"
                  class="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  ></div>
                </div>

                <div
                  v-if="cidOptions.length"
                  class="absolute left-0 top-full mt-1 w-full max-h-60 overflow-y-auto border rounded-md bg-white shadow-lg z-50"
                >
                  <div
                    v-for="option in cidOptions"
                    :key="option.code"
                    @click="() => selectCid(option)"
                    class="cursor-pointer hover:bg-gray-50 px-3 py-2 border-b last:border-b-0"
                  >
                    <div class="flex items-center justify-between w-full">
                      <span class="text-sm">
                        <strong class="text-primary">{{ option.code }}</strong>
                        <span class="text-muted-foreground ml-2">{{
                          option.title
                        }}</span>
                      </span>
                      <Check
                        v-if="value === option.code"
                        class="h-4 w-4 text-primary ml-2 flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    cidSearchTerm &&
                    cidSearchTerm.length >= 2 &&
                    !cidLoading &&
                    cidOptions.length === 0 &&
                    !selectedCid
                  "
                  class="absolute overflow-x-scroll left-0 top-full mt-1 w-full rounded-md border bg-white p-3 text-center text-sm text-gray-500 shadow-lg z-50"
                >
                  Nenhum CID encontrado para "{{ cidSearchTerm }}"
                </div>
              </div>
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
                class="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            class="cursor-pointer"
            :disabled="!canSubmit(values) || isCreating"
          >
            <div v-if="isCreating" class="flex items-center gap-2">
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
              Criando...
            </div>
            <span v-else>salvar</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
