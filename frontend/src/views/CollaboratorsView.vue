<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { getCoreRowModel, useVueTable, FlexRender } from '@tanstack/vue-table';

import Table from '@/components/ui/table/Table.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import { CollaboratorStatus, translateStatus } from '@/enums/status.enums';
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

interface Collaborator {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  status: CollaboratorStatus;
  createdAt: string;
}

const collaborators = ref<Collaborator[]>([]);
const loading = ref(false);
const error = ref('');

// Estados de paginação
const currentPage = ref(1);
const pageSize = ref(10);
const hasNextPage = ref(false);

// Opções de tamanho de página
const pageSizeOptions = [5, 10, 20, 50];

const fetchCollaborators = async () => {
  loading.value = true;
  error.value = '';

  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pageSize.value.toString(),
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/collaborators?${params}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar colaboradores');
    }

    const data = await response.json();

    // Se o backend retorna apenas array de dados
    if (Array.isArray(data)) {
      collaborators.value = data;
      // Se retornar menos itens que o limit, não há próxima página
      hasNextPage.value = data.length === pageSize.value;
    } else {
      // Se o backend retorna um objeto com dados
      collaborators.value = data.data || data;
      hasNextPage.value = (data.data || data).length === pageSize.value;
    }
  } catch (e: any) {
    error.value = e.message || 'Erro ao carregar dados';
    collaborators.value = [];
    hasNextPage.value = false;
  } finally {
    loading.value = false;
  }
};

// Watchers para refazer a busca quando mudar página ou tamanho
watch([currentPage, pageSize], () => {
  fetchCollaborators();
});

// Funções de navegação
const goToPage = (page: number) => {
  if (page >= 1) {
    currentPage.value = page;
  }
};

const goToFirstPage = () => goToPage(1);
const goToNextPage = () => goToPage(currentPage.value + 1);
const goToPrevPage = () => goToPage(currentPage.value - 1);
const goToLastPage = async () => {
  // Avança até não ter mais dados
  while (hasNextPage.value) {
    currentPage.value++;
    await fetchCollaborators();
  }
};

const changePageSize = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1; // Reset para primeira página
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

// Definir colunas da tabela
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
];

const table = useVueTable({
  data: collaborators,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

onMounted(() => {
  fetchCollaborators();
});
</script>

<template>
  <div class="p-8">
    <section class="flex justify-between mb-8">
      <h1 class="text-2xl font-bold">Colaboradores</h1>
      <AddCollaboratorDialog @saved="fetchCollaborators" />
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-32">
      <div class="text-lg">Carregando...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Controles de paginação superiores -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-muted-foreground">Itens por página:</span>
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
      </div>

      <!-- Tabela -->
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
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
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
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

      <!-- Paginação simplificada -->
      <div class="flex items-center justify-center space-x-2 py-4">
        <!-- Primeira página -->
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToFirstPage"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>

        <!-- Página anterior -->
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPrevPage"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <!-- Indicador de página atual -->
        <div class="flex items-center space-x-2">
          <span class="text-sm">Página</span>
          <div
            class="border rounded px-3 py-1 min-w-[3rem] text-center text-sm"
          >
            {{ currentPage }}
          </div>
        </div>

        <!-- Próxima página -->
        <Button
          variant="outline"
          size="sm"
          :disabled="!hasNextPage"
          @click="goToNextPage"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>

        <!-- Adicione este botão após o botão de próxima página -->
        <Button
          variant="outline"
          size="sm"
          :disabled="!hasNextPage"
          @click="goToLastPage"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
