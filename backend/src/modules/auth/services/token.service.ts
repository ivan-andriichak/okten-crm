import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Config, JwtConfig } from '../../../config/config.type';
import { LoggerService } from '../../logger/logger.service';
import { TokenType } from '../enums/token-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { ITokenPair } from '../interfaces/token-pair.interface';

@Injectable()
export class TokenService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.jwtConfig = configService.get<JwtConfig>('jwt');
    this.logger.log('TokenService initialized with JWT config');
  }

  public async generateAuthTokens(payload: { userId: string; deviceId: string; role: string }): Promise<ITokenPair> {
    this.logger.log(`Generating tokens for user: ${payload.userId}, device: ${payload.deviceId}`);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  public async verifyToken(token: string, type: TokenType): Promise<IJwtPayload> {
    try {
      const secret = this.getSecret(type);
      const payload = await this.jwtService.verifyAsync(token, { secret });
      this.logger.log(`Token verified. Payload: ${JSON.stringify(payload)}`);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private getSecret(type: TokenType): string {
    switch (type) {
      case TokenType.ACCESS:
        return this.jwtConfig.accessSecret;
      case TokenType.REFRESH:
        return this.jwtConfig.refreshSecret;
      default: {
        const errorMessage = `Unknown token type: ${type}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  }
}
