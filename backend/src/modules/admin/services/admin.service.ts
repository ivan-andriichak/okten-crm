import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MoreThan } from 'typeorm';

import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { LoggerService } from '../../logger/logger.service';
import { OrdersRepository } from '../../repository/services/orders.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { RegisterAdminReqDto } from '../dto/req/register-admin.req.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async createManager(dto: RegisterAdminReqDto): Promise<UserEntity> {
    this.logger.log(`Creating manager with email: ${dto.email}`);
    try {
      this.logger.log(`Checking for existing user with email: ${dto.email}`);
      const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existingUser) {
        this.logger.warn(`User with email ${dto.email} already exists`);
        throw new BadRequestException(`Користувач з email ${dto.email} вже існує`);
      }

      this.logger.log(`Creating new manager: ${JSON.stringify(dto)}`);
      const user = await this.userRepository.save(
        this.userRepository.create({
          email: dto.email,
          name: dto.name,
          surname: dto.surname,
          role: Role.MANAGER,
          is_active: false,
        }),
      );
      this.logger.log(`Manager created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create manager: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generateActivationOrRecoveryLink(id: string, type: 'activate' | 'recover'): Promise<{ link: string }> {
    this.logger.log(`Generating ${type} link for user: ${id}`);
    const token = this.jwtService.sign({ userId: id, type }, { expiresIn: '30m' });
    await this.userRepository.update(id, {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });
    const link = `${this.configService.get('APP_URL')}/${type}/${token}`;
    this.logger.log(`Generated link: ${link}`);
    return { link };
  }

  async setPassword(token: string, password: string): Promise<void> {
    this.logger.log(`Setting password for token: ${token}`);
    let payload: { userId: any };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
    const user = await this.userRepository.findOneByOrFail({
      id: payload.userId,
      passwordResetToken: token,
      passwordResetExpires: MoreThan(new Date()),
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      is_active: true,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
    this.logger.log(`Password set for user: ${user.id}`);
  }

  async banManager(id: string): Promise<UserEntity> {
    this.logger.log(`Banning manager: ${id}`);
    return await this.setActiveStatus(id, false);
  }

  async unbanManager(id: string): Promise<UserEntity> {
    this.logger.log(`Unbanning manager: ${id}`);
    return await this.setActiveStatus(id, true);
  }

  private async setActiveStatus(id: string, isActive: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!user) {
      throw new NotFoundException(`Менеджера з ID ${id} не знайдено`);
    }
    user.is_active = isActive;
    return await this.userRepository.save(user);
  }

  async getManagers(
    page = 1,
    limit = 12, // Змінено на 12 відповідно до вимог
    sort = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ managers: any[]; total: number }> {
    this.logger.log(`Fetching managers: page=${page}, limit=${limit}, sort=${sort}, order=${order}`);
    const [managers, total] = await this.userRepository.findAndCount({
      where: { role: Role.MANAGER },
      select: ['id', 'email', 'name', 'surname', 'is_active', 'created_at'],
      order: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const managersWithStats = await Promise.all(
      managers.map(async (manager) => {
        const stats = await this.getManagerStatistics(manager.id);
        return {
          ...manager,
          statistics: {
            totalOrders: Object.values(stats).reduce((a, b) => a + b, 0),
            activeOrders: (stats['New'] || 0) + (stats['In work'] || 0),
          },
        };
      }),
    );

    return { managers: managersWithStats, total };
  }

  async getOrderStatistics(): Promise<Record<string, number>> {
    this.logger.log(`Fetching order statistics`);
    return await this.getStatistics();
  }

  async getManagerStatistics(managerId: string): Promise<Record<string, number>> {
    this.logger.log(`Fetching statistics for manager: ${managerId}`);
    const manager = await this.userRepository.findOne({ where: { id: managerId, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Менеджера з ID ${managerId} не знайдено`);
    }
    return await this.getStatistics({ manager: { id: managerId } });
  }

  private async getStatistics(where: Record<string, any> = {}): Promise<Record<string, number>> {
    const statuses = ['New', 'In work', 'Agree', 'Disagree', 'Dubbing'];
    const result: Record<string, number> = {};
    for (const status of statuses) {
      result[status] = await this.ordersRepository.count({ where: { ...where, status } });
    }
    return result;
  }
}
