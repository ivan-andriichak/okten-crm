import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Role } from '../../../common/enums/role.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { RegisterReqDto } from '../../auth/dto/req/register.req.dto';
import { AuthService } from '../../auth/services/auth.service';
import { RegisterAdminReqDto } from '../dto/req/register-admin.req.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async createManager(dto: RegisterAdminReqDto): Promise<UserEntity> {
    const token = uuidv4();
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 хв

    const registerDto: RegisterReqDto = {
      email: dto.email,
      name: dto.name,
      surname: dto.surname,
      password: token,
      deviceId: `manager-${token}`,
      role: Role.MANAGER,
    };

    const { user } = await this.authService.register(registerDto);

    const userRepository = this.dataSource.getRepository(UserEntity);
    const entity = await userRepository.findOne({ where: { id: user.id } });
    entity.is_active = false;
    entity.passwordResetToken = token;
    entity.passwordResetExpires = tokenExpires;

    return await userRepository.save(entity);
  }

  async generateActivationLink(id: string): Promise<{ link: string }> {
    return await this.generateLinkWithToken(id, 'activate');
  }

  async generateRecoveryLink(id: string): Promise<{ link: string }> {
    return await this.generateLinkWithToken(id, 'recover');
  }

  private async generateLinkWithToken(id: string, type: 'activate' | 'recover'): Promise<{ link: string }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const manager = await userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) throw new NotFoundException('Manager not found');

    const token = uuidv4();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    manager.passwordResetToken = token;
    manager.passwordResetExpires = expires;
    await userRepository.save(manager);

    const baseUrl = type === 'activate' ? 'http://localhost:3000/activate/' : 'http://localhost:3000/recover/';
    return { link: `${baseUrl}${token}` };
  }

  async setPassword(token: string, password: string): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { passwordResetToken: token } });
    if (!user || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    //localhost:3000/activate/7b9ce0fc-4ac5-4983-b29b-11764ae55dc3

    user.password = await bcrypt.hash(password, 10);
    user.is_active = true;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await userRepository.save(user);
  }

  async banManager(id: string): Promise<UserEntity> {
    const userRepository = this.dataSource.getRepository(UserEntity); // Використовуйте стандартний репозиторій
    const user = await userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!user) throw new NotFoundException('Manager not found');
    user.is_active = false;
    return await userRepository.save(user);
  }

  async unbanManager(id: string): Promise<UserEntity> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!user) throw new NotFoundException('Manager not found');
    user.is_active = true;
    return await userRepository.save(user);
  }

  async getManagers(
    page = 1,
    limit = 25,
    sort = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ managers: UserEntity[]; total: number }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const [managers, total] = await userRepository.findAndCount({
      where: { role: Role.MANAGER },
      order: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { managers, total };
  }

  async getOrderStatistics(): Promise<Record<string, number>> {
    const orderRepository = this.dataSource.getRepository('OrderEntity');
    return await this.getStatistics(orderRepository);
  }

  async getManagerStatistics(id: string): Promise<Record<string, number>> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const manager = await userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) throw new NotFoundException('Manager not found');
    const orderRepository = this.dataSource.getRepository('OrderEntity');
    return await this.getStatistics(orderRepository, { manager: { id } });
  }

  private async getStatistics(
    orderRepository: any, // Тимчасово any, доки не отримаємо OrderEntity
    where: Record<string, any> = {},
  ): Promise<Record<string, number>> {
    const statuses = ['New', 'InWork', 'Agree', 'Disagree', 'Dubbing'];
    const stats: Record<string, number> = {};
    for (const status of statuses) {
      stats[status] = await orderRepository.count({ where: { ...where, status } });
    }
    return stats;
  }
}
