import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';

export function useCollaboratorSearch() {
  const searchValue = ref('');
  const loading = ref(false);
  const error = ref('');
  const collaborator = ref<any>(null);
  let timeout: any = null;

  async function searchCollaborator(value: string) {
    error.value = '';
    collaborator.value = null;
    searchValue.value = value;
    if (timeout) clearTimeout(timeout);

    if (!value || !value.trim()) {
      loading.value = false;
      return;
    }

    const cpfSanitized = value.replace(/\D/g, '');

    loading.value = true;
    try {
      let params;
      if (cpfSanitized.length === 11) {
        params = `cpf=${cpfSanitized}`;
      } else {
        params = `name=${encodeURIComponent(value)}`;
      }
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/collaborators/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (data && (data.id || (Array.isArray(data) && data.length))) {
        collaborator.value = data;
      } else {
        error.value = 'Colaborador não encontrado';
        toast.error(error.value);
      }
    } catch (error: any) {
      toast.error('Erro ao buscar pelo nome ou cpf');
    } finally {
      loading.value = false;
    }
  }

  return {
    searchValue,
    loading,
    error,
    collaborator,
    searchCollaborator,
  };
}
