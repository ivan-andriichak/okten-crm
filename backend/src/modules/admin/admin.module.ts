import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerService } from '../logger/logger.service';
import { RedisModule } from '../redis/redis.module';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserRepository } from '../repository/services/user.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, RedisModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserRepository, OrdersRepository]),
  ],
  controllers: [AdminController],
  providers: [AdminService, LoggerService],
})
export class AdminModule {}
