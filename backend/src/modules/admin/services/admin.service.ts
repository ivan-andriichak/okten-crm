import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { RegisterReqDto } from '../../auth/dto/req/register.req.dto';
import { AuthService } from '../../auth/services/auth.service';
import { OrdersRepository } from '../../repository/services/orders.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { RegisterAdminReqDto } from '../dto/req/register-admin.req.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly authService: AuthService,
  ) {}

  async createManager(dto: RegisterAdminReqDto): Promise<UserEntity> {
    const token = uuidv4();
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 хвилин (згідно з фронтендом)

    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new NotFoundException(`User with email ${dto.email} already exists`);
    }

    const registerDto: RegisterReqDto = {
      email: dto.email,
      name: dto.name,
      surname: dto.surname,
      password: token, // Тимчасовий пароль = token
      deviceId: `manager-${token}`,
      role: Role.MANAGER,
    };

    const authResult = await this.authService.register(registerDto);

    const user = await this.userRepository.findOne({ where: { id: authResult.user.id } });
    user.is_active = false;
    user.passwordResetToken = token;
    user.passwordResetExpires = tokenExpires;
    await this.userRepository.save(user);

    return user;
  }

  async generateActivationOrRecoveryLink(id: string, type: 'activate' | 'recover'): Promise<{ link: string }> {
    const manager = await this.userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${id} not found`);
    }

    const token = uuidv4();
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 хвилин
    manager.passwordResetToken = token;
    manager.passwordResetExpires = tokenExpires;
    await this.userRepository.save(manager);

    const baseUrl = type === 'activate' ? 'https://bigbird.space/activate/' : 'http://bigbird.space/recover/';
    const link = `${baseUrl}${token}`;
    return { link };
  }

  async banManager(id: string): Promise<UserEntity> {
    const manager = await this.userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${id} not found`);
    }
    manager.is_active = false;
    return await this.userRepository.save(manager);
  }

  async unbanManager(id: string): Promise<UserEntity> {
    const manager = await this.userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${id} not found`);
    }
    manager.is_active = true;
    return await this.userRepository.save(manager);
  }

  async setPassword(token: string, password: string): Promise<void> {
    const manager = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });
    if (!manager || (manager.passwordResetExpires && manager.passwordResetExpires < new Date())) {
      throw new NotFoundException('Invalid or expired token');
    }

    manager.password = await bcrypt.hash(password, 10);
    manager.passwordResetToken = null;
    manager.passwordResetExpires = null;
    manager.is_active = true;
    await this.userRepository.save(manager);
  }

  async getManagers(
    page: number = 1,
    limit: number = 2,
    sort: string = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ managers: UserEntity[]; total: number }> {
    const [managers, total] = await this.userRepository.findAndCount({
      where: { role: Role.MANAGER },
      select: ['id', 'email', 'name', 'surname', 'is_active', 'created_at'],
      order: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Додаємо статистику для кожного менеджера
    const managersWithStats = await Promise.all(
      managers.map(async (manager) => {
        const stats = await this.getManagerStatistics(manager.id);
        return {
          ...manager,
          statistics: {
            totalOrders: Object.values(stats).reduce((sum, count) => sum + count, 0),
            activeOrders: stats['New'] + stats['In Work'],
          },
        };
      }),
    );

    return { managers: managersWithStats, total };
  }

  async getOrderStatistics(): Promise<Record<string, number>> {
    return await this.getStatistics();
  }

  async getManagerStatistics(managerId: string): Promise<Record<string, number>> {
    const manager = await this.userRepository.findOne({ where: { id: managerId, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }
    return await this.getStatistics({ manager: { id: managerId } });
  }

  private async getStatistics(whereCondition: Record<string, any> = {}): Promise<Record<string, number>> {
    const statuses = ['New', 'InWork', 'Agree', 'Disagree', 'Dubbing'];
    const stats: Record<string, number> = {};
    for (const status of statuses) {
      const count = await this.ordersRepository.count({ where: { ...whereCondition, status } });
      stats[status] = count;
    }
    return stats;
  }
}
