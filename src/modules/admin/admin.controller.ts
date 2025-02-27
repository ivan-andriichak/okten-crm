import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminService } from './services/admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Get('dashboard')
  // async getDashboard(): Promise<DashboardDto> {
  //   return this.adminService.getDashboard();
  // }

  // @Post('create-manager')
  // @Roles(Role.ADMIN) // Тільки адміністратор може створювати менеджерів
  // async createManager(@Body() createManagerDto: CreateManagerDto): Promise<{ message: string }> {
  //   return this.adminService.createManager(createManagerDto);
  // }

  // @Get()
  //   async getManagers(@Query() query: OrderListQueryDto): Promise<ManagerListDto> {
  //     return this.managerService.getManagers(query);
  //   }
  //
  //   @Post()
  //   @Roles(Role.ADMIN) // Тільки адміністратор може створювати нових менеджерів
  //   async createManager(@Body() createManagerDto: CreateManagerDto): Promise<{ message: string }> {
  //     return this.managerService.createManager(createManagerDto);
  //   }
  //
  //   @Patch(':id/activate')
  //   @Roles(Role.ADMIN) // Тільки адміністратор може активувати менеджерів
  //   async activateManager(@Param('id') id: string): Promise<{ message: string }> {
  //     return this.managerService.activateManager(id);
  //   }
  //
  //   @Patch(':id/ban')
  //   @Roles(Role.ADMIN) // Тільки адміністратор може блокувати менеджерів
  //   async banManager(@Param('id') id: string): Promise<{ message: string }> {
  //     return this.managerService.banManager(id);
  //   }
  //
  //   @Patch(':id/unban')
  //   @Roles(Role.ADMIN) // Тільки адміністратор може розблокувати менеджерів
  //   async unbanManager(@Param('id') id: string): Promise<{ message: string }> {
  //     return this.managerService.unbanManager(id);
  //   }
  //
  //   @Get(':id/statistics')
  //   async getManagerStatistics(@Param('id') id: string): Promise<ManagerStatisticsDto> {
  //     return this.managerService.getManagerStatistics(id);
  //   }

  // @Get('orders/statistics')
  // async getOrderStatistics(): Promise<OrderStatisticsDto> {
  //   return this.adminService.getOrderStatistics();
  // }
}
