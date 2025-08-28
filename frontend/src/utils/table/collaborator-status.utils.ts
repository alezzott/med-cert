import { CollaboratorStatus } from '@/enums/status.enums';
import { toast } from 'vue-sonner';

export function getToggleStatusHandler(
  collaborator: { id: string },
  status: CollaboratorStatus,
  updateStatus: (id: string, status: CollaboratorStatus) => Promise<boolean>,
  fetchCollaborators: () => void,
) {
  return async () => {
    const newStatus =
      status === CollaboratorStatus.ACTIVE
        ? CollaboratorStatus.INACTIVE
        : CollaboratorStatus.ACTIVE;
    const statusText =
      newStatus === CollaboratorStatus.ACTIVE ? 'ativado' : 'desativado';
    try {
      const response = await updateStatus(collaborator.id, newStatus);
      if (response) {
        fetchCollaborators();
        toast.success(`Colaborador ${statusText} com sucesso!`);
      }
    } catch {
      toast.error('Erro ao atualizar status do colaborador');
    }
  };
}
