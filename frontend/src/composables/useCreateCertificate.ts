import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import dayjs from 'dayjs';
import { getErrorMessage } from '@/utils/get-error.utils';

export interface CreateCertificatePayload {
  collaboratorId: string;
  issueDate: string;
  leaveDays: number;
  cidCode: string;
  observations?: string;
}

export interface CreateCertificateOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  showToasts?: boolean;
}

export function useCreateCertificate() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const createCertificate = async (
    payload: CreateCertificatePayload,
    options: CreateCertificateOptions = {},
  ) => {
    const { onSuccess, onError, showToasts = true } = options;

    isLoading.value = true;
    error.value = null;

    const validationErrors = validatePayload(payload);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(', ');
      error.value = errorMessage;

      if (showToasts) {
        toast.error('Dados inválidos', {
          description: errorMessage,
        });
      }

      isLoading.value = false;
      onError?.(new Error(errorMessage));
      return { success: false, error: errorMessage };
    }

    const processedPayload = processPayload(payload);

    let loadingToast: string | number | undefined;
    if (showToasts) {
      loadingToast = toast.loading('Criando atestado...', {
        description: 'Processando informações do atestado médico',
      });
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/medical-certificates`,
        processedPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (showToasts && loadingToast) {
        toast.dismiss(loadingToast);
        toast.success('Atestado criado com sucesso!', {
          description: `Atestado de ${payload.leaveDays} dias criado`,
        });
      }

      onSuccess?.();

      return {
        success: true,
        data: response.data,
        message: 'Atestado criado com sucesso',
      };
    } catch (err: any) {
      console.error('Erro ao criar atestado:', err);

      const errorMessage = getErrorMessage(err);
      error.value = errorMessage;

      if (showToasts && loadingToast) {
        toast.dismiss(loadingToast);
        toast.error('Erro ao criar atestado', {
          description: errorMessage,
        });
      }

      onError?.(err);

      return {
        success: false,
        error: errorMessage,
        details: err?.response?.data,
      };
    } finally {
      isLoading.value = false;
    }
  };

  function parseIssueDate(issueDate: string): dayjs.Dayjs {
    const [datePart, timePart] = issueDate.split(' - ');
    return dayjs(`${datePart} ${timePart}`, 'DD/MM/YYYY HH:mm:ss', true);
  }

  const validatePayload = (payload: CreateCertificatePayload): string[] => {
    const errors: string[] = [];

    if (!payload.collaboratorId?.trim()) {
      errors.push('Colaborador é obrigatório');
    }

    if (!payload.issueDate?.trim()) {
      errors.push('Data de emissão é obrigatória');
    } else {
      const date = parseIssueDate(payload.issueDate);
      if (!date.isValid()) {
        errors.push('Data de emissão inválida');
      }
    }

    if (
      !payload.leaveDays ||
      payload.leaveDays < 1 ||
      payload.leaveDays > 365
    ) {
      errors.push('Dias de afastamento deve ser entre 1 e 365');
    }

    if (!payload.cidCode?.trim()) {
      errors.push('Código CID é obrigatório');
    }

    return errors;
  };

  const processPayload = (payload: CreateCertificatePayload) => {
    const date = parseIssueDate(payload.issueDate);
    const localDate = date.format('YYYY-MM-DDTHH:mm:ss');

    return {
      collaboratorId: payload.collaboratorId.trim(),
      issueDate: localDate,
      leaveDays: Number(payload.leaveDays),
      cidCode: payload.cidCode.trim().toUpperCase(),
      observations: payload.observations?.trim() || '',
    };
  };

  const clearError = () => {
    error.value = null;
  };

  const canSubmit = (payload: Partial<CreateCertificatePayload>): boolean => {
    return !!(
      payload.collaboratorId &&
      payload.issueDate &&
      payload.leaveDays &&
      payload.cidCode &&
      !isLoading.value
    );
  };

  return {
    isLoading,
    error,

    createCertificate,
    validatePayload,
    clearError,
    canSubmit,
  };
}
