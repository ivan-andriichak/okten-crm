import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../orders/order.module';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [OrderModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
