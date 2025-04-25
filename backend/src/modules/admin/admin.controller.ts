import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UserEntity } from '../../database/entities/user.entity';
import { RegisterAdminReqDto } from './dto/req/register-admin.req.dto';
import { AdminService } from './services/admin.service';

@ApiBearerAuth()
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('managers')
  // @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'Manager created', type: UserEntity })
  async createManager(@Body() dto: RegisterAdminReqDto): Promise<UserEntity> {
    return await this.adminService.createManager(dto);
  }

  @Get('managers')
  // @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'List of managers with pagination' })
  async getManagers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ): Promise<{ managers: UserEntity[]; total: number }> {
    const [managers, total] = await this.adminService.getManagers(page, limit);
    return { managers, total };
  }

  @Patch('managers/:id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'Manager status toggled', type: UserEntity })
  async toggleManagerStatus(@Param('id') id: string): Promise<UserEntity> {
    return await this.adminService.toggleManagerStatus(id);
  }

  @Post('set-password/:token')
  @ApiOkResponse({ description: 'Password set successfully' })
  async setPassword(@Param('token') token: string, @Body() data: { password: string }): Promise<void> {
    await this.adminService.setPassword(token, data.password);
  }

  @Get('statistics')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'Order statistics by status' })
  async getOrderStatistics(): Promise<Record<string, number>> {
    return await this.adminService.getOrderStatistics();
  }

  @Get('managers/:id/statistics')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'Manager statistics by status' })
  async getManagerStatistics(@Param('id') id: string): Promise<Record<string, number>> {
    return await this.adminService.getManagerStatistics(id);
  }
}
