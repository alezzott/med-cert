import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

export function useAuth() {
  const loading = ref(false);
  const error = ref('');
  const authStore = useAuthStore();
  const router = useRouter();

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = '';
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
        },
      );
      authStore.setToken(res.data.accessToken);
      console.log('Login realizado com sucesso:', res.data);
      return true;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Usuário ou senha inválidos';
      console.error('Erro ao realizar login:', error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function isAuthenticated() {
    return !!authStore.token;
  }

  function logout() {
    authStore.logout();
    router.push('/login');
  }

  return { login, logout, loading, error, isAuthenticated };
}
