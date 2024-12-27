import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { LoggerModule } from './modules/logger/logger.module';
import { MysqlModule } from './modules/mysql/mysql.module';
import { RedisModule } from './modules/redis/redis.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MysqlModule,
    RedisModule,
    LoggerModule,
    RepositoryModule,
    FileStorageModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
