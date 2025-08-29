import { useFetchCertificates } from '@/composables/useFetchCertificates';
import type { Certificate } from '@/interfaces/certificates';
import { defineStore } from 'pinia';

export const useCertificatesStore = defineStore('certificates', {
  state: () => ({
    certificates: [] as Certificate[],
    loading: false,
    error: '',
    total: 0,
    filters: {
      page: 1,
      limit: 10,
      name: '',
      sort: '',
    },
    cache: {} as Record<string, { data: Certificate[]; total: number }>,
  }),
  actions: {
    setCertificates(data: Certificate[], total: number) {
      this.certificates = data;
      this.total = total;
    },
    setLoading(val: boolean) {
      this.loading = val;
    },
    setError(msg: string) {
      this.error = msg;
    },
    setFilters(newFilters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...newFilters };
    },
    async fetchCertificates(customFilters?: Partial<typeof this.filters>) {
      if (customFilters) this.setFilters(customFilters);

      const cacheKey = JSON.stringify(this.filters);
      if (this.cache[cacheKey]) {
        this.setCertificates(
          this.cache[cacheKey].data,
          this.cache[cacheKey].total,
        );
        return;
      }

      this.setLoading(true);
      this.setError('');
      try {
        const data = await useFetchCertificates(this.filters);
        this.setCertificates(data.data, data.total);
        this.cache[cacheKey] = { data: data.data, total: data.total };
      } catch (e: any) {
        this.setError(
          e?.response?.data?.message || e.message || 'Erro ao carregar dados',
        );
      } finally {
        this.setLoading(false);
      }
    },
  },
});
