import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { RegisterReqDto } from '../../auth/dto/req/register.req.dto'; // Додаємо DTO
import { AuthService } from '../../auth/services/auth.service'; // Додаємо AuthService
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
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 години

    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new NotFoundException(`User with email ${dto.email} already exists`);
    }

    // Використовуємо AuthService.register для створення менеджера
    const registerDto: RegisterReqDto = {
      email: dto.email,
      name: dto.name,
      surname: dto.surname,
      password: token, // Тимчасовий пароль = token, буде замінений при set-password
      deviceId: `manager-${token}`, // Унікальний deviceId
      role: Role.MANAGER,
    };

    const authResult = await this.authService.register(registerDto);

    // Оновлюємо користувача з passwordResetToken і is_active: false
    const user = await this.userRepository.findOne({ where: { id: authResult.user.id } });
    user.is_active = false;
    user.passwordResetToken = token;
    user.passwordResetExpires = tokenExpires;
    await this.userRepository.save(user);

    return user;
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

  // Решта методів (getManagers, toggleManagerStatus, тощо) залишаються без змін
  async getManagers(page: number = 1, limit: number = 25): Promise<[UserEntity[], number]> {
    return await this.userRepository.findAndCount({
      where: { role: Role.MANAGER },
      select: ['id', 'email', 'name', 'surname', 'is_active', 'last_login'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async toggleManagerStatus(id: string): Promise<UserEntity> {
    const manager = await this.userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${id} not found`);
    }
    manager.is_active = !manager.is_active;
    return await this.userRepository.save(manager);
  }

  async getOrderStatistics(): Promise<Record<string, number>> {
    const statuses = ['New', 'In Work', 'Completed', 'Cancelled'];
    const stats: Record<string, number> = {};
    for (const status of statuses) {
      const count = await this.ordersRepository.count({ where: { status } });
      stats[status] = count;
    }
    return stats;
  }

  async getManagerStatistics(managerId: string): Promise<Record<string, number>> {
    const manager = await this.userRepository.findOne({ where: { id: managerId, role: Role.MANAGER } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }
    const statuses = ['New', 'In Work', 'Completed', 'Cancelled'];
    const stats: Record<string, number> = {};
    for (const status of statuses) {
      const count = await this.ordersRepository.count({
        where: { manager: { id: managerId }, status },
      });
      stats[status] = count;
    }
    return stats;
  }
}
