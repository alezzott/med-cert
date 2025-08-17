import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';

export interface CidOption {
  code: string;
  title: string;
}

export function useCidSearch() {
  const cidOptions = ref<CidOption[]>([]);
  const cidLoading = ref(false);
  const cidError = ref<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const searchCid = async (term: string): Promise<CidOption[]> => {
    if (!term || term.length < 2) {
      cidOptions.value = [];
      return [];
    }

    cidLoading.value = true;
    cidError.value = null;

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/cid/search?term=${encodeURIComponent(term)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      const results = Array.isArray(data) ? data : [];
      cidOptions.value = results;

      if (results.length === 0 && term.length >= 2) {
        toast.info('Nenhum CID encontrado', {
          description: `Nenhum resultado para "${term}". Tente termos diferentes.`,
        });
      }

      return results;
    } catch (error: any) {
      cidOptions.value = [];
      cidError.value = 'Erro ao buscar CID';

      toast.error('Erro ao buscar CID', {
        description: 'Não foi possível carregar os códigos CID',
      });

      return [];
    } finally {
      cidLoading.value = false;
    }
  };

  const debouncedSearchCid = (
    term: string,
    delay: number = 500,
  ): Promise<CidOption[]> => {
    return new Promise((resolve) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (!term || term.length < 2) {
        cidOptions.value = [];
        cidLoading.value = false;
        resolve([]);
        return;
      }

      cidLoading.value = true;
      debounceTimer = setTimeout(async () => {
        try {
          const results = await searchCid(term);
          resolve(results);
        } catch (error) {
          resolve([]);
        }
      }, delay);
    });
  };

  const clearCidSearch = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    cidOptions.value = [];
    cidError.value = null;
    cidLoading.value = false;
  };

  return {
    cidOptions,
    cidLoading,
    cidError,
    searchCid,
    debouncedSearchCid,
    clearCidSearch,
  };
}
