import { ref } from 'vue';
import axios from 'axios';

export function useCollaboratorSearch() {
  const cpfSearch = ref('');
  const cpfLoading = ref(false);
  const cpfError = ref('');
  const cpfCollaborator = ref<any>(null);
  let cpfTimeout: any = null;

  function searchByCpf(cpf: string) {
    cpfError.value = '';
    cpfCollaborator.value = null;
    cpfSearch.value = cpf;
    if (cpfTimeout) clearTimeout(cpfTimeout);

    if (cpf.length === 11) {
      cpfTimeout = setTimeout(async () => {
        cpfLoading.value = true;
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/collaborators/search?cpf=${cpf}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          );
          if (data && data.id) {
            cpfCollaborator.value = data;
          } else {
            cpfError.value = 'Colaborador não encontrado';
          }
        } catch {
          cpfError.value = 'Erro ao buscar colaborador';
        } finally {
          cpfLoading.value = false;
        }
      }, 500);
    }
  }

  return {
    cpfSearch,
    cpfLoading,
    cpfError,
    cpfCollaborator,
    searchByCpf,
  };
}
