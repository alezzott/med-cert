<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <div
      class="flex-2 flex items-center justify-center p-8 flex-col"
      style="background: var(--color-petroleo)"
    >
      <img
        :src="ManagerIllustrator"
        alt="Ilustração"
        class="w-[320px] lg:w-[540px] h-auto mb-6 object-contain"
        draggable="false"
      />
      <h2 class="text-white text-2xl font-semibold max-w-md text-center">
        Sistema de gestão de atestados médicos
      </h2>
    </div>
    <div class="flex-1 flex items-center justify-center bg-white p-4 md:p-8">
      <div class="w-full max-w-sm">
        <section class="flex m-auto items-center justify-center my-8">
          <img src="/favicon.png" class="h-14 w-14" draggable="false" />
          <h1 class="font-semibold text-2xl">MedCert</h1>
        </section>
        <p class="text-gray-800 text-center mb-8 text-lg font-semibold">
          Acesse sua conta para continuar
        </p>
        <form class="space-y-6" @submit.prevent="onLogin">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="seu@email.com"
                  class="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="w-full pr-10"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    @click="showPassword = !showPassword"
                    tabindex="-1"
                    aria-label="Mostrar ou ocultar senha"
                  >
                    <Eye v-if="!showPassword" class="w-5 h-5" />
                    <EyeOff v-else class="w-5 h-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button
            type="submit"
            class="w-full font-bold cursor-pointer"
            :style="{
              background: 'var(--color-petroleo)',
              color: 'var(--color-branco)',
            }"
            :disabled="loading"
          >
            <span v-if="loading">Entrando...</span>
            <span v-else>Entrar</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/composables/useAuth';
import z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import ManagerIllustrator from '../assets/bro-human.svg';

const showPassword = ref(false);
const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: 'E-mail é obrigatório' })
      .nonempty('E-mail é obrigatório')
      .email('E-mail inválido'),
    password: z
      .string({ required_error: 'Senha é obrigatória' })
      .nonempty('Senha é obrigatória')
      .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: loginSchema,
});

const router = useRouter();
const { login, loading } = useAuth();

const onLogin = handleSubmit(async (formValues) => {
  const ok = await login(formValues.email, formValues.password);
  if (ok) router.push('/');
});
</script>
