import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from '../../database/entities/order.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { LoggerService } from '../logger/logger.service';
import { RedisModule } from '../redis/redis.module';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserRepository } from '../repository/services/user.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, RedisModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserRepository, OrdersRepository, UserEntity, OrderEntity]),
  ],
  controllers: [AdminController],
  providers: [AdminService, LoggerService],
})
export class AdminModule {}
