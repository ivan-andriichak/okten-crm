import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
