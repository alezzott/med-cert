import { ref } from 'vue';
import axios from 'axios';

export function useCreateCollaborator() {
  const error = ref('');

  async function createCollaborator(payload: any) {
    error.value = '';
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/collaborators`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erro ao salvar colaborador';
      throw e;
    }
  }

  return { createCollaborator, error };
}
