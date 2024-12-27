import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RefreshTokenRepository } from '../../repository/services/refresh-token.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { UserMapper } from '../../users/user.maper';
import { UsersService } from '../../users/users.service';
import { LoginReqDto } from '../dto/req/login.req.dto';
import { RegisterReqDto } from '../dto/req/register.req.dto';
import { AuthResDto } from '../dto/res/auth.res.dto';
import { TokenPairResDto } from '../dto/res/token-pair.res.dto';
import { IUserData } from '../interfaces/user-data.interface';
import { AuthCacheService } from './auth-cach.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService
  ) {}

  public async register(dto: RegisterReqDto): Promise<AuthResDto> {
    try {
      await this.userService.isEmailExistOrThrow(dto.email);

      const password = await bcrypt.hash(dto.password, 10);
      const user = await this.userRepository.save(this.userRepository.create({ ...dto, password }));
      const tokens = await this.tokenService.generateAuthTokens({
        userId: user.id,
        deviceId: dto.deviceId,
      });

      await Promise.all([
        this.refreshTokenRepository.save({
          deviceId: dto.deviceId,
          refreshToken: tokens.refreshToken,
          user_id: user.id,
        }),
        this.authCacheService.saveToken(tokens.accessToken, user.id, dto.deviceId),
      ]);
      return { user: UserMapper.toResponseDTO(user), tokens };
    } catch (error) {
      this.logger.error('Registration failed', error.stack);
      throw new Error('Registration failed');
    }
  }

  public async login(dto: LoginReqDto): Promise<AuthResDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: dto.email },
        select: { id: true, password: true },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException();
      }
      const tokens = await this.tokenService.generateAuthTokens({
        userId: user.id,
        deviceId: dto.deviceId,
      });

      await Promise.all([
        this.refreshTokenRepository.delete({
          deviceId: dto.deviceId,
          user_id: user.id,
        }),
        this.authCacheService.deleteToken(user.id, dto.deviceId),
      ]);

      await Promise.all([
        this.refreshTokenRepository.save({
          deviceId: dto.deviceId,
          refreshToken: tokens.refreshToken,
          user_id: user.id,
        }),
        this.authCacheService.saveToken(tokens.accessToken, user.id, dto.deviceId),
      ]);
      const userEntity = await this.userRepository.findOneBy({ id: user.id });
      return { user: UserMapper.toResponseDTO(userEntity), tokens };
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      throw new Error('Login failed');
    }
  }

  public async refresh(userData: IUserData): Promise<TokenPairResDto> {
    await Promise.all([
      this.refreshTokenRepository.delete({
        deviceId: userData.deviceId,
        user_id: userData.userId,
      }),
      this.authCacheService.deleteToken(userData.userId, userData.deviceId),
    ]);

    const tokens = await this.tokenService.generateAuthTokens({
      userId: userData.userId,
      deviceId: userData.deviceId,
    });

    await Promise.all([
      this.refreshTokenRepository.save({
        deviceId: userData.deviceId,
        refreshToken: tokens.refreshToken,
        user_id: userData.userId,
      }),
      this.authCacheService.saveToken(tokens.accessToken, userData.userId, userData.deviceId),
    ]);

    return tokens;
  }

  public async logOut(userData: IUserData): Promise<void> {
    await Promise.all([
      this.refreshTokenRepository.delete({
        deviceId: userData.deviceId,
        user_id: userData.userId,
      }),
      this.authCacheService.deleteToken(userData.userId, userData.deviceId),
    ]);
  }
}
