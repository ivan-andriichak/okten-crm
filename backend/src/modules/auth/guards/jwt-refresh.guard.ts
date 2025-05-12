import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { LoggerService } from '../../logger/logger.service';
import { RefreshTokenRepository } from '../../repository/services/refresh-token.repository';
import { UserMapper } from '../../users/user.maper';
import { TokenType } from '../enums/token-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  private readonly logger: LoggerService;

  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { refreshToken, deviceId } = request.body;

    this.logger.log(`Checking refresh token: ${refreshToken?.slice(0, 10)}..., deviceId: ${deviceId}`);

    if (!refreshToken || !deviceId) {
      this.logger.error('Missing refresh token or deviceId');
      throw new UnauthorizedException('Missing refresh token or deviceId');
    }

    let payload: IJwtPayload;
    try {
      payload = await this.tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      this.logger.log(`Token verified, payload: ${JSON.stringify(payload)}`);
    } catch (error) {
      this.logger.error(`Token verification error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { refreshToken, deviceId, user: { id: payload.userId } },
      relations: ['user'],
    });

    if (!tokenEntity) {
      this.logger.error('Refresh token not found in database');
      throw new UnauthorizedException('Refresh token not found in database');
    }

    const user = tokenEntity.user;
    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      this.logger.error(`User ${user.id} is banned or inactive`);
      throw new UnauthorizedException('User is banned or inactive');
    }

    this.logger.log(`User ${user.id} successfully verified`);
    request.user = UserMapper.toIUserData(user, payload);
    return true;
  }
}
