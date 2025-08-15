import type { Collaborator } from '@/interfaces/collaborator';
import axios from 'axios';
import { ref } from 'vue';
import { toast } from 'vue-sonner';

const API_URL = import.meta.env.VITE_API_URL;

export function useCollaborators() {
  const collaborators = ref<Collaborator[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchCollaborators(params?: {
    page?: number;
    limit?: number;
  }) {
    loading.value = true;
    error.value = '';
    try {
      const query = [];
      if (params?.page) query.push(`page=${params.page}`);
      if (params?.limit) query.push(`limit=${params.limit}`);
      const queryString = query.length ? `?${query.join('&')}` : '';
      const res = await axios.get(`${API_URL}/collaborators${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      collaborators.value = res.data.data;
    } catch (e: any) {
      toast.error('Erro ao buscar colaboradores');
      collaborators.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { collaborators, loading, error, fetchCollaborators };
}
