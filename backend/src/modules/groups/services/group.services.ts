import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from '../../../database/entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async createGroup(name: string): Promise<GroupEntity> {
    const existingGroup = await this.groupRepository.findOne({
      where: { name },
    });
    if (existingGroup) {
      throw new BadRequestException(`Group with name "${name}" already exists`);
    }

    const group = this.groupRepository.create({ name });
    return await this.groupRepository.save(group);
  }

  async findAll(): Promise<GroupEntity[]> {
    return await this.groupRepository.find();
  }

  async findById(id: string): Promise<GroupEntity> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new BadRequestException(`Group with id "${id}" not found`);
    }
    return group;
  }
}
