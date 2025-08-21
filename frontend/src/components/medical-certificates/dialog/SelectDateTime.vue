<script setup lang="ts">
import { computed } from 'vue';
import { CalendarIcon, ClockIcon } from 'lucide-vue-next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
} from '@/components/ui/calendar';
import { CalendarRoot, useDateFormatter } from 'reka-ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Input from '@/components/ui/input/Input.vue';
import FormDescription from '@/components/ui/form/FormDescription.vue';
import {
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormItem,
} from '@/components/ui/form';
import { applyTimeMask } from '@/utils/time-mask.utils';
import { createDecade, createYear, toDate } from 'reka-ui/date';
import dayjs from 'dayjs';
import type { CertificateFormValues } from '@/schema/CertificateSchema';

const props = defineProps<{
  issueDate: string;
  issueTime: string;
  leaveDays: number | string;
  errors: Record<string, string>;
  setFieldValue: any;
  setIssueDate: (
    date: string,
    time: string,
    setFieldValue: <T extends keyof CertificateFormValues>(
      field: T,
      value: CertificateFormValues[T],
    ) => void,
  ) => void;
  formatDateToCalendar: (date: any) => string;
  parseCalendarDate: (date: string) => any;
}>();

const formatter = useDateFormatter('pt-BR');

const formattedIssueDate = computed(() => {
  if (!props.issueDate) return 'Selecione a data';
  const [datePart] = props.issueDate.split(' - ');
  if (!datePart) return 'Selecione a data';
  const date = dayjs(datePart, 'DD/MM/YYYY', true);
  return date.isValid() ? date.format('DD/MM/YYYY') : 'Selecione a data';
});
</script>

<template>
  <section class="flex flex-col md:flex-row gap-2 items-center">
    <div class="flex-1 min-w-0 max-md:w-full max-md:my-2 md:w-32 max-w-full">
      <FormField v-slot="{ value, setValue }" name="issueDate">
        <FormItem>
          <FormLabel>Data de emissão *</FormLabel>
          <Popover>
            <PopoverTrigger as-child>
              <FormControl>
                <button
                  type="button"
                  class="w-full justify-start text-left font-normal border rounded-md px-3 py-1 flex items-center"
                >
                  <span>
                    {{ formattedIssueDate }}
                  </span>
                  <CalendarIcon class="ms-auto h-4 w-4" />
                </button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <CalendarRoot
                v-slot="{ date, grid, weekDays }"
                :model-value="props.parseCalendarDate(value ?? '')"
                @update:model-value="
                  (d) =>
                    props.setIssueDate(
                      props.formatDateToCalendar(d),
                      props.issueTime,
                      props.setFieldValue,
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
                            props.formatDateToCalendar(
                              date.set({ month: Number(v) }),
                            ),
                          );
                        }
                      "
                    >
                      <SelectTrigger aria-label="Selecionar mês">
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
                            props.formatDateToCalendar(
                              date.set({ year: Number(v) }),
                            ),
                          );
                        }
                      "
                    >
                      <SelectTrigger aria-label="Selecionar ano">
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
                        <CalendarHeadCell v-for="day in weekDays" :key="day">
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
              :model-value="props.issueTime"
              @input="
                props.setFieldValue(
                  'issueTime',
                  applyTimeMask($event.target.value),
                )
              "
              @change="
                value &&
                props.setIssueDate(
                  value.split(' - ')[0],
                  props.issueTime,
                  props.setFieldValue,
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
              :class="{ 'border-red-500': props.errors.leaveDays }"
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
</template>
