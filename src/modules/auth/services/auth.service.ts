import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Role } from '../../../common/enums/role.enum';
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
  ) {}

  public async createDefaultAdmin(): Promise<AuthResDto> {
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

  // Реєстрація нового користувача
  public async register(dto: RegisterReqDto): Promise<AuthResDto> {
    try {
      // Перевірка на існування email
      await this.userService.isEmailExistOrThrow(dto.email);

      // Хешування пароля
      const password = await bcrypt.hash(dto.password, 10);

      // Збереження користувача
      const user = await this.userRepository.save(
        this.userRepository.create({
          ...dto,
          password,
        }),
      );

      // Генерація токенів
      const tokens = await this.tokenService.generateAuthTokens({
        userId: user.id,
        deviceId: dto.deviceId,
      });

      // Збереження токенів
      await Promise.all([
        this.refreshTokenRepository.save({
          deviceId: dto.deviceId,
          refreshToken: tokens.refreshToken,
          user_id: user.id,
        }),
        this.authCacheService.saveToken(
          tokens.accessToken,
          user.id,
          dto.deviceId,
        ),
      ]);

      return { user: UserMapper.toResponseDTO(user), tokens };
    } catch (error) {
      throw new Error(error);
    }
  }

  // Логін користувача
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
        this.authCacheService.saveToken(
          tokens.accessToken,
          user.id,
          dto.deviceId,
        ),
      ]);

      // Оновлення поля `last_login`
      await this.userRepository.update(user.id, { last_login: new Date() });

      const userEntity = await this.userRepository.findOneBy({ id: user.id });

      return { user: UserMapper.toResponseDTO(userEntity), tokens };
    } catch (error) {
      throw new Error(error);
    }
  }

  // Оновлення токенів
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
      this.authCacheService.saveToken(
        tokens.accessToken,
        userData.userId,
        userData.deviceId,
      ),
    ]);

    return tokens;
  }

  // Логаут користувача
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
