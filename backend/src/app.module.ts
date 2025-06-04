import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';

import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import configuration from './config/configuration';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/email/mail.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { GroupModule } from './modules/groups/group.module';
import { LoggerModule } from './modules/logger/logger.module';
import { MysqlModule } from './modules/mysql/mysql.module';
import { OrderModule } from './modules/orders/order.module';
import { RedisModule } from './modules/redis/redis.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    OrderModule,
    MysqlModule,
    RedisModule,
    LoggerModule,
    RepositoryModule,
    MailModule,
    FileStorageModule,
    GroupModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
