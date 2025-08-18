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

  const isRateLimited = ref(false);
  const retryAfter = ref(0);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;

  const startCountdown = (seconds: number) => {
    retryAfter.value = seconds;
    isRateLimited.value = true;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      retryAfter.value--;
      if (retryAfter.value <= 0) {
        clearInterval(countdownTimer!);
        isRateLimited.value = false;
        retryAfter.value = 0;
      }
    }, 1000);
  };

  const searchCid = async (term: string): Promise<CidOption[]> => {
    if (!term || term.length < 2) {
      cidOptions.value = [];
      return [];
    }

    if (isRateLimited.value) {
      toast.warning('Aguarde para buscar novamente', {
        description: `Você poderá buscar em ${retryAfter.value} segundos.`,
      });
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
      if (error.response?.status === 429) {
        const waitTime = 60;
        startCountdown(waitTime);
        toast.error('Limite de buscas atingido', {
          description:
            error.response?.data?.message ||
            'Muitas tentativas. Tente novamente em alguns instantes.',
        });
        cidError.value = 'Rate limit atingido';
      } else {
        cidError.value = 'Erro ao buscar CID';
        toast.error('Erro ao buscar CID', {
          description:
            error.response?.data?.message ||
            'Não foi possível carregar os códigos CID',
        });
      }
      return [];
    } finally {
      cidLoading.value = false;
    }
  };

  const debouncedSearchCid = (
    term: string,
    delay: number = 800,
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

      if (isRateLimited.value) {
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
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    cidOptions.value = [];
    cidError.value = null;
    cidLoading.value = false;
    isRateLimited.value = false;
    retryAfter.value = 0;
  };

  return {
    cidOptions,
    cidLoading,
    cidError,
    isRateLimited,
    retryAfter,
    searchCid,
    debouncedSearchCid,
    clearCidSearch,
  };
}
