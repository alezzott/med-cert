<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
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
import Input from '@/components/ui/input/Input.vue';
import FormDescription from '@/components/ui/form/FormDescription.vue';
import {
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormItem,
} from '@/components/ui/form';
import { CalendarIcon, ClockIcon, Loader2 } from 'lucide-vue-next';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import { useCreateCertificate } from '@/composables/useCreateCertificate';
import { useCidSearch } from '@/composables/useSearchCid';
import { applyCpfMask, removeCpfMask } from '@/utils/cpf-mask.utils';
import { useMedicalCertificates } from '@/composables/useFetchCertificates';
import SelectCid from './dialog/SelectCid.vue';
import SearchCollaboratorCpf from './dialog/SearchCollaboratorCpf.vue';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  CalendarHeader,
  CalendarHeading,
  CalendarGrid,
  CalendarGridHead,
  CalendarGridBody,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarCell,
  CalendarCellTrigger,
} from '../ui/calendar';
import { CalendarRoot, useDateFormatter } from 'reka-ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useDateTime } from '@/composables/useDateTime';
import { createDecade, createYear, toDate } from 'reka-ui/date';
import dayjs from 'dayjs';
import type { Collaborator } from '@/interfaces/collaborator';
import {
  certificateSchema,
  type CertificateFormValues,
} from '@/schema/CertificateSchema';
import { applyTimeMask } from '@/utils/time-mask.utils';

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

const formatter = useDateFormatter('pt-BR');

const formattedIssueDate = computed(() => {
  if (!values.issueDate) return 'Selecione a data';
  const [datePart] = values.issueDate.split(' - ');
  if (!datePart) return 'Selecione a data';
  const date = dayjs(datePart, 'DD/MM/YYYY', true);
  return date.isValid() ? date.format('DD/MM/YYYY') : 'Selecione a data';
});
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
          <div
            class="flex-1 min-w-0 max-md:w-full max-md:my-2 md:w-32 max-w-full"
          >
            <FormField v-slot="{ value, setValue }" name="issueDate">
              <FormItem>
                <FormLabel>Data de emissão *</FormLabel>
                <Popover>
                  <PopoverTrigger as-child>
                    <FormControl>
                      <Button
                        variant="outline"
                        class="w-full justify-start text-left font-normal"
                      >
                        <span>
                          {{ formattedIssueDate }}
                        </span>
                        <CalendarIcon class="ms-auto h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <CalendarRoot
                      v-slot="{ date, grid, weekDays }"
                      :model-value="parseCalendarDate(value ?? '')"
                      @update:model-value="
                        (d) =>
                          setIssueDate(
                            formatDateToCalendar(d),
                            issueTime,
                            setFieldValue,
                          )
                      "
                      class="rounded-md border p-3"
                    >
                      <CalendarHeader>
                        <CalendarHeading
                          class="flex w-full items-center justify-between gap-2"
                        >
                          <Select
                            :default-value="date.month.toString()"
                            @update:model-value="
                              (v) => {
                                if (!v || !date) return;
                                if (Number(v) === date.month) return;
                                setValue(
                                  formatDateToCalendar(
                                    date.set({ month: Number(v) }),
                                  ),
                                );
                              }
                            "
                          >
                            <SelectTrigger
                              aria-label="Selecionar mês"
                              class="w-54"
                            >
                              <SelectValue placeholder="Selecionar mês" />
                            </SelectTrigger>
                            <SelectContent class="max-h-[400px]">
                              <SelectItem
                                v-for="month in createYear({ dateObj: date })"
                                :key="month.month"
                                :value="month.month.toString()"
                              >
                                {{
                                  formatter.custom(toDate(month), {
                                    month: 'long',
                                  })
                                }}
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            :default-value="date ? date.year.toString() : ''"
                            @update:model-value="
                              (v) => {
                                if (!v || !date) return;
                                if (Number(v) === date.year) return;
                                setValue(
                                  formatDateToCalendar(
                                    date.set({ year: Number(v) }),
                                  ),
                                );
                              }
                            "
                          >
                            <SelectTrigger
                              aria-label="Selecionar ano"
                              class="w-[30%]"
                            >
                              <SelectValue placeholder="Selecionar ano" />
                            </SelectTrigger>
                            <SelectContent class="max-h-[400px]">
                              <SelectItem
                                v-for="yearValue in createDecade({
                                  dateObj: date,
                                  startIndex: -10,
                                  endIndex: 10,
                                })"
                                :key="yearValue.year"
                                :value="yearValue.year.toString()"
                              >
                                {{ yearValue.year }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </CalendarHeading>
                      </CalendarHeader>

                      <div
                        class="flex flex-col space-y-4 pt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0"
                      >
                        <CalendarGrid
                          v-for="month in grid"
                          :key="month.value.toString()"
                        >
                          <CalendarGridHead>
                            <CalendarGridRow>
                              <CalendarHeadCell
                                v-for="day in weekDays"
                                :key="day"
                              >
                                {{ day }}
                              </CalendarHeadCell>
                            </CalendarGridRow>
                          </CalendarGridHead>
                          <CalendarGridBody class="grid">
                            <CalendarGridRow
                              v-for="(weekDates, index) in month.rows"
                              :key="`weekDate-${index}`"
                              class="mt-2 w-full"
                            >
                              <CalendarCell
                                v-for="weekDate in weekDates"
                                :key="weekDate.toString()"
                                :date="weekDate"
                              >
                                <CalendarCellTrigger
                                  :day="weekDate"
                                  :month="month.value"
                                />
                              </CalendarCell>
                            </CalendarGridRow>
                          </CalendarGridBody>
                        </CalendarGrid>
                      </div>
                    </CalendarRoot>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Data e hora da emissão do atestado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <div class="min-w-0 max-md:w-full max-md:my-2">
            <FormField v-slot="{ value }" name="issueTime">
              <FormItem>
                <FormLabel>Hora *</FormLabel>
                <section class="relative md:w-32 max-w-full">
                  <Input
                    id="issueTime"
                    type="text"
                    v-model="issueTime"
                    @input="issueTime = applyTimeMask($event.target.value)"
                    @change="
                      value &&
                      setIssueDate(
                        value.split(' - ')[0],
                        issueTime,
                        setFieldValue,
                      )
                    "
                    step="1"
                    placeholder="hh:mm:ss"
                    maxlength="8"
                  />
                  <ClockIcon
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  />
                </section>
                <FormDescription>
                  <span class="invisible max-lg:hidden">hora</span>
                </FormDescription>
              </FormItem>
            </FormField>
          </div>
          <div class="flex-1 min-w-0 max-md:w-full max-md:my-2">
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
