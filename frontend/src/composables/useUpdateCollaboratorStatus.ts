import { ref } from 'vue';
import axios from 'axios';

export function useUpdateCollaboratorStatus() {
  const error = ref('');

  async function updateStatus(id: string, status: string) {
    error.value = '';
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/collaborators/status`,
        { id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return true;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erro ao atualizar status';
      return false;
    }
  }

  return { updateStatus, error };
}
