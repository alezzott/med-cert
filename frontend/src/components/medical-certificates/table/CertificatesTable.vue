<template>
  <div>
    <!-- Desktop -->
    <div class="hidden md:block">
      <Table class="bg-white">
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{
                width: header.getSize() ? `${header.getSize()}px` : undefined,
              }"
            >
              <div class="flex items-center justify-between">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <SortButtonItem
                  v-if="
                    header.column.getCanSort?.() &&
                    table.getRowModel().rows?.length
                  "
                  :column="header.column"
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <template v-if="cell.column.id === 'observations'">
                  <template v-if="row.getValue('observations')">
                    <article class="flex flex-row gap-4 items-center">
                      <h1>
                        {{
                          (row.getValue('observations') as string).slice(
                            0,
                            100,
                          )
                        }}...
                      </h1>
                      <Button
                        variant="link"
                        @click="openDialog(row.getValue('observations'))"
                      >
                        Ver mais
                      </Button>
                    </article>
                  </template>
                  <template v-else>
                    <span>{{ row.getValue('observations') || '-' }}</span>
                  </template>
                </template>
                <template v-else>
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </template>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Mobile -->
    <div class="md:hidden">
      <template v-if="table.getRowModel().rows?.length">
        <div
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="p-4 border-b bg-white"
        >
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-lg">
                  {{ row.getValue('name') || 'Colaborador não identificado' }}
                </h3>
              </div>
              <div class="text-right">
                <span
                  class="inline-block bg-[#c7fff6] text-[#0a6563] text-xs px-2 py-1 rounded-full"
                >
                  {{ row.getValue('leaveDays') }} dias
                </span>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-2 text-sm">
              <div class="flex justify-between">
                <strong>CID:</strong>
                <span
                  v-for="cid in row.getValue('cid') as CertificateCid[]"
                  :key="cid.cidCode"
                >
                  {{ cid.cidCode }}
                </span>
              </div>
              <div class="flex justify-between">
                <strong>Data de Emissão:</strong>
                <span>
                  <FlexRender :render="columns[3].cell" :props="{ row }" />
                </span>
              </div>
              <div
                v-if="row.getValue('observations')"
                class="border-t pt-2 mt-2"
              >
                <strong>Observações:</strong>
                <p class="text-gray-600 mt-1">
                  {{ row.getValue('observations') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="p-8 text-center text-gray-500">
          Nenhum resultado encontrado.
        </div>
      </template>
    </div>
    <ObservationDetailDialog
      v-model:open="dialogOpen"
      :text="dialogText"
      @close="closeDialog"
    />
  </div>
</template>

<script setup lang="ts">
import SortButtonItem from '@/components/collaborators/table/SortButtonItem.vue';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MedicalCertificate } from '@/composables/useFetchCertificates';

type CertificateCid = { cidCode: string; [key: string]: any };
import {
  FlexRender,
  type Table as TanTable,
  type ColumnDef,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';
import { ref } from 'vue';
import ObservationDetailDialog from '../dialog/ObservationDetailDialog.vue';

const dialogOpen = ref(false);
const dialogText = ref('');

function openDialog(text: string) {
  dialogText.value = text;
  dialogOpen.value = true;
}
function closeDialog() {
  dialogOpen.value = false;
}

defineProps<{
  table: TanTable<MedicalCertificate>;
  columns: ColumnDef<any, unknown>[];
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState | Updater<SortingState>) => void;
}>();
</script>
