import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { MailDto } from '../email/mail.dto';
import { UserResDto } from '../users/dto/res/user.res.dto';
import { RegisterAdminReqDto } from './dto/req/register-admin.req.dto';
import { SetPasswordReqDto } from './dto/req/set-password.req.dto';
import { AdminService } from './services/admin.service';

@ApiBearerAuth()
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAccessGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(Role.ADMIN)
  @Get('managers')
  async getManagers(
    @Query('page') page = 1,
    @Query('limit') limit = 25,
    @Query('sort') sort = 'created_at',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ managers: UserEntity[]; total: number }> {
    return await this.adminService.getManagers(page, limit, sort, order);
  }

  @Roles(Role.ADMIN)
  @Get('orders/stats')
  async getOrderStatistics(): Promise<Record<string, number>> {
    return await this.adminService.getOrderStatistics();
  }

  @Roles(Role.ADMIN)
  @Get('managers/:id/statistics')
  async getManagerStatistics(@Param('id') id: string): Promise<Record<string, number>> {
    return await this.adminService.getManagerStatistics(id);
  }

  @Public()
  @Get('user-by-token/:token')
  async getUserByToken(@Param('token') token: string) {
    return await this.adminService.getUserByToken(token);
  }

  @Roles(Role.ADMIN)
  @Post('managers')
  async createManager(@Body() dto: RegisterAdminReqDto): Promise<UserResDto> {
    return await this.adminService.createManager(dto);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/activate')
  async activateManager(@Param('id') id: string): Promise<{ link: string; email: string }> {
    return await this.adminService.generateActivationLink(id);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/recover')
  async recoverPassword(@Param('id') id: string): Promise<{ link: string; email: string }> {
    return await this.adminService.generateRecoveryLink(id);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/ban')
  async banManager(@Param('id') id: string): Promise<void> {
    return await this.adminService.banManager(id);
  }

  @Roles(Role.ADMIN)
  @Post('managers/:id/unban')
  async unbanManager(@Param('id') id: string): Promise<UserEntity> {
    return await this.adminService.unbanManager(id);
  }

  @Public()
  @Post('set-password/:token')
  async setPassword(@Param('token') token: string, @Body() dto: SetPasswordReqDto) {
    return await this.adminService.setPassword(token, dto.password);
  }

  @Roles(Role.ADMIN)
  @Post('send-email')
  async sendEmail(@Body() dto: MailDto): Promise<{ message: string }> {
    await this.adminService.sendEmail(dto);
    return { message: 'Email sent successfully' };
  }

  @Get('verify-token/:token')
  @Public()
  async verifyToken(@Param('token') token: string): Promise<{ email: string }> {
    return await this.adminService.verifyToken(token);
  }
}
