<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { getCoreRowModel, useVueTable, FlexRender } from '@tanstack/vue-table';
import Table from '@/components/ui/table/Table.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableBody from '@/components/ui/table/TableBody.vue';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import AddCertificateDialog from '@/components/medical-certificates/AddCertificateDialog.vue';
import { useMedicalCertificates } from '@/composables/useFetchCertificates';
import Spinner from '@/components/ui/spinner/Spinner.vue';

const { certificates, loading, error, total, fetchCertificates } =
  useMedicalCertificates();

const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [5, 10, 20];
const searchInput = ref('');

watch([currentPage, pageSize], () => {
  fetchCertificates({
    page: currentPage.value,
    limit: pageSize.value,
    name: searchInput.value,
  });
});

const handleSearchInput = () => {
  currentPage.value = 1;
  fetchCertificates({
    page: currentPage.value,
    limit: pageSize.value,
    name: searchInput.value,
  });
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= Math.ceil(total.value / pageSize.value)) {
    currentPage.value = page;
  }
};
const goToFirstPage = () => goToPage(1);
const goToNextPage = () => goToPage(currentPage.value + 1);
const goToPrevPage = () => goToPage(currentPage.value - 1);
const goToLastPage = () => goToPage(Math.ceil(total.value / pageSize.value));
const changePageSize = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

function parseCustomDate(dateStr: string) {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' - ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart ? timePart.split(':') : [0, 0, 0];
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
}

const columns = [
  {
    accessorKey: 'collaboratorId',
    header: 'ID do Colaborador',
    cell: ({ row }: any) => row.getValue('collaboratorId'),
  },
  {
    accessorKey: 'name',
    header: 'Nome do Colaborador',
    cell: ({ row }: any) => row.getValue('name') || '-',
  },
  {
    accessorKey: 'cidCode',
    header: 'CID',
    cell: ({ row }: any) => row.getValue('cidCode'),
  },
  {
    accessorKey: 'issueDate',
    header: 'Data de Emissão',
    cell: ({ row }: any) => {
      const value = row.getValue('issueDate');
      const date = parseCustomDate(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleString('pt-BR')
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'leaveDays',
    header: 'Dias de Afastamento',
    cell: ({ row }: any) => row.getValue('leaveDays'),
  },
  {
    accessorKey: 'observations',
    header: 'Observações',
    cell: ({ row }: any) => row.getValue('observations') || '-',
  },
];

const table = useVueTable({
  data: certificates,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

onMounted(() => {
  fetchCertificates({
    page: currentPage.value,
    limit: pageSize.value,
    name: searchInput.value,
  });
});

const addCertificateDialogOpen = ref(false);
const selectedCollaborator = ref<string | null>(null);

function openAddCertificateDialog(collaborator: string | null) {
  selectedCollaborator.value = collaborator;
  addCertificateDialogOpen.value = true;
}
</script>

<template>
  <div class="p-4 md:p-8">
    <section
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8"
    ></section>

    <Spinner v-if="loading" />
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>

    <div v-else>
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 md:mb-8"
      >
        <div class="flex items-center space-x-2">
          <span class="text-sm text-muted-foreground whitespace-nowrap"
            >Itens por página:</span
          >
          <Select
            :model-value="pageSize.toString()"
            @update:model-value="(value) => changePageSize(Number(value))"
          >
            <SelectTrigger class="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="size in pageSizeOptions"
                :key="size"
                :value="size.toString()"
              >
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center gap-2 w-full max-md:max-w-md">
          <Input
            v-model="searchInput"
            type="text"
            placeholder="Buscar colaborador..."
            class="border px-2 py-1 text-sm flex-1 rounded-md"
          />
          <Button
            v-if="searchInput"
            class="cursor-pointer whitespace-nowrap"
            size="sm"
            variant="outline"
            @click="
              () => {
                searchInput = '';
                handleSearchInput();
              }
            "
          >
            Limpar
          </Button>
          <Button
            class="cursor-pointer whitespace-nowrap"
            size="sm"
            @click="handleSearchInput"
            :disabled="!searchInput"
          >
            Buscar
          </Button>
        </div>
        <Button
          size="sm"
          variant="default"
          @click="openAddCertificateDialog(null)"
          class="cursor-pointer whitespace-nowrap"
        >
          Adicionar Atestado
        </Button>
      </div>

      <div class="rounded-md border overflow-hidden">
        <div class="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
              >
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                >
                  <FlexRender
                    v-if="!header.isPlaceholder"
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
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
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
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
                      {{
                        row.getValue('name') || 'Colaborador não identificado'
                      }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      ID: {{ row.getValue('collaboratorId') }}
                    </p>
                  </div>
                  <div class="text-right">
                    <span
                      class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {{ row.getValue('leaveDays') }} dias
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-2 text-sm">
                  <div class="flex justify-between">
                    <strong>CID:</strong>
                    <span>{{ row.getValue('cidCode') }}</span>
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
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4 py-4">
        <div
          class="flex items-center justify-center space-x-1 sm:space-x-2 w-full"
        >
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="goToFirstPage"
            class="px-2"
          >
            <ChevronsLeft class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="goToPrevPage"
            class="px-2"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>

          <div class="flex items-center space-x-2 mx-4">
            <span class="text-sm whitespace-nowrap">Página</span>
            <div
              class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm"
            >
              {{ currentPage }}
            </div>
            <span class="text-sm whitespace-nowrap"
              >de {{ Math.ceil(total / pageSize) }}</span
            >
          </div>

          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= Math.ceil(total / pageSize)"
            @click="goToNextPage"
            class="px-2"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= Math.ceil(total / pageSize)"
            @click="goToLastPage"
            class="px-2"
          >
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
        <div class="flex justify-end">
          <h1 class="text-muted-foreground whitespace-nowrap">
            Total: {{ total }}
          </h1>
        </div>
      </div>
    </div>

    <AddCertificateDialog
      v-model:open="addCertificateDialogOpen"
      :collaborator="selectedCollaborator"
    />
  </div>
</template>
