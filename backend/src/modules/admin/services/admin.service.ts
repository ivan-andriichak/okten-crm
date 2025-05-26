import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, Equal } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Role } from '../../../common/enums/role.enum';
import { OrderEntity } from '../../../database/entities/order.entity';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { StatusEnum } from '../../orders/enums/order.enums';
import { RegisterAdminReqDto } from '../dto/req/register-admin.req.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async createManager(dto: RegisterAdminReqDto): Promise<UserEntity> {
    const userRepository = this.dataSource.getRepository(UserEntity);

    const user = userRepository.create({
      id: uuidv4(),
      email: dto.email,
      name: dto.name,
      surname: dto.surname,
      password: null,
      role: Role.MANAGER,
      is_active: false,
    });

    return await userRepository.save(user);
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

    user.password = await bcrypt.hash(password, 10);
    user.is_active = true;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await userRepository.save(user);
  }

  async getUserByToken(token: string): Promise<{ email: string }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { passwordResetToken: token } });
    if (!user || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    user.passwordResetToken = null;
    return { email: user.email };
  }

  async banManager(managerId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(UserEntity, { id: managerId }, { is_active: false });

      await queryRunner.manager.delete(RefreshTokenEntity, { user: { id: managerId } });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new UnauthorizedException('Failed to ban manager');
    } finally {
      await queryRunner.release();
    }
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
    limit = 10,
    sort = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    managers: (UserEntity & { statistics: { totalOrders: number; activeOrders: number } })[];
    total: number;
  }> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const [managers, total] = await userRepository.findAndCount({
      where: { role: Role.MANAGER },
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
    return await this.getStatistics(orderRepository);
  }

  async getManagerStatistics(id: string): Promise<Record<string, number>> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const manager = await userRepository.findOne({ where: { id, role: Role.MANAGER } });
    if (!manager) throw new NotFoundException('Manager not found');
    const orderRepository = this.dataSource.getRepository(OrderEntity);
    return await this.getStatistics(orderRepository, { manager: { id } });
  }

  private async getStatistics(orderRepository: any, where: Record<string, any> = {}): Promise<Record<string, number>> {
    const statuses = [StatusEnum.NEW, StatusEnum.IN_WORK, StatusEnum.AGREE, StatusEnum.DISAGREE, StatusEnum.DUBBING];
    const stats: Record<string, number> = {};

    for (const status of statuses) {
      stats[status] = await orderRepository.count({
        where: { ...where, status: Equal(status) },
      });
    }

    stats['Total'] = await orderRepository.count({
      where: { ...where },
    });

    return stats;
  }
}
