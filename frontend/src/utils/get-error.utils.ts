export function getErrorMessage(
  error: any,
  defaultMessage = 'Erro inesperado',
): string {
  const messages: Record<number | string, string> = {
    400: 'Dados inválidos. Verifique os campos e tente novamente.',
    401: 'Sessão expirada. Faça login novamente.',
    403: 'Você não tem permissão para criar atestados.',
    404: 'Colaborador ou CID não encontrado.',
    500: 'Erro interno do servidor. Tente novamente mais tarde.',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  };

  if (error?.response?.data?.message) return error.response.data.message;

  const status = error?.response?.status;
  if (status && messages[status]) return messages[status];

  if (error?.code && messages[error.code]) return messages[error.code];

  return defaultMessage;
}
