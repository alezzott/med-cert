import type { Collaborator } from '@/interfaces/collaborator';
import axios from 'axios';
import { ref } from 'vue';
import { toast } from 'vue-sonner';

const API_URL = import.meta.env.VITE_API_URL;

export function useCollaborators() {
  const collaborators = ref<Collaborator[]>([]);
  const loading = ref(false);
  const error = ref('');
  const total = ref(0);

  async function fetchCollaborators(params?: {
    page?: number;
    limit?: number;
  }) {
    loading.value = true;
    error.value = '';
    try {
      const res = await axios.get(`${API_URL}/collaborators`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      collaborators.value = res.data.data;
      total.value = res.data.total || res.data.data?.length || 0;
    } catch (e: any) {
      toast.error('Erro ao buscar colaboradores');
      collaborators.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { collaborators, loading, error, total, fetchCollaborators };
}
