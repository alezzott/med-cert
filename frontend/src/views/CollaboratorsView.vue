<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { getCoreRowModel, useVueTable, FlexRender } from '@tanstack/vue-table';

import Table from '@/components/ui/table/Table.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import { CollaboratorStatus } from '@/enums/status.enums';
import { Button } from '@/components/ui/button';
import AddCollaboratorDialog from '@/components/collaborators/AddCollaboratorDialog.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next';
import { useUpdateCollaboratorStatus } from '@/composables/useUpdateCollaboratorStatus';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import { useCollaborators } from '@/composables/useFetchCollaborators';
import { toast } from 'vue-sonner';
import { useCollaboratorSearch } from '@/composables/useSearchCollaborator';
import { Input } from '@/components/ui/input';

const { updateStatus } = useUpdateCollaboratorStatus();
const { collaborators, loading, error, fetchCollaborators } =
  useCollaborators();
const {
  searchValue,
  loading: searchLoading,
  collaborator,
  searchCollaborator,
} = useCollaboratorSearch();

const currentPage = ref(1);
const pageSize = ref(10);
const hasNextPage = computed(() => {
  return currentPage.value * pageSize.value;
});
const pageSizeOptions = [5, 10, 20, 50];

watch([currentPage, pageSize], () => {
  fetchCollaborators({
    page: currentPage.value,
    limit: pageSize.value,
  });
});

const goToPage = (page: number) => {
  if (page >= 1) {
    currentPage.value = page;
  }
};

const goToFirstPage = () => goToPage(1);
const goToNextPage = () => goToPage(currentPage.value + 1);
const goToPrevPage = () => goToPage(currentPage.value - 1);
const goToLastPage = async () => {
  while (hasNextPage.value) {
    currentPage.value++;
    await fetchCollaborators();
  }
};

const changePageSize = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

function parseCustomDate(dateStr: string) {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' - ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
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
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }: any) => row.getValue('name'),
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
    cell: ({ row }: any) => row.getValue('email'),
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
    cell: ({ row }: any) => row.getValue('cpf'),
  },
  {
    accessorKey: 'birthDate',
    header: 'Data de Nascimento',
    cell: ({ row }: any) => {
      const value = row.getValue('birthDate');
      const date = parseCustomDate(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleDateString('pt-BR')
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Criação',
    cell: ({ row }: any) => {
      const value = row.getValue('createdAt');
      const date = parseCustomDate(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleString('pt-BR')
        : 'Data inválida';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as CollaboratorStatus;
      const collaborator = row.original;
      const handleToggleStatus = async () => {
        const newStatus =
          status === CollaboratorStatus.ACTIVE
            ? CollaboratorStatus.INACTIVE
            : CollaboratorStatus.ACTIVE;

        const statusText =
          newStatus === CollaboratorStatus.ACTIVE ? 'ativado' : 'desativado';

        try {
          const ok = await updateStatus(collaborator.id, newStatus);
          if (ok) {
            fetchCollaborators();
            toast.success(`Colaborador ${statusText} com sucesso!`);
          } else {
            toast.error('Erro ao atualizar status do colaborador');
          }
        } catch (error) {
          toast.error('Erro ao atualizar status do colaborador');
        }
      };

      return h(
        Button,
        {
          variant: status === 'ACTIVE' ? 'default' : 'outline',
          onClick: handleToggleStatus,
          class: 'cursor-pointer',
        },
        {
          default: () => (status === 'ACTIVE' ? 'Ativo' : 'Inativo'),
        },
      );
    },
  },
];

const table = useVueTable({
  data: collaborators,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

onMounted(() => {
  fetchCollaborators({
    page: currentPage.value,
    limit: pageSize.value,
  });
});

const handleSearchInput = () => {
  searchCollaborator(searchValue.value);
};
</script>

<template>
  <div class="p-4 md:p-8">
    <section
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8"
    >
      <h1 class="text-xl md:text-2xl font-bold">Colaboradores</h1>
      <AddCollaboratorDialog @saved="fetchCollaborators" />
    </section>

    <Spinner v-if="loading" />
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>

    <div v-else>
      <!-- Controles de paginação e busca -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4"
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

        <div class="flex items-center gap-2 w-full md:w-full max-md:max-w-md">
          <Input
            v-model="searchValue"
            type="text"
            placeholder="Buscar por nome ou CPF..."
            class="border px-2 py-1 text-sm flex-1 rounded-md"
          />
          <Button
            v-if="searchValue"
            class="cursor-pointer whitespace-nowrap"
            size="sm"
            variant="outline"
            @click="
              () => {
                searchValue = '';
                handleSearchInput();
              }
            "
          >
            Limpar
          </Button>
          <Button
            @click="handleSearchInput"
            size="sm"
            class="whitespace-nowrap"
          >
            Buscar
          </Button>
        </div>
      </div>

      <div v-if="searchLoading">
        <Spinner />
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
              <template v-if="collaborator">
                <TableRow>
                  <TableCell v-for="col in columns" :key="col.accessorKey">
                    <FlexRender
                      :render="col.cell"
                      :props="{
                        row: {
                          getValue: (key: string) =>
                            Array.isArray(collaborator)
                              ? collaborator[0][key]
                              : collaborator[key],
                          original: Array.isArray(collaborator)
                            ? collaborator[0]
                            : collaborator,
                        },
                      }"
                    />
                  </TableCell>
                </TableRow>
              </template>
              <template v-else-if="table.getRowModel().rows?.length">
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
          <template v-if="collaborator">
            <div class="p-4 border-b bg-white">
              <div class="space-y-2">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-lg">
                      {{
                        Array.isArray(collaborator)
                          ? collaborator[0].name
                          : collaborator.name
                      }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{
                        Array.isArray(collaborator)
                          ? collaborator[0].email
                          : collaborator.email
                      }}
                    </p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <Button
                      :variant="
                        (Array.isArray(collaborator)
                          ? collaborator[0].status
                          : collaborator.status) === 'ACTIVE'
                          ? 'default'
                          : 'outline'
                      "
                      size="sm"
                      class="cursor-pointer"
                    >
                      {{
                        (Array.isArray(collaborator)
                          ? collaborator[0].status
                          : collaborator.status) === 'ACTIVE'
                          ? 'Ativo'
                          : 'Inativo'
                      }}
                    </Button>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-1 text-sm">
                  <div>
                    <strong>CPF:</strong>
                    {{
                      Array.isArray(collaborator)
                        ? collaborator[0].cpf
                        : collaborator.cpf
                    }}
                  </div>
                  <div>
                    <strong>Nascimento:</strong>
                    {{
                      Array.isArray(collaborator)
                        ? collaborator[0].birthDate
                        : collaborator.birthDate
                    }}
                  </div>
                  <div>
                    <strong>Criado em:</strong>
                    {{
                      Array.isArray(collaborator)
                        ? collaborator[0].createdAt
                        : collaborator.createdAt
                    }}
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <div
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="p-4 border-b bg-white"
            >
              <div class="space-y-2">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-lg">
                      {{ row.getValue('name') }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ row.getValue('email') }}
                    </p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <FlexRender :render="columns[5].cell" :props="{ row }" />
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-1 text-sm">
                  <div><strong>CPF:</strong> {{ row.getValue('cpf') }}</div>
                  <div>
                    <strong>Nascimento:</strong>
                    <FlexRender :render="columns[3].cell" :props="{ row }" />
                  </div>
                  <div>
                    <strong>Criado em:</strong>
                    <FlexRender :render="columns[4].cell" :props="{ row }" />
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

      <div
        class="flex flex-col sm:flex-row items-center justify-center gap-4 py-4"
      >
        <div class="flex items-center space-x-1 sm:space-x-2">
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
          </div>

          <Button
            variant="outline"
            size="sm"
            :disabled="!hasNextPage"
            @click="goToNextPage"
            class="px-2"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!hasNextPage"
            @click="goToLastPage"
            class="px-2"
          >
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
