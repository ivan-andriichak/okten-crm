import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { OrdersRepository } from '../repository/services/orders.repository';
import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersRepository]), LoggerModule],
  controllers: [OrderController],
  providers: [OrderService, OrdersRepository],
  exports: [OrderService],
})
export class OrderModule {}
