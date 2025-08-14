import { ref } from 'vue';

export interface MedicalCertificate {
  collaboratorId: string;
  collaboratorName?: string;
  cidCode: string;
  issueDate: string;
  leaveDays: number;
  observations: string;
}

export function useMedicalCertificates() {
  const certificates = ref<MedicalCertificate[]>([]);
  const loading = ref(false);
  const error = ref('');
  const total = ref(0);

  const fetchCertificates = async ({
    page = 1,
    limit = 10,
    name = '',
  } = {}) => {
    loading.value = true;
    error.value = '';
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (name.trim()) {
        params.append('name', name.trim());
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/medical-certificates?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar atestados médicos');
      }
      const data = await response.json();
      certificates.value = data.data;
      total.value = data.total;
    } catch (e: any) {
      error.value = e.message || 'Erro ao carregar dados';
    } finally {
      loading.value = false;
    }
  };

  return {
    certificates,
    loading,
    error,
    total,
    fetchCertificates,
  };
}
