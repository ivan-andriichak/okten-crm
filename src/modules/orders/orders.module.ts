import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersRepository } from '../repository/services/orders.repository';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersRepository])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
