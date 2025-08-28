import { defineStore } from 'pinia';
import type { Collaborator } from '@/interfaces/collaborator';
import type { CollaboratorStatus } from '@/enums/status.enums';
import { toast } from 'vue-sonner';
import { useFetchCollaborators } from '@/composables/useFetchCollaborators';

function getCacheKey(filters: { page: number; limit: number; status: string }) {
  return `${filters.page}-${filters.limit}-${filters.status}`;
}

function getParams(filters: {
  page: number;
  limit: number;
  status: CollaboratorStatus | 'ALL';
}) {
  return {
    ...filters,
    status: filters.status === 'ALL' ? undefined : filters.status,
  };
}

export const useCollaboratorsStore = defineStore('collaborators', {
  state: () => ({
    collaborators: [] as Collaborator[],
    loading: false,
    error: '',
    total: 0,
    filters: {
      page: 1,
      limit: 10,
      status: 'ALL' as CollaboratorStatus | 'ALL',
    },
    cache: {} as Record<string, Collaborator[]>,
  }),
  actions: {
    invalidateCache() {
      this.cache = {};
    },
    async fetchCollaborators(params?: {
      page?: number;
      limit?: number;
      status?: CollaboratorStatus;
    }) {
      this.loading = true;
      this.error = '';
      const filters = { ...this.filters, ...params };

      const cacheKey = getCacheKey({
        page: filters.page,
        limit: filters.limit,
        status: String(filters.status),
      });

      if (this.cache[cacheKey]) {
        this.collaborators = this.cache[cacheKey];
        this.loading = false;
        return;
      }
      try {
        const apiParams = getParams(filters);
        const { data: collaborators, total } =
          await useFetchCollaborators(apiParams);
        this.collaborators = collaborators;
        this.total = total;
        this.cache[cacheKey] = collaborators;
      } catch (e: any) {
        this.error = 'Erro ao buscar colaboradores';
        toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },
    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },
    setPage(page: number) {
      this.filters.page = page;
    },
    setLimit(limit: number) {
      this.filters.limit = limit;
    },
    setStatus(status: CollaboratorStatus | 'ALL') {
      this.filters.status = status;
    },
  },
});
