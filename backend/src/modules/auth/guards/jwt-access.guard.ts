import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    // Перевіряємо, чи маршрут позначений як публічний через @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Пропускаємо перевірку для публічних маршрутів
    }

    // Перевіряємо SKIP_AUTH (залишаємо для сумісності з іншими частинами коду)
    const skipAuth = this.reflector.getAllAndOverride<boolean>('SKIP_AUTH', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const accessToken = request.get('Authorization')?.split('Bearer ')[1];
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    const payload = await this.tokenService.verifyToken(
      accessToken,
      TokenType.ACCESS,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }

    const isAccessTokenExist = await this.authCacheService.isAccessTokenExist(
      payload.userId,
      payload.deviceId,
      accessToken,
    );
    if (!isAccessTokenExist) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOneBy({
      id: payload.userId,
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = UserMapper.toIUserData(user, payload);
    return true;
  }

  async validate(payload: any): Promise<any> {
    console.log('JWT payload:', payload);
    return payload;
  }
}
