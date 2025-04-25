import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Role } from '../../../common/enums/role.enum';
import { LoggerService } from '../../logger/logger.service';
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
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly logger: LoggerService,
  ) {}

  public async createDefaultAdmin(): Promise<AuthResDto> {
    this.logger.info('Attempting to create default admin');
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@gmail.com', role: Role.ADMIN },
    });
    if (existingAdmin) {
      throw new ConflictException('Admin already exists');
    }

    const defaultAdminDto: RegisterReqDto = {
      email: 'admin@gmail.com',
      password: 'admin',
      deviceId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Admin',
      surname: 'Default',
      role: Role.ADMIN,
    };

    return await this.register(defaultAdminDto);
  }

  public async register(dto: RegisterReqDto): Promise<AuthResDto> {
    try {
      this.logger.log(`Registering user with email: ${dto.email}`);
      await this.userService.isEmailExistOrThrow(dto.email);

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.userRepository.save(
        this.userRepository.create({
          ...dto,
          password: hashedPassword,
        }),
      );

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
      this.logger.log(`Old tokens removed for user ${user.id} and device ${dto.deviceId}`);

      await Promise.all([
        this.refreshTokenRepository.save({
          deviceId: dto.deviceId,
          refreshToken: tokens.refreshToken,
          user_id: user.id,
        }),
        this.authCacheService.saveToken(tokens.accessToken, user.id, dto.deviceId),
      ]);
      this.logger.log(`Tokens saved for user ${user.id}`);

      return { user: UserMapper.toResponseDTO(user), tokens };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async login(dto: LoginReqDto): Promise<AuthResDto> {
    try {
      this.logger.log(`Login attempt for email: ${dto.email}`);
      const user = await this.userRepository.findOne({
        where: { email: dto.email },
        select: { id: true, password: true },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
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
      this.logger.log(`Old tokens removed for user ${user.id}`);

      await Promise.all([
        this.refreshTokenRepository.save({
          deviceId: dto.deviceId,
          refreshToken: tokens.refreshToken,
          user_id: user.id,
        }),
        this.authCacheService.saveToken(tokens.accessToken, user.id, dto.deviceId),
      ]);
      this.logger.log(`New tokens saved for user ${user.id}`);

      await this.userRepository.update(user.id, { last_login: new Date() });
      this.logger.log(`Updated last_login for user ${user.id}`);

      const userEntity = await this.userRepository.findOneBy({ id: user.id });

      return { user: UserMapper.toResponseDTO(userEntity), tokens };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  public async refresh(userData: IUserData): Promise<TokenPairResDto> {
    try {
      this.logger.log(`Refreshing tokens for user ${userData.userId}`);
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

      this.logger.log(`Tokens refreshed for user ${userData.userId}`);
      return tokens;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  public async logOut(userData: IUserData): Promise<void> {
    try {
      this.logger.log(`Logging out user ${userData.userId}`);
      await Promise.all([
        this.refreshTokenRepository.delete({
          deviceId: userData.deviceId,
          user_id: userData.userId,
        }),
        this.authCacheService.deleteToken(userData.userId, userData.deviceId),
      ]);
      this.logger.log(`User ${userData.userId} logged out successfully`);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }
}
