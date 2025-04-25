import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupModule } from '../groups/group.module';
import { LoggerModule } from '../logger/logger.module';
import { CommentRepository } from '../repository/services/comment.repository';
import { OrdersRepository } from '../repository/services/orders.repository';
import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersRepository]), LoggerModule, GroupModule],
  controllers: [OrderController],
  providers: [OrderService, OrdersRepository, CommentRepository],
  exports: [OrderService, OrdersRepository],
})
export class OrderModule {}
