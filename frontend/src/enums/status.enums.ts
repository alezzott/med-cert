export const CollaboratorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type CollaboratorStatus = typeof CollaboratorStatus[keyof typeof CollaboratorStatus];

export function translateStatus(status: CollaboratorStatus) {
  switch (status) {
    case CollaboratorStatus.ACTIVE:
      return 'Ativo';
    case CollaboratorStatus.INACTIVE:
      return 'Inativo';
    default:
      return 'Desconhecido';
  }
}
