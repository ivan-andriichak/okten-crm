// src/modules/groups/group.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../common/guards/roles.guard';
import { GroupEntity } from '../../database/entities/group.entity';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GroupService } from './services/group.services';

@ApiBearerAuth()
@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAccessGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOkResponse({ description: 'Group created', type: GroupEntity })
  async createGroup(@Body('name') name: string): Promise<GroupEntity> {
    return await this.groupService.createGroup(name);
  }

  @Get()
  @ApiOkResponse({ description: 'List of groups', type: [GroupEntity] })
  async findAll(): Promise<GroupEntity[]> {
    return await this.groupService.findAll();
  }
}
