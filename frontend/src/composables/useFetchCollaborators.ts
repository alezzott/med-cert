import { ref } from 'vue';
import axios from 'axios';
import type { Collaborator } from '@/interfaces/collaborator';

const API_URL = import.meta.env.VITE_API_URL;

export function useCollaborators() {
  const collaborators = ref<Collaborator[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchCollaborators() {
    loading.value = true;
    error.value = '';
    try {
      const res = await axios.get(`${API_URL}/collaborators`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      collaborators.value = res.data.data;
    } catch (e: any) {
      error.value = 'Erro ao buscar colaboradores';
      collaborators.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { collaborators, loading, error, fetchCollaborators };
}
