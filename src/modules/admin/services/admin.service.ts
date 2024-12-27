import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Role } from '../../../common/enums/role.enum';
import { LoggerService } from '../../logger/logger.service';
import { UserRepository } from '../../repository/services/user.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository
  ) {}

  public async createDefaultAdmin(): Promise<string> {
    const defaultAdminEmail = 'admin@gmail.com';
    const defaultAdminPassword = 'admin';

    const adminExists = await this.userRepository.findOne({
      where: { email: defaultAdminEmail },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      const admin = this.userRepository.create({
        email: defaultAdminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        name: 'Default Admin',
      });
      await this.userRepository.save(admin);
      this.logger.log('Default admin created successfully');
      return 'Default admin created: admin@gmail.com / admin';
    } else {
      this.logger.warn('Default admin already exists');
      return 'Default admin already exists';
    }
  }
}
