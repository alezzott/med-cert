import { ref } from 'vue';

export function useCreateCollaborator() {
  const error = ref('');

  async function createCollaborator(payload: any) {
    error.value = '';
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/collaborators`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error('Erro ao salvar colaborador');
      }
      return await response.json();
    } catch (e: any) {
      error.value = e.message || 'Erro ao salvar colaborador';
      throw e;
    }
  }

  return { createCollaborator, error };
}
