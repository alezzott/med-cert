import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CollaboratorRepository } from '../domain/collaborator.repository';
import {
  Collaborator,
  CollaboratorRole,
  CollaboratorStatus,
} from '../domain/collaborator.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CollaboratorDocument } from './collaborator.schema';

@Injectable()
export class CollaboratorRepositoryImpl implements CollaboratorRepository {
  constructor(
    @InjectModel('Collaborator')
    private readonly collaboratorModel: Model<CollaboratorDocument>,
  ) {}

  private toCollaborator(
    doc: CollaboratorDocument | null,
  ): Collaborator | null {
    if (!doc) return null;
    return new Collaborator(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.cpf,
      doc.birthDate,
      doc.status,
      doc.role as CollaboratorRole,
    );
  }

  async create(collaborator: Collaborator): Promise<Collaborator> {
    const created = new this.collaboratorModel(collaborator);
    const saved = await created.save();
    const result = this.toCollaborator(saved);
    if (!result) {
      throw new InternalServerErrorException('Erro ao criar colaborador');
    }
    return result;
  }

  async findById(id: string): Promise<Collaborator | null> {
    const doc = await this.collaboratorModel.findById(id).exec();
    return this.toCollaborator(doc);
  }

  async findByEmail(email: string): Promise<Collaborator | null> {
    const doc = await this.collaboratorModel.findOne({ email }).exec();
    return this.toCollaborator(doc);
  }

  async findAll(): Promise<Collaborator[]> {
    const docs = await this.collaboratorModel.find().exec();
    return docs.map((doc) => this.toCollaborator(doc) as Collaborator);
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ collaborators: Collaborator[]; total: number }> {
    const skip = (page - 1) * limit;
    const docs = await this.collaboratorModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.collaboratorModel.countDocuments().exec();
    return {
      collaborators: docs.map(
        (doc) => this.toCollaborator(doc) as Collaborator,
      ),
      total,
    };
  }

  async findByCpf(cpf: string): Promise<Collaborator | null> {
    const doc = await this.collaboratorModel.findOne({ cpf }).exec();
    return this.toCollaborator(doc);
  }

  async updateStatus(
    id: string,
    status: CollaboratorStatus,
  ): Promise<Collaborator | null> {
    const doc = await this.collaboratorModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    return this.toCollaborator(doc);
  }
}
