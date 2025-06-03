import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from '../../database/entities/order.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserRepository } from '../repository/services/user.repository';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
    LoggerModule,
    EmailModule,
    TypeOrmModule.forFeature([UserRepository, OrdersRepository, UserEntity, OrderEntity, RefreshTokenEntity]),
  ],
  controllers: [AdminController],
  providers: [AdminService, LoggerService, EmailService],
})
export class AdminModule {}
