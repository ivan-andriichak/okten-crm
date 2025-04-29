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
    console.log(`JwtAccessGuard: Processing route: ${route}`); // Логування маршруту

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(`JwtAccessGuard: isPublic: ${isPublic}`); // Логування

    if (isPublic) {
      console.log(`JwtAccessGuard: Route is public, allowing access`);
      return true;
    }

    const skipAuth = this.reflector.getAllAndOverride<boolean>('SKIP_AUTH', [context.getHandler(), context.getClass()]);
    console.log(`JwtAccessGuard: skipAuth: ${skipAuth}`); // Логування

    if (skipAuth) {
      console.log(`JwtAccessGuard: Auth skipped, allowing access`);
      return true;
    }

    const accessToken = request.get('Authorization')?.split('Bearer ')[1];
    console.log(`JwtAccessGuard: accessToken: ${accessToken ? 'present' : 'missing'}`); // Логування

    if (!accessToken) {
      console.error(`JwtAccessGuard: No access token provided for ${route}`);
      throw new UnauthorizedException('No access token provided');
    }

    const payload = await this.tokenService.verifyToken(accessToken, TokenType.ACCESS);
    console.log(`JwtAccessGuard: payload: ${JSON.stringify(payload)}`); // Логування

    if (!payload) {
      console.error(`JwtAccessGuard: Invalid token for ${route}`);
      throw new UnauthorizedException('Invalid token');
    }

    const isAccessTokenExist = await this.authCacheService.isAccessTokenExist(
      payload.userId,
      payload.deviceId,
      accessToken,
    );
    console.log(`JwtAccessGuard: isAccessTokenExist: ${isAccessTokenExist}`); // Логування

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

    if (!user) {
      console.error(`JwtAccessGuard: User not found for ID: ${payload.userId} for ${route}`);
      throw new UnauthorizedException('User not found');
    }

    request.user = UserMapper.toIUserData(user, payload);
    console.log(`JwtAccessGuard: request.user set: ${JSON.stringify(request.user)}`); // Логування
    return true;
  }
}
