import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DataSource, Equal, MoreThan, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ERROR_MESSAGES } from '../../../common/constants/error-messages';
import { Role } from '../../../common/enums/role.enum';
import { OrderEntity } from '../../../database/entities/order.entity';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { AuthService } from '../../auth/services/auth.service';
import { LoggerService } from '../../logger/logger.service';
import { StatusEnum } from '../../orders/enums/order.enums';
import { UserResDto } from '../../users/dto/res/user.res.dto';
import { RegisterAdminReqDto } from '../dto/req/register-admin.req.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  async createManager(dto: RegisterAdminReqDto): Promise<UserResDto> {
    try {
      const authResponse = await this.authService.register({
        ...dto,
        deviceId: uuidv4(),
        role: Role.MANAGER,
        password: null,
        is_active: false,
      });
      return authResponse.user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.loggerService.error(`Failed to create manager with email: ${dto.email}`, error.stack);
      throw error;
    }
  }

  async generateActivationLink(id: string): Promise<{ link: string }> {
    this.loggerService.log(`Generating activation link for manager id: ${id}`);
    return await this.generateLinkWithToken(id, 'activate');
  }

  async generateRecoveryLink(id: string): Promise<{ link: string }> {
    this.loggerService.log(`Generating recovery link for manager id: ${id}`);
    return await this.generateLinkWithToken(id, 'recover');
  }

  private async generateLinkWithToken(id: string, type: 'activate' | 'recover'): Promise<{ link: string }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const manager = await userRepository.findOne({
      where: { id, role: Role.MANAGER },
      select: ['id', 'is_active', 'password'],
    });
    if (!manager) {
      this.loggerService.error(`Manager not found: ${id}`);
      throw new NotFoundException(ERROR_MESSAGES.MANAGER_NOT_FOUND);
    }

    if (type === 'activate' && manager.is_active) {
      this.loggerService.warn(`Manager already active: ${id}`);
      throw new BadRequestException('Manager is already active');
    }
    if (type === 'recover' && !manager.is_active) {
      this.loggerService.warn(`Manager is not active for recovery: ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.MANAGER_NOT_ACTIVE);
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await userRepository.update(id, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    });
    this.loggerService.log(`Generated ${type} token for manager: ${id}`);

    const baseUrl = this.configService.get<string>('APP_URL');
    if (!baseUrl) {
      this.loggerService.error('APP_URL is not defined in configuration');
      throw new BadRequestException(ERROR_MESSAGES.SERVER_CONFIGURATION_ERROR);
    }
    const path = type === 'activate' ? '/activate/' : '/recover/';
    return { link: `${baseUrl}${path}${token}` };
  }

  async setPassword(token: string, password: string): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await userRepository.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: MoreThan(new Date()),
          role: Role.MANAGER,
        },
        select: ['id', 'email', 'role', 'password'],
      });

      if (!user) {
        this.loggerService.error(`Invalid or expired token: ${token}`);
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
      }

      if (password.length > 128) {
        this.loggerService.warn(`Password too long for token: ${token}`);
        throw new BadRequestException('Password must not exceed 128 characters');
      }

      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        this.loggerService.warn(`Invalid password format for token: ${token}, length: ${password.length}`);
        throw new BadRequestException(ERROR_MESSAGES.PASSWORD_INVALID_FORMAT);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await queryRunner.manager.update(
        UserEntity,
        { id: user.id },
        {
          password: hashedPassword,
          is_active: true,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      );

      await queryRunner.commitTransaction();
      this.loggerService.log(`Password set for user: ${user.id}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error(`Failed to set password for token: ${token}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserByToken(token: string): Promise<{ email: string }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
        role: Role.MANAGER,
      },
      select: ['email'],
    });

    if (!user) {
      this.loggerService.error(`Invalid or expired token: ${token}`);
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    return { email: user.email };
  }

  async banManager(managerId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = this.dataSource.getRepository(UserEntity);
      const manager = await userRepository.findOne({
        where: { id: managerId, role: Role.MANAGER },
        select: ['id', 'is_active', 'password'],
      });
      if (!manager) {
        this.loggerService.error(`Manager not found: ${managerId}`);
        throw new NotFoundException(ERROR_MESSAGES.MANAGER_NOT_FOUND);
      }
      if (!manager.is_active) {
        this.loggerService.warn(`Manager is already inactive: ${managerId}`);
        throw new BadRequestException(ERROR_MESSAGES.MANAGER_ALREADY_INACTIVE);
      }

      await queryRunner.manager.update(UserEntity, { id: managerId }, { is_active: false });
      await queryRunner.manager.delete(RefreshTokenEntity, { user: { id: managerId } });
      await queryRunner.commitTransaction();
      this.loggerService.log(`Manager banned: ${managerId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error(`Failed to ban manager: ${managerId}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unbanManager(id: string): Promise<UserEntity> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id, role: Role.MANAGER },
      select: ['id', 'email', 'role', 'is_active', 'password'],
    });
    if (!user) {
      this.loggerService.error(`Manager not found: ${id}`);
      throw new NotFoundException(ERROR_MESSAGES.MANAGER_NOT_FOUND);
    }
    if (user.is_active) {
      this.loggerService.warn(`Manager is already active: ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.MANAGER_ALREADY_ACTIVE);
    }
    if (!user.password) {
      this.loggerService.warn(`Manager is not banned (no password set): ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.MANAGER_NOT_BANNED);
    }

    await userRepository.update(id, { is_active: true });
    this.loggerService.log(`Manager unbanned: ${id}`);
    return await userRepository.findOneBy({ id });
  }

  async getManagers(
    page = 1,
    limit = 10,
    sort = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    managers: (UserEntity & { statistics: { totalOrders: number; activeOrders: number }; hasPassword: boolean })[];
    total: number;
  }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const [managers, total] = await userRepository.findAndCount({
      where: { role: Role.MANAGER },
      order: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'email', 'name', 'surname', 'is_active', 'password', 'created_at', 'last_login', 'role'],
    });

    this.loggerService.log(`Fetched ${managers.length} managers, page: ${page}, limit: ${limit}`);

    const managersWithStats = await Promise.all(
      managers.map(async (manager) => {
        const stats = await this.getManagerStatistics(manager.id);
        return {
          ...manager,
          hasPassword: !!manager.password,
          statistics: {
            totalOrders: stats.Total || 0,
            activeOrders: stats[StatusEnum.IN_WORK] || 0,
          },
        };
      }),
    );

    return { managers: managersWithStats, total };
  }

  async getOrderStatistics(): Promise<Record<string, number>> {
    const orderRepository = this.dataSource.getRepository(OrderEntity);
    const stats = await this.getStatistics(orderRepository);
    this.loggerService.log('Fetched order statistics');
    return stats;
  }

  async getManagerStatistics(id: string): Promise<Record<string, number>> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const manager = await userRepository.findOne({
      where: { id, role: Role.MANAGER },
      select: ['id'],
    });
    if (!manager) {
      this.loggerService.error(`Manager not found: ${id}`);
      throw new NotFoundException(ERROR_MESSAGES.MANAGER_NOT_FOUND);
    }
    const orderRepository = this.dataSource.getRepository(OrderEntity);
    const stats = await this.getStatistics(orderRepository, { manager: { id } });
    this.loggerService.log(`Fetched statistics for manager: ${id}`);
    return stats;
  }

  private async getStatistics(
    orderRepository: Repository<OrderEntity>,
    where: Record<string, any> = {},
  ): Promise<Record<string, number>> {
    const statuses = [StatusEnum.NEW, StatusEnum.IN_WORK, StatusEnum.AGREE, StatusEnum.DISAGREE, StatusEnum.DUBBING];
    const stats: Record<string, number> = {};

    for (const status of statuses) {
      stats[status] = await orderRepository.count({
        where: { ...where, status: Equal(status) },
      });
    }

    stats['Total'] = await orderRepository.count({ where });
    return stats;
  }
}
