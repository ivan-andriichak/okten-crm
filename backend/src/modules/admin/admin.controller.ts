import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Roles(Role.ADMIN)
  @Post('managers')
  @ApiOkResponse({ description: 'Manager created', type: UserEntity })
  async createManager(@Body() dto: RegisterAdminReqDto): Promise<UserEntity> {
    return await this.adminService.createManager(dto);
  }

  @Roles(Role.ADMIN)
  @Get('managers')
  @ApiOkResponse({ description: 'List of managers with pagination' })
  async getManagers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 2,
    @Query('sort') sort: string = 'created_at',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ managers: UserEntity[]; total: number }> {
    return await this.adminService.getManagers(page, limit, sort, order);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/activate')
  @ApiOkResponse({ description: 'Activation link generated' })
  async activateManager(@Param('id') id: string): Promise<{ link: string }> {
    return await this.adminService.generateActivationLink(id);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/recover')
  @ApiOkResponse({ description: 'Recovery link generated' })
  async recoverPassword(@Param('id') id: string): Promise<{ link: string }> {
    return await this.adminService.generateRecoveryLink(id);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/ban')
  @ApiOkResponse({ description: 'Manager banned', type: UserEntity })
  async banManager(@Param('id') id: string): Promise<UserEntity> {
    return await this.adminService.banManager(id);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/unban')
  @ApiOkResponse({ description: 'Manager unbanned', type: UserEntity })
  async unbanManager(@Param('id') id: string): Promise<UserEntity> {
    return await this.adminService.unbanManager(id);
  }

  @Post('set-password/:token')
  @ApiOkResponse({ description: 'Password set successfully' })
  async setPassword(@Param('token') token: string, @Body() data: { password: string }): Promise<void> {
    await this.adminService.setPassword(token, data.password);
  }

  @Roles(Role.ADMIN)
  @Get('orders/stats')
  @ApiOkResponse({ description: 'Order statistics by status' })
  async getOrderStatistics(): Promise<Record<string, number>> {
    return await this.adminService.getOrderStatistics();
  }

  @Roles(Role.ADMIN)
  @Get('managers/:id/statistics')
  @ApiOkResponse({ description: 'Manager statistics by status' })
  async getManagerStatistics(@Param('id') id: string): Promise<Record<string, number>> {
    return await this.adminService.getManagerStatistics(id);
  }
}
