import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';

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
      toast.success('colaborador criado !');
      return response.data;
    } catch (e: any) {
      const msg = e.response?.data?.error?.message;
      toast.warning(msg);
      error.value = msg;
      throw e;
    }
  }

  return { createCollaborator, error };
}
