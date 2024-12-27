import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { RolesGuard } from '../../common/guards/roles.guard';
// import { CreateDefaultAdminHook } from './hooks/default-admin.hook';
import { AdminService } from '../admin/services/admin.service';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { AuthService } from './services/auth.service';
import { AuthCacheService } from './services/auth-cach.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [JwtModule, RedisModule, forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthService,
    AdminService,
    TokenService,
    AuthCacheService,
    // CreateDefaultAdminHook,
  ],
  exports: [AuthCacheService],
})
export class AuthModule {}
