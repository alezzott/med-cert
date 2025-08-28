<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useCreateCollaborator } from '@/composables/useCreateCollaborator';
import { removeCpfMask } from '@/utils/cpf-mask.utils';
import CollaboratorsFormFields from './dialog/CollaboratorsFormFields.vue';
import { CollaboratorSchema } from '@/schema/CollaboratorSchema';
import { Loader2 } from 'lucide-vue-next';
import { useCollaboratorsStore } from '@/stores/collaborator.store';
import {
  stringToCalendarDate,
  calendarDateToString,
  formatDateForDisplay,
} from '@/utils/date-calendar.utils';

type CollaboratorForm = {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
};

const openDialog = ref(false);
const saving = ref(false);
const error = ref('');
const store = useCollaboratorsStore();
const { createCollaborator, error: apiError } = useCreateCollaborator();

const { resetForm, setValues } = useForm<CollaboratorForm>({
  initialValues: {
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
  },
  validateOnMount: false,
});

const emit = defineEmits<{
  saved: [];
}>();

watch(openDialog, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

const onSubmit = async (formValues: CollaboratorForm) => {
  saving.value = true;
  try {
    const payload = {
      ...formValues,
      cpf: removeCpfMask(formValues.cpf),
      birthDate: formValues.birthDate,
      role: 'COLLABORATOR',
    };

    await createCollaborator(payload);
    resetForm();
    setValues({
      name: '',
      email: '',
      cpf: '',
      birthDate: '',
    });
    openDialog.value = false;
    emit('saved');
    store.cache = {};
    await store.fetchCollaborators();
  } catch (e) {
    error.value = apiError.value || 'Erro ao salvar colaborador';
    return false;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <Form
    v-slot="{ handleSubmit }"
    as=""
    keep-values
    :validation-schema="CollaboratorSchema"
  >
    <Dialog v-model:open="openDialog">
      <DialogTrigger as-child>
        <Button>Adicionar novo colaborador</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Adicionar colaborador</DialogTitle>
        </DialogHeader>
        <form
          id="collaboratorForm"
          @submit.prevent="handleSubmit(onSubmit as never)"
        >
          <CollaboratorsFormFields
            :formatDateForDisplay="formatDateForDisplay"
            :stringToCalendarDate="stringToCalendarDate"
            :calendarDateToString="calendarDateToString"
          />

          <DialogFooter>
            <Button type="submit" form="collaboratorForm" :disabled="saving">
              {{ saving ? 'Salvando' : 'Salvar' }}
              <Loader2 v-if="saving" class="w-4 h-4 m-auto flex animate-spin" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </Form>
</template>
