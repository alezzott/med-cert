import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { Collaborator } from '@/interfaces/collaborator';

export function useCollaboratorSearch() {
  const searchValue = ref('');
  const loading = ref(false);
  const error = ref('');
  const collaborator = ref<Collaborator[]>([]);
  let timeout: number | null = null;

  const searchCollaborator = async (value: string): Promise<void> => {
    error.value = '';
    collaborator.value = [];
    searchValue.value = value;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    if (!value?.trim()) {
      loading.value = false;
      return;
    }

    const cpfSanitized = value.replace(/\D/g, '');
    loading.value = true;

    try {
      const params =
        cpfSanitized.length === 11
          ? `cpf=${cpfSanitized}`
          : `name=${encodeURIComponent(value)}`;

      const token = localStorage.getItem('token');

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/collaborators/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (Array.isArray(data) && data.length > 0) {
        collaborator.value = data;
      } else {
        error.value = 'Colaborador não encontrado';
        toast.error(error.value);
      }
    } catch (err: unknown) {
      const errorMessage = 'Erro ao buscar pelo nome ou CPF';
      error.value = errorMessage;
      toast.error(errorMessage);
      console.error('Erro na busca de colaborador:', err);
    } finally {
      loading.value = false;
    }
  };

  const resetSearch = (): void => {
    searchValue.value = '';
    collaborator.value = [];
    error.value = '';
    loading.value = false;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return {
    searchValue,
    loading,
    error,
    collaborator,
    searchCollaborator,
    resetSearch,
  } as const;
}
