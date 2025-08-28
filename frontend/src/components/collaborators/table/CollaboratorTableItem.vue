<template>
  <div :class="isMobile ? 'md:hidden' : 'hidden md:block'">
    <Table class="bg-white">
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="relative"
          >
            <div class="flex items-center justify-between">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <SortButtonItem
                v-if="header.column.getCanSort()"
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
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center"
              role="status"
            >
              Nenhum resultado encontrado.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import Table from '@/components/ui/table/Table.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import {
  FlexRender,
  type ColumnDef,
  type Table as TanstackTable,
} from '@tanstack/vue-table';
import SortButtonItem from './SortButtonItem.vue';
import type { Collaborator } from '@/interfaces/collaborator';
import type { CollaboratorStatus } from '@/enums/status.enums';

defineProps<{
  table: TanstackTable<Collaborator>;
  columns: ColumnDef<Collaborator, string | CollaboratorStatus>[];
  isMobile: boolean;
}>();
</script>
