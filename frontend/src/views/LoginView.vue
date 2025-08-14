<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Esquerda: texto -->
    <div
      class="flex-1 flex items-center justify-center p-8"
      style="background: var(--color-petroleo)"
    >
      <h2
        class="text-white text-3xl md:text-4xl font-bold max-w-md text-center"
      >
        Bem-vindo ao MedCert<br />
        <span class="text-base font-normal block mt-4"
          >Sistema de gestão de atestados médicos</span
        >
      </h2>
    </div>
    <!-- Direita: login -->
    <div class="flex-1 flex items-center justify-center bg-white p-4 md:p-8">
      <div class="w-full max-w-sm">
        <div v-if="loading" class="flex items-center justify-center mb-4">
          <svg
            class="animate-spin h-5 w-5 text-[var(--color-petroleo)] mr-2"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span class="text-[var(--color-cinza-escuro)] text-sm"
            >Conectando à API...</span
          >
        </div>
        <form class="space-y-6" @submit.prevent="onLogin">
          <h3
            class="text-2xl font-bold mb-4"
            :style="{ color: 'var(--color-cinza-escuro)' }"
          >
            Entrar
          </h3>
          <div>
            <label
              class="block mb-1 text-sm font-medium"
              :style="{ color: 'var(--color-cinza-escuro)' }"
              >E-mail</label
            >
            <Input
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="w-full"
            />
          </div>
          <div>
            <label
              class="block mb-1 text-sm font-medium"
              :style="{ color: 'var(--color-cinza-escuro)' }"
              >Senha</label
            >
            <Input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full"
            />
          </div>
          <Button
            type="submit"
            class="w-full font-bold"
            :style="{
              background: 'var(--color-petroleo)',
              color: 'var(--color-branco)',
            }"
            :disabled="loading"
          >
            <span v-if="loading">Entrando...</span>
            <span v-else>Entrar</span>
          </Button>
          <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/composables/useAuth';

const email = ref('');
const password = ref('');
const router = useRouter();
const { login, loading, error } = useAuth();

async function onLogin() {
  const ok = await login(email.value, password.value);
  if (ok) router.push('/');
}
</script>
