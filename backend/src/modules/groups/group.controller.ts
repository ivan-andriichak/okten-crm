// src/modules/groups/group.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../common/guards/roles.guard';
import { GroupEntity } from '../../database/entities/group.entity';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CreateGroupDto } from './dto/req/create-group.dto';
import { GroupService } from './services/group.services';

@ApiBearerAuth()
@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAccessGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOkResponse({ description: 'Group created', type: GroupEntity })
  async createGroup(@Body() dto: CreateGroupDto): Promise<GroupEntity> {
    return await this.groupService.createGroup(dto.name);
  }

  @Get()
  @ApiOkResponse({ description: 'List of groups', type: [GroupEntity] })
  async findAll(): Promise<GroupEntity[]> {
    return await this.groupService.findAll();
  }
}
