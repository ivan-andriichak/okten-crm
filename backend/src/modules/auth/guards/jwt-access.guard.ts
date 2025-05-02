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
    console.log(`JwtAccessGuard: Processing route: ${route}`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(`JwtAccessGuard: isPublic: ${isPublic}`);

    if (isPublic) {
      console.log(`JwtAccessGuard: Route is public, allowing access`);
      return true;
    }

    const skipAuth = this.reflector.getAllAndOverride<boolean>('SKIP_AUTH', [context.getHandler(), context.getClass()]);
    console.log(`JwtAccessGuard: skipAuth: ${skipAuth}`);

    if (skipAuth) {
      console.log(`JwtAccessGuard: Auth skipped, allowing access`);
      return true;
    }

    const accessToken = request.get('Authorization')?.split('Bearer ')[1];
    console.log(`JwtAccessGuard: accessToken: ${accessToken ? accessToken : 'missing'}`);

    if (!accessToken) {
      console.error(`JwtAccessGuard: No access token provided for ${route}`);
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload = await this.tokenService.verifyToken(accessToken, TokenType.ACCESS);
      console.log(`JwtAccessGuard: payload: ${JSON.stringify(payload)}`);

      const isAccessTokenExist = await this.authCacheService.isAccessTokenExist(
        payload.userId,
        payload.deviceId,
        accessToken,
      );
      console.log(`JwtAccessGuard: isAccessTokenExist: ${isAccessTokenExist}`);

      if (!isAccessTokenExist) {
        console.error(`JwtAccessGuard: Access token not found in cache for ${route}`, {
          userId: payload.userId,
          deviceId: payload.deviceId,
        });
        throw new UnauthorizedException('Access token not found in cache');
      }

      const user = await this.userRepository.findOneBy({ id: payload.userId });
      console.log(
        `JwtAccessGuard: user: ${
          user ? JSON.stringify({ id: user.id, email: user.email, role: user.role }) : 'not found'
        }`,
      );

      if (user.role === 'manager' && !user.is_active) {
        throw new UnauthorizedException('User is banned');
      }

      request.user = UserMapper.toIUserData(user, payload);
      console.log(`JwtAccessGuard: request.user set: ${JSON.stringify(request.user)}`);
      return true;
    } catch (error) {
      console.error(`JwtAccessGuard: Помилка валідації для ${route}: ${error.message}`);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
