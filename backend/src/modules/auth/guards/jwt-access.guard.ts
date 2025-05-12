// backend/src/modules/auth/guards/jwt-access.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { UserRepository } from '../../repository/services/user.repository';
import { UserMapper } from '../../users/user.maper';
import { TokenType } from '../enums/token-type.enum';
import { AuthCacheService } from '../services/auth-cach.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = `${request.method} ${request.url}`;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const skipAuth = this.reflector.getAllAndOverride<boolean>('SKIP_AUTH', [context.getHandler(), context.getClass()]);

    if (skipAuth) {
      return true;
    }

    const accessToken = request.get('Authorization')?.split('Bearer ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload = await this.tokenService.verifyToken(accessToken, TokenType.ACCESS);

      const isAccessTokenExist = await this.authCacheService.isAccessTokenExist(
        payload.userId,
        payload.deviceId,
        accessToken,
      );

      if (!isAccessTokenExist) {
        console.error(`JwtAccessGuard: Access token not found in cache for ${route}`, {
          userId: payload.userId,
          deviceId: payload.deviceId,
        });
        throw new UnauthorizedException('Access token not found in cache');
      }

      const user = await this.userRepository.findOneBy({ id: payload.userId });

      if (user.role === 'manager' && !user.is_active) {
        throw new UnauthorizedException('User is banned');
      }

      request.user = UserMapper.toIUserData(user, payload);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
