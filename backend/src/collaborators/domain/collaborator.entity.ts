export class Collaborator {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly cpf: string,
    public readonly birthDate: Date,
    public readonly status: CollaboratorStatus,
    public readonly role: CollaboratorRole = CollaboratorRole.COLLABORATOR,
  ) {}
}

export enum CollaboratorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CollaboratorRole {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
}
